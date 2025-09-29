import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { getErrorMessage } from '../_shared/error-utils.ts'

interface RequestBody {
  user_id: string
  problem_number_type: number
  finished_or_not: boolean
  is_correct: boolean
  difficulty: number
  scaling_type: string
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

    const { user_id, problem_number_type, finished_or_not, is_correct, difficulty, scaling_type, course_id }: RequestBody = await req.json()

    // Validate required parameters
    if (!user_id || problem_number_type === undefined || finished_or_not === undefined || is_correct === undefined || difficulty === undefined || !scaling_type) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: user_id, problem_number_type, finished_or_not, is_correct, difficulty, scaling_type' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate scaling_type
    if (!['linear', 'exponential'].includes(scaling_type)) {
      return new Response(
        JSON.stringify({ 
          error: 'scaling_type must be either "linear" or "exponential"' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Updating problem number type ${problem_number_type} for user ${user_id}`)

    // Get alpha and beta using the existing get-alpha-beta function
    const { data: alphaBetaResult, error: alphaBetaError } = await supabaseClient.functions.invoke('get-alpha-beta', {
      body: {
        user_id,
        entity_type: 'problem_number_type',
        entity_id: problem_number_type,
        course_id: course_id || 'default'
      }
    })

    if (alphaBetaError) {
      console.error('Error getting alpha/beta:', alphaBetaError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to retrieve alpha/beta values', 
          details: alphaBetaError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize if not found (non-weak prior based on difficulty)
    let alpha = alphaBetaResult?.data?.alpha ?? 1
    let beta = alphaBetaResult?.data?.beta ?? 40

    console.log(`Current alpha: ${alpha}, beta: ${beta}`)

    // Compute mastery probability using the existing function
    const { data: masteryResult, error: masteryError } = await supabaseClient.functions.invoke('compute-mastery-probability', {
      body: {
        alpha,
        beta
      }
    })

    if (masteryError) {
      console.error('Error computing mastery probability:', masteryError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to compute mastery probability', 
          details: masteryError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const p = masteryResult.data.mastery_probability

    // Compute difficulty weight using the existing function
    const { data: weightResult, error: weightError } = await supabaseClient.functions.invoke('compute-difficulty-weight', {
      body: {
        scaling_type,
        d: difficulty
      }
    })

    if (weightError) {
      console.error('Error computing difficulty weight:', weightError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to compute difficulty weight', 
          details: weightError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const w = weightResult.data.weight

    // Update alpha/beta based on attempt outcome
    if (finished_or_not && is_correct) {
      // Compute velocity factor for correct answers
      const { data: velocityResult, error: velocityError } = await supabaseClient.functions.invoke('compute-velocity-factor', {
        body: {
          p
        }
      })

      if (velocityError) {
        console.error('Error computing velocity factor:', velocityError)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to compute velocity factor', 
            details: velocityError.message 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const f = velocityResult.data.velocity_factor
      alpha += f * w
      console.log(`Finished and correct: alpha += ${f} * ${w} = ${f * w}`)
    } else if (finished_or_not && !is_correct) {
      beta += w
      console.log(`Finished and incorrect: beta += ${w}`)
    } else if (!finished_or_not) {
      // Not finished (skipped)
      if (difficulty >= 3) {
        beta += w
        console.log(`Skipped (difficulty ${difficulty} >= 3): beta += ${w}`)
      } else {
        beta += 0.5 * w
        console.log(`Skipped (difficulty ${difficulty} < 3): beta += ${0.5 * w}`)
      }
    }

    // Set new alpha/beta values using the existing function
    const { data: setResult, error: setError } = await supabaseClient.functions.invoke('set-alpha-beta', {
      body: {
        user_id,
        entity_type: 'problem_number_type',
        entity_id: problem_number_type,
        alpha,
        beta,
        course_id: course_id || 'default'
      }
    })

    if (setError) {
      console.error('Error setting alpha/beta:', setError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to update alpha/beta values', 
          details: setError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Successfully updated problem number type ${problem_number_type}: alpha=${alpha}, beta=${beta}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          user_id,
          problem_number_type,
          old_alpha: alphaBetaResult?.data?.alpha || 1,
          old_beta: alphaBetaResult?.data?.beta || 40,
          new_alpha: alpha,
          new_beta: beta,
          mastery_probability: p,
          difficulty_weight: w,
          course_id: course_id || 'default'
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
        details: getErrorMessage(error) 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})