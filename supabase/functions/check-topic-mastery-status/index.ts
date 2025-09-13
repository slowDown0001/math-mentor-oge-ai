import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  topic_code: number
  A?: number
  B?: number
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

    const { user_id, topic_code, A = 0.05, B = 20, course_id }: RequestBody = await req.json()

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

    console.log(`Checking topic mastery status for user ${user_id}, topic ${topic_code}`)

    // Step 1: Compute average mastery probability (p_t) using the compute-topic-mastery-with-decay function
    const { data: topicMasteryResult, error: topicMasteryError } = await supabaseClient.functions.invoke('compute-topic-mastery-with-decay', {
      body: {
        user_id,
        topic_code,
        course_id: course_id || 'default'
      }
    })

    if (topicMasteryError) {
      console.error('Error computing topic mastery with decay:', topicMasteryError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to compute topic mastery with decay', 
          details: topicMasteryError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const p_t = topicMasteryResult?.data?.topic_mastery_probability

    if (p_t === null || p_t === undefined) {
      console.log(`No mastery probability computed for topic ${topic_code}, returning continue`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            status: 'continue',
            reason: 'No mastery probability available',
            topic_code,
            p_t: null
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Step 2: Get skills for topic to collect outcomes
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
            status: 'continue',
            reason: 'No skills found for topic',
            topic_code,
            p_t
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Step 3: Aggregate outcomes from all skills in the topic
    const allOutcomes = []

    for (const skillId of skillIds) {
      try {
        console.log(`Getting outcomes for skill ${skillId}`)

        const { data: outcomesResult, error: outcomesError } = await supabaseClient.functions.invoke('get-recent-outcomes', {
          body: {
            user_id,
            entity_type: 'skill',
            entity_id: skillId,
            days: 90,
            min_attempts: 5
          }
        })

        if (outcomesError) {
          console.error(`Error getting outcomes for skill ${skillId}:`, outcomesError)
          continue
        }

        const skillOutcomes = outcomesResult?.data?.outcomes || []
        allOutcomes.push(...skillOutcomes)
        console.log(`Skill ${skillId}: ${skillOutcomes.length} outcomes`)

      } catch (error) {
        console.error(`Error processing outcomes for skill ${skillId}:`, error)
        continue
      }
    }

    if (allOutcomes.length === 0) {
      console.log(`No outcomes found for topic ${topic_code}`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            status: 'continue',
            reason: 'No outcomes found',
            topic_code,
            p_t,
            outcomes_count: 0
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Step 4: Use p_h1 = p_t, p_h0 = max(0.1, p_t - 0.1) for SPRT
    const p_h1 = p_t
    const p_h0 = Math.max(0.1, p_t - 0.1)

    console.log(`Using SPRT with p_h0=${p_h0}, p_h1=${p_h1}, ${allOutcomes.length} outcomes`)

    // Step 5: Perform SPRT
    const { data: sprtResult, error: sprtError } = await supabaseClient.functions.invoke('perform-sprt', {
      body: {
        outcomes: allOutcomes,
        p_h0,
        p_h1,
        A,
        B
      }
    })

    if (sprtError) {
      console.error('Error performing SPRT:', sprtError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to perform SPRT', 
          details: sprtError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const masteryStatus = sprtResult?.data?.status || 'continue'
    console.log(`Topic ${topic_code} mastery status: ${masteryStatus}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          status: masteryStatus,
          topic_code,
          p_t,
          p_h0,
          p_h1,
          outcomes_count: allOutcomes.length,
          success_rate: allOutcomes.length > 0 ? allOutcomes.reduce((sum, outcome) => sum + outcome, 0) / allOutcomes.length : 0,
          lambda_n: sprtResult?.data?.lambda_n,
          threshold_A: A,
          threshold_B: B,
          skill_count: skillIds.length,
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