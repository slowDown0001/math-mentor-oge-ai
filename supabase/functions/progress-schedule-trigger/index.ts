import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting progress schedule trigger...');

    // Get all users with their courses
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, courses')
      .not('courses', 'is', null);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return new Response(JSON.stringify({ error: 'Failed to fetch profiles' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let processedCount = 0;
    let eligibleCount = 0;
    const results = [];

    for (const profile of profiles || []) {
      const { user_id, courses } = profile;
      
      if (!courses || courses.length === 0) {
        console.log(`User ${user_id} has no courses, skipping`);
        continue;
      }

      for (const course_id of courses) {
        console.log(`Checking conditions for user ${user_id}, course ${course_id}`);
        
        // Check if conditions are met
        const isEligible = await checkEligibilityConditions(supabase, user_id, course_id);
        
        if (isEligible) {
          eligibleCount++;
          console.log(`Processing user ${user_id}, course ${course_id}`);
          
          try {
            // Call student-progress-calculate
            const { data: progressData, error: progressError } = await supabase.functions.invoke(
              'student-progress-calculate',
              {
                body: { user_id, course_id },
                headers: {
                  'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
                }
              }
            );

            if (progressError) {
              console.error(`Error calling student-progress-calculate for user ${user_id}, course ${course_id}:`, progressError);
              results.push({ user_id, course_id, status: 'error', error: progressError.message });
              continue;
            }

            // Process and store the snapshot
            await storeProgressSnapshot(supabase, user_id, course_id, progressData);
            
            processedCount++;
            results.push({ user_id, course_id, status: 'success' });
            console.log(`Successfully processed user ${user_id}, course ${course_id}`);
            
            // Wait 1 second before next iteration
            await new Promise(resolve => setTimeout(resolve, 1000));
            
          } catch (error) {
            console.error(`Error processing user ${user_id}, course ${course_id}:`, error);
            results.push({ user_id, course_id, status: 'error', error: error.message });
          }
        } else {
          console.log(`User ${user_id}, course ${course_id} not eligible, skipping`);
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
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in progress-schedule-trigger:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function checkEligibilityConditions(supabase: any, user_id: string, course_id: string): Promise<boolean> {
  try {
    // Get most recent updated_at from student_mastery for this user/course
    const { data: masteryData, error: masteryError } = await supabase
      .from('student_mastery')
      .select('updated_at')
      .eq('user_id', user_id)
      .eq('course_id', course_id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (masteryError && masteryError.code !== 'PGRST116') {
      console.error('Error checking student_mastery:', masteryError);
      return false;
    }

    // Get most recent run_timestamp from mastery_snapshots for this user/course
    const { data: snapshotData, error: snapshotError } = await supabase
      .from('mastery_snapshots')
      .select('run_timestamp')
      .eq('user_id', user_id)
      .eq('course_id', course_id)
      .order('run_timestamp', { ascending: false })
      .limit(1)
      .single();

    if (snapshotError && snapshotError.code !== 'PGRST116') {
      console.error('Error checking mastery_snapshots:', snapshotError);
      return false;
    }

    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    // Condition 1: Most recent mastery update is later than most recent snapshot
    let condition1 = true;
    if (masteryData && snapshotData) {
      const masteryTime = new Date(masteryData.updated_at);
      const snapshotTime = new Date(snapshotData.run_timestamp);
      condition1 = masteryTime > snapshotTime;
    } else if (!masteryData || masteryError?.code === 'PGRST116') {
      // No mastery data means no activity, so skip
      return false;
    }
    // If no snapshot exists, condition1 is true (as specified)

    // Condition 2: NOW() is more than 30 minutes after most recent snapshot
    let condition2 = true;
    if (snapshotData) {
      const snapshotTime = new Date(snapshotData.run_timestamp);
      condition2 = now > new Date(snapshotTime.getTime() + 30 * 60 * 1000);
    }
    // If no snapshot exists, condition2 is true (as specified)

    console.log(`User ${user_id}, course ${course_id}: Condition1=${condition1}, Condition2=${condition2}`);
    return condition1 && condition2;

  } catch (error) {
    console.error('Error checking eligibility conditions:', error);
    return false;
  }
}

async function storeProgressSnapshot(supabase: any, user_id: string, course_id: string, progressData: any) {
  try {
    const raw_data = progressData;
    
    // Compute summary from the progress data
    const computed_summary = computeSummary(progressData);

    const { error } = await supabase
      .from('mastery_snapshots')
      .insert({
        user_id,
        course_id,
        raw_data,
        computed_summary,
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

function computeSummary(progressData: any): any[] {
  try {
    const summary = [];
    const probabilities = [];

    // Extract topic probabilities from progress data
    if (Array.isArray(progressData)) {
      for (const item of progressData) {
        if (item.topic && typeof item.prob === 'number') {
          summary.push({
            topic: item.topic,
            prob: item.prob
          });
          probabilities.push(item.prob);
        }
      }
    }

    // Calculate general progress as arithmetic mean
    const general_progress = probabilities.length > 0 
      ? probabilities.reduce((sum, prob) => sum + prob, 0) / probabilities.length 
      : 0;

    // Insert general progress at the beginning
    summary.unshift({ general_progress });

    return summary;
  } catch (error) {
    console.error('Error computing summary:', error);
    return [{ general_progress: 0 }];
  }
}