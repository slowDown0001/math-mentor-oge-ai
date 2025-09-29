import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  entity_type: 'skill' | 'problem_number_type'
  entity_id: number
  adjustment: number
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

    const { user_id, entity_type, entity_id, adjustment, course_id }: RequestBody = await req.json()

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
        entity_id,
        course_id: course_id || 'default'
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
        beta,
        course_id: course_id || 'default'
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
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})