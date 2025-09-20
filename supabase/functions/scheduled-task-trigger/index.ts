import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log('Starting scheduled task trigger execution');

    // Get all user IDs from profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw new Error('Failed to fetch user profiles');
    }

    console.log(`Found ${profiles.length} users to check`);

    let eligibleUsers = 0;
    let processedUsers = 0;

    // Process each user sequentially
    for (const profile of profiles) {
      const userId = profile.user_id;
      console.log(`Checking conditions for user: ${userId}`);

      try {
        // Check condition 1: Most recent story has seen = 1
        const { data: recentStory, error: storyError } = await supabase
          .from('stories_and_telegram')
          .select('seen, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (storyError) {
          console.error(`Error checking stories for user ${userId}:`, storyError);
          continue;
        }

        if (!recentStory || recentStory.seen !== 1) {
          console.log(`User ${userId}: Most recent story not seen or no stories found`);
          continue;
        }

        // Check condition 2: Most recent activity is more than 6 hours ago
        const { data: recentActivity, error: activityError } = await supabase
          .from('student_activity')
          .select('updated_at')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (activityError) {
          console.error(`Error checking activity for user ${userId}:`, activityError);
          continue;
        }

        if (!recentActivity) {
          console.log(`User ${userId}: No activity found`);
          continue;
        }

        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
        const lastActivity = new Date(recentActivity.updated_at);

        if (lastActivity > sixHoursAgo) {
          console.log(`User ${userId}: Recent activity within 6 hours`);
          continue;
        }

        // Check condition 3: Most recent story created on different calendar day
        const today = new Date();
        const todayDateString = today.toDateString();
        const storyDate = new Date(recentStory.created_at);
        const storyDateString = storyDate.toDateString();

        if (storyDateString === todayDateString) {
          console.log(`User ${userId}: Story created today`);
          continue;
        }

        // All conditions met - call create-task
        console.log(`User ${userId}: All conditions met, calling create-task`);
        eligibleUsers++;

        const { data: taskResult, error: taskError } = await supabase.functions.invoke(
          'create-task',
          {
            body: {
              user_id: userId,
              course_id: 1, // Default course_id
              date_string: '29 may 2026', // Default date
              number_of_words: 500 // Default word count
            }
          }
        );

        if (taskError) {
          console.error(`Error calling create-task for user ${userId}:`, taskError);
        } else {
          console.log(`Successfully created task for user ${userId}:`, taskResult);
          processedUsers++;
        }

        // Wait 1 second before processing next user
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (userError) {
        console.error(`Error processing user ${userId}:`, userError);
        continue;
      }
    }

    console.log(`Scheduled task execution completed. Eligible users: ${eligibleUsers}, Successfully processed: ${processedUsers}`);

    return new Response(
      JSON.stringify({
        success: true,
        total_users: profiles.length,
        eligible_users: eligibleUsers,
        processed_users: processedUsers,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in scheduled task trigger:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});