import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  question_id: string
  origin?: string
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

const { question_id, origin: originOverride }: RequestBody = await req.json()

// Derive origin for fallback fetching of public assets
let originHeader = req.headers.get('origin') || req.headers.get('referer') || ''
if (originOverride && typeof originOverride === 'string') {
  originHeader = originOverride
}

    // Validate required parameters
    if (!question_id) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameter: question_id' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Fetching question details for question_id: ${question_id}`)

    // Determine which table to query based on question_id format
    let tableName = 'oge_math_fipi_bank' // default
    if (question_id.startsWith('EGEBASIC_')) {
      tableName = 'egemathbase'
    } else if (question_id.startsWith('EGEPROF_')) {
      tableName = 'egemathprof'
    }

    console.log(`Querying table: ${tableName}`)

    // Fetch question details from the appropriate table
    const { data: questionData, error } = await supabaseClient
      .from(tableName)
      .select('skills, problem_number_type, difficulty')
      .eq('question_id', question_id)
      .maybeSingle()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch question details', 
          details: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!questionData) {
      return new Response(
        JSON.stringify({ 
          error: `Question ID ${question_id} not found` 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse skills string to array if it exists
    let skillsArray: number[] = []
    if (questionData.skills) {
      try {
        // Skills might be stored as comma-separated string or JSON
        if (typeof questionData.skills === 'string') {
          skillsArray = questionData.skills.split(',').map(s => {
            const num = parseInt(s.trim(), 10)
            return isNaN(num) ? null : num
          }).filter(n => n !== null) as number[]
        } else if (Array.isArray(questionData.skills)) {
          // If already an array, ensure all elements are integers
          skillsArray = questionData.skills.map(s => parseInt(s, 10)).filter(n => !isNaN(n))
        }
      } catch (e) {
        console.warn('Error parsing skills:', e)
      }
    }

// Function to fetch topic-skill mapping from external file
    async function getTopicSkillMapping(courseType: string, origin?: string): Promise<Array<{topic: string, skills: number[]}>> {
      try {
        let fileName = 'ogemath_topic_skills_json.txt' // default
        if (courseType === 'egebasic') {
          fileName = 'egemathbase_topic_skills_json.txt'
        } else if (courseType === 'egeprof') {
          fileName = 'egemathprof_topic_skills_json.txt'
        }

        // 1) Try Supabase Storage (preferred)
        const storageUrl = `https://kbaazksvkvnafrwtmkcw.supabase.co/storage/v1/object/public/txtbkimg/${fileName}`
        const response = await fetch(storageUrl)
        if (response.ok) {
          const mapping = await response.json()
          return Object.entries(mapping).map(([topic, skills]: [string, any]) => ({
            topic,
            skills: skills as number[]
          }))
        }

        // 2) Fallback to app's public assets using request origin
        if (origin) {
          const appAssetUrl = `${origin.replace(/\/$/, '')}/${fileName}`
          const fallbackResp = await fetch(appAssetUrl)
          if (fallbackResp.ok) {
            const mapping = await fallbackResp.json()
            return Object.entries(mapping).map(([topic, skills]: [string, any]) => ({
              topic,
              skills: skills as number[]
            }))
          }
          console.warn(`Failed to fetch mapping from app assets at ${appAssetUrl}`)
        }

        console.warn('Failed to fetch topic-skill mapping from storage and app assets, returning empty mapping')
        return []
      } catch (error) {
        console.error('Error fetching topic-skill mapping:', error)
        return []
      }
    }

    // Determine course type based on question_id
    let courseType = 'ogemath' // default
    if (question_id.startsWith('EGEBASIC_')) {
      courseType = 'egebasic'
    } else if (question_id.startsWith('EGEPROF_')) {
      courseType = 'egeprof'
    }

// Get topic-skill mapping from external file (with robust fallbacks)
    const topicSkillMapping = await getTopicSkillMapping(courseType, originHeader);

    // Derive topics from skills
    const topicsArray: string[] = []
    for (const mapping of topicSkillMapping) {
      // Check if any skill from this question matches skills in this topic
      if (skillsArray.some(skill => mapping.skills.includes(skill))) {
        topicsArray.push(mapping.topic)
      }
    }

    const questionDetails = {
      skills: skillsArray,
      topics: topicsArray,
      problem_number_type: questionData.problem_number_type ? parseInt(questionData.problem_number_type.toString()) : null,
      difficulty: questionData.difficulty ? parseInt(questionData.difficulty.toString()) : 1
    }

    console.log(`Successfully fetched question details for ${question_id}:`, questionDetails)

    return new Response(
      JSON.stringify({ 
        success: true,
        data: questionDetails
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