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
  const { generalPreparedness, isLoading } = useStudentSkills();
  const { messages, isTyping, isDatabaseMode, setMessages, setIsTyping, addMessage } = useChatContext();
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Пользователь';
  
  // Initialize welcome messages if chat is empty
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessages = [
        {
          id: 1,
          text: `Здравствуйте, ${userName}! Рад видеть вас снова. У вас хороший прогресс подготовки к ОГЭ — ${generalPreparedness}%. Продолжайте в том же духе!`,
          isUser: false,
          timestamp: new Date()
        },
        {
          id: 2,
          text: "На сегодня я рекомендую вам изучить тему по геометрии: 'Подобие треугольников'. Хотите посмотреть видеоурок или сразу перейти к практическим заданиям?",
          isUser: false,
          timestamp: new Date()
        }
      ];
      setMessages(welcomeMessages);
    }
  }, [messages.length, userName, generalPreparedness, setMessages]);
  
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
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <section className="bg-gradient-to-b from-primary/10 to-primary/5 py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3 space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-primary mb-2">Здравствуйте, {userName}!</h1>
                  <p className="text-gray-700">Рады видеть вас снова! Продолжайте обучение.</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Прогресс подготовки к ОГЭ</h2>
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="text-center py-4">
                        <div className="text-gray-500">Загрузка...</div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-700">Общий прогресс</span>
                          <span className="text-sm font-medium text-primary">{generalPreparedness}%</span>
                        </div>
                        <Progress value={generalPreparedness} className="h-3 bg-primary/20" />
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 flex space-x-3">
                    <Button variant="outline" asChild className="flex gap-2 border-primary/70 text-primary">
                      <Link to="/resources"><BookOpen className="w-4 h-4" /> Учебные материалы</Link>
                    </Button>
                    <Button asChild className="flex gap-2 bg-primary">
                      <Link to="/practice"><CheckCircle className="w-4 h-4" /> Практика</Link>
                    </Button>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Рекомендация на сегодня</h2>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Video className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Геометрия: Подобие треугольников</h3>
                      <p className="text-sm text-gray-600 mt-1">Видеоурок, 15 минут</p>
                    </div>
                  </div>
                  <Button asChild className="w-full bg-primary">
                    <Link to="/resources?tab=videos">Смотреть видеоурок</Link>
                  </Button>
                </div>
              </div>
              
              <div className="md:w-2/3">
                <Card className="bg-white shadow-xl rounded-xl overflow-hidden border-0 h-[600px] flex flex-col">
                  <div className="bg-gradient-to-r from-primary to-secondary p-4">
                    <h3 className="text-white font-medium flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-accent animate-pulse"></span>
                      Ёжик AI
                    </h3>
                  </div>
                  
                  <ChatMessages messages={messages} isTyping={isTyping} />
                  <ChatInput onSendMessage={handleSendMessage} isTyping={isTyping} />
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
