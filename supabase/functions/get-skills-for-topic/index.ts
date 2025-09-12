import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to fetch topic-skill mapping from external file
async function getTopicSkillMapping(courseType: string = 'ogemath'): Promise<Record<string, number[]>> {
  try {
    let fileName = 'ogemath_topic_skills_json.txt'; // default
    if (courseType === 'egebasic') {
      fileName = 'egemathbase_topic_skills_json.txt';
    } else if (courseType === 'egeprof') {
      fileName = 'egemathprof_topic_skills_json.txt';
    }
    const response = await fetch(`https://kbaazksvkvnafrwtmkcw.supabase.co/storage/v1/object/public/txtbkimg/${fileName}`);
    if (!response.ok) {
      console.warn('Failed to fetch topic-skill mapping, using fallback');
      return {};
    }
    const mapping = await response.json();
    return mapping;
  } catch (error) {
    console.error('Error fetching topic-skill mapping:', error);
    return {};
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const { topic_code, course_type } = await req.json();

    if (!topic_code) {
      throw new Error('topic_code parameter is required');
    }

    console.log(`Looking up skills for topic_code: ${topic_code}, course_type: ${course_type}`);

    // Fetch topic-skill mapping from external file
    const topicSkillMapping = await getTopicSkillMapping(course_type);
    
    // Get skill IDs for the topic code, return empty array if not found
    const skillIds = topicSkillMapping[topic_code] || [];

    console.log(`Found ${skillIds.length} skills for topic ${topic_code}: [${skillIds.join(', ')}]`);

    return new Response(
      JSON.stringify({ 
        topic_code,
        skill_ids: skillIds,
        count: skillIds.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in get-skills-for-topic function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});