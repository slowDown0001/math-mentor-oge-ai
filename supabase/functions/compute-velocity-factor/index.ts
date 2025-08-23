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