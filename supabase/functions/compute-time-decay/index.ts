import { corsHeaders } from '../_shared/cors.ts'
import { getErrorMessage } from '../_shared/error-utils.ts'

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
        details: getErrorMessage(error) 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})