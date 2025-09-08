import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  course_id: string
  diagnostic_test_oge_result?: number[] | null
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

    const { user_id, course_id, diagnostic_test_oge_result }: RequestBody = await req.json()

    if (!user_id || !course_id) {
      return new Response(
        JSON.stringify({ error: 'user_id and course_id are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Initializing priors for user ${user_id}, course ${course_id}`, {
      has_diagnostic_result: !!diagnostic_test_oge_result,
      weak_skills_count: diagnostic_test_oge_result?.length || 0
    })

    const upsertData = []

    // Initialize skills (1 to 550) - all with Beta(1,40)
    for (let skill_id = 1; skill_id <= 550; skill_id++) {
      const alpha = 1
      const beta = 40

      upsertData.push({
        user_id,
        entity_type: 'skill',
        entity_id: skill_id,
        alpha,
        beta,
        course_id
      })
    }

    // Initialize problem types based on course_id - all with Beta(1,40)
    if (course_id === '1') {
      // Course 1: Initialize problem types (-1, 1, 6 to 25)
      const problem_number_types = [-1, 1, ...Array.from({ length: 20 }, (_, i) => i + 6)]
      
      for (const problem_number_type of problem_number_types) {
        const alpha = 1
        const beta = 40

        upsertData.push({
          user_id,
          entity_type: 'problem_number_type',
          entity_id: problem_number_type,
          alpha,
          beta,
          course_id
        })
      }
    } else if (course_id === '2') {
      // Course 2: Initialize problem types (1 to 21)
      for (let problem_type = 1; problem_type <= 21; problem_type++) {
        const alpha = 1
        const beta = 40

        upsertData.push({
          user_id,
          entity_type: 'problem_number_type',
          entity_id: problem_type,
          alpha,
          beta,
          course_id
        })
      }
    } else if (course_id === '3') {
      // Course 3: Initialize problem types (1 to 19)
      for (let problem_type = 1; problem_type <= 19; problem_type++) {
        const alpha = 1
        const beta = 40

        upsertData.push({
          user_id,
          entity_type: 'problem_number_type',
          entity_id: problem_type,
          alpha,
          beta,
          course_id
        })
      }
    }

    console.log(`Prepared ${upsertData.length} records for upsert`)

    // Perform upsert operation
    const { error } = await supabaseClient
      .from('student_mastery')
      .upsert(upsertData, {
        onConflict: 'user_id,entity_type,entity_id,course_id'
      })

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to initialize priors', details: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Successfully initialized priors for user ${user_id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Priors initialized successfully',
        records_processed: upsertData.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})