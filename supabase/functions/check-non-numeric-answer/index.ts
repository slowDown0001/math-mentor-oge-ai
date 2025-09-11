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

    const prompt = `Ты учитель по математике. Тебе нужно определить, является ли ответ ученика на задачу правильным. Ответ ученика начало: ${student_answer}. Ответ ученика конец. Правильный ответ начало: ${correct_answer}. Правильный ответ конец. Условие задачи начало: ${problem_text}. Условие задачи конец. Дай ответ в виде числа 1 если ответ ученика правильный, и в виде числа 0 если ответ ученика неправильный.`;

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