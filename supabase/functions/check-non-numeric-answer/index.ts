import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  student_answer: string;
  correct_answer: string;
  problem_text: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { student_answer, correct_answer, problem_text }: RequestBody = await req.json();

    if (!student_answer || !correct_answer || !problem_text) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: student_answer, correct_answer, problem_text' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openrouterApiKey) {
      console.error('OPENROUTER_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const prompt = `Ты строгий, но справедливый учитель по математике. Тебе нужно определить, является ли ответ ученика на задачу правильным по сути, а не по точному совпадению строк. Учитывай условие задачи для контекста: переменные, требования к форме ответа (например, упрощение, единицы измерения) и возможные эквивалентные формы.

Ответ ученика: ${student_answer}
Правильный ответ: ${correct_answer}
Условие задачи: ${problem_text}

**ПРАВИЛА ПРОВЕРКИ**:
- Считай правильным, если ответ семантически эквивалентен: игнорируй порядок, форматирование, синонимы (например, "или" вместо ";"), мелкие опечатки, если суть ясна.
- Примеры эквивалентности:
  1. Квадратное уравнение: правильный \\( -2; 1 \\), ученик "корни 1 и -2" или "x=1, x=-2" — правильный.
  2. Дроби: правильный 1/2, ученик "0.5" или 2/4 (если не требуется упрощение) — правильный.
  4. Неправильный: правильный \\( \\pi r^2 \\), ученик "площадь круга 2\\pi r" — неправильный, так как формула неверна.
- Если ответ частично верен (например, один корень правильный), оцени как неправильный, если задача требует полноты.
- Игнорируй лишние объяснения в ответе ученика; фокусируйся на математической сути.
- Если ответ пустой или нерелевантный — 0.

**ВЫВОД**: Только число 1 (правильный) или 0 (неправильный). Никаких объяснений.`;

    console.log('Making OpenRouter API call with prompt length:', prompt.length);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite-preview-06-17',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'API call failed',
          retry_message: 'Произошла ошибка при проверке ответа. Пожалуйста, попробуйте ещё раз.'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    console.log('OpenRouter API response:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected API response format:', data);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid API response format',
          retry_message: 'Произошла ошибка при проверке ответа. Пожалуйста, попробуйте ещё раз.'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const apiResponse = data.choices[0].message.content.trim();
    console.log('API response content:', apiResponse);

    // Check if response is exactly '1' or '0'
    const isCorrect = apiResponse === '1';
    const isValidResponse = apiResponse === '1' || apiResponse === '0';

    if (!isValidResponse) {
      console.error('Invalid API response - not 1 or 0:', apiResponse);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid API response format',
          retry_message: 'Произошла ошибка при проверке ответа. Пожалуйста, попробуйте ещё раз.'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ is_correct: isCorrect }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in check-non-numeric-answer function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        retry_message: 'Произошла ошибка при проверке ответа. Пожалуйста, попробуйте ещё раз.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});