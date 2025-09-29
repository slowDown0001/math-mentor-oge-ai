import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { getErrorMessage } from '../_shared/error-utils.ts'

interface RequestBody {
  user_id: string
  entity_type: 'skill' | 'problem_number_type'
  entity_id?: number
  entity_ids?: number[]
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

    const { user_id, entity_type, entity_id, entity_ids }: RequestBody = await req.json()

    // Validate required parameters
    if (!user_id || !entity_type || (entity_id === undefined && !entity_ids)) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: user_id, entity_type, and either entity_id or entity_ids' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Handle batch request for multiple entities
    if (entity_ids && entity_ids.length > 0) {
      console.log(`Getting latest attempt times for user ${user_id}, ${entity_type} [${entity_ids.join(', ')}]`)
      
      const results: { [key: number]: string | null } = {}
      
      if (entity_type === 'skill') {
        // Build OR conditions for skills using overlaps operator
        const { data, error } = await supabaseClient
          .from('student_activity')
          .select('skills, updated_at')
          .eq('user_id', user_id)
          .order('updated_at', { ascending: false })
        
        if (error) {
          console.error('Database error:', error)
          return new Response(
            JSON.stringify({ 
              error: 'Failed to retrieve latest attempt times', 
              details: error.message 
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Find latest attempt for each skill
        for (const entityId of entity_ids) {
          const latestActivity = data?.find(activity => 
            activity.skills && Array.isArray(activity.skills) && activity.skills.includes(entityId)
          )
          results[entityId] = latestActivity?.updated_at || null
        }
      } else {
        // For problem_number_type, use IN operator
        const { data, error } = await supabaseClient
          .from('student_activity')
          .select('problem_number_type, updated_at')
          .eq('user_id', user_id)
          .in('problem_number_type', entity_ids)
          .order('updated_at', { ascending: false })
        
        if (error) {
          console.error('Database error:', error)
          return new Response(
            JSON.stringify({ 
              error: 'Failed to retrieve latest attempt times', 
              details: error.message 
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Group by problem_number_type and get latest for each
        const grouped = data?.reduce((acc: { [key: number]: string }, curr) => {
          if (!acc[curr.problem_number_type] || curr.updated_at > acc[curr.problem_number_type]) {
            acc[curr.problem_number_type] = curr.updated_at
          }
          return acc
        }, {}) || {}

        for (const entityId of entity_ids) {
          results[entityId] = grouped[entityId] || null
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            latest_attempt_times: results
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Handle single entity request (backward compatibility)
    console.log(`Getting latest attempt time for user ${user_id}, ${entity_type} ${entity_id}`)

    let query = supabaseClient
      .from('student_activity')
      .select('updated_at')
      .eq('user_id', user_id)
      .order('updated_at', { ascending: false })
      .limit(1)

    // Add entity-specific filter
    if (entity_type === 'skill') {
      query = query.contains('skills', [entity_id])
    } else {
      query = query.eq('problem_number_type', entity_id)
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to retrieve latest attempt time', 
          details: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const latestAttemptTime = data && data.length > 0 ? data[0].updated_at : null

    console.log(`Latest attempt time: ${latestAttemptTime}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          latest_attempt_time: latestAttemptTime
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