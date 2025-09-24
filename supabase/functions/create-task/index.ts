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

// Helper functions to provide default values when profile data is missing
function getDefaultTargetScore(course_id: number): number {
  // Provide sensible defaults based on course type
  switch (course_id) {
    case 1: return 18; // OGE Math basic target score
    case 2: return 15; // EGE Math basic target score  
    case 3: return 12; // EGE Math advanced target score
    default: return 15;
  }
}

function getDefaultSchoolGrade(course_id: number): number {
  // Default to grade 4 (good) for all courses
  return 4;
}

// Telegram notification function
async function sendTelegramNotification(telegramUserId: number, message: string): Promise<boolean> {
  try {
    const telegramToken = Deno.env.get('TELEGRAM_TOKEN');
    if (!telegramToken) {
      console.warn('TELEGRAM_TOKEN not found in environment variables');
      return false;
    }

    const telegramApiUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramUserId,
        text: message,
        parse_mode: 'Markdown'
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Telegram API error: ${response.status} - ${errorData}`);
      return false;
    }

    const responseData = await response.json();
    console.log(`Notification sent to Telegram user ${telegramUserId}: ${message}`);
    return true;
  } catch (error) {
    console.error(`Failed to send Telegram notification to user ${telegramUserId}:`, error);
    return false;
  }
}

// Background task to send notification
async function sendNotificationBackground(supabase: any, userId: string) {
  try {
    console.log(`Starting background notification task for user: ${userId}`);
    
    // Query telegram_user_id from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('telegram_user_id')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.warn(`Error fetching profile for notification: ${profileError.message}`);
      return;
    }

    if (!profileData?.telegram_user_id) {
      console.log(`No telegram_user_id found for user ${userId}, skipping notification`);
      return;
    }

    // Random notification messages (matching the Python version)
    const notifications = [
      "🆕 Новое задание создано! Заходи на платформу заниматься!",
      "📚 Новое задание на платформе! Заходи!",
      "✅ Задание добавлено! Время заниматься!"
    ];

    const randomMessage = notifications[Math.floor(Math.random() * notifications.length)];
    
    // Send the notification
    const success = await sendTelegramNotification(profileData.telegram_user_id, randomMessage);
    
    if (success) {
      console.log(`Telegram notification sent successfully to user ${userId}`);
    } else {
      console.warn(`Failed to send Telegram notification to user ${userId}`);
    }

    // Add a small delay as mentioned in the Python code
    await new Promise(resolve => setTimeout(resolve, 50));
    
  } catch (error) {
    console.error(`Background notification task failed for user ${userId}:`, error);
  }
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

    // Use profile data if available, otherwise use sensible defaults
    const target_score = profileData[targetScoreColumn] || getDefaultTargetScore(course_id);
    const school_grade = profileData[schoolGradeColumn] || getDefaultSchoolGrade(course_id);

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

    // Find the most recent row for this user with hardcode_task and update it
    const { data: existingRows, error: fetchError } = await supabase
      .from('stories_and_telegram')
      .select('*')
      .eq('user_id', user_id)
      .not('hardcode_task', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('Error fetching existing rows:', fetchError);
      throw new Error('Failed to fetch existing task data');
    }

    let insertData;
    if (existingRows && existingRows.length > 0) {
      // Update the existing row with the task
      console.log('Updating existing row with task...');
      const { data: updateData, error: updateError } = await supabase
        .from('stories_and_telegram')
        .update({ task })
        .eq('upload_id', existingRows[0].upload_id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating task:', updateError);
        throw new Error('Failed to update task');
      }
      
      insertData = updateData;
      console.log('Task updated successfully');
    } else {
      // No existing row found, create a new one
      console.log('No existing hardcode_task found, creating new row...');
      const { data: newData, error: insertError } = await supabase
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
      
      insertData = newData;
      console.log('New task row created successfully');
    }

    // Start background notification task (non-blocking)
    // Using EdgeRuntime.waitUntil to ensure the background task completes
    if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
      EdgeRuntime.waitUntil(sendNotificationBackground(supabase, user_id));
    } else {
      // Fallback for environments that don't support EdgeRuntime.waitUntil
      sendNotificationBackground(supabase, user_id).catch(error => {
        console.error('Background notification task error:', error);
      });
    }

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