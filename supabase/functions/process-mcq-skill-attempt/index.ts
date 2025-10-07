import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
Deno.serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    // Create Supabase client
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const { user_id, question_id, skill_id, finished_or_not, is_correct, difficulty, duration, course_id } = await req.json();
    // Validate required parameters
    if (!user_id || !question_id || skill_id === undefined || finished_or_not === undefined || is_correct === undefined || !difficulty || !course_id) {
      return new Response(JSON.stringify({
        error: 'Missing required parameters'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    console.log(`Processing MCQ skill attempt for user ${user_id}, question ${question_id}, skill ${skill_id}`);
    // Step 1: Insert/update student_activity record
    const { error: activityError } = await supabaseClient.from('student_activity').insert({
      user_id,
      question_id,
      answer_time_start: new Date(Date.now() - duration * 1000).toISOString(),
      finished_or_not,
      is_correct,
      duration_answer: duration,
      problem_number_type: 0,
      skills: [
        skill_id
      ],
      topics: null
    });
    if (activityError) {
      console.error('Error inserting student_activity:', activityError);
      return new Response(JSON.stringify({
        error: 'Failed to record activity',
        details: activityError.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Step 2: Check if this question was previously solved correctly
    let shouldApplyReducedIncrease = false;
    if (finished_or_not && is_correct) {
      const { data: previousCorrect, error: checkError } = await supabaseClient.from('student_activity').select('attempt_id').eq('user_id', user_id).eq('question_id', question_id).eq('is_correct', true).limit(1);
      if (checkError) {
        console.error('Error checking previous attempts:', checkError);
      } else if (previousCorrect && previousCorrect.length > 0) {
        shouldApplyReducedIncrease = true;
        console.log(`Question ${question_id} was previously solved correctly, applying reduced alpha increase`);
      }
    }
    // Step 3: Update skill mastery (alpha/beta)
    if (shouldApplyReducedIncrease) {
      const { data: currentMastery, error: getMasteryError } = await supabaseClient.functions.invoke('get-alpha-beta', {
        body: {
          user_id,
          entity_type: 'skill',
          entity_id: skill_id,
          course_id
        }
      });
      if (getMasteryError) {
        console.error(`Error getting current mastery for skill ${skill_id}:`, getMasteryError);
        return new Response(JSON.stringify({
          error: 'Failed to get current mastery',
          details: getMasteryError.message
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      const currentAlpha = currentMastery.data?.alpha || 0;
      const currentBeta = currentMastery.data?.beta || 0;
      const newAlpha = currentAlpha + 0.5;
      console.log(`Applying reduced increase: alpha ${currentAlpha} -> ${newAlpha}, beta unchanged at ${currentBeta}`);
      const { error: setMasteryError } = await supabaseClient.functions.invoke('set-alpha-beta', {
        body: {
          user_id,
          entity_type: 'skill',
          entity_id: skill_id,
          alpha: newAlpha,
          beta: currentBeta,
          course_id
        }
      });
      if (setMasteryError) {
        console.error(`Error setting mastery for skill ${skill_id}:`, setMasteryError);
        return new Response(JSON.stringify({
          error: 'Failed to set mastery',
          details: setMasteryError.message
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    } else {
      // Normal update through update-skill-for-attempt
      const scaling_type = 'exponential'; // Default scaling type for OGE skills
      const { error: updateSkillError } = await supabaseClient.functions.invoke('update-skill-for-attempt', {
        body: {
          user_id,
          skills: [
            skill_id
          ],
          finished_or_not,
          is_correct,
          difficulty,
          scaling_type,
          course_id
        }
      });
      if (updateSkillError) {
        console.error(`Error updating skill ${skill_id}:`, updateSkillError);
        return new Response(JSON.stringify({
          error: 'Failed to update skill mastery',
          details: updateSkillError.message
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    }
    // Step 4: Apply CUSUM for skill
    const x_n = finished_or_not && is_correct ? 1 : 0;
    const { error: cusumError } = await supabaseClient.functions.invoke('apply-cusum', {
      body: {
        user_id,
        entity_type: 'skill',
        entity_id: skill_id,
        x_n,
        course_id
      }
    });
    if (cusumError) {
      console.error(`Error applying CUSUM for skill ${skill_id}:`, cusumError);
    }
    // Step 5: Apply SPRT for skill mastery status
    const { data: sprtData, error: sprtError } = await supabaseClient.functions.invoke('check-mastery-status', {
      body: {
        user_id,
        entity_type: 'skill',
        entity_id: skill_id,
        A: 0.05,
        B: 20,
        course_id
      }
    });
    if (sprtError) {
      console.error(`Error checking mastery status for skill ${skill_id}:`, sprtError);
    } else if (sprtData?.success && sprtData?.data?.status) {
      const { error: updateStatusError } = await supabaseClient.functions.invoke('update-mastery-status', {
        body: {
          user_id,
          entity_type: 'skill',
          entity_id: skill_id,
          status: sprtData.data.status,
          course_id
        }
      });
      if (updateStatusError) {
        console.error(`Error updating mastery status for skill ${skill_id}:`, updateStatusError);
      }
    }
    // ✅ Step 6: Invoke update-skill-for-attempt with scaling_type = 'linear'
    const { error: linearUpdateError } = await supabaseClient.functions.invoke('update-skill-for-attempt', {
      body: {
        user_id,
        skills: [
          skill_id
        ],
        finished_or_not,
        is_correct,
        difficulty,
        scaling_type: 'linear',
        course_id
      }
    });
    if (linearUpdateError) {
      console.error(`Error in final linear skill update for skill ${skill_id}:`, linearUpdateError);
    } else {
      console.log(`Successfully applied additional linear update for skill ${skill_id}`);
    }
    console.log(`✅ Successfully processed MCQ skill attempt for user ${user_id}, skill ${skill_id}`);
    return new Response(JSON.stringify({
      success: true,
      data: {
        user_id,
        skill_id,
        is_correct,
        course_id
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
