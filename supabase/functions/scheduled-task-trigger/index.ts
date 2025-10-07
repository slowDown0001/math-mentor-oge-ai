import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
Deno.serve(async (req)=>{
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("Starting scheduled task trigger execution with seen-reset feature");
    // Fetch all users
    const { data: profiles, error: profilesError } = await supabase.from("profiles").select("user_id");
    if (profilesError) throw new Error("Failed to fetch user profiles");
    console.log(`Found ${profiles.length} users to process`);
    let eligibleUsers = 0;
    let processedUsers = 0;
    let seenResets = 0;
    // Helper: Sleep
    const sleep = (ms)=>new Promise((r)=>setTimeout(r, ms));
    for (const profile of profiles){
      const userId = profile.user_id;
      console.log(`\n🔍 Checking user ${userId}`);
      try {
        // 1️⃣ Get most recent story
        const { data: recentStory, error: storyError } = await supabase.from("stories_and_telegram").select("upload_id, seen, created_at").eq("user_id", userId).order("created_at", {
          ascending: false
        }).limit(1).maybeSingle();
        if (storyError) {
          console.error(`Error fetching story for user ${userId}`, storyError);
          continue;
        }
        if (!recentStory) {
          console.log(`User ${userId}: No story found`);
          continue;
        }
        // 2️⃣ Get most recent student activity with is_correct NOT NULL
        const { data: lastActivity, error: activityError } = await supabase.from("student_activity").select("updated_at").eq("user_id", userId).not("is_correct", "is", null).order("updated_at", {
          ascending: false
        }).limit(1).maybeSingle();
        if (activityError) {
          console.error(`Error fetching activity for user ${userId}`, activityError);
          continue;
        }
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
        const lastActive = lastActivity ? new Date(lastActivity.updated_at) : null;
        const storyCreated = new Date(recentStory.created_at);
        const noRecentActivity = !lastActive || lastActive < sixHoursAgo;
        const noActivityAfterStory = !lastActive || lastActive <= storyCreated;
        // 🧩 NEW FEATURE: Reset 'seen' if conditions are met
        if (recentStory.seen === 1 && noRecentActivity && noActivityAfterStory) {
          const { error: resetError } = await supabase.from("stories_and_telegram").update({
            seen: 0
          }).eq("upload_id", recentStory.upload_id);
          if (resetError) {
            console.error(`❌ Failed to reset seen for user ${userId}`, resetError);
          } else {
            seenResets++;
            console.log(`✅ User ${userId}: Story seen reset to 0`);
          }
        }
        // 3️⃣ Proceed to task-creation eligibility check
        if (recentStory.seen !== 1) {
          console.log(`User ${userId}: Story not seen, skipping task`);
          continue;
        }
        // Get most recent activity (any type)
        const { data: recentActivity } = await supabase.from("student_activity").select("updated_at").eq("user_id", userId).order("updated_at", {
          ascending: false
        }).limit(1).maybeSingle();
        if (!recentActivity) {
          console.log(`User ${userId}: No activity found`);
          continue;
        }
        const lastActivityTime = new Date(recentActivity.updated_at);
        if (lastActivityTime > sixHoursAgo) {
          console.log(`User ${userId}: Activity within 6 hours`);
          continue;
        }
        // Skip if story was created today
        const today = new Date();
        if (storyCreated.toDateString() === today.toDateString()) {
          console.log(`User ${userId}: Story created today`);
          continue;
        }
        // ✅ All conditions met → invoke create-task
        console.log(`🚀 User ${userId}: All task conditions met`);
        eligibleUsers++;
        const { data: taskResult, error: taskError } = await supabase.functions.invoke("create-task", {
          body: {
            user_id: userId,
            course_id: 1,
            date_string: "29 may 2026",
            number_of_words: 500
          }
        });
        if (taskError) {
          console.error(`Error calling create-task for user ${userId}:`, taskError);
        } else {
          processedUsers++;
          console.log(`✅ Created task for user ${userId}`);
        }
        await sleep(1000); // rate limit
      } catch (err) {
        console.error(`Error processing user ${userId}:`, err);
      }
    }
    console.log("\n✅ Scheduled task completed.");
    console.log(`Eligible: ${eligibleUsers}, Processed: ${processedUsers}, Seen resets: ${seenResets}`);
    return new Response(JSON.stringify({
      success: true,
      total_users: profiles.length,
      eligible_users: eligibleUsers,
      processed_users: processedUsers,
      seen_resets: seenResets,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    console.error("Fatal error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
});
