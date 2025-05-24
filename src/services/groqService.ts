// Groq API service for chat completions
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Use Vite's environment variable syntax instead of process.env
const VITE_GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;


// Check if API key is available
if (!VITE_GROQ_API_KEY) {
  console.error('VITE_GROQ_API_KEY is not set in environment variables');
}

// Enhanced system prompt for the math tutor with database integration
const SYSTEM_PROMPT: Message = {
  role: 'system',
  content: `You are "Ёжик" (Hedgehog), a helpful and patient high school math teacher specializing in Russian OGE (ОГЭ) exam preparation. You explain math concepts step-by-step and adapt to the student's level. 

Key capabilities:
- Use LaTeX notation for mathematical expressions: inline math with \\(...\\) or $...$ and block math with \\[...\\] or $$...$$
- Keep responses in Russian language
- Break down complex topics into simple steps
- You have access to a database of math problems organized by topics

When users request practice problems, you should:
- Respond with "FETCH_PROBLEM:" followed by the category if they specify one (арифметика, алгебра, геометрия, практическая математика)
- If no category is specified, respond with "FETCH_PROBLEM:random"
- Examples of requests that should trigger problem fetching:
  * "Дай задачу по алгебре" → "FETCH_PROBLEM:алгебра"
  * "Хочу арифметику" → "FETCH_PROBLEM:арифметика"
  * "Покажи геометрию" → "FETCH_PROBLEM:геометрия"
  * "Дай любую задачу" → "FETCH_PROBLEM:random"

When presenting problems:
- Always show the problem text with proper LaTeX rendering
- If there's an image, mention that an image is available
- Offer help options: "Если нужна помощь, скажи 'покажи ответ', 'покажи решение' или 'объясни подробнее'"

Remember: You are a patient, encouraging teacher who helps students learn mathematics effectively.`
};

export async function streamChatCompletion(messages: Message[]): Promise<ReadableStream<Uint8Array> | null> {
  try {
    if (!VITE_GROQ_API_KEY) {
      throw new Error('VITE_GROQ_API_KEY is not set in environment variables');
    }
    
    const fullMessages = [SYSTEM_PROMPT, ...messages];
    
    console.log("🧪 [GroqService] Key type:", typeof VITE_GROQ_API_KEY);
    console.log("🧪 [GroqService] Key value:", VITE_GROQ_API_KEY);  // WARNING: temporary, don't expose in production!
    
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VITE_GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: fullMessages,
        stream: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API error:', errorData);
      throw new Error(`Groq API error: ${response.status}`);
    }

    return response.body;
  } catch (error) {
    console.error('Error streaming from Groq:', error);
    return null;
  }
}

export async function getChatCompletion(messages: Message[]): Promise<string> {
  try {
    if (!VITE_GROQ_API_KEY) {
      throw new Error('VITE_GROQ_API_KEY is not set in environment variables');
    }
    
    const fullMessages = [SYSTEM_PROMPT, ...messages];
    console.log("🛠️ DEBUG fetch config", {
      url: GROQ_API_URL,
      headers: {
        Authorization: `Bearer ${VITE_GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [SYSTEM_PROMPT, ...messages]
      }),
    });

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VITE_GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: fullMessages
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API error:', errorData);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error getting chat completion from Groq:', error);
    return 'Извините, у меня возникла проблема с подключением. Пожалуйста, проверьте, что API ключ GROQ настроен правильно и попробуйте еще раз.';
  }
}
