import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { getErrorMessage } from '../_shared/error-utils.ts'

interface RequestBody {
  user_id: string
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

    const { user_id, course_id }: RequestBody = await req.json()

    if (!user_id || !course_id) {
      return new Response(
        JSON.stringify({ error: 'user_id and course_id are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Deleting mastery data for user ${user_id}, course ${course_id}`)

    // Delete all mastery data for the user and course
    const { error } = await supabaseClient
      .from('student_mastery')
      .delete()
      .eq('user_id', user_id)
      .eq('course_id', course_id)

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to delete mastery data', details: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Successfully deleted mastery data for user ${user_id}, course ${course_id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Mastery data deleted successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: getErrorMessage(error) }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})