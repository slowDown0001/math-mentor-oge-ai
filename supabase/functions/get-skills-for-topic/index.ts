import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to fetch topic-skill mapping from external file
async function getTopicSkillMapping(courseId: string = '1', origin?: string): Promise<Record<string, number[]>> {
  try {
    let fileName = 'ogemath_topic_skills_json.txt'; // default for course_id '1'
    if (courseId === '2') {
      fileName = 'egemathbase_topic_skills_json.txt';
    } else if (courseId === '3') {
      fileName = 'egemathprof_topic_skills_json.txt';
    }

    // 1) Try Supabase Storage (preferred and stable for production)
    const storageUrl = `https://kbaazksvkvnafrwtmkcw.supabase.co/storage/v1/object/public/txtbkimg/${fileName}`;
    const response = await fetch(storageUrl);
    if (response.ok) {
      const mapping = await response.json();
      return mapping;
    }

    // 2) Fallback to app's public assets using request origin (useful in preview)
    if (origin) {
      const appAssetUrl = `${origin.replace(/\/$/, '')}/${fileName}`;
      const fallbackResp = await fetch(appAssetUrl);
      if (fallbackResp.ok) {
        const mapping = await fallbackResp.json();
        return mapping;
      }
      console.warn(`Failed to fetch mapping from app assets at ${appAssetUrl}`);
    }

    console.warn('Failed to fetch topic-skill mapping from storage and app assets, returning empty mapping');
    return {};
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

    const { topic_code, course_id, origin: originOverride } = await req.json();

    if (!topic_code) {
      throw new Error('topic_code parameter is required');
    }

    if (!course_id) {
      throw new Error('course_id parameter is required');
    }

    // Derive origin for fallback fetching of public assets
    let originHeader = req.headers.get('origin') || req.headers.get('referer') || '';
    if (originOverride && typeof originOverride === 'string') {
      originHeader = originOverride;
    }

    console.log(`Looking up skills for topic_code: ${topic_code}, course_id: ${course_id}, origin: ${originHeader}`);

    // Fetch topic-skill mapping from external file
    const topicSkillMapping = await getTopicSkillMapping(course_id, originHeader);
    
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