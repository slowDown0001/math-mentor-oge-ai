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