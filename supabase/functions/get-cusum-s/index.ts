import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { getErrorMessage } from '../_shared/error-utils.ts'

interface RequestBody {
  user_id: string
  entity_type: 'skill' | 'problem_number_type'
  entity_id: number
  course_id: string
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

    const { user_id, entity_type, entity_id, course_id }: RequestBody = await req.json()

    // Validate required parameters
    if (!user_id || !entity_type || entity_id === undefined || !course_id) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: user_id, entity_type, entity_id, course_id' 
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

    console.log(`Getting cusum_s for user ${user_id}, ${entity_type} ${entity_id}, course ${course_id}`)

    // Query the student_mastery table for cusum_s value
    const { data, error } = await supabaseClient
      .from('student_mastery')
      .select('cusum_s')
      .eq('user_id', user_id)
      .eq('entity_type', entity_type)
      .eq('entity_id', entity_id)
      .eq('course_id', course_id)
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

    console.log(`Retrieved cusum_s: ${cusumS} for user ${user_id}, ${entity_type} ${entity_id}, course ${course_id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          user_id,
          entity_type,
          entity_id,
          course_id,
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
        details: getErrorMessage(error)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})