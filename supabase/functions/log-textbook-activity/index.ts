import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface LogActivityPayload {
  activity_type: 'exercise' | 'test' | 'exam' | 'video' | 'article'
  activity: string
  status?: 'started' | 'finished' | 'opened' | 'read'
  solved_count?: number
  correct_count?: number
  total_questions?: number
  skills_involved?: string
  module_id?: string
  item_id?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      console.error('No authorization header provided')
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the JWT token and get user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.error('Authentication failed:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse the request body
    const payload: LogActivityPayload = await req.json()
    console.log('Received payload:', payload)

    // Generate work_done description
    let work_done = ''
    if (payload.status) {
      switch (payload.activity_type) {
        case 'video':
          work_done = payload.status === 'started' ? 'video started' : 'video finished'
          break
        case 'article':
          work_done = payload.status === 'opened' ? 'article opened' : 'article read'
          break
        default:
          work_done = payload.status
      }
    } else if (payload.solved_count !== undefined) {
      const total = payload.total_questions || 4
      if (payload.solved_count === 0) {
        work_done = `${payload.activity_type} started`
      } else {
        work_done = `${payload.solved_count}/${total} solved`
      }
    } else {
      work_done = `${payload.activity_type} activity`
    }

    // Insert into textbook_progress table
    const { data, error } = await supabase
      .from('textbook_progress')
      .insert({
        user_id: user.id,
        activity_type: payload.activity_type,
        activity: payload.activity,
        work_done: work_done,
        solved_count: payload.solved_count,
        correct_count: payload.correct_count,
        total_questions: payload.total_questions,
        skills_involved: payload.skills_involved,
        module_id: payload.module_id,
        item_id: payload.item_id,
      })

    if (error) {
      console.error('Database insert error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to log activity', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Successfully logged activity for user:', user.id)
    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})