import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  topic_code: string
  status: string
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

    const { user_id, topic_code, status }: RequestBody = await req.json()

    // Validate required parameters
    if (!user_id || !topic_code || !status) {
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

    // Validate status values
    const validStatuses = ['mastered', 'not_mastered', 'continue']
    if (!validStatuses.includes(status)) {
      return new Response(
        JSON.stringify({ 
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Updating topic mastery status for user ${user_id}, topic ${topic_code}, status: ${status}`)

    // Insert or update the mastery status in student_mastery_status table
    const { error: upsertError } = await supabaseClient
      .from('student_mastery_status')
      .upsert({
        user_id,
        entity_type: 'topic',
        entity_id: topic_code,
        status,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'user_id,entity_type,entity_id'
      })

    if (upsertError) {
      console.error('Database error during upsert:', upsertError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to update mastery status', 
          details: upsertError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Successfully updated topic mastery status for user ${user_id}, topic ${topic_code}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          user_id,
          entity_type: 'topic',
          entity_id: topic_code,
          status,
          message: 'Topic mastery status updated successfully'
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