import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  problem_number_type: number
  finished_or_not: boolean
  is_correct: boolean
  difficulty: number
  scaling_type: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { 
      user_id, 
      problem_number_type, 
      finished_or_not, 
      is_correct, 
      difficulty, 
      scaling_type 
    }: RequestBody = await req.json()

    // Validate required parameters
    if (!user_id || problem_number_type === undefined || finished_or_not === undefined || 
        is_correct === undefined || difficulty === undefined || !scaling_type) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: user_id, problem_number_type, finished_or_not, is_correct, difficulty, scaling_type' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Updating problem_number_type ${problem_number_type} for user ${user_id}`)

    // Get current alpha/beta values
    const getAlphaBetaResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/get-alpha-beta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        user_id,
        entity_type: 'problem_number_type',
        entity_id: problem_number_type
      })
    })

    const alphaBetaData = await getAlphaBetaResponse.json()
    let alpha = alphaBetaData.data?.alpha
    let beta = alphaBetaData.data?.beta

    // Initialize if not found
    if (alpha === null || beta === null) {
      alpha = 1
      beta = 40
      console.log(`Initializing alpha=${alpha}, beta=${beta} for problem_number_type ${problem_number_type}`)
    }

    // Compute mastery probability
    const masteryResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/compute-mastery-probability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({ alpha, beta })
    })

    const masteryData = await masteryResponse.json()
    const p = masteryData.data?.mastery_probability

    // Compute difficulty weight
    const weightResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/compute-difficulty-weight`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({ scaling_type, d: difficulty })
    })

    const weightData = await weightResponse.json()
    const w = weightData.data?.weight

    console.log(`Current state: alpha=${alpha}, beta=${beta}, p=${p}, w=${w}`)

    // Apply update logic
    if (finished_or_not && is_correct) {
      // Compute velocity factor
      const velocityResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/compute-velocity-factor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({ p })
      })

      const velocityData = await velocityResponse.json()
      const f = velocityData.data?.velocity_factor

      alpha += f * w
      console.log(`Correct answer: alpha increased by ${f * w}, new alpha=${alpha}`)
    } else if (finished_or_not && !is_correct) {
      beta += w
      console.log(`Incorrect answer: beta increased by ${w}, new beta=${beta}`)
    } else if (!finished_or_not) {
      // Handle skips based on difficulty
      if (difficulty >= 3) {
        beta += w
        console.log(`Skip (difficulty ${difficulty}): beta increased by ${w}, new beta=${beta}`)
      } else {
        beta += 0.5 * w
        console.log(`Skip (difficulty ${difficulty}): beta increased by ${0.5 * w}, new beta=${beta}`)
      }
    }

    // Set new alpha/beta values
    const setResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/set-alpha-beta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        user_id,
        entity_type: 'problem_number_type',
        entity_id: problem_number_type,
        alpha,
        beta
      })
    })

    const setData = await setResponse.json()
    if (!setData.success) {
      throw new Error('Failed to set alpha/beta values')
    }

    console.log(`Successfully updated problem_number_type ${problem_number_type}: final alpha=${alpha}, beta=${beta}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          user_id,
          problem_number_type,
          alpha,
          beta,
          mastery_probability: p
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