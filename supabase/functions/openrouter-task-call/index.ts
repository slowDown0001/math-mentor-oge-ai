import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  user_id: string;
  course_id?: number;
  target_score: number;
  weekly_hours: number;
  school_grade: number;
  date_string?: string;
  number_of_words: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get OpenRouter API key from Supabase secrets
    const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openrouterApiKey) {
      throw new Error('OPENROUTER_API_KEY not found in environment variables');
    }

    // Parse request body
    const { 
      user_id, 
      course_id = 1, 
      target_score, 
      weekly_hours, 
      school_grade, 
      date_string = '29 may 2026', 
      number_of_words 
    }: RequestBody = await req.json();

    console.log(`Processing task call for user: ${user_id}`);

    // Calculate days to exam
    const examDate = new Date(date_string);
    const today = new Date();
    const daysToExam = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let studentProgress = '';

    // Get student progress if course_id is 1
    if (course_id === 1) {
      console.log('Fetching student progress...');
      const { data: progressData, error: progressError } = await supabase.functions.invoke(
        'student-progress-calculate',
        {
          body: { user_id }
        }
      );

      if (progressError) {
        console.error('Error fetching student progress:', progressError);
        studentProgress = 'Не удалось загрузить прогресс студента';
      } else {
        studentProgress = JSON.stringify(progressData, null, 2);
      }
    }

    // Get task context from oge_entrypage_rag table
    console.log(`Fetching task context for course_id: ${course_id}`);
    const { data: ragData, error: ragError } = await supabase
      .from('oge_entrypage_rag')
      .select('task_context')
      .eq('id', course_id)
      .single();

    if (ragError) {
      console.error('Error fetching task context:', ragError);
      throw new Error('Failed to fetch task context');
    }

    const prompt1 = ragData.task_context || '';

    // Construct the full prompt
    const prompt = prompt1 + `
Твой ответ должен иметь длину до ${number_of_words} слов.

### Данные студента

{ЦЕЛЬ_СТУДЕНТА}:
${target_score} балла

{КОЛИЧЕСТВО_ЧАСОВ_В_НЕДЕЛЮ}
${weekly_hours}

{ШКОЛЬНАЯ_ОЦЕНКА_СТУДЕНТА}
${school_grade}

{ДНЕЙ_ДО_ЭКЗАМЕНА}:
${daysToExam}

{ПРОГРЕСС_СТУДЕНТА}:
${studentProgress}
`;

    console.log('Making OpenRouter API call...');

    // Make OpenRouter API call
    const headers = {
      "Authorization": `Bearer ${openrouterApiKey}`,
      "Content-Type": "application/json"
    };

    const data = {
      "model": "google/gemini-flash-1.5",
      "messages": [
        {"role": "system", "content": "You are a math tutor."},
        {"role": "user", "content": prompt}
      ],
      "max_tokens": 40000,
      "temperature": 0.6
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    const aiResponse = responseData.choices?.[0]?.message?.content || "Не удалось получить ответ от ИИ";

    console.log('Successfully generated AI response');

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        metadata: {
          user_id,
          course_id,
          target_score,
          weekly_hours,
          school_grade,
          days_to_exam: daysToExam,
          number_of_words
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in openrouter-task-call function:', error);
    
    return new Response(
      JSON.stringify({ 
        response: "Какие-то неполадки в сети. Попробуй позже 👀",
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});