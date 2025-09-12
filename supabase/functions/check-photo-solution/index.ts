import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    const { student_solution, problem_text, solution_text } = await req.json();

    if (!student_solution || !problem_text || !solution_text) {
      return new Response(JSON.stringify({ 
        error: 'Missing required parameters' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `Ты учитель по математике. Тебе нужно определить, является ли предоставленное учеником решение задачи правильным. Решение ученика начало: ${student_solution}. Решение ученика конец. Правильное решение начало: ${solution_text}. Правильное решение конец. Условие задачи начало: ${problem_text}. Условие задачи конец. Дай ответ в виде замечаний к решению, сделанных красным цветом используя $\\textcolor{red}{...}$. Весь текст должен быть в LaTeX, который я смогу скомпилировать в MathJax.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-mini',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API error:', errorData);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const feedback = data.choices?.[0]?.message?.content;

    if (!feedback) {
      throw new Error('No feedback received from OpenRouter API');
    }

    return new Response(JSON.stringify({ 
      feedback: feedback 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in check-photo-solution function:', error);
    return new Response(JSON.stringify({ 
      error: 'Ошибка API. Попробуйте ввести решение снова.',
      retry_message: 'Произошла ошибка при обработке. Пожалуйста, попробуйте снова.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});