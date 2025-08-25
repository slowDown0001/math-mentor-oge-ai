import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  topic_code: string
  A?: number
  B?: number
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

    const { user_id, topic_code, A = 0.05, B = 20 }: RequestBody = await req.json()

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

    console.log(`Checking topic mastery status for user ${user_id}, topic ${topic_code}`)

    // Step 1: Compute average mastery probability (p_t) using time decay
    const { data: masteryData, error: masteryError } = await supabaseClient.functions.invoke(
      'compute-topic-mastery-with-decay',
      {
        body: { user_id, topic_code }
      }
    )

    if (masteryError) {
      console.error('Error computing topic mastery with decay:', masteryError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to compute topic mastery', 
          details: masteryError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const p_t = masteryData?.data?.topic_mastery
    
    if (p_t === null) {
      console.log(`No mastery data available for topic ${topic_code}`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            user_id,
            topic_code,
            status: 'continue',
            message: 'No mastery data available for this topic'
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Step 2: Get skills for the topic to aggregate outcomes
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

    // Step 3: Aggregate recent outcomes across all skills in the topic
    const allOutcomes: number[] = []
    
    for (const skillId of skillIds) {
      try {
        const { data: outcomeData, error: outcomeError } = await supabaseClient.functions.invoke(
          'get-recent-outcomes',
          {
            body: {
              user_id,
              entity_type: 'skill',
              entity_id: skillId,
              days: 90,
              min_attempts: 5
            }
          }
        )

        if (!outcomeError && outcomeData?.data?.outcomes) {
          allOutcomes.push(...outcomeData.data.outcomes)
        }
      } catch (error) {
        console.warn(`Failed to get outcomes for skill ${skillId}:`, error)
      }
    }

    console.log(`Aggregated ${allOutcomes.length} outcomes across ${skillIds.length} skills for topic ${topic_code}`)

    if (allOutcomes.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            user_id,
            topic_code,
            status: 'continue',
            p_t,
            message: 'No outcomes found for topic skills'
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Step 4: Apply SPRT using p_h1 = p_t, p_h0 = max(0.1, p_t - 0.1)
    const p_h1 = p_t
    const p_h0 = Math.max(0.1, p_t - 0.1)

    const { data: sprtData, error: sprtError } = await supabaseClient.functions.invoke(
      'perform-sprt',
      {
        body: {
          outcomes: allOutcomes,
          p_h0,
          p_h1,
          A,
          B
        }
      }
    )

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

    const status = sprtData?.data?.status
    const lambda_n = sprtData?.data?.lambda_n

    console.log(`Topic ${topic_code} SPRT result: ${status} (λ=${lambda_n}, p_h0=${p_h0}, p_h1=${p_h1})`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          user_id,
          topic_code,
          status,
          p_t,
          p_h0,
          p_h1,
          lambda_n,
          outcomes_count: allOutcomes.length,
          skills_count: skillIds.length,
          threshold_A: A,
          threshold_B: B
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