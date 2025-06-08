
import { getChatCompletion, type Message as GroqMessage } from "./groqService";
import { getRandomMathProblem, getMathProblemById, getCategoryByCode, type MathProblem } from "./mathProblemsService";
import { toast } from "@/hooks/use-toast";

export interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  problemId?: string;
}

// Store current problem for follow-up questions
let currentProblem: MathProblem | null = null;

const formatProblemResponse = (problem: MathProblem): string => {
  const category = getCategoryByCode(problem.code);
  let response = `**Задача по теме: ${category}** (${problem.code})\n\n`;
  
  if (problem.problem_image) {
    response += `*[Изображение к задаче доступно]*\n\n`;
  }
  
  response += problem.problem_text + '\n\n';
  response += `Если нужна помощь, скажи:\n`;
  response += `• "покажи ответ" - для получения ответа\n`;
  response += `• "покажи решение" - для получения решения\n`;
  response += `• "объясни подробнее" - для подробного объяснения`;
  
  return response;
};

const handleHelpRequest = (userMessage: string): string | null => {
  if (!currentProblem) {
    return null;
  }
  
  const message = userMessage.toLowerCase();
  
  if (message.includes('покажи ответ') || message.includes('ответ')) {
    return `**Ответ:** ${currentProblem.answer}`;
  }
  
  if (message.includes('покажи решение') || message.includes('решение')) {
    return currentProblem.solution_text || "Решение для этой задачи пока недоступно.";
  }
  
  if (message.includes('объясни подробнее') || message.includes('подробнее') || message.includes('не понял')) {
    return currentProblem.solutiontextexpanded || currentProblem.solution_text || "Подробное объяснение для этой задачи пока недоступно.";
  }
  
  return null;
};

const shouldFetchProblem = (userMessage: string): string | null => {
  const message = userMessage.toLowerCase();
  
  // Check for practice problem requests
  if (message.includes('дай задач') || message.includes('хочу задач') || 
      message.includes('покажи задач') || message.includes('практик') ||
      message.includes('тренировк') || message.includes('упражнен')) {
    
    if (message.includes('арифметик')) return 'арифметика';
    if (message.includes('алгебр')) return 'алгебра';
    if (message.includes('геометри')) return 'геометрия';
    if (message.includes('практическ')) return 'практическая математика';
    
    return 'random';
  }
  
  return null;
};

const handleDatabaseOnlyMode = async (userMessage: string): Promise<string> => {
  // Check for help requests first
  const helpResponse = handleHelpRequest(userMessage);
  if (helpResponse) {
    return helpResponse;
  }
  
  // Check for problem requests
  const problemCategory = shouldFetchProblem(userMessage);
  if (problemCategory) {
    const requestedCategory = problemCategory === 'random' ? undefined : problemCategory;
    const problem = await getRandomMathProblem(requestedCategory);
    
    if (problem) {
      currentProblem = problem;
      return formatProblemResponse(problem);
    } else {
      return "Извините, не удалось найти подходящую задачу в базе данных.";
    }
  }
  
  // For any other input in database mode, provide standard database responses
  if (userMessage.toLowerCase().includes('помощь') || userMessage.toLowerCase().includes('что ты умеешь')) {
    return `В режиме "База" я могу:\n\n• Предоставить задачи из базы данных\n• Показать ответы к задачам\n• Показать решения\n• Дать подробные объяснения\n\nЧтобы получить задачу, скажите "дай задачу" или укажите тему (алгебра, геометрия, арифметика).`;
  }
  
  // Default response for database mode
  return "В режиме работы с базой данных я могу предоставить только задачи и решения из базы. Скажите 'дай задачу' или укажите нужную тему.";
};

export const sendChatMessage = async (
  userMessage: Message,
  messageHistory: Message[],
  isDatabaseMode: boolean = false
): Promise<Message> => {
  try {
    let responseText: string;
    
    if (isDatabaseMode) {
      // Handle database-only mode
      responseText = await handleDatabaseOnlyMode(userMessage.text);
    } else {
      // Check if user is asking for help with current problem
      const helpResponse = handleHelpRequest(userMessage.text);
      if (helpResponse) {
        return {
          id: messageHistory.length + 2,
          text: helpResponse,
          isUser: false,
          timestamp: new Date(),
          problemId: currentProblem?.question_id
        };
      }
      
      // Check if user wants a practice problem
      const problemCategory = shouldFetchProblem(userMessage.text);
      if (problemCategory) {
        const requestedCategory = problemCategory === 'random' ? undefined : problemCategory;
        const problem = await getRandomMathProblem(requestedCategory);
        
        if (problem) {
          currentProblem = problem;
          return {
            id: messageHistory.length + 2,
            text: formatProblemResponse(problem),
            isUser: false,
            timestamp: new Date(),
            problemId: problem.question_id
          };
        } else {
          return {
            id: messageHistory.length + 2,
            text: "Извините, не удалось найти подходящую задачу. Попробуйте запросить другую тему.",
            isUser: false,
            timestamp: new Date()
          };
        }
      }
      
      // For all other messages, send to AI for general math conversation
      const groqMessages = [...messageHistory, userMessage].map(msg => ({
        role: msg.isUser ? 'user' as const : 'assistant' as const,
        content: msg.text
      }));
      
      // Call Groq API for general conversation
      responseText = await getChatCompletion(groqMessages);
    }
    
    // Create and return AI message
    return {
      id: messageHistory.length + 2,
      text: responseText,
      isUser: false,
      timestamp: new Date(),
      problemId: currentProblem?.question_id
    };
  } catch (error) {
    console.error('Error getting response:', error);
    
    // Display more specific error message
    let errorMessage = "Не удалось получить ответ от ассистента. ";
    
    if (error instanceof Error) {
      errorMessage += error.message;
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
