import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { getErrorMessage } from '../_shared/error-utils.ts'

interface RequestBody {
  user_id: string
  question_id: string
  finished_or_not: boolean
  is_correct: boolean
  difficulty: number
  skills_list: number[]
  topics_list: number[]
  problem_number_type: number
  duration?: number
  scores_fipi?: number
  scaling_type: string
  attempt_id?: number
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

    const {
      user_id,
      skills_list,
      topics_list,
      problem_number_type,
      finished_or_not,
      is_correct,
      difficulty,
      scaling_type,
      duration = 0,
      scores_fipi,
      attempt_id,
      course_id = 'default'
    }: RequestBody = await req.json()

    // Validate required parameters
    if (!user_id || !skills_list || !topics_list || 
        finished_or_not === undefined || is_correct === undefined || 
        !difficulty || !scaling_type) {
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

    console.log(`Processing attempt for user ${user_id} with ${skills_list.length} skills and ${topics_list.length} topics`)

    const errors: string[] = []

    // Step 1: Update skills
    for (const skill_id of skills_list) {
      try {
        // Update alpha/beta for the skill
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
          errors.push(`Failed to update skill ${skill_id}: ${updateSkillError.message}`)
          continue
        }

        // Apply CUSUM for skill
        const x_n = (finished_or_not && is_correct) || (finished_or_not && scores_fipi !== null && scores_fipi !== undefined && scores_fipi >= 1) ? 1 : 0
        
        const { data: cusumData, error: cusumError } = await supabaseClient.functions.invoke('apply-cusum', {
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
          errors.push(`Failed to apply CUSUM for skill ${skill_id}: ${cusumError.message}`)
        }

        // Apply SPRT for skill
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
          errors.push(`Failed to check mastery status for skill ${skill_id}: ${sprtError.message}`)
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
            errors.push(`Failed to update mastery status for skill ${skill_id}: ${updateStatusError.message}`)
          }
        }

      } catch (error) {
        console.error(`Unexpected error processing skill ${skill_id}:`, error)
        errors.push(`Unexpected error processing skill ${skill_id}: ${getErrorMessage(error)}`)
      }
    }

    // Step 2: Update problem type based on course_id
    try {
      if (course_id === '1' && problem_number_type >= 20 && scores_fipi !== null && scores_fipi !== undefined) {
        // Special handling for course 1, problem types 20+
        const { data: weightData, error: weightError } = await supabaseClient.functions.invoke('compute-difficulty-weight', {
          body: {
            scaling_type,
            d: difficulty
          }
        })

        if (weightError) {
          console.error('Error computing difficulty weight:', weightError)
          errors.push(`Failed to compute difficulty weight: ${weightError.message}`)
        } else {
          const w = weightData?.data?.weight || 1

          const { data: scoresData, error: scoresError } = await supabaseClient.functions.invoke('adjust-for-scores', {
            body: {
              score: scores_fipi,
              w
            }
          })

          if (scoresError) {
            console.error('Error adjusting for scores:', scoresError)
            errors.push(`Failed to adjust for scores: ${scoresError.message}`)
          } else {
            let alpha_adj = scoresData?.data?.alpha_adjustment || 0
            const beta_adj = scoresData?.data?.beta_adjustment || 0

            const { data: alphaBetaData, error: alphaBetaError } = await supabaseClient.functions.invoke('get-alpha-beta', {
              body: {
                user_id,
                entity_type: 'problem_number_type',
                entity_id: problem_number_type,
                course_id
              }
            })

            let alpha = 1
            let beta = 40

            if (alphaBetaData?.success && alphaBetaData?.data?.alpha !== null) {
              alpha = alphaBetaData.data.alpha
              beta = alphaBetaData.data.beta
            }

            // Apply duration adjustment if alpha_adj is positive
            if (alpha_adj > 0) {
              const { data: durationData, error: durationError } = await supabaseClient.functions.invoke('adjust-for-duration', {
                body: {
                  original_increment: alpha_adj,
                  duration: duration || 0,
                  threshold: 60
                }
              })

              if (durationError) {
                console.error('Error adjusting for duration:', durationError)
                errors.push(`Failed to adjust for duration: ${durationError.message}`)
              } else {
                alpha_adj = durationData?.data?.adjusted_increment || alpha_adj
              }
            }

            alpha += alpha_adj
            beta += beta_adj

            const { error: setAlphaBetaError } = await supabaseClient.functions.invoke('set-alpha-beta', {
              body: {
                user_id,
                entity_type: 'problem_number_type',
                entity_id: problem_number_type,
                alpha,
                beta,
                course_id
              }
            })

            if (setAlphaBetaError) {
              console.error('Error setting alpha/beta:', setAlphaBetaError)
              errors.push(`Failed to set alpha/beta: ${setAlphaBetaError.message}`)
            }
          }
        }
      } else if (course_id === '1') {
        // Standard update for course 1, problem types < 20
        const { error: updateProblemError } = await supabaseClient.functions.invoke('update-problem-number-type-for-attempt', {
          body: {
            user_id,
            problem_number_type,
            finished_or_not,
            is_correct,
            difficulty,
            scaling_type,
            course_id
          }
        })

        if (updateProblemError) {
          console.error('Error updating problem number type:', updateProblemError)
          errors.push(`Failed to update problem number type: ${updateProblemError.message}`)
        }
      }

      if (course_id === '2') {
        // Standard update for course 2
        const { error: updateProblemError } = await supabaseClient.functions.invoke('update-problem-number-type-for-attempt', {
          body: {
            user_id,
            problem_number_type,
            finished_or_not,
            is_correct,
            difficulty,
            scaling_type,
            course_id
          }
        })

        if (updateProblemError) {
          console.error('Error updating problem number type for course 2:', updateProblemError)
          errors.push(`Failed to update problem number type for course 2: ${updateProblemError.message}`)
        }
      }

      if (course_id === '3' && problem_number_type >= 13 && scores_fipi !== null && scores_fipi !== undefined) {
        // Special handling for course 3, problem types 13+
        const { data: weightData, error: weightError } = await supabaseClient.functions.invoke('compute-difficulty-weight', {
          body: {
            scaling_type,
            d: difficulty
          }
        })

        if (weightError) {
          console.error('Error computing difficulty weight for course 3:', weightError)
          errors.push(`Failed to compute difficulty weight for course 3: ${weightError.message}`)
        } else {
          const w = weightData?.data?.weight || 1

          const { data: scoresData, error: scoresError } = await supabaseClient.functions.invoke('adjust-for-scores', {
            body: {
              score: scores_fipi,
              w
            }
          })

          if (scoresError) {
            console.error('Error adjusting for scores for course 3:', scoresError)
            errors.push(`Failed to adjust for scores for course 3: ${scoresError.message}`)
          } else {
            let alpha_adj = scoresData?.data?.alpha_adjustment || 0
            const beta_adj = scoresData?.data?.beta_adjustment || 0

            const { data: alphaBetaData, error: alphaBetaError } = await supabaseClient.functions.invoke('get-alpha-beta', {
              body: {
                user_id,
                entity_type: 'problem_number_type',
                entity_id: problem_number_type,
                course_id
              }
            })

            let alpha = 1
            let beta = 40

            if (alphaBetaData?.success && alphaBetaData?.data?.alpha !== null) {
              alpha = alphaBetaData.data.alpha
              beta = alphaBetaData.data.beta
            }

            // Apply duration adjustment if alpha_adj is positive
            if (alpha_adj > 0) {
              const { data: durationData, error: durationError } = await supabaseClient.functions.invoke('adjust-for-duration', {
                body: {
                  original_increment: alpha_adj,
                  duration: duration || 0,
                  threshold: 60
                }
              })

              if (durationError) {
                console.error('Error adjusting for duration for course 3:', durationError)
                errors.push(`Failed to adjust for duration for course 3: ${durationError.message}`)
              } else {
                alpha_adj = durationData?.data?.adjusted_increment || alpha_adj
              }
            }

            alpha += alpha_adj
            beta += beta_adj

            const { error: setAlphaBetaError } = await supabaseClient.functions.invoke('set-alpha-beta', {
              body: {
                user_id,
                entity_type: 'problem_number_type',
                entity_id: problem_number_type,
                alpha,
                beta,
                course_id
              }
            })

            if (setAlphaBetaError) {
              console.error('Error setting alpha/beta for course 3:', setAlphaBetaError)
              errors.push(`Failed to set alpha/beta for course 3: ${setAlphaBetaError.message}`)
            }
          }
        }
      } else if (course_id === '3') {
        // Standard update for course 3, problem types < 13
        const { error: updateProblemError } = await supabaseClient.functions.invoke('update-problem-number-type-for-attempt', {
          body: {
            user_id,
            problem_number_type,
            finished_or_not,
            is_correct,
            difficulty,
            scaling_type,
            course_id
          }
        })

        if (updateProblemError) {
          console.error('Error updating problem number type for course 3:', updateProblemError)
          errors.push(`Failed to update problem number type for course 3: ${updateProblemError.message}`)
        }
      }

      // Apply CUSUM for problem type
      const x_n = (finished_or_not && is_correct) || (finished_or_not && scores_fipi !== null && scores_fipi !== undefined && scores_fipi >= 1) ? 1 : 0
      
      const { data: cusumData, error: cusumError } = await supabaseClient.functions.invoke('apply-cusum', {
        body: {
          user_id,
          entity_type: 'problem_number_type',
          entity_id: problem_number_type,
          x_n,
          course_id
        }
      })

      if (cusumError) {
        console.error('Error applying CUSUM for problem type:', cusumError)
        errors.push(`Failed to apply CUSUM for problem type: ${cusumError.message}`)
      }

      // Apply SPRT for problem type
      const { data: sprtData, error: sprtError } = await supabaseClient.functions.invoke('check-mastery-status', {
        body: {
          user_id,
          entity_type: 'problem_number_type',
          entity_id: problem_number_type,
          A: 0.05,
          B: 20,
          course_id
        }
      })

      if (sprtError) {
        console.error('Error checking mastery status for problem type:', sprtError)
        errors.push(`Failed to check mastery status for problem type: ${sprtError.message}`)
      } else if (sprtData?.success && sprtData?.data?.status) {
        const { error: updateStatusError } = await supabaseClient.functions.invoke('update-mastery-status', {
          body: {
            user_id,
            entity_type: 'problem_number_type',
            entity_id: problem_number_type,
            status: sprtData.data.status,
            course_id
          }
        })

        if (updateStatusError) {
          console.error('Error updating mastery status for problem type:', updateStatusError)
          errors.push(`Failed to update mastery status for problem type: ${updateStatusError.message}`)
        }
      }

    } catch (error) {
      console.error('Unexpected error processing problem type:', error)
      errors.push(`Unexpected error processing problem type: ${getErrorMessage(error)}`)
    }

    // Step 3: Update topic mastery
    for (const topic_code of topics_list) {
      try {
        const { data: topicStatusData, error: topicStatusError } = await supabaseClient.functions.invoke('check-topic-mastery-status', {
          body: {
            user_id,
            topic_code,
            A: 0.05,
            B: 20,
            course_id
          }
        })

        if (topicStatusError) {
          console.error(`Error checking topic mastery status for topic ${topic_code}:`, topicStatusError)
          errors.push(`Failed to check topic mastery status for topic ${topic_code}: ${topicStatusError.message}`)
        } else if (topicStatusData?.success && topicStatusData?.data?.status) {
          const { error: updateTopicStatusError } = await supabaseClient.functions.invoke('update-topic-mastery-status', {
            body: {
              user_id,
              topic_code,
              status: topicStatusData.data.status,
              course_id
            }
          })

          if (updateTopicStatusError) {
            console.error(`Error updating topic mastery status for topic ${topic_code}:`, updateTopicStatusError)
            errors.push(`Failed to update topic mastery status for topic ${topic_code}: ${updateTopicStatusError.message}`)
          }
        }

      } catch (error) {
        console.error(`Unexpected error processing topic ${topic_code}:`, error)
        errors.push(`Unexpected error processing topic ${topic_code}: ${getErrorMessage(error)}`)
      }
    }

    const processedSkills = skills_list.length
    const processedTopics = topics_list.length

    console.log(`Successfully processed attempt for user ${user_id}. Skills: ${processedSkills}, Topics: ${processedTopics}, Errors: ${errors.length}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          user_id,
          processed_skills: processedSkills,
          processed_topics: processedTopics,
          problem_number_type,
          course_id,
          errors_count: errors.length,
          errors: errors.length > 0 ? errors : undefined
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
        details: getErrorMessage(error) 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})