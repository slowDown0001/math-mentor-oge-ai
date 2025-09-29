import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { getErrorMessage } from '../_shared/error-utils.ts'

interface RequestBody {
  user_id: string
  entity_type: 'skill' | 'problem_number_type'
  entity_id: number
  days?: number
  min_attempts?: number
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

    const { user_id, entity_type, entity_id, days = 90, min_attempts = 5 }: RequestBody = await req.json()

    // Validate required parameters
    if (!user_id || !entity_type || entity_id === undefined) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: user_id, entity_type, entity_id' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Getting recent outcomes for user ${user_id}, ${entity_type} ${entity_id}, last ${days} days`)

    // First try last N days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    let query = supabaseClient
      .from('student_activity')
      .select('finished_or_not, is_correct, scores_fipi, answer_time_start')
      .eq('user_id', user_id)
      .gte('answer_time_start', startDate.toISOString())
      .order('answer_time_start', { ascending: false })

    // Add entity-specific filter
    if (entity_type === 'skill') {
      query = query.contains('skills', [entity_id])
    } else {
      query = query.eq('problem_number_type', entity_id)
    }

    const { data: recentData, error: recentError } = await query

    if (recentError) {
      console.error('Database error (recent):', recentError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to retrieve recent outcomes', 
          details: recentError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let outcomes = (recentData || []).map(row => {
      const finished = row.finished_or_not
      const correct = row.is_correct
      const score = row.scores_fipi
      
      return (finished && correct) || (finished && score !== null && score >= 1) ? 1 : 0
    })

    // If less than min_attempts, get last N attempts regardless of time
    if (outcomes.length < min_attempts) {
      console.log(`Only ${outcomes.length} outcomes in ${days} days, extending search`)
      
      let extendedQuery = supabaseClient
        .from('student_activity')
        .select('finished_or_not, is_correct, scores_fipi, answer_time_start')
        .eq('user_id', user_id)
        .order('answer_time_start', { ascending: false })
        .limit(min_attempts)

      // Add entity-specific filter
      if (entity_type === 'skill') {
        extendedQuery = extendedQuery.contains('skills', [entity_id])
      } else {
        extendedQuery = extendedQuery.eq('problem_number_type', entity_id)
      }

      const { data: extendedData, error: extendedError } = await extendedQuery

      if (extendedError) {
        console.error('Database error (extended):', extendedError)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to retrieve extended outcomes', 
            details: extendedError.message 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      outcomes = (extendedData || []).map(row => {
        const finished = row.finished_or_not
        const correct = row.is_correct
        const score = row.scores_fipi
        
        return (finished && correct) || (finished && score !== null && score >= 1) ? 1 : 0
      })
    }

    console.log(`Retrieved ${outcomes.length} outcomes:`, outcomes)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          outcomes,
          total_attempts: outcomes.length,
          success_rate: outcomes.length > 0 ? outcomes.reduce((a: number, b: number) => a + b, 0) / outcomes.length : 0
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