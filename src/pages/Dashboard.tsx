import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Video, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import { sendChatMessage } from "@/services/chatService";
import { useStudentSkills } from "@/hooks/useStudentSkills";
import { useChatContext } from "@/contexts/ChatContext";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  problemId?: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { topicProgress, generalPreparedness, isLoading } = useStudentSkills();
  const { messages, isTyping, isDatabaseMode, setMessages, setIsTyping, addMessage } = useChatContext();
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Пользователь';
  
  // Initialize welcome messages if chat is empty
  useEffect(() => {
    if (messages.length === 0 && !isLoading && topicProgress.length > 0) {
      // Find topics that need improvement (below 70%)
      const topicsToImprove = topicProgress
        .filter(topic => topic.averageScore < 70)
        .sort((a, b) => a.averageScore - b.averageScore)
        .slice(0, 3);

      let welcomeMessage = `Привет, ${userName}! Рад видеть тебя снова. `;
      
      if (generalPreparedness >= 80) {
        welcomeMessage += `Отличный прогресс — ${generalPreparedness}%! Ты на правильном пути к успеху на ОГЭ. 🎯`;
      } else if (generalPreparedness >= 60) {
        welcomeMessage += `У тебя хороший прогресс — ${generalPreparedness}%. Продолжай в том же духе! 💪`;
      } else {
        welcomeMessage += `Твой текущий прогресс — ${generalPreparedness}%. Есть над чем поработать, но я помогу тебе улучшить результаты! 📚`;
      }

      let recommendationMessage = "";
      
      if (topicsToImprove.length > 0) {
        recommendationMessage = `**Рекомендую сегодня поработать над этими темами:**\n\n`;
        
        topicsToImprove.forEach((topic, index) => {
          const topicNumber = topic.topic;
          recommendationMessage += `${index + 1}. **${topic.name}** (${topic.averageScore}%)\n`;
          recommendationMessage += `   📖 [Изучить материал](/textbook?topic=${topicNumber})\n\n`;
        });

        recommendationMessage += `Начни с изучения теории, а затем переходи к практическим заданиям. Удачи! 🚀`;
      } else {
        recommendationMessage = `const recommendationMessage = `<div className="prose">
  <p><strong>🔥 Ну что, поехали дальше! Сегодня у нас — Признаки подобия треугольников</strong></p>
  <p>Ты уже прошёл(а) немало тем — движемся по плану шаг за шагом 🚂</p>
  <p>Сегодняшняя тема важная и часто встречается на ОГЭ, так что давай разложим всё по полочкам:</p>

  <p>📘 <a href="/textbook2" style={{ color: "#10b981", textDecoration: "underline" }}>Изучить теорию</a> — разберись в признаках и основах</p>
  <p>🎥 <a href="/videos" style={{ color: "#10b981", textDecoration: "underline" }}>Посмотреть видео</a> — объясняю всё на простых примерах</p>
  <p>🧠 <a href="/videos?style=brainrot" style={{ color: "#10b981", textDecoration: "underline" }}>Brainrot-видео</a> — если хочется учиться под мемчики 😏</p>
  <p>✍️ <a href="/practice" style={{ color: "#10b981", textDecoration: "underline" }}>Попрактиковаться</a> — сначала простые, потом ОГЭ-уровень</p>

  <p><strong>🎯 И, как всегда, обязательная часть дня:</strong></p>
  <p>🔎 <a href="/fipi-bank" style={{ color: "#10b981", textDecoration: "underline" }}>Банк заданий ФИПИ</a> — решай хотя бы 1–2 задачи в день, и ты точно прокачаешься 💪</p>
  <p>Начни с теории — дальше всё пойдёт как по маслу. Если что — я рядом 😉</p>
</div>
`;
`;
      }

      const welcomeMessages = [
        {
          id: 1,
          text: welcomeMessage,
          isUser: false,
          timestamp: new Date()
        },
        {
          id: 2,
          text: recommendationMessage,
          isUser: false,
          timestamp: new Date()
        }
      ];
      
      setMessages(welcomeMessages);
    }
  }, [messages.length, userName, generalPreparedness, topicProgress, isLoading, setMessages]);
  
  const handleSendMessage = async (userInput: string) => {
    if (userInput.trim() === "") return;

    // Add user message
    const newUserMessage = {
      id: messages.length + 1,
      text: userInput,
      isUser: true,
      timestamp: new Date()
    };
    
    addMessage(newUserMessage);
    setIsTyping(true);

    try {
      // Send message to AI and get response using Groq API
      const aiResponse = await sendChatMessage(newUserMessage, messages, isDatabaseMode);
      addMessage(aiResponse);
    } finally {
      setIsTyping(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1 pt-16">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-semibold text-foreground">Ёжик AI</h1>
          <p className="text-sm text-muted-foreground">Добро пожаловать, {userName}</p>
        </div>
        
        <div className="flex-1 p-4 space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium text-foreground mb-2">Прогресс ОГЭ</h3>
            <div className="space-y-2">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Загрузка...</div>
              ) : (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Общий прогресс</span>
                    <span className="text-foreground font-medium">{generalPreparedness}%</span>
                  </div>
                  <Progress value={generalPreparedness} className="h-2" />
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Button variant="ghost" asChild className="w-full justify-start h-auto p-3">
              <Link to="/daily-practice" className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-medium">Ежедневная практика</div>
                  <div className="text-xs text-muted-foreground">Решай задачи каждый день</div>
                </div>
              </Link>
            </Button>
            
            <Button variant="ghost" asChild className="w-full justify-start h-auto p-3">
              <Link to="/textbook" className="flex items-center gap-3">
                <BookOpen className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-medium">Учебник</div>
                  <div className="text-xs text-muted-foreground">Изучай теорию</div>
                </div>
              </Link>
            </Button>
            
            <Button variant="ghost" asChild className="w-full justify-start h-auto p-3">
              <Link to="/videos" className="flex items-center gap-3">
                <Video className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-medium">Видеоуроки</div>
                  <div className="text-xs text-muted-foreground">Смотри объяснения</div>
                </div>
              </Link>
            </Button>
            
            <Button variant="ghost" asChild className="w-full justify-start h-auto p-3">
              <Link to="/practice" className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-medium">Практика</div>
                  <div className="text-xs text-muted-foreground">Тренируйся решать</div>
                </div>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-border bg-card">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium text-foreground">Ёжик AI</span>
              <span className="text-sm text-muted-foreground">• Готов помочь с математикой</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
          <div className="flex-1">
            <ChatMessages messages={messages} isTyping={isTyping} />
          </div>
          <div className="border-t border-border bg-card">
            <div className="max-w-3xl mx-auto">
              <ChatInput onSendMessage={handleSendMessage} isTyping={isTyping} />
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
