import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  outcomes: number[]
  p_h0: number
  p_h1: number
  A?: number
  B?: number
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { outcomes, p_h0, p_h1, A = 0.05, B = 20 }: RequestBody = await req.json()

    // Validate required parameters
    if (!outcomes || p_h0 === undefined || p_h1 === undefined) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: outcomes, p_h0, p_h1' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate probability parameters
    if (p_h0 < 0 || p_h0 > 1 || p_h1 < 0 || p_h1 > 1) {
      return new Response(
        JSON.stringify({ 
          error: 'Probabilities p_h0 and p_h1 must be between 0 and 1' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (p_h0 >= p_h1) {
      return new Response(
        JSON.stringify({ 
          error: 'p_h0 must be less than p_h1' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Performing SPRT with ${outcomes.length} outcomes, p_h0=${p_h0}, p_h1=${p_h1}, A=${A}, B=${B}`)

    // Perform Sequential Probability Ratio Test
    let lambda_n = 1.0

    for (const x_j of outcomes) {
      const prob_h1 = x_j === 1 ? p_h1 : (1 - p_h1)
      const prob_h0 = x_j === 1 ? p_h0 : (1 - p_h0)
      
      // Avoid division by zero
      if (prob_h0 === 0) {
        console.warn('prob_h0 is zero, adjusting to small value')
        lambda_n *= prob_h1 / 0.001
      } else {
        lambda_n *= prob_h1 / prob_h0
      }
    }

    console.log(`Lambda_n calculated: ${lambda_n}`)

    // Determine status based on thresholds
    let status: string
    if (lambda_n <= A) {
      status = 'not_mastered'
    } else if (lambda_n >= B) {
      status = 'mastered'
    } else {
      status = 'continue'
    }

    console.log(`SPRT result: ${status}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          status,
          lambda_n,
          threshold_A: A,
          threshold_B: B,
          outcomes_count: outcomes.length,
          p_h0,
          p_h1
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