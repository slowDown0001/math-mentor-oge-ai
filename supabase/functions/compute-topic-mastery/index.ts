import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  topic_code: string
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

    const { user_id, topic_code, course_id = '1' }: RequestBody = await req.json()

    // Capture client origin to pass along for asset fallback
    const clientOrigin = req.headers.get('origin') || req.headers.get('referer') || ''

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

    console.log(`Computing topic mastery for user ${user_id}, topic ${topic_code}, course ${course_id}`)

    // Step 1: Get skill IDs for the topic
    let skillIds: number[] = []
    
    if (course_id === '1') {
      const { data: skillsData, error: skillsError } = await supabaseClient.functions.invoke(
        'get-skills-for-topic',
        {
          body: { 
            topic_code,
            course_type: 'ogemath',
            origin: clientOrigin
          }
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

      skillIds = skillsData?.skill_ids || []
    }
    
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

    // Step 2: Get alpha/beta and compute mastery probability for each skill
    const masteryPromises = skillIds.map(async (skillId: number) => {
      try {
        // Get alpha/beta for this skill
        const { data: alphaBetaData, error: alphaBetaError } = await supabaseClient.functions.invoke(
          'get-alpha-beta',
          {
            body: {
              user_id,
              entity_type: 'skill',
              entity_id: skillId,
              course_id
            }
          }
        )

        if (alphaBetaError) {
          console.error(`Error getting alpha/beta for skill ${skillId}:`, alphaBetaError)
          return null
        }

        const { alpha, beta } = alphaBetaData?.data || {}
        
        if (alpha == null || beta == null) {
          console.log(`No alpha/beta data found for user ${user_id}, skill ${skillId}. Falling back to attempts.`)
          // Fallback: compute naive mastery from student_activity for this skill
          const { data: attempts, error: attemptsError } = await supabaseClient
            .from('student_activity')
            .select('is_correct')
            .eq('user_id', user_id)
            .contains('skills', [skillId])

          if (attemptsError) {
            console.error(`Error fetching attempts for skill ${skillId}:`, attemptsError)
            return null
          }

          if (!attempts || attempts.length === 0) {
            return null
          }

          const correct = attempts.filter(a => a.is_correct === true).length
          const masteryProbability = correct / attempts.length
          console.log(`Skill ${skillId}: attempts=${attempts.length}, correct=${correct}, mastery=${masteryProbability}`)
          return masteryProbability
        }

        // Compute mastery probability using alpha/beta when available
        const { data: masteryData, error: masteryError } = await supabaseClient.functions.invoke(
          'compute-mastery-probability',
          {
            body: { alpha, beta }
          }
        )

        if (masteryError) {
          console.error(`Error computing mastery probability for skill ${skillId}:`, masteryError)
          return null
        }

        const masteryProbability = masteryData?.data?.mastery_probability
        console.log(`Skill ${skillId}: alpha=${alpha}, beta=${beta}, mastery=${masteryProbability}`)
        
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