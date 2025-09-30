import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  question_id: string
  skill_id: number
  finished_or_not: boolean
  is_correct: boolean
  difficulty: number
  duration: number
  course_id: string
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

    const {
      user_id,
      question_id,
      skill_id,
      finished_or_not,
      is_correct,
      difficulty,
      duration,
      course_id
    }: RequestBody = await req.json()

    // Validate required parameters
    if (!user_id || !question_id || skill_id === undefined || 
        finished_or_not === undefined || is_correct === undefined || 
        !difficulty || !course_id) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Processing MCQ skill attempt for user ${user_id}, question ${question_id}, skill ${skill_id}`)

    // Step 1: Insert/update student_activity record
    const { error: activityError } = await supabaseClient
      .from('student_activity')
      .insert({
        user_id,
        question_id,
        answer_time_start: new Date(Date.now() - duration * 1000).toISOString(),
        finished_or_not,
        is_correct,
        duration_answer: duration,
        problem_number_type: 0, // Not used for MCQ skills
        skills: [skill_id],
        topics: null // No topics for MCQ skill questions
      })

    if (activityError) {
      console.error('Error inserting student_activity:', activityError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to record activity', 
          details: activityError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Step 2: Update skill mastery (alpha/beta)
    const scaling_type = 'exponential' // Default scaling type for OGE skills
    
    const { error: updateSkillError } = await supabaseClient.functions.invoke('update-skill-for-attempt', {
      body: {
        user_id,
        skills: [skill_id],
        finished_or_not,
        is_correct,
        difficulty,
        scaling_type,
        course_id
      }
    })

    if (updateSkillError) {
      console.error(`Error updating skill ${skill_id}:`, updateSkillError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to update skill mastery', 
          details: updateSkillError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Step 3: Apply CUSUM for skill
    const x_n = (finished_or_not && is_correct) ? 1 : 0
    
    const { error: cusumError } = await supabaseClient.functions.invoke('apply-cusum', {
      body: {
        user_id,
        entity_type: 'skill',
        entity_id: skill_id,
        x_n,
        course_id
      }
    })

    if (cusumError) {
      console.error(`Error applying CUSUM for skill ${skill_id}:`, cusumError)
    }

    // Step 4: Apply SPRT for skill mastery status
    const { data: sprtData, error: sprtError } = await supabaseClient.functions.invoke('check-mastery-status', {
      body: {
        user_id,
        entity_type: 'skill',
        entity_id: skill_id,
        A: 0.05,
        B: 20,
        course_id
      }
    })

    if (sprtError) {
      console.error(`Error checking mastery status for skill ${skill_id}:`, sprtError)
    } else if (sprtData?.success && sprtData?.data?.status) {
      const { error: updateStatusError } = await supabaseClient.functions.invoke('update-mastery-status', {
        body: {
          user_id,
          entity_type: 'skill',
          entity_id: skill_id,
          status: sprtData.data.status,
          course_id
        }
      })

      if (updateStatusError) {
        console.error(`Error updating mastery status for skill ${skill_id}:`, updateStatusError)
      }
    }

    console.log(`Successfully processed MCQ skill attempt for user ${user_id}, skill ${skill_id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          user_id,
          skill_id,
          is_correct,
          course_id
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
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
