import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get OpenRouter API key
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key not found');
    }

    const { image_base64, question_id, user_id } = await req.json();

    if (!image_base64 || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: image_base64, user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get task context from oge_entrypage_rag table (id=2)
    const { data: contextData, error: contextError } = await supabase
      .from('oge_entrypage_rag')
      .select('task_context')
      .eq('id', 2)
      .single();

    if (contextError) {
      console.error('Error fetching context:', contextError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch task context' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const taskContext = contextData?.task_context || 'Проанализируй решение математической задачи на изображении и дай подробную обратную связь.';

    // Prepare the message for OpenRouter
    const messages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: taskContext
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${image_base64}`
            }
          }
        ]
      }
    ];

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://kbaazksvkvnafrwtmkcw.supabase.co',
        'X-Title': 'Math Learning Platform'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: messages,
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisResult = data.choices[0]?.message?.content;

    if (!analysisResult) {
      throw new Error('No analysis result from OpenRouter');
    }

    // Save raw output to photo_analysis_outputs table
    const { error: insertError } = await supabase
      .from('photo_analysis_outputs')
      .insert({
        user_id: user_id,
        question_id: question_id,
        raw_output: analysisResult,
        analysis_type: 'photo_solution'
      });

    if (insertError) {
      console.error('Error saving raw output:', insertError);
      // Don't fail the request if we can't save to database
    }

    return new Response(
      JSON.stringify({ analysis: analysisResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-photo-solution function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});