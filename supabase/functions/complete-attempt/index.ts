import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  attempt_id: number
  finished_or_not: boolean
  is_correct?: boolean
  scores_fipi?: number
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

    const { attempt_id, finished_or_not, is_correct, scores_fipi }: RequestBody = await req.json()

    // Validate required parameters
    if (attempt_id === undefined || finished_or_not === undefined) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: attempt_id, finished_or_not' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Completing attempt ${attempt_id}: finished=${finished_or_not}, correct=${is_correct}, scores=${scores_fipi}`)

    // First, get the current attempt to calculate duration
    const { data: currentAttempt, error: fetchError } = await supabaseClient
      .from('student_activity')
      .select('answer_time_start')
      .eq('attempt_id', attempt_id)
      .single()

    if (fetchError || !currentAttempt) {
      console.error('Failed to fetch attempt:', fetchError)
      return new Response(
        JSON.stringify({ 
          error: 'Attempt not found', 
          details: fetchError?.message 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Calculate duration in seconds
    const startTime = new Date(currentAttempt.answer_time_start)
    const currentTime = new Date()
    const durationSeconds = (currentTime.getTime() - startTime.getTime()) / 1000

    // Update the attempt with completion data
    const { data: updatedAttempt, error: updateError } = await supabaseClient
      .from('student_activity')
      .update({
        finished_or_not,
        is_correct: is_correct ?? null,
        scores_fipi: scores_fipi ?? null,
        duration_answer: durationSeconds
      })
      .eq('attempt_id', attempt_id)
      .select()
      .single()

    if (updateError) {
      console.error('Database error updating attempt:', updateError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to complete attempt', 
          details: updateError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Successfully completed attempt ${attempt_id} with duration ${durationSeconds}s`)

    return new Response(
      JSON.stringify({ 
        success: true,
        attempt_id,
        duration_seconds: durationSeconds,
        updated_attempt: updatedAttempt
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