import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  user_id: string;
  course_id?: number;
  date_string?: string;
  number_of_words?: number;
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

    // Parse request body
    const { 
      user_id, 
      course_id = 1, 
      date_string = '29 may 2026', 
      number_of_words = 500 
    }: RequestBody = await req.json();

    console.log(`Creating task for user: ${user_id}, course: ${course_id}`);

    // Get target score from profiles table
    const targetScoreColumn = `course_${course_id}_goal`;
    const schoolGradeColumn = `schoolmark${course_id}`;

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select(`${targetScoreColumn}, ${schoolGradeColumn}`)
      .eq('user_id', user_id)
      .single();

    if (profileError) {
      console.error('Error fetching profile data:', profileError);
      throw new Error('Failed to fetch user profile data');
    }

    const target_score = profileData[targetScoreColumn];
    const school_grade = profileData[schoolGradeColumn];

    if (!target_score || !school_grade) {
      throw new Error('Missing target score or school grade in user profile');
    }

    console.log(`Target score: ${target_score}, School grade: ${school_grade}`);

    // Call openrouter-task-call function
    const { data: taskData, error: taskError } = await supabase.functions.invoke(
      'openrouter-task-call',
      {
        body: {
          user_id,
          course_id,
          target_score,
          weekly_hours: 8,
          school_grade,
          date_string,
          number_of_words
        }
      }
    );

    if (taskError) {
      console.error('Error calling openrouter-task-call:', taskError);
      throw new Error('Failed to generate task');
    }

    const task = taskData.response;
    console.log('Generated task successfully');

    // Insert new row to stories_and_telegram table
    const { data: insertData, error: insertError } = await supabase
      .from('stories_and_telegram')
      .insert({
        user_id,
        task,
        seen: 0,
        upload_id: Math.floor(Math.random() * 1000000)
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting task:', insertError);
      throw new Error('Failed to save task');
    }

    console.log('Task saved successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        task_id: insertData.upload_id,
        task: task
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in create-task function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});