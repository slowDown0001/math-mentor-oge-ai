import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  question_id: string
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

    const { question_id }: RequestBody = await req.json()

    // Validate required parameters
    if (!question_id) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameter: question_id' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Fetching question details for question_id: ${question_id}`)

    // Fetch question details from the oge_math_fipi_bank table
    const { data: questionData, error } = await supabaseClient
      .from('oge_math_fipi_bank')
      .select('skills, problem_number_type, difficulty')
      .eq('question_id', question_id)
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch question details', 
          details: error.message 
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

    // Parse skills string to array if it exists
    let skillsArray: number[] = []
    if (questionData.skills) {
      try {
        // Skills might be stored as comma-separated string or JSON
        if (typeof questionData.skills === 'string') {
          skillsArray = questionData.skills.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
        }
      } catch (e) {
        console.warn('Error parsing skills:', e)
      }
    }

    const questionDetails = {
      skills: skillsArray,
      topics: [], // Topics not available in current schema, can be derived from skills if mapping exists
      problem_number_type: questionData.problem_number_type ? parseInt(questionData.problem_number_type) : null,
      difficulty: questionData.difficulty ? parseInt(questionData.difficulty) : 1
    }

    console.log(`Successfully fetched question details for ${question_id}:`, questionDetails)

    return new Response(
      JSON.stringify({ 
        success: true,
        data: questionDetails
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