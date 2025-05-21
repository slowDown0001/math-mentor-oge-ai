
import { getChatCompletion, type Message as GroqMessage } from "./groqService";
import { toast } from "@/hooks/use-toast";

export interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const sendChatMessage = async (
  userMessage: Message,
  messageHistory: Message[]
): Promise<Message> => {
  try {
    // Check if API key is available
    if (!import.meta.env.VITE_GROQ_API_KEY) {
      throw new Error('VITE_GROQ_API_KEY is not set in environment variables');
    }
    
    // Convert to Groq format
    const groqMessages = [...messageHistory, userMessage].map(msg => ({
      role: msg.isUser ? 'user' as const : 'assistant' as const,
      content: msg.text
    }));
    
    // Call Groq API
    const aiResponse = await getChatCompletion(groqMessages);
    
    // Create and return AI message
    return {
      id: messageHistory.length + 2, // +1 for user message, +1 for AI response
      text: aiResponse,
      isUser: false,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error getting response:', error);
    
    // Display more specific error message
    let errorMessage = "Не удалось получить ответ от ассистента. ";
    
    if (error instanceof Error) {
      if (error.message.includes('VITE_GROQ_API_KEY is not set')) {
        errorMessage += "API ключ GROQ не настроен. Пожалуйста, добавьте VITE_GROQ_API_KEY в переменные окружения.";
      } else if (error.message.includes('Groq API error')) {
        errorMessage += "Ошибка API Groq: " + error.message;
      } else {
        errorMessage += error.message;
      }
    } else {
      errorMessage += "Пожалуйста, проверьте консоль для получения дополнительной информации.";
    }
    
    toast({
      title: "Ошибка",
      description: errorMessage,
      variant: "destructive"
    });
    
    // Return error message
    return {
      id: messageHistory.length + 2,
      text: "Извините, произошла ошибка при обработке вашего запроса. " + errorMessage,
      isUser: false,
      timestamp: new Date()
    };
  }
};
