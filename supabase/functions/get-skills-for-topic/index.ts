import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Topic code to skill IDs mapping
const topicSkillMapping: Record<string, number[]> = {
  "1.1": [1, 2, 3, 4, 5, 189],
  "1.2": [6, 7, 8, 9, 10],
  "1.3": [11, 12, 13, 14, 15, 16, 17, 180, 194],
  "1.4": [18, 19, 20],
  "1.5": [21, 22, 23],
  "2.1": [35, 36, 37, 38],
  "2.2": [39, 40, 41, 42, 43, 44],
  "2.3": [45, 46, 47, 48, 49, 179],
  "2.4": [50, 51, 52, 53],
  "2.5": [54, 55, 56, 57],
  "3.1": [58, 59, 60, 61, 62, 188, 190, 191],
  "3.2": [63, 64, 65, 66, 67, 68],
  "3.3": [69, 70, 71, 72, 73, 74, 75, 184, 185, 193],
  "4.1": [76, 77, 78, 79],
  "4.2": [80, 81, 82, 83, 84, 85, 86, 87, 88],
  "5.1": [89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 186, 187],
  "6.1": [103, 104, 105, 106, 107, 108, 109],
  "6.2": [110, 111],
  "7.1": [112, 113, 114, 115, 116],
  "7.2": [117, 118, 119, 120, 121, 122, 123, 124],
  "7.3": [125, 126, 127, 128, 129, 130, 131, 132, 133, 134],
  "7.4": [135, 136, 137, 138],
  "7.5": [139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153],
  "7.6": [154, 155, 156, 157],
  "7.7": [158, 159, 160, 161],
  "8.1": [162, 163, 164, 165],
  "8.2": [166, 167, 168],
  "8.3": [169, 170, 171, 172],
  "8.4": [173, 174],
  "8.5": [175, 176, 177, 178],
  "9.1": [24, 25, 26, 27, 28, 29, 30, 31, 181, 182, 183, 192],
  "9.2": [32, 33, 34]
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const { topic_code } = await req.json();

    if (!topic_code) {
      throw new Error('topic_code parameter is required');
    }

    console.log(`Looking up skills for topic_code: ${topic_code}`);

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