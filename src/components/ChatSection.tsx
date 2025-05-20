
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getChatCompletion, streamChatCompletion, Message as GroqMessage } from "@/services/groqService";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatSection = () => {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Пользователь';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Check if API key is available
    if (!import.meta.env.VITE_GROQ_API_KEY) {
      toast({
        title: "Ошибка настройки",
        description: "API ключ GROQ не настроен. Пожалуйста, добавьте VITE_GROQ_API_KEY в переменные окружения.",
        variant: "destructive"
      });
    }
    
    // Welcome message when component mounts
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: `Привет, ${userName}! Я твой ИИ-репетитор по математике. Давай проверим твой уровень знаний!`,
          isUser: false,
          timestamp: new Date()
        },
        {
          id: 2,
          text: "Хочешь пройти входное тестирование или решить несколько тренировочных задач?",
          isUser: false,
          timestamp: new Date()
        }
      ]);
    }
  }, [userName]);
  
  useEffect(() => {
    // Scroll to bottom when new messages come in
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);
  
  // Convert our messages to Groq format
  const convertToGroqMessages = (): GroqMessage[] => {
    return messages.map(msg => ({
      role: msg.isUser ? 'user' as const : 'assistant' as const,
      content: msg.text
    }));
  };
  
  const handleSendMessage = async () => {
    if (userInput.trim() === "") return;

    // Add user message
    const newUserMessage = {
      id: messages.length + 1,
      text: userInput,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput("");
    setIsTyping(true);

    try {
      // Check if API key is available
      if (!import.meta.env.VITE_GROQ_API_KEY) {
        throw new Error('VITE_GROQ_API_KEY is not set in environment variables');
      }
      
      // Add the new user message to history and convert to Groq format
      const updatedMessages = [...messages, newUserMessage];
      const groqMessages = updatedMessages.map(msg => ({
        role: msg.isUser ? 'user' as const : 'assistant' as const,
        content: msg.text
      }));
      
      // Call Groq API
      const aiResponse = await getChatCompletion(groqMessages);
      
      // Add AI response to chat
      const newAiMessage = {
        id: updatedMessages.length + 1,
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newAiMessage]);
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
      
      // Add error message to chat
      const errorAiMessage = {
        id: messages.length + 2,
        text: "Извините, произошла ошибка при обработке вашего запроса. " + errorMessage,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorAiMessage]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };
  
  return (
    <section id="ai-tutor" className="py-16 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ваш ИИ-репетитор по математике</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Задавайте вопросы, получайте объяснения и решайте задачи с мгновенной обратной связью.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white backdrop-blur-lg shadow-xl rounded-xl overflow-hidden border-0 relative">
            <div className="bg-gradient-to-r from-primary to-secondary p-4">
              <h3 className="text-white font-medium flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse"></span>
                Ёжик AI
              </h3>
            </div>
            
            <ScrollArea className="h-96 bg-gray-50/80" ref={scrollAreaRef}>
              <div className="p-4 flex flex-col space-y-4">
                {messages.map(message => (
                  <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
                    <div 
                      className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
                        message.isUser 
                          ? "bg-gradient-to-br from-primary to-primary/80 text-white rounded-tr-none" 
                          : "bg-white/80 border border-gray-200/50 rounded-tl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.text}</p>
                      <div className={`text-xs mt-1 ${message.isUser ? "text-primary-foreground/80" : "text-gray-400"}`}>
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-white/80 shadow-sm border border-gray-200/50 p-3 rounded-lg rounded-tl-none max-w-[80%]">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-primary/70 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-primary/70 animate-pulse delay-100"></div>
                        <div className="w-2 h-2 rounded-full bg-primary/70 animate-pulse delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t border-gray-200/30 backdrop-blur-sm bg-white/80 flex gap-2">
              <Input 
                value={userInput} 
                onChange={e => setUserInput(e.target.value)} 
                onKeyDown={handleKeyDown} 
                placeholder="Задайте ваш вопрос по математике..." 
                className="flex-1 border-gray-200/70 focus:ring-primary/50 bg-white rounded-lg" 
                disabled={isTyping}
              />
              <Button 
                onClick={handleSendMessage} 
                className="bg-primary hover:bg-primary/90 shadow-md transition-all duration-200 hover:scale-105" 
                disabled={!userInput.trim() || isTyping}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ChatSection;
