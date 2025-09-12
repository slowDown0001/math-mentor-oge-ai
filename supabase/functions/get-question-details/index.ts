import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  question_id: string
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

    const { question_id }: RequestBody = await req.json()

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
    async function getTopicSkillMapping(): Promise<Array<{topic: string, skills: number[]}>> {
      try {
        const response = await fetch('https://kbaazksvkvnafrwtmkcw.supabase.co/storage/v1/object/public/txtbkimg/ogemath_topic_skills_json.txt');
        if (!response.ok) {
          console.warn('Failed to fetch topic-skill mapping, using fallback');
          return [];
        }
        const mapping = await response.json();
        // Convert object format to array format
        return Object.entries(mapping).map(([topic, skills]) => ({
          topic,
          skills: skills as number[]
        }));
      } catch (error) {
        console.error('Error fetching topic-skill mapping:', error);
        return [];
      }
    }

    // Get topic-skill mapping from external file
    const topicSkillMapping = await getTopicSkillMapping();

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