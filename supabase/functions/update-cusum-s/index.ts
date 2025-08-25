import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  entity_type: 'skill' | 'problem_number_type'
  entity_id: number
  new_s: number
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

    const { user_id, entity_type, entity_id, new_s }: RequestBody = await req.json()

    // Validate required parameters
    if (!user_id || !entity_type || entity_id === undefined || new_s === undefined) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: user_id, entity_type, entity_id, new_s' 
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

    console.log(`Updating cusum_s to ${new_s} for user ${user_id}, ${entity_type} ${entity_id}`)

    // Update cusum_s value using upsert
    const { error } = await supabaseClient
      .from('student_mastery')
      .upsert({
        user_id,
        entity_type,
        entity_id,
        cusum_s: new_s,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,entity_type,entity_id'
      })

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to update cusum_s value', 
          details: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Successfully updated cusum_s to ${new_s} for user ${user_id}, ${entity_type} ${entity_id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          user_id,
          entity_type,
          entity_id,
          new_s,
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