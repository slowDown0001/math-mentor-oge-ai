import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuestionDetails {
  question_id: string;
  problem_text?: string;
  solution_text?: string;
  solutiontextexpanded?: string;
  answer?: string;
  problem_image?: string;
  difficulty?: number;
  skills?: string;
  problem_number_type?: string | number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { questionIds } = await req.json();

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid question IDs array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching details for question IDs:', questionIds);

    const questionDetails: QuestionDetails[] = [];

    // Separate question IDs by their source based on prefixes
    const ogeQuestions = questionIds.filter((id: string) => id.includes('FIPI') || id.includes('OGE'));
    const egeBasicQuestions = questionIds.filter((id: string) => id.includes('EGEMATHBASE'));
    const egeProfQuestions = questionIds.filter((id: string) => id.includes('EGEMATHPROF'));
    const skillQuestions = questionIds.filter((id: string) => id.includes('SKILLS'));

    // Fetch from oge_math_fipi_bank
    if (ogeQuestions.length > 0) {
      const { data: ogeData, error: ogeError } = await supabase
        .from('oge_math_fipi_bank')
        .select('question_id, problem_text, solution_text, solutiontextexpanded, answer, problem_image, difficulty, skills, problem_number_type')
        .in('question_id', ogeQuestions);

      if (ogeError) {
        console.error('Error fetching OGE questions:', ogeError);
      } else {
        questionDetails.push(...(ogeData || []));
      }
    }

    // Fetch from egemathbase
    if (egeBasicQuestions.length > 0) {
      const { data: egeBasicData, error: egeBasicError } = await supabase
        .from('egemathbase')
        .select('question_id, problem_text, solution_text, solutiontextexpanded, answer, problem_image, difficulty, skills, problem_number_type')
        .in('question_id', egeBasicQuestions);

      if (egeBasicError) {
        console.error('Error fetching EGE Basic questions:', egeBasicError);
      } else {
        questionDetails.push(...(egeBasicData || []));
      }
    }

    // Fetch from egemathprof
    if (egeProfQuestions.length > 0) {
      const { data: egeProfData, error: egeProfError } = await supabase
        .from('egemathprof')
        .select('question_id, problem_text, solution_text, solutiontextexpanded, answer, problem_image, difficulty, skills, problem_number_type')
        .in('question_id', egeProfQuestions);

      if (egeProfError) {
        console.error('Error fetching EGE Prof questions:', egeProfError);
      } else {
        questionDetails.push(...(egeProfData || []));
      }
    }

    // Fetch from oge_math_skills_questions
    if (skillQuestions.length > 0) {
      const { data: skillData, error: skillError } = await supabase
        .from('oge_math_skills_questions')
        .select('question_id, problem_text, solution_text, solutiontextexpanded, answer, problem_image, difficulty, skills, problem_number_type')
        .in('question_id', skillQuestions);

      if (skillError) {
        console.error('Error fetching skill questions:', skillError);
      } else {
        questionDetails.push(...(skillData || []));
      }
    }

    console.log(`Found ${questionDetails.length} question details out of ${questionIds.length} requested`);

    return new Response(
      JSON.stringify({ questions: questionDetails }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-homework-questions-details function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});