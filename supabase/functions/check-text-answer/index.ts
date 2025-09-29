import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  question_id: string
  submitted_answer: string
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

    const { user_id, question_id, submitted_answer }: RequestBody = await req.json()

    // Validate required parameters
    if (!user_id || !question_id || submitted_answer === undefined) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: user_id, question_id, submitted_answer' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Checking answer for question ${question_id}, user ${user_id}`)

    // Determine which table to query based on question_id format
    let tableName = 'oge_math_fipi_bank' // default
    if (question_id.startsWith('EGEBASIC_')) {
      tableName = 'egemathbase'
    } else if (question_id.startsWith('EGEPROF_')) {
      tableName = 'egemathprof'
    }

    console.log(`Querying table: ${tableName}`)

    // Step 1: Query the appropriate table for answer and problem_text
    const { data: questionData, error: questionError } = await supabaseClient
      .from(tableName)
      .select('answer, problem_text')
      .eq('question_id', question_id)
      .maybeSingle()

    if (questionError) {
      console.error('Error fetching question data:', questionError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch question data', 
          details: questionError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!questionData) {
      return new Response(
        JSON.stringify({ 
          error: `Question ID ${question_id} not found` 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { answer: correct_answer, problem_text } = questionData

    // Step 2: Determine if the answer is correct
    let is_correct = false

    try {
      // Try to parse as numbers (handles 7.0 == 7)
      const correctNum = parseFloat(correct_answer)
      const submittedNum = parseFloat(submitted_answer)
      
      if (!isNaN(correctNum) && !isNaN(submittedNum)) {
        is_correct = correctNum === submittedNum
        console.log(`Numeric comparison: ${correctNum} === ${submittedNum} = ${is_correct}`)
      } else {
        throw new Error('Not numeric answers')
      }
    } catch {
      // Not numbers, use OpenRouter API
      const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
      if (!openrouterApiKey) {
        return new Response(
          JSON.stringify({ 
            error: 'OPENROUTER_API_KEY not configured' 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const prompt = `Given the problem: ${problem_text}. The correct answer is: ${correct_answer}. Is the submitted answer '${submitted_answer}' correct? Respond with True or False only.`

      console.log('Making OpenRouter API call for text comparison')

      const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openrouterApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-lite-preview-06-17',
          temperature: 0,
          messages: [{ role: 'user', content: prompt }]
        })
      })

      if (!openrouterResponse.ok) {
        console.error('OpenRouter API error:', await openrouterResponse.text())
        return new Response(
          JSON.stringify({ 
            error: 'OpenRouter API error', 
            details: await openrouterResponse.text() 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const apiResult = await openrouterResponse.json()
      const apiOutput = apiResult.choices[0].message.content.trim()
      is_correct = apiOutput.toLowerCase() === 'true'
      console.log(`OpenRouter API result: ${apiOutput}, is_correct: ${is_correct}`)
    }

    // Step 3: Get the latest attempt for this user
    const { data: latestAttempt, error: attemptError } = await supabaseClient
      .from('student_activity')
      .select('attempt_id, answer_time_start, problem_number_type')
      .eq('user_id', user_id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (attemptError) {
      console.error('Error fetching latest attempt:', attemptError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch latest attempt', 
          details: attemptError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!latestAttempt) {
      return new Response(
        JSON.stringify({ 
          error: `No recent attempt found for user_id ${user_id}` 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Step 4: Calculate duration and scores
    const { attempt_id, answer_time_start, problem_number_type } = latestAttempt
    const startTime = new Date(answer_time_start)
    const currentTime = new Date()
    const duration_answer = (currentTime.getTime() - startTime.getTime()) / 1000

    // Determine scores_fipi
    let scores_fipi = null
    if (problem_number_type >= 20 && problem_number_type <= 25) {
      scores_fipi = is_correct ? 2 : 0
    }

    console.log(`Updating attempt ${attempt_id}: correct=${is_correct}, duration=${duration_answer}s, scores=${scores_fipi}`)

    // Step 5: Update the student_activity record
    const { error: updateError } = await supabaseClient
      .from('student_activity')
      .update({
        finished_or_not: true,
        is_correct: is_correct,
        duration_answer: duration_answer,
        scores_fipi: scores_fipi
      })
      .eq('attempt_id', attempt_id)

    if (updateError) {
      console.error('Error updating student activity:', updateError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to update student activity', 
          details: updateError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Successfully checked answer for question ${question_id}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        is_correct: is_correct,
        duration_seconds: duration_answer,
        scores_fipi: scores_fipi,
        attempt_id: attempt_id
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