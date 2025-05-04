
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatSection = () => {
  const [messages, setMessages] = useState<Message[]>([{
    id: 1,
    text: "Привет! Я твой ИИ-репетитор по математике. Давай проверим твой уровень знаний!",
    isUser: false,
    timestamp: new Date()
  }, {
    id: 2,
    text: "Хочешь пройти входное тестирование или решить несколько тренировочных задач?",
    isUser: false,
    timestamp: new Date()
  }]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const handleSendMessage = () => {
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

    // Simulate AI response based on user input
    setTimeout(() => {
      let aiResponse = "";
      if (userInput.toLowerCase().includes("тест")) {
        aiResponse = "Отлично! Я подготовлю входной тест для тебя. Это поможет мне понять твой текущий уровень и создать персонализированный учебный план.";
      } else if (userInput.toLowerCase().includes("задач") || userInput.toLowerCase().includes("задания") || userInput.toLowerCase().includes("примеры")) {
        aiResponse = "Отлично! Давай попробуем эту задачу по алгебре: Решите уравнение: 3x - 7 = 8. Не торопись и напиши свой ответ, когда будешь готов.";
      } else if (userInput.toLowerCase().includes("привет") || userInput.toLowerCase().includes("здравствуй")) {
        aiResponse = "Привет! Я здесь, чтобы помочь тебе подготовиться к экзамену ОГЭ по математике. Что бы ты хотел изучить сегодня?";
      } else {
        aiResponse = "Я с радостью помогу тебе с этим. Хочешь сосредоточиться на алгебре, геометрии или теории вероятностей сегодня?";
      }
      const newAiMessage = {
        id: messages.length + 2,
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newAiMessage]);
      setIsTyping(false);
    }, 1500);
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
                HEDGCOCK AI
              </h3>
            </div>
            
            <ScrollArea className="h-96 bg-gray-50/80">
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
                      <p>{message.text}</p>
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
              />
              <Button 
                onClick={handleSendMessage} 
                className="bg-primary hover:bg-primary/90 shadow-md transition-all duration-200 hover:scale-105" 
                disabled={!userInput.trim()}
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
