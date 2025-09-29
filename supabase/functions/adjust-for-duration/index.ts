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