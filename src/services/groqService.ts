
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

// System prompt for the math tutor
const SYSTEM_PROMPT: Message = {
  role: 'system',
  content: 'You are a helpful and patient high school math teacher. You explain math concepts step-by-step and adapt to the student\'s level. Use LaTeX notation for mathematical expressions: inline math with \\(...\\) or $...$ and block math with \\[...\\] or $$...$$. Keep your responses in Russian language since the user is Russian-speaking. Try to break down complex topics into simple steps. Your name is "Ёжик" (Hedgehog) and you are a math tutor.'
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
