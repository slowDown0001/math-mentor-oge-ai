import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
// Helper functions to provide default values when profile data is missing
function getDefaultTargetScore(course_id) {
  // Provide sensible defaults based on course type
  switch(course_id){
    case 1:
      return 18; // OGE Math basic target score
    case 2:
      return 15; // EGE Math basic target score  
    case 3:
      return 12; // EGE Math advanced target score
    default:
      return 15;
  }
}
function getDefaultSchoolGrade(course_id) {
  // Default to grade 4 (good) for all courses
  return 4;
}
// Telegram notification function
async function sendTelegramNotification(telegramUserId, message) {
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
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: telegramUserId,
        text: message,
        parse_mode: 'Markdown'
      })
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
async function sendNotificationBackground(supabase, userId) {
  try {
    console.log(`Starting background notification task for user: ${userId}`);
    // Query telegram_user_id from profiles table
    const { data: profileData, error: profileError } = await supabase.from('profiles').select('telegram_user_id').eq('user_id', userId).single();
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
    await new Promise((resolve)=>setTimeout(resolve, 50));
  } catch (error) {
    console.error(`Background notification task failed for user ${userId}:`, error);
  }
}
Deno.serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // Parse request body
    const { user_id, course_id = 1, date_string = '29 may 2026', number_of_words = 500 } = await req.json();
    console.log(`Creating task for user: ${user_id}, course: ${course_id}`);
    // Get target score from profiles table
    const targetScoreColumn = `course_${course_id}_goal`;
    const schoolGradeColumn = `schoolmark${course_id}`;
    const { data: profileData, error: profileError } = await supabase.from('profiles').select(`${targetScoreColumn}, ${schoolGradeColumn}`).eq('user_id', user_id).single();
    if (profileError) {
      console.error('Error fetching profile data:', profileError);
      throw new Error('Failed to fetch user profile data');
    }
    // Use profile data if available, otherwise use sensible defaults
    const target_score = profileData[targetScoreColumn] || getDefaultTargetScore(course_id);
    const school_grade = profileData[schoolGradeColumn] || getDefaultSchoolGrade(course_id);
    console.log(`Target score: ${target_score}, School grade: ${school_grade}`);
    // Call openrouter-task-call function
    const { data: taskData, error: taskError } = await supabase.functions.invoke('openrouter-task-call', {
      body: {
        user_id,
        course_id,
        target_score,
        weekly_hours: 8,
        school_grade,
        date_string,
        number_of_words
      }
    });
    if (taskError) {
      console.error('Error calling openrouter-task-call:', taskError);
      throw new Error('Failed to generate task');
    }
    // Extract the required data from the response
    const task = taskData.task;
    const hardcode_task = taskData.hardcode_task;
    const previously_failed_topics = taskData.previously_failed_topics;
    console.log('Generated task, hardcode_task, and previously_failed_topics successfully');
    // Always insert a new row with the three extracted values plus seen: 0
    console.log('Inserting new row with task, hardcode_task, and previously_failed_topics...');
    const { data: insertData, error: insertError } = await supabase.from('stories_and_telegram').insert({
      user_id,
      task,
      hardcode_task,
      previously_failed_topics,
      seen: 0,
      upload_id: Math.floor(Math.random() * 1000000)
    }).select().single();
    if (insertError) {
      console.error('Error inserting new task row:', insertError);
      throw new Error('Failed to save task');
    }
    console.log('New task row created successfully');
    // Start background notification task (non-blocking)
    sendNotificationBackground(supabase, user_id).catch((error)=>{
      console.error('Background notification task error:', error);
    });
    return new Response(JSON.stringify({
      success: true,
      task_id: insertData.upload_id,
      task: task
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Error in create-task function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
