import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  question_id: string
  course_id?: string | number
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

    const { user_id, question_id, course_id }: RequestBody = await req.json()

    // Validate required parameters
    if (!user_id || !question_id) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: user_id, question_id' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

console.log(`Starting attempt for user ${user_id}, question ${question_id}`)

    // Capture client origin to pass along for asset fallback
    const clientOrigin = req.headers.get('origin') || req.headers.get('referer') || ''

    // First, get question details by calling the get-question-details function
    const { data: questionDetailsResponse, error: questionDetailsError } = await supabaseClient.functions.invoke('get-question-details', {
      body: { question_id, origin: clientOrigin, course_id }
    })

    if (questionDetailsError || !questionDetailsResponse.success) {
      console.error('Failed to get question details:', questionDetailsError || questionDetailsResponse.error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get question details', 
          details: questionDetailsError?.message || questionDetailsResponse.error 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const questionDetails = questionDetailsResponse.data

    // Insert new attempt into student_activity table
    const { data: attemptData, error: insertError } = await supabaseClient
      .from('student_activity')
      .insert({
        user_id,
        question_id,
        answer_time_start: new Date().toISOString(),
        finished_or_not: false,
        skills: questionDetails.skills,
        topics: questionDetails.topics,
        problem_number_type: questionDetails.problem_number_type
      })
      .select('attempt_id')
      .single()

    if (insertError) {
      console.error('Database error inserting attempt:', insertError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to start attempt', 
          details: insertError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Successfully started attempt ${attemptData.attempt_id} for user ${user_id}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        attempt_id: attemptData.attempt_id,
        question_details: questionDetails
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