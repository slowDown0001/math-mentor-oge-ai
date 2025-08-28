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

    // Step 1: Fetch question details
    const { data: questionDetails, error: questionDetailsError } = await supabaseClient.functions.invoke('get-question-details', {
      body: {
        question_id: submissionData.question_id
      }
    })

    if (questionDetailsError || !questionDetails) {
      console.error('Failed to get question details:', questionDetailsError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get question details', 
          details: questionDetailsError?.message || 'Question not found' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Step 2: Get the is_correct value from student_activity table
    const { data: activityData, error: activityError } = await supabaseClient
      .from('student_activity')
      .select('is_correct')
      .eq('user_id', submissionData.user_id)
      .eq('question_id', submissionData.question_id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (activityError) {
      console.error('Failed to get activity data:', activityError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get activity data', 
          details: activityError.message 
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
      is_correct: activityData?.is_correct || false,
      difficulty: questionDetails.difficulty || 1,
      skills_list: questionDetails.skills || [],
      topics_list: questionDetails.topics || [],
      problem_number_type: questionDetails.problem_number_type,
      duration: submissionData.duration || 0,
      scores_fipi: submissionData.scores_fipi,
      scaling_type: submissionData.scaling_type || 'linear',
      attempt_id: submissionData.attempt_id || null
    }

    // Step 3: Process attempt (update mastery estimates)
    const { data: processAttemptResponse, error: processAttemptError } = await supabaseClient.functions.invoke('process-attempt', {
      body: attemptData
    })

    if (processAttemptError) {
      console.error('Failed to process attempt:', processAttemptError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to process attempt', 
          details: processAttemptError?.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Successfully handled submission for user ${submissionData.user_id}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        question_details: questionDetails,
        processing_result: processAttemptResponse
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