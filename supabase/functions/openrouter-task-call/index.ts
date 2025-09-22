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
      try {
        // Add timeout to the function call
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Function call timeout after 30 seconds')), 30000);
        });

        const functionPromise = supabase.functions.invoke(
          'student-progress-calculate',
          {
            body: { user_id }
          }
        );

        const { data: progressData, error: progressError } = await Promise.race([
          functionPromise,
          timeoutPromise
        ]) as any;

        if (progressError) {
          console.error('Error fetching student progress:', progressError);
          console.log('Using fallback for student progress');
          studentProgress = '[]'; // Use empty array as fallback
        } else {
          console.log('Progress data received successfully');
          console.log('Progress data type:', typeof progressData);
          console.log('Progress data length:', Array.isArray(progressData) ? progressData.length : 'not array');
          studentProgress = JSON.stringify(progressData, null, 2);
        }
      } catch (error) {
        console.error('Exception while fetching student progress:', error);
        console.log('Error details:', error.name, error.message);
        console.log('Using fallback for student progress due to exception');
        studentProgress = '[]'; // Use empty array as fallback
      }
    }

    // Get student hardcoded task
    let student_hardcoded_task = '';
    console.log(`Checking conditions for ogemath-task-hardcode: course_id=${course_id}, studentProgress exists=${!!studentProgress}, studentProgress length=${studentProgress.length}`);
    
    if (course_id === 1 && studentProgress) {
      console.log('Calling ogemath-task-hardcode function...');
      try {
        let progressArray;
        try {
          progressArray = JSON.parse(studentProgress);
        } catch (parseError) {
          console.error('Failed to parse studentProgress JSON:', parseError);
          progressArray = []; // Use empty array as fallback
        }
        
        console.log('Progress array parsed, type:', typeof progressArray, 'is array:', Array.isArray(progressArray));
        
        // Extract progress_bars if it exists, otherwise use the array directly, or empty array as fallback
        let progressData;
        if (progressArray && typeof progressArray === 'object') {
          progressData = progressArray.progress_bars || progressArray;
        } else {
          progressData = [];
        }
        
        // Ensure progressData is an array
        if (!Array.isArray(progressData)) {
          console.log('progressData is not an array, converting to empty array');
          progressData = [];
        }
        
        console.log('Using progress data:', `Array with ${progressData.length} items`);
        
        const { data: taskData, error: taskError } = await supabase.functions.invoke(
          'ogemath-task-hardcode',
          {
            body: {
              goal: target_score,
              hours_per_week: weekly_hours,
              school_grade: school_grade,
              days_to_exam: daysToExam,
              progress: progressData
            }
          }
        );

        if (taskError) {
          console.error('Error generating student task:', taskError);
          student_hardcoded_task = 'Не удалось сгенерировать задание';
        } else {
          console.log('ogemath-task-hardcode completed successfully');
          student_hardcoded_task = JSON.stringify(taskData, null, 2);
        }
      } catch (error) {
        console.error('Error parsing student progress for task generation:', error);
        student_hardcoded_task = 'Ошибка при обработке прогресса';
      }
    } else {
      console.log('Conditions not met for ogemath-task-hardcode. Reasons:');
      console.log(`- course_id !== 1: ${course_id !== 1}`);
      console.log(`- no studentProgress: ${!studentProgress}`);
      console.log(`- studentProgress is error: ${studentProgress === 'Не удалось загрузить прогресс студента' || studentProgress === 'Ошибка при загрузке прогресса студента'}`);
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

    // Filter student progress to remove skill elements
    let filteredStudentProgress = studentProgress;
    if (studentProgress && course_id === 1) {
      try {
        const progressArray = JSON.parse(studentProgress);
        const filteredProgress = progressArray.filter((item: any) => !item.hasOwnProperty('навык'));
        filteredStudentProgress = JSON.stringify(filteredProgress, null, 2);
      } catch (error) {
        console.error('Error filtering student progress:', error);
        // Keep original if filtering fails
      }
    }

    // Construct the full prompt
    const prompt = prompt1 + `
Твой ответ должен иметь длину до ${number_of_words} слов.

### Задание студента

{ЗАДАНИЕ_ДЛЯ_СТУДЕНТА}:
${student_hardcoded_task}

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
${filteredStudentProgress}
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

    // Insert hardcode_task to stories_and_telegram table if it exists
    if (student_hardcoded_task && course_id === 1) {
      console.log('Saving hardcode task to database...');
      const { data: insertData, error: insertError } = await supabase
        .from('stories_and_telegram')
        .insert({
          user_id,
          hardcode_task: student_hardcoded_task,
          seen: 0,
          upload_id: Math.floor(Math.random() * 1000000)
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting hardcode task:', insertError);
      } else {
        console.log('Hardcode task saved successfully');
      }
    }

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