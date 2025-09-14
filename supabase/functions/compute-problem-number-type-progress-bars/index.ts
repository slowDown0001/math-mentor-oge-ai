import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  problem_number_types: number[]
  course_id?: string
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

    const { user_id, problem_number_types, course_id }: RequestBody = await req.json()

    // Validate required parameters
    if (!user_id || !problem_number_types || !Array.isArray(problem_number_types)) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: user_id, problem_number_types (array)' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Computing problem number type progress bars for user ${user_id}, types: ${problem_number_types.join(', ')}`)

    const t_current = new Date().toISOString()
    const progress_list: Array<Record<string, number>> = []

    // Process each problem number type
    for (const pt_id of problem_number_types) {
      try {
        console.log(`Processing problem number type ${pt_id}`)

        // Get latest attempt time
        const latestAttemptResponse = await supabaseClient.functions.invoke('get-latest-attempt-time', {
          body: {
            user_id,
            entity_type: 'problem_number_type',
            entity_id: pt_id
          }
        })

        if (latestAttemptResponse.error) {
          console.error(`Error getting latest attempt time for problem number type ${pt_id}:`, latestAttemptResponse.error)
          progress_list.push({ [pt_id.toString()]: 0.0 })
          continue
        }

        const t_attempt = latestAttemptResponse.data?.data?.latest_attempt_time

        // Apply time decay to parameters
        const timeDecayResponse = await supabaseClient.functions.invoke('apply-time-decay-to-params', {
          body: {
            user_id,
            entity_type: 'problem_number_type',
            entity_id: pt_id,
            t_current,
            t_attempt,
            lambda_decay: 0.01,
            course_id: course_id || 'default'
          }
        })

        if (timeDecayResponse.error) {
          console.error(`Error applying time decay for problem number type ${pt_id}:`, timeDecayResponse.error)
          progress_list.push({ [pt_id.toString()]: 0.0 })
          continue
        }

        const { alpha_decayed, beta_decayed } = timeDecayResponse.data?.data || {}

        // Compute mastery probability
        const masteryProbResponse = await supabaseClient.functions.invoke('compute-mastery-probability', {
          body: {
            alpha: alpha_decayed || 0.0,
            beta: beta_decayed || 0.0
          }
        })

        if (masteryProbResponse.error) {
          console.error(`Error computing mastery probability for problem number type ${pt_id}:`, masteryProbResponse.error)
          progress_list.push({ [pt_id.toString()]: 0.0 })
          continue
        }

        const probability = masteryProbResponse.data?.data?.mastery_probability || 0.0

        // Add to progress list
        progress_list.push({ [pt_id.toString()]: probability })

        console.log(`Problem number type ${pt_id} probability: ${probability}`)

      } catch (ptError) {
        console.error(`Error processing problem number type ${pt_id}:`, ptError)
        progress_list.push({ [pt_id.toString()]: 0.0 })
      }
    }

    console.log(`Computed progress bars for ${progress_list.length} problem number types`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          user_id,
          progress_bars: progress_list
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