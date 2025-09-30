import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface RequestBody {
  user_id: string;
  course_id: string;
  topics: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id, course_id, topics }: RequestBody = await req.json();

    // Validate required parameters
    if (!user_id || !course_id || !topics || !Array.isArray(topics) || topics.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Missing or invalid required parameters: user_id, course_id, topics (array)',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Processing module completion for user ${user_id}, course ${course_id}, topics:`, topics);

    // Step 1: Fetch topic-skill mapping from json_files
    const { data: jsonData, error: jsonError } = await supabaseClient
      .from('json_files')
      .select('content')
      .eq('id', 1)
      .eq('course_id', course_id)
      .single();

    if (jsonError || !jsonData) {
      console.error('Error fetching json_files:', jsonError);
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch topic-skill mapping',
          details: jsonError?.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 2: Extract all skills for the given topics
    const topicSkillMapping = jsonData.content as Record<string, number[]>;
    const allSkills = new Set<number>();

    topics.forEach((topic) => {
      const skills = topicSkillMapping[topic];
      if (skills && Array.isArray(skills)) {
        skills.forEach((skill) => allSkills.add(skill));
      }
    });

    if (allSkills.size === 0) {
      console.log('No skills found for the given topics');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No skills found for the given topics',
          updated_count: 0,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Found ${allSkills.size} unique skills:`, Array.from(allSkills));

    // Step 3: Query student_mastery for all these skills
    const { data: masteryData, error: masteryError } = await supabaseClient
      .from('student_mastery')
      .select('entity_id, alpha, beta')
      .eq('user_id', user_id)
      .eq('course_id', course_id)
      .eq('entity_type', 'skill')
      .in('entity_id', Array.from(allSkills));

    if (masteryError) {
      console.error('Error fetching student_mastery:', masteryError);
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch student mastery data',
          details: masteryError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 4: Identify skills that need updating (alpha/(alpha+beta) <= 0.2)
    const skillsToUpdate: number[] = [];
    
    if (masteryData) {
      masteryData.forEach((record) => {
        const { entity_id, alpha, beta } = record;
        const totalMastery = alpha + beta;
        const masteryRatio = totalMastery > 0 ? alpha / totalMastery : 0;
        
        if (masteryRatio <= 0.2) {
          skillsToUpdate.push(entity_id);
        }
      });
    }

    console.log(`Found ${skillsToUpdate.length} skills with low mastery (<= 20%):`, skillsToUpdate);

    // Step 5: Update alpha and beta for low-mastery skills
    let updatedCount = 0;
    
    if (skillsToUpdate.length > 0) {
      // Use edge function to update each skill
      for (const skillId of skillsToUpdate) {
        const { error: updateError } = await supabaseClient
          .from('student_mastery')
          .update({ 
            alpha: 11, 
            beta: 40,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user_id)
          .eq('course_id', course_id)
          .eq('entity_type', 'skill')
          .eq('entity_id', skillId);

        if (updateError) {
          console.error(`Error updating skill ${skillId}:`, updateError);
        } else {
          updatedCount++;
          console.log(`Updated skill ${skillId} to alpha=11, beta=40`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Module completion mastery update completed`,
        total_skills: allSkills.size,
        low_mastery_skills: skillsToUpdate.length,
        updated_count: updatedCount,
        updated_skills: skillsToUpdate,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
