import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  user_id: string;
  course_id?: string;
}

interface TopicMapping {
  code: string;
  name: string;
}

interface ProgressItem {
  topic?: string;
  "задача ФИПИ"?: string;
  "навык"?: string;
  prob: number;
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
    const { user_id, course_id = '1' }: RequestBody = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Calculating progress for user: ${user_id}, course: ${course_id}`);

    // Define topic mappings based on course_id
    let topicMappings: TopicMapping[] = [];
    let topicsUrl: string;

    if (course_id === '1') {
      topicsUrl = 'https://kbaazksvkvnafrwtmkcw.supabase.co/storage/v1/object/public/jsons_for_topic_skills/ogemath_topics_only_with_names.json';
    } else if (course_id === '2') {
      topicsUrl = 'https://kbaazksvkvnafrwtmkcw.supabase.co/storage/v1/object/public/jsons_for_topic_skills/egemathbasic_topics_only_with_names.json';
    } else if (course_id === '3') {
      topicsUrl = 'https://kbaazksvkvnafrwtmkcw.supabase.co/storage/v1/object/public/jsons_for_topic_skills/egemathprof_topics_only_with_names.json';
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid course_id. Must be "1", "2", or "3"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch topic mappings from the appropriate URL
    try {
      const topicsResponse = await fetch(topicsUrl);
      if (!topicsResponse.ok) {
        throw new Error(`Failed to fetch topics: ${topicsResponse.statusText}`);
      }
      topicMappings = await topicsResponse.json();
      console.log(`Loaded ${topicMappings.length} topics for course ${course_id}`);
    } catch (error) {
      console.error('Error fetching topic mappings:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to load topic mappings' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result: ProgressItem[] = [];

    // Calculate topic mastery for each topic
    console.log('Calculating topic mastery...');
    for (const topicMapping of topicMappings) {
      try {
        const { data: topicData, error: topicError } = await supabase.functions.invoke(
          'compute-topic-mastery-with-decay',
          {
            body: {
              user_id,
              topic_code: parseFloat(topicMapping.code),
              course_id
            }
          }
        );

        if (topicError) {
          console.error(`Error computing topic mastery for ${topicMapping.code}:`, topicError);
          result.push({
            topic: topicMapping.name,
            prob: 0.02 // Default low value
          });
        } else {
          const probability = topicData?.topic_mastery_probability || 0.02;
          result.push({
            topic: topicMapping.name,
            prob: Math.round(probability * 100) / 100 // Round to 2 decimal places
          });
        }
      } catch (error) {
        console.error(`Error processing topic ${topicMapping.code}:`, error);
        result.push({
          topic: topicMapping.name,
          prob: 0.02
        });
      }
    }

    // Calculate problem type progress
    console.log('Calculating problem type progress...');
    
    // Define problem types based on course_id
    let problemTypes: number[];
    if (course_id === '1') {
      problemTypes = [1, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
    } else if (course_id === '2') {
      problemTypes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
    } else if (course_id === '3') {
      problemTypes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    } else {
      problemTypes = []; // This shouldn't happen due to earlier validation
    }
    
    try {
      const { data: problemData, error: problemError } = await supabase.functions.invoke(
        'compute-problem-number-type-progress-bars',
        {
          body: {
            user_id,
            problem_number_types: problemTypes,
            course_id
          }
        }
      );

      if (problemError) {
        console.error('Error computing problem type progress:', problemError);
        // Add default values for all problem types
        problemTypes.forEach(problemType => {
          result.push({
            "задача ФИПИ": problemType.toString(),
            prob: 0.02
          });
        });
      } else {
        const progressBars = problemData?.progress_bars || [];
        problemTypes.forEach((problemType, index) => {
          const probability = progressBars[index] || 0.02;
          result.push({
            "задача ФИПИ": problemType.toString(),
            prob: Math.round(probability * 100) / 100 // Round to 2 decimal places
          });
        });
      }
    } catch (error) {
      console.error('Error processing problem types:', error);
      // Add default values for all problem types
      problemTypes.forEach(problemType => {
        result.push({
          "задача ФИПИ": problemType.toString(),
          prob: 0.02
        });
      });
    }

    // Calculate skill mastery for all skills (1-200)
    console.log('Calculating skill mastery...');
    const allSkills = Array.from({ length: 200 }, (_, i) => i + 1); // Skills 1 through 200
    
    try {
      const { data: skillData, error: skillError } = await supabase.functions.invoke(
        'compute-skills-progress-bars',
        {
          body: {
            user_id,
            skill_ids: allSkills
          }
        }
      );

      if (skillError) {
        console.error('Error computing skill progress:', skillError);
        // Add default values for all skills
        allSkills.forEach(skillId => {
          result.push({
            "навык": skillId.toString(),
            prob: 0.02
          });
        });
      } else {
        const progressBars = skillData?.data?.progress_bars || [];
        progressBars.forEach((skillProgress: Record<string, number>) => {
          // skillProgress is in format { "skillId": probability }
          Object.entries(skillProgress).forEach(([skillId, probability]) => {
            result.push({
              "навык": skillId,
              prob: Math.round(probability * 100) / 100 // Round to 2 decimal places
            });
          });
        });
      }
    } catch (error) {
      console.error('Error processing skills:', error);
      // Add default values for all skills
      allSkills.forEach(skillId => {
        result.push({
          "навык": skillId.toString(),
          prob: 0.02
        });
      });
    }

    console.log(`Successfully calculated progress for user ${user_id}, returning ${result.length} items`);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in student-progress-calculate function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});