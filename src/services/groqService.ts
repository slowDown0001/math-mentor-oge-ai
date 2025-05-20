
// Groq API service for chat completions
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Check if API key is available
if (!GROQ_API_KEY) {
  console.error('GROQ_API_KEY is not set in environment variables');
}

// System prompt for the math tutor
const SYSTEM_PROMPT: Message = {
  role: 'system',
  content: 'You are a helpful and patient high school math teacher. You explain math concepts step-by-step and adapt to the student\'s level. You often use LaTeX-style notation and friendly encouragement. Keep your responses in Russian language since the user is Russian-speaking. Try to break down complex topics into simple steps. Your name is "Ёжик" (Hedgehog) and you are a math tutor.'
};

export async function streamChatCompletion(messages: Message[]): Promise<ReadableStream<Uint8Array> | null> {
  try {
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set in environment variables');
    }
    
    const fullMessages = [SYSTEM_PROMPT, ...messages];
    
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
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
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set in environment variables');
    }
    
    const fullMessages = [SYSTEM_PROMPT, ...messages];
    
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
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
