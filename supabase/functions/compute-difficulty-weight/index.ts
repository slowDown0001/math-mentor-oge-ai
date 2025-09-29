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