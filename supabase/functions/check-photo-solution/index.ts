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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    const { student_solution, problem_text, solution_text, user_id, question_id } = await req.json();

    if (!student_solution || !problem_text || !solution_text) {
      return new Response(JSON.stringify({ 
        error: 'Missing required parameters' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `Ты строгий, но справедливый учитель математики. Оцени решение ученика (из OCR-текста, с возможными опечатками) по условию задачи. Входные данные:

Решение ученика: ${student_solution}

Правильное решение: ${solution_text}

Условие задачи: ${problem_text}

**Критерии баллов (макс. 2)**:
- 2: Обоснованно получен верный ответ.
- 1: Решение доведено до конца, но арифметическая ошибка; дальнейшие шаги верны с учётом ошибки.
- 0: Не соответствует вышеуказанному.

**Вывод**: JSON-объект с ключами:
- "scores": n (где n = 0,1,2),
- "review": Краткий список ошибок/плюсов в LaTeX (для MathJax), с обоснованием балла.

Пример: {"scores": 1, "review": "\\( \\text{Плюс: Логично выведено. Ошибка: } a + b = 5 \\text{ вместо } a + b = 3 \\)"}`;

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

    // Second API call to polish LaTeX
    const polishPrompt = `You are given a JSON output: ${feedback}, where scores_fipi is in {0,1,2} and review is LaTeX code.

Your task: Return the SAME JSON, but ensure review is perfectly compilable LaTeX by applying these strict rules:

1. All math must be wrapped in $...$, \\(...\\), \\[...\\], or $$...$$ — pick the most appropriate.
2. NEVER use environments: itemize, tabular, enumerate.
3. ALL textual content — including Russian — must be wrapped in \\text{...}.
4. If any \\text{...} contains >10 words, split it into multiple \\text{...} calls with shorter phrases.
5. **IMPORTANT**: Preserve original meaning and structure. Only fix LaTeX syntax.

**IMPORTANT**: Return ONLY the corrected JSON. No explanations.`;

    const polishResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen/qwen3-coder-flash',
        messages: [
          { role: 'user', content: polishPrompt }
        ],
        temperature: 0,
      }),
    });

    if (!polishResponse.ok) {
      const errorData = await polishResponse.json();
      console.error('OpenRouter Polish API error:', errorData);
      // If polish fails, use original feedback
      var finalFeedback = feedback;
    } else {
      const polishData = await polishResponse.json();
      var finalFeedback = polishData.choices?.[0]?.message?.content || feedback;
    }

    // Save raw output to photo_analysis_outputs table if user_id is provided
    if (user_id) {
      const { error: insertError } = await supabase
        .from('photo_analysis_outputs')
        .insert({
          user_id: user_id,
          question_id: question_id || null,
          raw_output: finalFeedback,
          analysis_type: 'photo_solution'
        });

      if (insertError) {
        console.error('Error saving raw output:', insertError);
        // Don't fail the request if we can't save to database
      }
    }

    return new Response(JSON.stringify({ 
      feedback: finalFeedback 
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