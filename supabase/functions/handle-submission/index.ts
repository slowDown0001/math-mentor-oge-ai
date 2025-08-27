import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface SubmissionData {
  user_id: string
  question_id: string
  finished_or_not: boolean
  is_correct?: boolean
  scores_fipi?: number
  duration?: number
  scaling_type?: string
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

    const submissionData: SubmissionData = await req.json()

    // Validate required parameters
    if (!submissionData.user_id || !submissionData.question_id || submissionData.finished_or_not === undefined) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: user_id, question_id, finished_or_not' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Handling submission for user ${submissionData.user_id}, question ${submissionData.question_id}`)

    // Step 1: Start attempt
    const { data: startAttemptResponse, error: startAttemptError } = await supabaseClient.functions.invoke('start-attempt', {
      body: {
        user_id: submissionData.user_id,
        question_id: submissionData.question_id
      }
    })

    if (startAttemptError || !startAttemptResponse.success) {
      console.error('Failed to start attempt:', startAttemptError || startAttemptResponse.error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to start attempt', 
          details: startAttemptError?.message || startAttemptResponse.error 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const attemptId = startAttemptResponse.attempt_id
    const questionDetails = startAttemptResponse.question_details

    // Step 2: Complete attempt
    const { data: completeAttemptResponse, error: completeAttemptError } = await supabaseClient.functions.invoke('complete-attempt', {
      body: {
        attempt_id: attemptId,
        finished_or_not: submissionData.finished_or_not,
        is_correct: submissionData.is_correct,
        scores_fipi: submissionData.scores_fipi
      }
    })

    if (completeAttemptError || !completeAttemptResponse.success) {
      console.error('Failed to complete attempt:', completeAttemptError || completeAttemptResponse.error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to complete attempt', 
          details: completeAttemptError?.message || completeAttemptResponse.error 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Step 3: Construct attempt data for process-attempt
    const attemptData = {
      user_id: submissionData.user_id,
      question_id: submissionData.question_id,
      finished_or_not: submissionData.finished_or_not,
      is_correct: submissionData.is_correct || false,
      difficulty: questionDetails.difficulty || 1,
      skills_list: questionDetails.skills || [],
      topics_list: questionDetails.topics || [],
      problem_number_type: questionDetails.problem_number_type,
      duration: submissionData.duration || completeAttemptResponse.duration_seconds || 0,
      scores_fipi: submissionData.scores_fipi,
      scaling_type: submissionData.scaling_type || 'linear',
      attempt_id: attemptId
    }

    // Step 4: Process attempt (update mastery estimates)
    const { data: processAttemptResponse, error: processAttemptError } = await supabaseClient.functions.invoke('process-attempt', {
      body: attemptData
    })

    if (processAttemptError) {
      console.error('Failed to process attempt:', processAttemptError)
      // Don't fail the whole submission if processing fails, just log it
      console.warn('Continuing despite process-attempt failure')
    }

    console.log(`Successfully handled submission for attempt ${attemptId}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        attempt_id: attemptId,
        duration_seconds: completeAttemptResponse.duration_seconds,
        question_details: questionDetails,
        processing_result: processAttemptResponse || { error: 'Processing failed but submission completed' }
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