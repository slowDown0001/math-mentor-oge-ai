export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}


import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  original_increment: number
  duration: number
  threshold?: number
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { original_increment, duration, threshold = 500 }: RequestBody = await req.json()

    // Validate required parameters
    if (original_increment === undefined || duration === undefined) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: original_increment, duration' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate that parameters are numbers
    if (typeof original_increment !== 'number' || typeof duration !== 'number') {
      return new Response(
        JSON.stringify({ 
          error: 'original_increment and duration must be numbers' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate threshold if provided
    if (threshold !== undefined && typeof threshold !== 'number') {
      return new Response(
        JSON.stringify({ 
          error: 'threshold must be a number' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Adjusting increment: ${original_increment}, duration: ${duration}, threshold: ${threshold}`)

    // Apply duration-based adjustment
    const adjusted_increment = duration > threshold ? 0.7 * original_increment : original_increment

    console.log(`Duration ${duration} vs threshold ${threshold} -> adjusted increment: ${adjusted_increment}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          original_increment,
          duration,
          threshold,
          adjusted_increment,
          was_reduced: duration > threshold
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



import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  score: number
  w: number
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { score, w }: RequestBody = await req.json()

    // Validate required parameters
    if (score === undefined || w === undefined) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: score, w' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate that parameters are numbers
    if (typeof score !== 'number' || typeof w !== 'number') {
      return new Response(
        JSON.stringify({ 
          error: 'score and w must be numbers' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Adjusting for score: ${score}, weight: ${w}`)

    let alpha_adjustment: number
    let beta_adjustment: number

    // Apply score-based adjustments
    if (score === 0) {
      alpha_adjustment = 0
      beta_adjustment = w
    } else if (score === 1) {
      alpha_adjustment = 0.5 * w
      beta_adjustment = 0
    } else if (score === 2) {
      alpha_adjustment = w
      beta_adjustment = 0
    } else {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid score. Must be 0, 1, or 2.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Score ${score} -> alpha adjustment: ${alpha_adjustment}, beta adjustment: ${beta_adjustment}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          score,
          w,
          alpha_adjustment,
          beta_adjustment
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


import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  entity_type: 'skill' | 'problem_number_type'
  entity_id: number
  x_n: number // 1 for correct, 0 for incorrect
  k?: number  // threshold parameter, default 0.5
  h?: number  // decision threshold, default 3.0
}

interface CusumResult {
  new_s: number
  adjustment: number
}

function applyCusum(currentS: number, xN: number, k: number = 0.5, h: number = 3.0): CusumResult {
  const newS = Math.max(0, currentS + (xN - k))
  let adjustment = 0.0
  let finalS = newS

  if (newS > h) {
    adjustment = 0.5  // Boost alpha by 0.5
    finalS = 0        // Reset
  } else if (newS < -h) {
    adjustment = -0.5 // Increase beta by 0.5 (negative indicates beta adjustment)
    finalS = 0        // Reset
  }

  return { new_s: finalS, adjustment }
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

    const { user_id, entity_type, entity_id, x_n, k = 0.5, h = 3.0 }: RequestBody = await req.json()

    // Validate required parameters
    if (!user_id || !entity_type || entity_id === undefined || x_n === undefined) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: user_id, entity_type, entity_id, x_n' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate entity_type
    if (!['skill', 'problem_number_type'].includes(entity_type)) {
      return new Response(
        JSON.stringify({ 
          error: 'entity_type must be either "skill" or "problem_number_type"' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate x_n (should be 0 or 1)
    if (x_n !== 0 && x_n !== 1) {
      return new Response(
        JSON.stringify({ 
          error: 'x_n must be either 0 (incorrect) or 1 (correct)' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Applying CUSUM for user ${user_id}, ${entity_type} ${entity_id}, x_n=${x_n}, k=${k}, h=${h}`)

    // Get current mastery data including cusum_s
    const { data: masteryData, error: masteryError } = await supabaseClient
      .from('student_mastery')
      .select('alpha, beta, cusum_s')
      .eq('user_id', user_id)
      .eq('entity_type', entity_type)
      .eq('entity_id', entity_id)
      .maybeSingle()

    if (masteryError) {
      console.error('Error fetching mastery data:', masteryError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch mastery data', 
          details: masteryError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // If no mastery data exists, create initial record with default values
    let currentAlpha = masteryData?.alpha ?? 1.0
    let currentBeta = masteryData?.beta ?? 1.0
    let currentCusumS = masteryData?.cusum_s ?? 0.0

    console.log(`Current values: alpha=${currentAlpha}, beta=${currentBeta}, cusum_s=${currentCusumS}`)

    // Apply CUSUM algorithm
    const cusumResult = applyCusum(currentCusumS, x_n, k, h)
    const newCusumS = cusumResult.new_s
    const adjustment = cusumResult.adjustment

    console.log(`CUSUM result: new_s=${newCusumS}, adjustment=${adjustment}`)

    // Apply adjustments to alpha/beta if needed
    let newAlpha = currentAlpha
    let newBeta = currentBeta

    if (adjustment > 0) {
      // Boost alpha
      newAlpha = currentAlpha + adjustment
      console.log(`Boosting alpha by ${adjustment}: ${currentAlpha} -> ${newAlpha}`)
    } else if (adjustment < 0) {
      // Increase beta (adjustment is negative)
      newBeta = currentBeta + Math.abs(adjustment)
      console.log(`Increasing beta by ${Math.abs(adjustment)}: ${currentBeta} -> ${newBeta}`)
    }

    // Update mastery data with new values
    const { error: updateError } = await supabaseClient
      .from('student_mastery')
      .upsert({
        user_id,
        entity_type,
        entity_id,
        alpha: newAlpha,
        beta: newBeta,
        cusum_s: newCusumS,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,entity_type,entity_id'
      })

    if (updateError) {
      console.error('Error updating mastery data:', updateError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to update mastery data', 
          details: updateError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Successfully applied CUSUM for user ${user_id}, ${entity_type} ${entity_id}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          user_id,
          entity_type,
          entity_id,
          x_n,
          previous_values: {
            alpha: currentAlpha,
            beta: currentBeta,
            cusum_s: currentCusumS
          },
          new_values: {
            alpha: newAlpha,
            beta: newBeta,
            cusum_s: newCusumS
          },
          cusum_parameters: { k, h },
          adjustment_applied: adjustment !== 0,
          adjustment_amount: adjustment
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


import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  entity_type: 'skill' | 'problem_number_type'
  entity_id: number
  adjustment: number
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

    const { user_id, entity_type, entity_id, adjustment }: RequestBody = await req.json()

    // Validate required parameters
    if (!user_id || !entity_type || entity_id === undefined || adjustment === undefined) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: user_id, entity_type, entity_id, adjustment' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate entity_type
    if (!['skill', 'problem_number_type'].includes(entity_type)) {
      return new Response(
        JSON.stringify({ 
          error: 'entity_type must be either "skill" or "problem_number_type"' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Applying CUSUM adjustment ${adjustment} for user ${user_id}, ${entity_type} ${entity_id}`)

    // Get current alpha and beta values
    const getAlphaBetaResponse = await supabaseClient.functions.invoke('get-alpha-beta', {
      body: {
        user_id,
        entity_type,
        entity_id
      }
    })

    if (getAlphaBetaResponse.error) {
      console.error('Error getting alpha/beta:', getAlphaBetaResponse.error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get current alpha/beta values', 
          details: getAlphaBetaResponse.error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize alpha and beta if not found
    let alpha = 1
    let beta = 40

    if (getAlphaBetaResponse.data?.success && getAlphaBetaResponse.data?.data?.alpha !== null) {
      alpha = getAlphaBetaResponse.data.data.alpha
      beta = getAlphaBetaResponse.data.data.beta
    }

    console.log(`Current alpha: ${alpha}, beta: ${beta}`)

    // Apply adjustment
    if (adjustment > 0) {
      alpha += adjustment
    } else if (adjustment < 0) {
      beta += Math.abs(adjustment)
    }

    console.log(`New alpha: ${alpha}, beta: ${beta}`)

    // Set new alpha and beta values
    const setAlphaBetaResponse = await supabaseClient.functions.invoke('set-alpha-beta', {
      body: {
        user_id,
        entity_type,
        entity_id,
        alpha,
        beta
      }
    })

    if (setAlphaBetaResponse.error) {
      console.error('Error setting alpha/beta:', setAlphaBetaResponse.error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to set new alpha/beta values', 
          details: setAlphaBetaResponse.error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Successfully applied CUSUM adjustment for user ${user_id}, ${entity_type} ${entity_id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          user_id,
          entity_type,
          entity_id,
          adjustment,
          old_alpha: alpha - (adjustment > 0 ? adjustment : 0),
          old_beta: beta - (adjustment < 0 ? Math.abs(adjustment) : 0),
          new_alpha: alpha,
          new_beta: beta
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


import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  entity_type: 'skill' | 'problem_number_type'
  entity_id: number
  t_current: string // ISO string
  t_attempt: string // ISO string
  lambda_decay: number
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

    const { user_id, entity_type, entity_id, t_current, t_attempt, lambda_decay }: RequestBody = await req.json()

    // Validate required parameters
    if (!user_id || !entity_type || entity_id === undefined || !t_current || !t_attempt || lambda_decay === undefined) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: user_id, entity_type, entity_id, t_current, t_attempt, lambda_decay' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate entity_type
    if (!['skill', 'problem_number_type'].includes(entity_type)) {
      return new Response(
        JSON.stringify({ 
          error: 'entity_type must be either "skill" or "problem_number_type"' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Applying time decay for user ${user_id}, ${entity_type} ${entity_id}`)

    // Get alpha and beta using the existing get-alpha-beta function
    const { data: alphaBetaResult, error: alphaBetaError } = await supabaseClient.functions.invoke('get-alpha-beta', {
      body: {
        user_id,
        entity_type,
        entity_id
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

    // Check if alpha/beta were found
    const { alpha, beta } = alphaBetaResult.data
    if (alpha === null || beta === null) {
      console.log(`No alpha/beta found for user ${user_id}, ${entity_type} ${entity_id}`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            alpha_decayed: null,
            beta_decayed: null,
            message: 'No alpha/beta values found for this entity'
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Compute time decay using the compute-time-decay function
    const { data: timeDecayResult, error: timeDecayError } = await supabaseClient.functions.invoke('compute-time-decay', {
      body: {
        lambda_decay,
        t_current,
        t_attempt
      }
    })

    if (timeDecayError) {
      console.error('Error computing time decay:', timeDecayError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to compute time decay', 
          details: timeDecayError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const timeDecay = timeDecayResult.data.time_decay

    // Apply decay weight: (alpha * w, beta * w)
    const alphaDecayed = alpha * timeDecay
    const betaDecayed = beta * timeDecay

    console.log(`Applied time decay: alpha ${alpha} -> ${alphaDecayed}, beta ${beta} -> ${betaDecayed}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          alpha_decayed: alphaDecayed,
          beta_decayed: betaDecayed,
          original_alpha: alpha,
          original_beta: beta,
          time_decay: timeDecay,
          delta_days: timeDecayResult.data.delta_days
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


import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  attempt_id: number
  finished_or_not: boolean
  is_correct?: boolean
  scores_fipi?: number
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

    const { attempt_id, finished_or_not, is_correct, scores_fipi }: RequestBody = await req.json()

    // Validate required parameters
    if (attempt_id === undefined || finished_or_not === undefined) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: attempt_id, finished_or_not' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Completing attempt ${attempt_id}: finished=${finished_or_not}, correct=${is_correct}, scores=${scores_fipi}`)

    // First, get the current attempt to calculate duration
    const { data: currentAttempt, error: fetchError } = await supabaseClient
      .from('student_activity')
      .select('answer_time_start')
      .eq('attempt_id', attempt_id)
      .single()

    if (fetchError || !currentAttempt) {
      console.error('Failed to fetch attempt:', fetchError)
      return new Response(
        JSON.stringify({ 
          error: 'Attempt not found', 
          details: fetchError?.message 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Calculate duration in seconds
    const startTime = new Date(currentAttempt.answer_time_start)
    const currentTime = new Date()
    const durationSeconds = (currentTime.getTime() - startTime.getTime()) / 1000

    // Update the attempt with completion data
    const { data: updatedAttempt, error: updateError } = await supabaseClient
      .from('student_activity')
      .update({
        finished_or_not,
        is_correct: is_correct ?? null,
        scores_fipi: scores_fipi ?? null,
        duration_answer: durationSeconds
      })
      .eq('attempt_id', attempt_id)
      .select()
      .single()

    if (updateError) {
      console.error('Database error updating attempt:', updateError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to complete attempt', 
          details: updateError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Successfully completed attempt ${attempt_id} with duration ${durationSeconds}s`)

    return new Response(
      JSON.stringify({ 
        success: true,
        attempt_id,
        duration_seconds: durationSeconds,
        updated_attempt: updatedAttempt
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


import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  scaling_type: string // 'linear' or 'exponential'
  d: number // difficulty level (1-5)
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { scaling_type, d }: RequestBody = await req.json()

    // Validate required parameters
    if (scaling_type === undefined || d === undefined) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: scaling_type and d are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate parameter types
    if (typeof scaling_type !== 'string' || typeof d !== 'number') {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid parameter types: scaling_type must be string, d must be number' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate scaling_type
    if (scaling_type !== 'linear' && scaling_type !== 'exponential') {
      return new Response(
        JSON.stringify({ 
          error: "Invalid scaling_type. Must be 'linear' or 'exponential'" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate difficulty range
    if (d < 1 || d > 5 || !Number.isInteger(d)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid difficulty. Must be an integer between 1 and 5' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Computing difficulty weight for scaling_type: ${scaling_type}, difficulty: ${d}`)

    // Compute difficulty weight based on scaling type
    let weight: number
    if (scaling_type === 'linear') {
      weight = d
    } else { // exponential
      weight = Math.pow(2, d - 1)
    }

    console.log(`Computed difficulty weight: ${weight}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          scaling_type,
          difficulty: d,
          weight
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


import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  alpha: number
  beta: number
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { alpha, beta }: RequestBody = await req.json()

    // Validate required parameters
    if (alpha === undefined || beta === undefined) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: alpha, beta' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate that parameters are numbers
    if (typeof alpha !== 'number' || typeof beta !== 'number') {
      return new Response(
        JSON.stringify({ 
          error: 'alpha and beta must be numbers' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Computing mastery probability for alpha: ${alpha}, beta: ${beta}`)

    // Compute mastery probability: p = alpha / (alpha + beta)
    let masteryProbability: number
    if (alpha + beta > 0) {
      masteryProbability = alpha / (alpha + beta)
    } else {
      masteryProbability = 0.0
    }

    console.log(`Computed mastery probability: ${masteryProbability}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          alpha,
          beta,
          mastery_probability: masteryProbability
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


import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  lambda_decay: number
  t_current: string // ISO string
  t_attempt?: string // ISO string, optional
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { lambda_decay, t_current, t_attempt }: RequestBody = await req.json()

    // Validate required parameters
    if (lambda_decay === undefined || !t_current) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: lambda_decay, t_current' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // If t_attempt is null/undefined, return 1
    if (!t_attempt) {
      console.log(`t_attempt is null/undefined, returning time_decay = 1`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            time_decay: 1,
            delta_days: null,
            lambda_decay,
            t_current,
            t_attempt: null
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Computing time decay with lambda=${lambda_decay}, current=${t_current}, attempt=${t_attempt}`)

    // Parse dates
    const currentDate = new Date(t_current)
    const attemptDate = new Date(t_attempt)

    // Validate dates
    if (isNaN(currentDate.getTime()) || isNaN(attemptDate.getTime())) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid date format. Use ISO string format.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Calculate delta_days = (t_current - t_attempt).days
    const deltaMs = currentDate.getTime() - attemptDate.getTime()
    const deltaDays = deltaMs / (1000 * 60 * 60 * 24)

    // Compute exp(-lambda_decay * delta_days)
    const timeDecay = Math.exp(-lambda_decay * deltaDays)

    console.log(`Delta days: ${deltaDays}, Time decay: ${timeDecay}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          time_decay: timeDecay,
          delta_days: deltaDays,
          lambda_decay,
          t_current,
          t_attempt
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



import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  topic_code: string
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

    const { user_id, topic_code }: RequestBody = await req.json()

    // Validate required parameters
    if (!user_id || !topic_code) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: user_id, topic_code' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Computing topic mastery for user ${user_id}, topic ${topic_code}`)

    // Step 1: Get skill IDs for the topic
    const { data: skillsData, error: skillsError } = await supabaseClient.functions.invoke(
      'get-skills-for-topic',
      {
        body: { topic_code }
      }
    )

    if (skillsError) {
      console.error('Error getting skills for topic:', skillsError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get skills for topic', 
          details: skillsError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const skillIds = skillsData?.skill_ids || []
    
    if (!skillIds || skillIds.length === 0) {
      console.log(`No skills found for topic ${topic_code}`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            user_id,
            topic_code,
            topic_mastery: null,
            message: 'No skills found for this topic'
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Found ${skillIds.length} skills for topic ${topic_code}: [${skillIds.join(', ')}]`)

    // Step 2: Get alpha/beta and compute mastery probability for each skill
    const masteryPromises = skillIds.map(async (skillId: number) => {
      try {
        // Get alpha/beta for this skill
        const { data: alphaBetaData, error: alphaBetaError } = await supabaseClient.functions.invoke(
          'get-alpha-beta',
          {
            body: {
              user_id,
              entity_type: 'skill',
              entity_id: skillId
            }
          }
        )

        if (alphaBetaError) {
          console.error(`Error getting alpha/beta for skill ${skillId}:`, alphaBetaError)
          return null
        }

        const { alpha, beta } = alphaBetaData?.data || {}
        
        if (alpha === null || beta === null) {
          console.log(`No alpha/beta data found for user ${user_id}, skill ${skillId}`)
          return null
        }

        // Compute mastery probability
        const { data: masteryData, error: masteryError } = await supabaseClient.functions.invoke(
          'compute-mastery-probability',
          {
            body: { alpha, beta }
          }
        )

        if (masteryError) {
          console.error(`Error computing mastery probability for skill ${skillId}:`, masteryError)
          return null
        }

        const masteryProbability = masteryData?.data?.mastery_probability
        console.log(`Skill ${skillId}: alpha=${alpha}, beta=${beta}, mastery=${masteryProbability}`)
        
        return masteryProbability
      } catch (error) {
        console.error(`Error processing skill ${skillId}:`, error)
        return null
      }
    })

    // Wait for all mastery probability calculations
    const masteryProbabilities = await Promise.all(masteryPromises)
    
    // Filter out null values
    const validMasteryProbabilities = masteryProbabilities.filter(p => p !== null) as number[]

    // Step 3: Compute average mastery probability
    let topicMastery: number | null = null
    if (validMasteryProbabilities.length > 0) {
      topicMastery = validMasteryProbabilities.reduce((sum, p) => sum + p, 0) / validMasteryProbabilities.length
    }

    console.log(`Topic ${topic_code} mastery for user ${user_id}: ${topicMastery} (based on ${validMasteryProbabilities.length}/${skillIds.length} skills)`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          user_id,
          topic_code,
          topic_mastery: topicMastery,
          skills_count: skillIds.length,
          valid_skills_count: validMasteryProbabilities.length,
          skill_masteries: skillIds.map((skillId, index) => ({
            skill_id: skillId,
            mastery_probability: masteryProbabilities[index]
          }))
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


import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  topic_code: string
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

    const { user_id, topic_code }: RequestBody = await req.json()

    // Validate required parameters
    if (!user_id || !topic_code) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: user_id, topic_code' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Computing topic mastery with decay for user ${user_id}, topic ${topic_code}`)

    // Step 1: Get skill IDs for the topic
    const { data: skillsData, error: skillsError } = await supabaseClient.functions.invoke(
      'get-skills-for-topic',
      {
        body: { topic_code }
      }
    )

    if (skillsError) {
      console.error('Error getting skills for topic:', skillsError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get skills for topic', 
          details: skillsError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const skillIds = skillsData?.skill_ids || []
    
    if (!skillIds || skillIds.length === 0) {
      console.log(`No skills found for topic ${topic_code}`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            user_id,
            topic_code,
            topic_mastery: null,
            message: 'No skills found for this topic'
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Found ${skillIds.length} skills for topic ${topic_code}: [${skillIds.join(', ')}]`)

    // Step 2: For each skill, apply time decay and compute mastery probability
    const t_current = new Date().toISOString()
    const masteryPromises = skillIds.map(async (skillId: number) => {
      try {
        // Get latest attempt time for this skill
        const { data: attemptData, error: attemptError } = await supabaseClient.functions.invoke(
          'get-latest-attempt-time',
          {
            body: {
              user_id,
              entity_type: 'skill',
              entity_id: skillId
            }
          }
        )

        if (attemptError) {
          console.error(`Error getting latest attempt time for skill ${skillId}:`, attemptError)
          return null
        }

        const t_attempt = attemptData?.data?.latest_attempt_time
        
        if (!t_attempt) {
          console.log(`No attempt time found for user ${user_id}, skill ${skillId}`)
          return null
        }

        // Apply time decay to alpha/beta params
        const { data: decayData, error: decayError } = await supabaseClient.functions.invoke(
          'apply-time-decay-to-params',
          {
            body: {
              user_id,
              entity_type: 'skill',
              entity_id: skillId,
              t_current,
              t_attempt,
              lambda_decay: 0.01
            }
          }
        )

        if (decayError) {
          console.error(`Error applying time decay for skill ${skillId}:`, decayError)
          return null
        }

        const { alpha_decayed, beta_decayed } = decayData?.data || {}
        
        if (alpha_decayed === null || beta_decayed === null) {
          console.log(`No decayed alpha/beta data for user ${user_id}, skill ${skillId}`)
          return null
        }

        // Compute mastery probability
        const { data: masteryData, error: masteryError } = await supabaseClient.functions.invoke(
          'compute-mastery-probability',
          {
            body: { alpha: alpha_decayed, beta: beta_decayed }
          }
        )

        if (masteryError) {
          console.error(`Error computing mastery probability for skill ${skillId}:`, masteryError)
          return null
        }

        const masteryProbability = masteryData?.data?.mastery_probability
        console.log(`Skill ${skillId}: mastery probability = ${masteryProbability}`)
        
        return masteryProbability
      } catch (error) {
        console.error(`Error processing skill ${skillId}:`, error)
        return null
      }
    })

    // Wait for all mastery probability calculations
    const masteryProbabilities = await Promise.all(masteryPromises)
    
    // Filter out null values
    const validMasteryProbabilities = masteryProbabilities.filter(p => p !== null) as number[]

    // Step 3: Compute average mastery probability
    let topicMastery: number | null = null
    if (validMasteryProbabilities.length > 0) {
      topicMastery = validMasteryProbabilities.reduce((sum, p) => sum + p, 0) / validMasteryProbabilities.length
    }

    console.log(`Topic ${topic_code} mastery for user ${user_id}: ${topicMastery} (based on ${validMasteryProbabilities.length}/${skillIds.length} skills)`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          user_id,
          topic_code,
          topic_mastery: topicMastery,
          skills_count: skillIds.length,
          valid_skills_count: validMasteryProbabilities.length,
          skill_masteries: skillIds.map((skillId, index) => ({
            skill_id: skillId,
            mastery_probability: masteryProbabilities[index]
          }))
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


import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  p: number // mastery probability
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { p }: RequestBody = await req.json()

    // Validate required parameters
    if (p === undefined) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameter: p (mastery probability)' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate that parameter is a number
    if (typeof p !== 'number') {
      return new Response(
        JSON.stringify({ 
          error: 'p (mastery probability) must be a number' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Computing velocity factor for mastery probability: ${p}`)

    // Compute velocity factor based on tiered mastery probability
    let velocityFactor: number
    if (p < 0.2) {
      velocityFactor = 2
    } else if (p < 0.5) {
      velocityFactor = 0.725
    } else if (p < 0.7) {
      velocityFactor = 0.6667
    } else {
      velocityFactor = 0.5
    }

    console.log(`Computed velocity factor: ${velocityFactor}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          mastery_probability: p,
          velocity_factor: velocityFactor
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


import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  entity_type: 'skill' | 'problem_number_type'
  entity_id: number
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

    const { user_id, entity_type, entity_id }: RequestBody = await req.json()

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

    // Validate entity_type
    if (!['skill', 'problem_number_type'].includes(entity_type)) {
      return new Response(
        JSON.stringify({ 
          error: 'entity_type must be either "skill" or "problem_number_type"' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Getting alpha/beta for user ${user_id}, ${entity_type} ${entity_id}`)

    // Query the student_mastery table
    const { data, error } = await supabaseClient
      .from('student_mastery')
      .select('alpha, beta')
      .eq('user_id', user_id)
      .eq('entity_type', entity_type)
      .eq('entity_id', entity_id)
      .maybeSingle()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to retrieve alpha/beta values', 
          details: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Return the data or null if not found (replicating Python's (None, None) behavior)
    const result = data ? { alpha: data.alpha, beta: data.beta } : { alpha: null, beta: null }
    
    console.log(`Retrieved alpha/beta for user ${user_id}, ${entity_type} ${entity_id}:`, result)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result
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


import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  entity_type: 'skill' | 'problem_number_type'
  entity_id: number
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

    const { user_id, entity_type, entity_id }: RequestBody = await req.json()

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

    // Validate entity_type
    if (!['skill', 'problem_number_type'].includes(entity_type)) {
      return new Response(
        JSON.stringify({ 
          error: 'entity_type must be either "skill" or "problem_number_type"' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Getting cusum_s for user ${user_id}, ${entity_type} ${entity_id}`)

    // Query the student_mastery table for cusum_s value
    const { data, error } = await supabaseClient
      .from('student_mastery')
      .select('cusum_s')
      .eq('user_id', user_id)
      .eq('entity_type', entity_type)
      .eq('entity_id', entity_id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to retrieve cusum_s value', 
          details: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const cusumS = data?.cusum_s || null

    console.log(`Retrieved cusum_s: ${cusumS} for user ${user_id}, ${entity_type} ${entity_id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          user_id,
          entity_type,
          entity_id,
          cusum_s: cusumS
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


import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  entity_type: 'skill' | 'problem_number_type'
  entity_id: number
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

    const { user_id, entity_type, entity_id }: RequestBody = await req.json()

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

    console.log(`Getting latest attempt time for user ${user_id}, ${entity_type} ${entity_id}`)

    let query = supabaseClient
      .from('student_activity')
      .select('updated_at')
      .eq('user_id', user_id)
      .order('updated_at', { ascending: false })
      .limit(1)

    // Add entity-specific filter
    if (entity_type === 'skill') {
      query = query.contains('skills', [entity_id])
    } else {
      query = query.eq('problem_number_type', entity_id)
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to retrieve latest attempt time', 
          details: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const latestAttemptTime = data && data.length > 0 ? data[0].updated_at : null

    console.log(`Latest attempt time: ${latestAttemptTime}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          latest_attempt_time: latestAttemptTime
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )a

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



import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  entity_type: 'skill' | 'problem_number_type'
  entity_id: number
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

    const { user_id, entity_type, entity_id }: RequestBody = await req.json()

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

    console.log(`Getting latest attempt time for user ${user_id}, ${entity_type} ${entity_id}`)

    let query = supabaseClient
      .from('student_activity')
      .select('updated_at')
      .eq('user_id', user_id)
      .order('updated_at', { ascending: false })
      .limit(1)

    // Add entity-specific filter
    if (entity_type === 'skill') {
      query = query.contains('skills', [entity_id])
    } else {
      query = query.eq('problem_number_type', entity_id)
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to retrieve latest attempt time', 
          details: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const latestAttemptTime = data && data.length > 0 ? data[0].updated_at : null

    console.log(`Latest attempt time: ${latestAttemptTime}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
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