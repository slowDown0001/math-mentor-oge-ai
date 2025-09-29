import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
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
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})