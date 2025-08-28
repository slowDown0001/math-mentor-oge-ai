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

    // Fetch question details from the oge_math_fipi_bank table
    const { data: questionData, error } = await supabaseClient
      .from('oge_math_fipi_bank')
      .select('skills, problem_number_type, difficulty')
      .eq('question_id', question_id)
      .single()

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
          skillsArray = questionData.skills.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
        }
      } catch (e) {
        console.warn('Error parsing skills:', e)
      }
    }

    // Topic-skill mapping to derive topics from skills (using integer topic IDs)
    const topicSkillMapping = [
      { topic: 1, skills: [1, 2, 3, 4, 5] },                    // 1.1 Натуральные и целые числа
      { topic: 2, skills: [6, 7, 8, 9, 10] },                  // 1.2 Дроби и проценты  
      { topic: 3, skills: [11, 12, 13, 14, 15, 16, 17, 180] }, // 1.3 Рациональные числа
      { topic: 4, skills: [18, 19, 20] },                      // 1.4 Действительные числа
      { topic: 5, skills: [21, 22] },                          // 1.5 Приближённые вычисления
      { topic: 6, skills: [23, 24, 25, 26, 27] },              // 1.6 Измерения, приближения
      { topic: 7, skills: [28, 29, 30, 31, 32, 33] },          // 2.1 Буквенные выражения
      { topic: 8, skills: [34, 35, 36, 37, 38, 39, 40] },      // 2.2 Многочлены
      { topic: 9, skills: [41, 42, 43] },                      // 2.3 Алгебраические дроби
      { topic: 10, skills: [44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179] } // 2.4 Уравнения и неравенства
    ]

    // Derive topics from skills
    const topicsArray: number[] = []
    for (const mapping of topicSkillMapping) {
      // Check if any skill from this question matches skills in this topic
      if (skillsArray.some(skill => mapping.skills.includes(skill))) {
        topicsArray.push(mapping.topic)
      }
    }

    const questionDetails = {
      skills: skillsArray,
      topics: topicsArray,
      problem_number_type: questionData.problem_number_type ? parseInt(questionData.problem_number_type) : null,
      difficulty: questionData.difficulty ? parseInt(questionData.difficulty) : 1
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