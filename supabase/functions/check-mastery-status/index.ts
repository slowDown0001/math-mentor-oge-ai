import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  entity_type: 'skill' | 'problem_number_type'
  entity_id: number
  A?: number
  B?: number
  lambda_decay?: number
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id, entity_type, entity_id, A = 0.05, B = 20, lambda_decay = 0.01 }: RequestBody = await req.json()

    // Validate required parameters
    if (!user_id || !entity_type || entity_id === undefined) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: user_id, entity_type, entity_id' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Checking mastery status for user ${user_id}, ${entity_type} ${entity_id}`)

    // Step 1: Get recent outcomes
    const outcomesResponse = await supabaseClient.functions.invoke('get-recent-outcomes', {
      body: { user_id, entity_type, entity_id, days: 90, min_attempts: 5 }
    })

    if (outcomesResponse.error) {
      console.error('Error getting recent outcomes:', outcomesResponse.error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get recent outcomes', 
          details: outcomesResponse.error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const outcomes = outcomesResponse.data?.data?.outcomes || []
    
    if (outcomes.length === 0) {
      console.log('No outcomes found, returning continue')
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            status: 'continue',
            reason: 'No activity found',
            outcomes_count: 0
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Step 2: Get latest attempt time
    const attemptTimeResponse = await supabaseClient.functions.invoke('get-latest-attempt-time', {
      body: { user_id, entity_type, entity_id }
    })

    if (attemptTimeResponse.error) {
      console.error('Error getting latest attempt time:', attemptTimeResponse.error)
    }

    const latestAttemptTime = attemptTimeResponse.data?.data?.latest_attempt_time

    // Step 3: Calculate time-decayed probabilities
    let p_h1 = 0.7  // Default probability for mastery
    let p_h0 = 0.6  // Default probability for non-mastery

    if (latestAttemptTime) {
      const currentTime = new Date().toISOString()
      
      // Apply time decay to parameters
      const timeDecayResponse = await supabaseClient.functions.invoke('apply-time-decay-to-params', {
        body: { 
          user_id, 
          entity_type, 
          entity_id, 
          t_current: currentTime, 
          t_attempt: latestAttemptTime, 
          lambda_decay 
        }
      })

      if (timeDecayResponse.data?.success) {
        const { alpha_decayed, beta_decayed } = timeDecayResponse.data.data
        
        if (alpha_decayed && beta_decayed) {
          // Compute mastery probability
          const masteryProbResponse = await supabaseClient.functions.invoke('compute-mastery-probability', {
            body: { alpha: alpha_decayed, beta: beta_decayed }
          })

          if (masteryProbResponse.data?.success) {
            p_h1 = masteryProbResponse.data.data.mastery_probability
            p_h0 = Math.max(0.1, p_h1 - 0.1)  // Ensure p_h0 < p_h1
            console.log(`Using time-decayed probabilities: p_h1=${p_h1}, p_h0=${p_h0}`)
          }
        }
      }
    }

    // Step 4: Perform SPRT
    const sprtResponse = await supabaseClient.functions.invoke('perform-sprt', {
      body: { outcomes, p_h0, p_h1, A, B }
    })

    if (sprtResponse.error) {
      console.error('Error performing SPRT:', sprtResponse.error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to perform SPRT', 
          details: sprtResponse.error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const sprtResult = sprtResponse.data?.data
    
    console.log(`Mastery status check complete: ${sprtResult?.status}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          status: sprtResult?.status || 'continue',
          lambda_n: sprtResult?.lambda_n,
          outcomes_count: outcomes.length,
          success_rate: outcomes.reduce((a: number, b: number) => a + b, 0) / outcomes.length,
          p_h0,
          p_h1,
          threshold_A: A,
          threshold_B: B,
          latest_attempt_time: latestAttemptTime
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})