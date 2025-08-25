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