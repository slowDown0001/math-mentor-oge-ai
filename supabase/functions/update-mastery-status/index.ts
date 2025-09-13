import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  entity_type: 'skill' | 'problem_number_type'
  entity_id: number | string
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

    const { user_id, entity_type, entity_id, status, course_id }: RequestBody = await req.json()

    // Validate required parameters
    if (!user_id || !entity_type || entity_id === undefined || !status) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: user_id, entity_type, entity_id, status' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate entity_type
    if (!['skill', 'problem_number_type', 'topic'].includes(entity_type)) {
      return new Response(
        JSON.stringify({ 
          error: 'entity_type must be either "skill", "problem_number_type", or "topic"' 
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

    console.log(`Updating mastery status for user ${user_id}, ${entity_type} ${entity_id} to ${status}`)

    // First check if the table exists, if not create the record in student_mastery
    if (entity_type === 'skill' || entity_type === 'problem_number_type') {
      // Update the student_mastery table
      const { error: masteryError } = await supabaseClient
        .from('student_mastery')
        .upsert({
          user_id,
          entity_type,
          entity_id: parseInt(entity_id.toString()),
          status,
          course_id: course_id || 'default',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,entity_type,entity_id,course_id'
        })

      if (masteryError) {
        console.error('Error updating student_mastery:', masteryError)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to update mastery status in student_mastery', 
            details: masteryError.message 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Always update/insert into student_mastery_status table
    const { error: statusError } = await supabaseClient
      .from('student_mastery_status')
      .upsert({
        user_id,
        entity_type,
        entity_id: entity_id.toString(),
        status,
        course_id: course_id || 'default',
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'user_id,entity_type,entity_id,course_id'
      })

    if (statusError) {
      console.error('Error updating student_mastery_status:', statusError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to update mastery status', 
          details: statusError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Successfully updated mastery status for ${entity_type} ${entity_id} to ${status}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          user_id,
          entity_type,
          entity_id,
          status,
          updated_at: new Date().toISOString()
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