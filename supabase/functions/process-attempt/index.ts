import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  question_id: string
  finished_or_not: boolean
  is_correct?: boolean
  difficulty: number
  skills_list: number[]
  topics_list: number[]
  problem_number_type: number
  duration?: number
  scores_fipi?: number
  scaling_type: string
  attempt_id?: number
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
      finished_or_not,
      is_correct,
      difficulty,
      skills_list,
      topics_list,
      problem_number_type,
      duration = 0,
      scores_fipi,
      scaling_type,
      attempt_id
    }: RequestBody = await req.json()

    // Validate required parameters
    if (!user_id || !question_id || finished_or_not === undefined || 
        difficulty === undefined || !skills_list || !topics_list || 
        problem_number_type === undefined || !scaling_type) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: user_id, question_id, finished_or_not, difficulty, skills_list, topics_list, problem_number_type, scaling_type' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Processing attempt for user ${user_id}, question ${question_id}`)

    const results: any = {
      skills_processed: [],
      problem_type_processed: false,
      topics_processed: [],
      errors: []
    }

    // Step 1: Update skills
    for (const skill_id of skills_list) {
      try {
        console.log(`Processing skill ${skill_id}`)

        // Update alpha/beta for the skill
        const skillUpdateResponse = await supabaseClient.functions.invoke('update-skill-for-attempt', {
          body: {
            user_id,
            skills_list: [skill_id],
            finished_or_not,
            is_correct,
            difficulty,
            scaling_type
          }
        })

        if (skillUpdateResponse.error) {
          console.error(`Error updating skill ${skill_id}:`, skillUpdateResponse.error)
          results.errors.push(`Skill ${skill_id} update failed: ${skillUpdateResponse.error.message}`)
          continue
        }

        // Apply CUSUM for skill
        const x_n = (finished_or_not && is_correct) || (finished_or_not && scores_fipi !== null && scores_fipi !== undefined && scores_fipi >= 1) ? 1 : 0
        
        // Get current cusum_s
        const getCurrentSResponse = await supabaseClient.functions.invoke('get-cusum-s', {
          body: {
            user_id,
            entity_type: 'skill',
            entity_id: skill_id
          }
        })

        let current_s = null
        if (!getCurrentSResponse.error && getCurrentSResponse.data?.success) {
          current_s = getCurrentSResponse.data.data.cusum_s
        }

        // Apply CUSUM algorithm
        const cusumResponse = await supabaseClient.functions.invoke('apply-cusum', {
          body: {
            current_s,
            x_n,
            k: 0.5,
            h: 3.0
          }
        })

        if (cusumResponse.error) {
          console.error(`Error applying CUSUM for skill ${skill_id}:`, cusumResponse.error)
          results.errors.push(`Skill ${skill_id} CUSUM failed: ${cusumResponse.error.message}`)
        } else {
          const { new_s, adjustment } = cusumResponse.data?.data || { new_s: 0, adjustment: 0 }
          
          // Update cusum_s
          const updateCusumResponse = await supabaseClient.functions.invoke('update-cusum-s', {
            body: {
              user_id,
              entity_type: 'skill',
              entity_id: skill_id,
              new_s
            }
          })

          if (updateCusumResponse.error) {
            console.error(`Error updating cusum_s for skill ${skill_id}:`, updateCusumResponse.error)
            results.errors.push(`Skill ${skill_id} cusum_s update failed: ${updateCusumResponse.error.message}`)
          }

          // Apply adjustment if needed
          if (adjustment !== 0) {
            const adjustmentResponse = await supabaseClient.functions.invoke('apply-cusum-adjustment', {
              body: {
                user_id,
                entity_type: 'skill',
                entity_id: skill_id,
                adjustment
              }
            })

            if (adjustmentResponse.error) {
              console.error(`Error applying CUSUM adjustment for skill ${skill_id}:`, adjustmentResponse.error)
              results.errors.push(`Skill ${skill_id} CUSUM adjustment failed: ${adjustmentResponse.error.message}`)
            }
          }
        }

        // Apply SPRT for skill
        const masteryCheckResponse = await supabaseClient.functions.invoke('check-mastery-status', {
          body: {
            user_id,
            entity_type: 'skill',
            entity_id: skill_id,
            A: 0.05,
            B: 20
          }
        })

        if (masteryCheckResponse.error) {
          console.error(`Error checking mastery for skill ${skill_id}:`, masteryCheckResponse.error)
          results.errors.push(`Skill ${skill_id} mastery check failed: ${masteryCheckResponse.error.message}`)
        } else {
          // Update mastery status
          const status = masteryCheckResponse.data?.data?.status || 'continue'
          const updateStatusResponse = await supabaseClient.functions.invoke('update-mastery-status', {
            body: {
              user_id,
              entity_type: 'skill',
              entity_id: skill_id,
              status
            }
          })

          if (updateStatusResponse.error) {
            console.error(`Error updating mastery status for skill ${skill_id}:`, updateStatusResponse.error)
            results.errors.push(`Skill ${skill_id} status update failed: ${updateStatusResponse.error.message}`)
          }
        }

        results.skills_processed.push(skill_id)
      } catch (error) {
        console.error(`Error processing skill ${skill_id}:`, error)
        results.errors.push(`Skill ${skill_id} processing failed: ${error.message}`)
      }
    }

    // Step 2: Update problem type
    try {
      console.log(`Processing problem type ${problem_number_type}`)

      if (problem_number_type >= 20 && scores_fipi !== null && scores_fipi !== undefined) {
        // Special handling for problem types 20-25 with scores_fipi
        const difficultyWeightResponse = await supabaseClient.functions.invoke('compute-difficulty-weight', {
          body: { scaling_type, difficulty }
        })

        if (difficultyWeightResponse.error) {
          console.error('Error computing difficulty weight:', difficultyWeightResponse.error)
          results.errors.push(`Difficulty weight computation failed: ${difficultyWeightResponse.error.message}`)
        } else {
          const w = difficultyWeightResponse.data?.data?.weight || 1

          // Adjust for scores
          const scoresAdjustResponse = await supabaseClient.functions.invoke('adjust-for-scores', {
            body: { score: scores_fipi, w }
          })

          if (scoresAdjustResponse.error) {
            console.error('Error adjusting for scores:', scoresAdjustResponse.error)
            results.errors.push(`Scores adjustment failed: ${scoresAdjustResponse.error.message}`)
          } else {
            let { alpha_adjustment, beta_adjustment } = scoresAdjustResponse.data?.data || { alpha_adjustment: 0, beta_adjustment: 0 }

            // Apply duration adjustment if alpha_adjustment is positive
            if (alpha_adjustment > 0) {
              const durationAdjustResponse = await supabaseClient.functions.invoke('adjust-for-duration', {
                body: { 
                  original_increment: alpha_adjustment, 
                  duration,
                  threshold: 500
                }
              })

              if (durationAdjustResponse.error) {
                console.error('Error adjusting for duration:', durationAdjustResponse.error)
                results.errors.push(`Duration adjustment failed: ${durationAdjustResponse.error.message}`)
              } else {
                alpha_adjustment = durationAdjustResponse.data?.data?.adjusted_increment || alpha_adjustment
              }
            }

            // Get current alpha/beta
            const getAlphaBetaResponse = await supabaseClient.functions.invoke('get-alpha-beta', {
              body: {
                user_id,
                entity_type: 'problem_number_type',
                entity_id: problem_number_type
              }
            })

            let alpha = 1, beta = 25
            if (getAlphaBetaResponse.data?.success && getAlphaBetaResponse.data?.data?.alpha !== null) {
              alpha = getAlphaBetaResponse.data.data.alpha
              beta = getAlphaBetaResponse.data.data.beta
            }

            // Apply adjustments
            alpha += alpha_adjustment
            beta += beta_adjustment

            // Set new alpha/beta
            const setAlphaBetaResponse = await supabaseClient.functions.invoke('set-alpha-beta', {
              body: {
                user_id,
                entity_type: 'problem_number_type',
                entity_id: problem_number_type,
                alpha,
                beta
              }
            })

            if (setAlphaBetaResponse.error) {
              console.error('Error setting alpha/beta:', setAlphaBetaResponse.error)
              results.errors.push(`Alpha/beta setting failed: ${setAlphaBetaResponse.error.message}`)
            }
          }
        }
      } else {
        // Regular problem type update
        const problemTypeUpdateResponse = await supabaseClient.functions.invoke('update-problem-number-type-for-attempt', {
          body: {
            user_id,
            problem_number_type,
            finished_or_not,
            is_correct,
            difficulty,
            scaling_type
          }
        })

        if (problemTypeUpdateResponse.error) {
          console.error('Error updating problem type:', problemTypeUpdateResponse.error)
          results.errors.push(`Problem type update failed: ${problemTypeUpdateResponse.error.message}`)
        }
      }

      // Apply CUSUM for problem type
      const x_n = (finished_or_not && is_correct) || (finished_or_not && scores_fipi !== null && scores_fipi !== undefined && scores_fipi >= 1) ? 1 : 0
      
      // Get current cusum_s for problem type
      const getCurrentSProblemResponse = await supabaseClient.functions.invoke('get-cusum-s', {
        body: {
          user_id,
          entity_type: 'problem_number_type',
          entity_id: problem_number_type
        }
      })

      let current_s_problem = null
      if (!getCurrentSProblemResponse.error && getCurrentSProblemResponse.data?.success) {
        current_s_problem = getCurrentSProblemResponse.data.data.cusum_s
      }

      // Apply CUSUM algorithm for problem type
      const cusumProblemResponse = await supabaseClient.functions.invoke('apply-cusum', {
        body: {
          current_s: current_s_problem,
          x_n,
          k: 0.5,
          h: 3.0
        }
      })

      if (cusumProblemResponse.error) {
        console.error('Error applying CUSUM for problem type:', cusumProblemResponse.error)
        results.errors.push(`Problem type CUSUM failed: ${cusumProblemResponse.error.message}`)
      } else {
        const { new_s, adjustment } = cusumProblemResponse.data?.data || { new_s: 0, adjustment: 0 }
        
        // Update cusum_s for problem type
        const updateCusumProblemResponse = await supabaseClient.functions.invoke('update-cusum-s', {
          body: {
            user_id,
            entity_type: 'problem_number_type',
            entity_id: problem_number_type,
            new_s
          }
        })

        if (updateCusumProblemResponse.error) {
          console.error(`Error updating cusum_s for problem type ${problem_number_type}:`, updateCusumProblemResponse.error)
          results.errors.push(`Problem type cusum_s update failed: ${updateCusumProblemResponse.error.message}`)
        }

        // Apply adjustment if needed for problem type
        if (adjustment !== 0) {
          const adjustmentProblemResponse = await supabaseClient.functions.invoke('apply-cusum-adjustment', {
            body: {
              user_id,
              entity_type: 'problem_number_type',
              entity_id: problem_number_type,
              adjustment
            }
          })

          if (adjustmentProblemResponse.error) {
            console.error(`Error applying CUSUM adjustment for problem type ${problem_number_type}:`, adjustmentProblemResponse.error)
            results.errors.push(`Problem type CUSUM adjustment failed: ${adjustmentProblemResponse.error.message}`)
          }
        }
      }

      // Apply SPRT for problem type
      const masteryCheckProblemResponse = await supabaseClient.functions.invoke('check-mastery-status', {
        body: {
          user_id,
          entity_type: 'problem_number_type',
          entity_id: problem_number_type,
          A: 0.05,
          B: 20
        }
      })

      if (masteryCheckProblemResponse.error) {
        console.error('Error checking mastery for problem type:', masteryCheckProblemResponse.error)
        results.errors.push(`Problem type mastery check failed: ${masteryCheckProblemResponse.error.message}`)
      } else {
        // Update mastery status
        const status = masteryCheckProblemResponse.data?.data?.status || 'continue'
        const updateStatusProblemResponse = await supabaseClient.functions.invoke('update-mastery-status', {
          body: {
            user_id,
            entity_type: 'problem_number_type',
            entity_id: problem_number_type,
            status
          }
        })

        if (updateStatusProblemResponse.error) {
          console.error('Error updating mastery status for problem type:', updateStatusProblemResponse.error)
          results.errors.push(`Problem type status update failed: ${updateStatusProblemResponse.error.message}`)
        }
      }

      results.problem_type_processed = true
    } catch (error) {
      console.error('Error processing problem type:', error)
      results.errors.push(`Problem type processing failed: ${error.message}`)
    }

    // Step 3: Update topic mastery
    for (const topic_id of topics_list) {
      try {
        console.log(`Processing topic ${topic_id}`)

        // Check topic mastery status
        const topicMasteryCheckResponse = await supabaseClient.functions.invoke('check-topic-mastery-status', {
          body: {
            user_id,
            topic_code: topic_id.toString(),
            A: 0.05,
            B: 20
          }
        })

        if (topicMasteryCheckResponse.error) {
          console.error(`Error checking topic mastery for ${topic_id}:`, topicMasteryCheckResponse.error)
          results.errors.push(`Topic ${topic_id} mastery check failed: ${topicMasteryCheckResponse.error.message}`)
        } else {
          // Update topic mastery status
          const status = topicMasteryCheckResponse.data?.data?.status || 'continue'
          const updateTopicStatusResponse = await supabaseClient.functions.invoke('update-topic-mastery-status', {
            body: {
              user_id,
              topic_code: topic_id.toString(),
              status
            }
          })

          if (updateTopicStatusResponse.error) {
            console.error(`Error updating topic mastery status for ${topic_id}:`, updateTopicStatusResponse.error)
            results.errors.push(`Topic ${topic_id} status update failed: ${updateTopicStatusResponse.error.message}`)
          }
        }

        results.topics_processed.push(topic_id)
      } catch (error) {
        console.error(`Error processing topic ${topic_id}:`, error)
        results.errors.push(`Topic ${topic_id} processing failed: ${error.message}`)
      }
    }

    console.log(`Attempt processing complete. Skills: ${results.skills_processed.length}, Problem type: ${results.problem_type_processed}, Topics: ${results.topics_processed.length}, Errors: ${results.errors.length}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          ...results,
          summary: {
            total_skills: skills_list.length,
            skills_processed: results.skills_processed.length,
            problem_type_processed: results.problem_type_processed,
            total_topics: topics_list.length,
            topics_processed: results.topics_processed.length,
            total_errors: results.errors.length
          }
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