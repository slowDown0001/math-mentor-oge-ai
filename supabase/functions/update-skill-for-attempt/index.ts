import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  skills: number[]
  finished_or_not: boolean
  is_correct: boolean
  difficulty: number
  scaling_type: 'linear' | 'exponential'
  course_id?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { user_id, skills, finished_or_not, is_correct, difficulty, scaling_type, course_id }: RequestBody = await req.json()

    // Validate required parameters
    if (!user_id || !skills || finished_or_not === undefined || is_correct === undefined || !difficulty || !scaling_type) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: user_id, skills, finished_or_not, is_correct, difficulty, scaling_type' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate parameter types
    if (typeof user_id !== 'string' || !Array.isArray(skills) || typeof finished_or_not !== 'boolean' || 
        typeof is_correct !== 'boolean' || typeof difficulty !== 'number' || typeof scaling_type !== 'string') {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid parameter types' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate difficulty range
    if (difficulty < 1 || difficulty > 5 || !Number.isInteger(difficulty)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid difficulty. Must be an integer between 1 and 5' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate scaling_type
    if (scaling_type !== 'linear' && scaling_type !== 'exponential') {
      return new Response(
        JSON.stringify({ 
          error: "Invalid scaling_type. Must be 'linear' or 'exponential'" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Updating skills for user ${user_id}: ${skills.length} skills, difficulty: ${difficulty}, finished: ${finished_or_not}, correct: ${is_correct}`)

    const updatedSkills = []

    // Process each skill
    for (const skill of skills) {
      try {
        console.log(`Processing skill ${skill}`)
        
        // Get current alpha/beta values
        const getAlphaBetaResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/get-alpha-beta`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
          },
          body: JSON.stringify({
            user_id,
            entity_type: 'skill',
            entity_id: skill,
            course_id: course_id || 'default'
          })
        })

        if (!getAlphaBetaResponse.ok) {
          console.error(`Failed to get alpha/beta for skill ${skill}`)
          continue
        }

        const getAlphaBetaData = await getAlphaBetaResponse.json()
        let alpha = getAlphaBetaData.data?.alpha
        let beta = getAlphaBetaData.data?.beta

        // Initialize if not found
        if (alpha === null || beta === null) {
          alpha = 1
          beta = 40
          console.log(`Initialized skill ${skill} with alpha=1, beta=40`)
        }

        // Compute mastery probability
        const masteryResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/compute-mastery-probability`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
          },
          body: JSON.stringify({ alpha, beta })
        })

        if (!masteryResponse.ok) {
          console.error(`Failed to compute mastery probability for skill ${skill}`)
          continue
        }

        const masteryData = await masteryResponse.json()
        const p = masteryData.data.mastery_probability

        // Compute difficulty weight
        const weightResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/compute-difficulty-weight`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
          },
          body: JSON.stringify({ scaling_type, d: difficulty })
        })

        if (!weightResponse.ok) {
          console.error(`Failed to compute difficulty weight for skill ${skill}`)
          continue
        }

        const weightData = await weightResponse.json()
        const w = weightData.data.weight

        // Update alpha/beta based on attempt outcome
        if (finished_or_not && is_correct) {
          // Compute velocity factor
          const velocityResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/compute-velocity-factor`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
            },
            body: JSON.stringify({ p })
          })

          if (!velocityResponse.ok) {
            console.error(`Failed to compute velocity factor for skill ${skill}`)
            continue
          }

          const velocityData = await velocityResponse.json()
          const f = velocityData.data.velocity_factor
          
          alpha += f * w
          console.log(`Skill ${skill}: finished and correct, alpha += ${f} * ${w} = ${f * w}`)
        } else if (finished_or_not && !is_correct) {
          beta += w
          console.log(`Skill ${skill}: finished and incorrect, beta += ${w}`)
        } else if (!finished_or_not) {
          // Not finished (skipped)
          if (difficulty >= 3) {
            beta += w
            console.log(`Skill ${skill}: skipped (difficulty ${difficulty} >= 3), beta += ${w}`)
          } else {
            beta += 0.5 * w
            console.log(`Skill ${skill}: skipped (difficulty ${difficulty} < 3), beta += ${0.5 * w}`)
          }
        }

        // Set new alpha/beta values
        const setAlphaBetaResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/set-alpha-beta`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
          },
          body: JSON.stringify({
            user_id,
            entity_type: 'skill',
            entity_id: skill,
            alpha,
            beta,
            course_id: course_id || 'default'
          })
        })

        if (!setAlphaBetaResponse.ok) {
          console.error(`Failed to set alpha/beta for skill ${skill}`)
          continue
        }

        updatedSkills.push({
          skill_id: skill,
          old_alpha: getAlphaBetaData.data?.alpha || 1,
          old_beta: getAlphaBetaData.data?.beta || 40,
          new_alpha: alpha,
          new_beta: beta,
          mastery_probability: p,
          difficulty_weight: w
        })

        console.log(`Successfully updated skill ${skill}: alpha=${alpha}, beta=${beta}`)

      } catch (error) {
        console.error(`Error processing skill ${skill}:`, error)
        continue
      }
    }

    console.log(`Successfully updated ${updatedSkills.length} out of ${skills.length} skills`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          user_id,
          updated_skills: updatedSkills,
          total_skills_processed: skills.length,
          successful_updates: updatedSkills.length
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