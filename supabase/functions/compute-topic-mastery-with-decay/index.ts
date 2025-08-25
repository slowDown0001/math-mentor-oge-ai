import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  topic_code: string
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

    const { user_id, topic_code }: RequestBody = await req.json()

    // Validate required parameters
    if (!user_id || !topic_code) {
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

    // Step 1: Get skill IDs for the topic
    const { data: skillsData, error: skillsError } = await supabaseClient.functions.invoke(
      'get-skills-for-topic',
      {
        body: { topic_code }
      }
    )

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

    const skillIds = skillsData?.skill_ids || []
    
    if (!skillIds || skillIds.length === 0) {
      console.log(`No skills found for topic ${topic_code}`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            user_id,
            topic_code,
            topic_mastery: null,
            message: 'No skills found for this topic'
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Found ${skillIds.length} skills for topic ${topic_code}: [${skillIds.join(', ')}]`)

    // Step 2: For each skill, apply time decay and compute mastery probability
    const t_current = new Date().toISOString()
    const masteryPromises = skillIds.map(async (skillId: number) => {
      try {
        // Get latest attempt time for this skill
        const { data: attemptData, error: attemptError } = await supabaseClient.functions.invoke(
          'get-latest-attempt-time',
          {
            body: {
              user_id,
              entity_type: 'skill',
              entity_id: skillId
            }
          }
        )

        if (attemptError) {
          console.error(`Error getting latest attempt time for skill ${skillId}:`, attemptError)
          return null
        }

        const t_attempt = attemptData?.data?.latest_attempt_time
        
        if (!t_attempt) {
          console.log(`No attempt time found for user ${user_id}, skill ${skillId}`)
          return null
        }

        // Apply time decay to alpha/beta params
        const { data: decayData, error: decayError } = await supabaseClient.functions.invoke(
          'apply-time-decay-to-params',
          {
            body: {
              user_id,
              entity_type: 'skill',
              entity_id: skillId,
              t_current,
              t_attempt,
              lambda_decay: 0.01
            }
          }
        )

        if (decayError) {
          console.error(`Error applying time decay for skill ${skillId}:`, decayError)
          return null
        }

        const { alpha_decayed, beta_decayed } = decayData?.data || {}
        
        if (alpha_decayed === null || beta_decayed === null) {
          console.log(`No decayed alpha/beta data for user ${user_id}, skill ${skillId}`)
          return null
        }

        // Compute mastery probability
        const { data: masteryData, error: masteryError } = await supabaseClient.functions.invoke(
          'compute-mastery-probability',
          {
            body: { alpha: alpha_decayed, beta: beta_decayed }
          }
        )

        if (masteryError) {
          console.error(`Error computing mastery probability for skill ${skillId}:`, masteryError)
          return null
        }

        const masteryProbability = masteryData?.data?.mastery_probability
        console.log(`Skill ${skillId}: mastery probability = ${masteryProbability}`)
        
        return masteryProbability
      } catch (error) {
        console.error(`Error processing skill ${skillId}:`, error)
        return null
      }
    })

    // Wait for all mastery probability calculations
    const masteryProbabilities = await Promise.all(masteryPromises)
    
    // Filter out null values
    const validMasteryProbabilities = masteryProbabilities.filter(p => p !== null) as number[]

    // Step 3: Compute average mastery probability
    let topicMastery: number | null = null
    if (validMasteryProbabilities.length > 0) {
      topicMastery = validMasteryProbabilities.reduce((sum, p) => sum + p, 0) / validMasteryProbabilities.length
    }

    console.log(`Topic ${topic_code} mastery for user ${user_id}: ${topicMastery} (based on ${validMasteryProbabilities.length}/${skillIds.length} skills)`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          user_id,
          topic_code,
          topic_mastery: topicMastery,
          skills_count: skillIds.length,
          valid_skills_count: validMasteryProbabilities.length,
          skill_masteries: skillIds.map((skillId, index) => ({
            skill_id: skillId,
            mastery_probability: masteryProbabilities[index]
          }))
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