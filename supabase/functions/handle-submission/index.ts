import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { getErrorMessage } from '../_shared/error-utils.ts'

interface SubmissionData {
  user_id: string
  question_id: string
  finished_or_not: boolean
  is_correct: boolean
  duration?: number
  scores_fipi?: number
}

interface RequestBody {
  course_id?: string
  submission_data: SubmissionData
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

    const { course_id, submission_data }: RequestBody = await req.json()

    // Validate required parameters
    if (!submission_data || !submission_data.user_id || !submission_data.question_id || 
        submission_data.finished_or_not === undefined || submission_data.is_correct === undefined) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters in submission_data: user_id, question_id, finished_or_not, is_correct' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Handling submission for user ${submission_data.user_id}, question ${submission_data.question_id}`)

    // Step 1: Fetch question details using the existing function
    const { data: questionDetailsResult, error: questionDetailsError } = await supabaseClient.functions.invoke('get-question-details', {
      body: {
        question_id: submission_data.question_id
      }
    })

    if (questionDetailsError) {
      console.error('Error getting question details:', questionDetailsError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get question details', 
          details: questionDetailsError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const questionDetails = questionDetailsResult?.data
    if (!questionDetails) {
      console.error('No question details found for question:', submission_data.question_id)
      return new Response(
        JSON.stringify({ 
          error: 'Question details not found', 
          question_id: submission_data.question_id 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Question details retrieved: difficulty=${questionDetails.difficulty}, skills=${questionDetails.skills_list?.length || 0}`)

    // Step 2: Generate attempt_id (could be timestamp-based or random)
    const attempt_id = Date.now()

    // Step 3: Construct attempt_data matching the Python structure
    const attemptData = {
      user_id: submission_data.user_id,
      question_id: submission_data.question_id,
      finished_or_not: submission_data.finished_or_not,
      is_correct: submission_data.is_correct,
      difficulty: questionDetails.difficulty,
      skills_list: questionDetails.skills_list || [],
      topics_list: questionDetails.topics_list || [],
      problem_number_type: questionDetails.problem_number_type,
      duration: submission_data.duration || 0,
      scores_fipi: submission_data.scores_fipi,
      scaling_type: 'linear', // Default scaling type
      attempt_id: attempt_id,
      course_id: course_id || 'default'
    }

    console.log(`Constructed attempt data with ${attemptData.skills_list.length} skills and ${attemptData.topics_list.length} topics`)

    // Step 4: Process the attempt using the existing function
    const { data: processResult, error: processError } = await supabaseClient.functions.invoke('process-attempt', {
      body: attemptData
    })

    if (processError) {
      console.error('Error processing attempt:', processError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to process attempt', 
          details: processError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Successfully processed submission for user ${submission_data.user_id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          user_id: submission_data.user_id,
          question_id: submission_data.question_id,
          attempt_id: attempt_id,
          course_id: course_id || 'default',
          question_details: questionDetails,
          process_result: processResult,
          processed_skills: attemptData.skills_list.length,
          processed_topics: attemptData.topics_list.length
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