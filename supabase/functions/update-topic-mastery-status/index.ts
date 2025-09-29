import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  topic_code: number
  status: string
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

    const { user_id, topic_code, status, course_id }: RequestBody = await req.json()

    // Validate required parameters
    if (!user_id || topic_code === undefined || !status) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: user_id, topic_code, status' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate status
    if (!['mastered', 'not_mastered', 'continue'].includes(status)) {
      return new Response(
        JSON.stringify({ 
          error: 'status must be either "mastered", "not_mastered", or "continue"' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Updating topic mastery status for user ${user_id}, topic ${topic_code} to ${status}`)

    // Store/update the mastery status for the topic in student_mastery_status table
    const { data, error } = await supabaseClient
      .from('student_mastery_status')
      .upsert({
        user_id,
        entity_type: 'topic',
        entity_id: topic_code.toString(),
        status,
        course_id: course_id || 'default',
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'user_id,entity_type,entity_id,course_id'
      })

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to update topic mastery status', 
          details: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Successfully updated topic mastery status for topic ${topic_code} to ${status}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          user_id,
          entity_type: 'topic',
          entity_id: topic_code,
          status,
          course_id: course_id || 'default',
          last_updated: new Date().toISOString()
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