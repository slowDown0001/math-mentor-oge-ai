import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Starting progress schedule trigger...');
    // Get all users with their courses
    const { data: profiles, error: profilesError } = await supabase.from('profiles').select('user_id, courses').not('courses', 'is', null);
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return new Response(JSON.stringify({
        error: 'Failed to fetch profiles'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    let processedCount = 0;
    let eligibleCount = 0;
    const results = [];
    for (const profile of profiles || []){
      const { user_id, courses } = profile;
      if (!courses || courses.length === 0) {
        console.log(`User ${user_id} has no courses, skipping`);
        continue;
      }
      for (const course_id of courses){
        const courseIdString = String(course_id);
        console.log(`Checking conditions for user ${user_id}, course ${courseIdString}`);
        const isEligible = await checkEligibilityConditions(supabase, user_id, courseIdString);
        if (isEligible) {
          eligibleCount++;
          console.log(`Processing user ${user_id}, course ${courseIdString}`);
          try {
            const { data: progressData, error: progressError } = await supabase.functions.invoke('student-progress-calculate', {
              body: {
                user_id,
                course_id: courseIdString
              },
              headers: {
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
              }
            });
            if (progressError) {
              console.error(`Error calling student-progress-calculate for user ${user_id}, course ${courseIdString}:`, progressError);
              results.push({
                user_id,
                course_id: courseIdString,
                status: 'error',
                error: progressError.message
              });
              continue;
            }
            await storeProgressSnapshot(supabase, user_id, courseIdString, progressData);
            processedCount++;
            results.push({
              user_id,
              course_id: courseIdString,
              status: 'success'
            });
            console.log(`Successfully processed user ${user_id}, course ${courseIdString}`);
            await new Promise((resolve)=>setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`Error processing user ${user_id}, course ${courseIdString}:`, error);
            results.push({
              user_id,
              course_id: courseIdString,
              status: 'error',
              error: error.message
            });
          }
        } else {
          console.log(`User ${user_id}, course ${courseIdString} not eligible, skipping`);
        }
      }
    }
    console.log(`Progress schedule trigger completed. Processed: ${processedCount}, Eligible: ${eligibleCount}, Total profiles: ${profiles?.length || 0}`);
    return new Response(JSON.stringify({
      success: true,
      total_profiles: profiles?.length || 0,
      eligible_pairs: eligibleCount,
      processed_pairs: processedCount,
      results
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in progress-schedule-trigger:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
async function checkEligibilityConditions(supabase, user_id, course_id) {
  try {
    const { data: masteryData, error: masteryError } = await supabase.from('student_mastery').select('updated_at').eq('user_id', user_id).eq('course_id', course_id).order('updated_at', {
      ascending: false
    }).limit(1).single();
    if (masteryError && masteryError.code !== 'PGRST116') {
      console.error('Error checking student_mastery:', masteryError);
      return false;
    }
    const { data: snapshotData, error: snapshotError } = await supabase.from('mastery_snapshots').select('run_timestamp').eq('user_id', user_id).eq('course_id', course_id).order('run_timestamp', {
      ascending: false
    }).limit(1).single();
    if (snapshotError && snapshotError.code !== 'PGRST116') {
      console.error('Error checking mastery_snapshots:', snapshotError);
      return false;
    }
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    let condition1 = true;
    if (masteryData && snapshotData) {
      const masteryTime = new Date(masteryData.updated_at);
      const snapshotTime = new Date(snapshotData.run_timestamp);
      condition1 = masteryTime > snapshotTime;
    } else if (!masteryData || masteryError?.code === 'PGRST116') {
      return false;
    }
    let condition2 = true;
    if (snapshotData) {
      const snapshotTime = new Date(snapshotData.run_timestamp);
      condition2 = now > new Date(snapshotTime.getTime() + 30 * 60 * 1000);
    }
    console.log(`User ${user_id}, course ${course_id}: Condition1=${condition1}, Condition2=${condition2}`);
    return condition1 && condition2;
  } catch (error) {
    console.error('Error checking eligibility conditions:', error);
    return false;
  }
}
async function storeProgressSnapshot(supabase, user_id, course_id, progressData) {
  try {
    const raw_data = progressData;
    const computed_summary = computeSummary(progressData);
    // 🔹 NEW FEATURE: compute stats from student_activity
    const { data: data_questions, error: questionsError } = await supabase.from('student_activity').select('question_id, is_correct, duration_answer, created_at').eq('user_id', user_id).eq('course_id', course_id || '1').not('is_correct', 'is', null);
    if (questionsError) {
      console.error('Error fetching student_activity:', questionsError);
    }
    let stats = {
      "Решено задач": 0,
      "Правильных ответов": 0,
      "Время обучения": 0,
      "Дней подряд": 0
    };
    if (data_questions && data_questions.length > 0) {
      const total = data_questions.length;
      const correctCount = data_questions.filter((q)=>q.is_correct === true).length;
      const totalDurationSec = data_questions.reduce((sum, q)=>sum + (q.duration_answer || 0), 0);
      const totalDurationHours = +(totalDurationSec / 3600).toFixed(2);
      // Compute streak ("Дней подряд")
      const uniqueDays = Array.from(new Set(data_questions.map((q)=>q.created_at.split('T')[0]))).sort(); // ascending order
      let streak = 0;
      if (uniqueDays.length > 0) {
        const today = new Date(uniqueDays[uniqueDays.length - 1]);
        streak = 1;
        for(let i = uniqueDays.length - 2; i >= 0; i--){
          const prev = new Date(uniqueDays[i]);
          const diffDays = Math.floor((today - prev) / (1000 * 60 * 60 * 24));
          if (diffDays === streak) {
            streak++;
          } else if (diffDays > streak) {
            break;
          }
        }
      }
      stats = {
        "Решено задач": total,
        "Правильных ответов": +(correctCount / total * 100).toFixed(2),
        "Время обучения": totalDurationHours,
        "Дней подряд": streak
      };
    }
    const { error } = await supabase.from('mastery_snapshots').insert({
      user_id,
      course_id,
      raw_data,
      computed_summary,
      stats,
      run_timestamp: new Date().toISOString()
    });
    if (error) {
      console.error('Error storing snapshot:', error);
      throw error;
    }
    console.log(`Stored snapshot for user ${user_id}, course ${course_id}`);
  } catch (error) {
    console.error('Error in storeProgressSnapshot:', error);
    throw error;
  }
}
function computeSummary(progressData) {
  try {
    const summary = [];
    const probabilities = [];
    if (Array.isArray(progressData)) {
      for (const item of progressData){
        if (item.topic && typeof item.prob === 'number') {
          summary.push({
            topic: item.topic,
            prob: item.prob
          });
          probabilities.push(item.prob);
        }
      }
    }
    const general_progress = probabilities.length > 0 ? probabilities.reduce((sum, prob)=>sum + prob, 0) / probabilities.length : 0;
    summary.unshift({
      general_progress
    });
    return summary;
  } catch (error) {
    console.error('Error computing summary:', error);
    return [
      {
        general_progress: 0
      }
    ];
  }
}
