import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  topic_code: number
  course_id?: string
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

    const { user_id, topic_code, course_id }: RequestBody = await req.json()

    // Validate required parameters
    if (!user_id || topic_code === undefined) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: user_id, topic_code' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Computing topic mastery with decay for user ${user_id}, topic ${topic_code}`)

    // Get skills for topic using the existing function
    const { data: skillsResult, error: skillsError } = await supabaseClient.functions.invoke('get-skills-for-topic', {
      body: {
        topic_code,
        course_id: course_id || 'default'
      }
    })

    if (skillsError) {
      console.error('Error getting skills for topic:', skillsError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get skills for topic', 
          details: skillsError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const skillIds = skillsResult?.data?.skill_ids || []
    
    if (skillIds.length === 0) {
      console.log(`No skills found for topic ${topic_code}`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            topic_mastery_probability: null,
            reason: 'No skills found for topic',
            topic_code,
            skill_count: 0
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const probabilityList = []
    const currentTime = new Date().toISOString()

    // Process each skill
    for (const skillId of skillIds) {
      try {
        console.log(`Processing skill ${skillId} for topic ${topic_code}`)

        // Get latest attempt time for this skill
        const { data: attemptTimeResult, error: attemptTimeError } = await supabaseClient.functions.invoke('get-latest-attempt-time', {
          body: {
            user_id,
            entity_type: 'skill',
            entity_id: skillId
          }
        })

        if (attemptTimeError) {
          console.error(`Error getting latest attempt time for skill ${skillId}:`, attemptTimeError)
          continue
        }

        const latestAttemptTime = attemptTimeResult?.data?.latest_attempt_time

        if (!latestAttemptTime) {
          console.log(`No attempt time found for skill ${skillId}, skipping`)
          continue
        }

        // Apply time decay to parameters
        const { data: timeDecayResult, error: timeDecayError } = await supabaseClient.functions.invoke('apply-time-decay-to-params', {
          body: {
            user_id,
            entity_type: 'skill',
            entity_id: skillId,
            t_current: currentTime,
            t_attempt: latestAttemptTime,
            lambda_decay: 0.01,
            course_id: course_id || 'default'
          }
        })

        if (timeDecayError) {
          console.error(`Error applying time decay for skill ${skillId}:`, timeDecayError)
          continue
        }

        const { alpha_decayed, beta_decayed } = timeDecayResult?.data || {}

        if (alpha_decayed !== null && beta_decayed !== null) {
          // Compute mastery probability
          const { data: masteryResult, error: masteryError } = await supabaseClient.functions.invoke('compute-mastery-probability', {
            body: {
              alpha: alpha_decayed,
              beta: beta_decayed
            }
          })

          if (masteryError) {
            console.error(`Error computing mastery probability for skill ${skillId}:`, masteryError)
            continue
          }

          const masteryProbability = masteryResult?.data?.mastery_probability
          if (masteryProbability !== undefined) {
            probabilityList.push(masteryProbability)
            console.log(`Skill ${skillId}: mastery probability = ${masteryProbability}`)
          }
        }

      } catch (error) {
        console.error(`Error processing skill ${skillId}:`, error)
        continue
      }
    }

    // Calculate average mastery probability
    let topicMasteryProbability = null
    if (probabilityList.length > 0) {
      topicMasteryProbability = probabilityList.reduce((sum, p) => sum + p, 0) / probabilityList.length
      console.log(`Topic ${topic_code} average mastery probability: ${topicMasteryProbability}`)
    } else {
      console.log(`No valid probabilities computed for topic ${topic_code}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          topic_mastery_probability: topicMasteryProbability,
          topic_code,
          skill_count: skillIds.length,
          processed_skills: probabilityList.length,
          individual_probabilities: probabilityList,
          course_id: course_id || 'default'
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