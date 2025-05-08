
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Video, CheckCircle } from "lucide-react";
import { useState } from "react";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Dashboard = () => {
  const [messages, setMessages] = useState<Message[]>([{
    id: 1,
    text: "Здравствуйте, Афанасий! Рад видеть вас снова. У вас хороший прогресс подготовки к ОГЭ — 60%. Продолжайте в том же духе!",
    isUser: false,
    timestamp: new Date()
  }, {
    id: 2,
    text: "На сегодня я рекомендую вам изучить тему по геометрии: 'Подобие треугольников'. Хотите посмотреть видеоурок или сразу перейти к практическим заданиям?",
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

    // Simulate AI response
    setTimeout(() => {
      let aiResponse = "";
      if (userInput.toLowerCase().includes("видео") || userInput.toLowerCase().includes("урок")) {
        aiResponse = "Отлично! Вот видеоурок по теме 'Подобие треугольников'. После просмотра вы можете перейти к практическим заданиям на странице Практика.";
      } else if (userInput.toLowerCase().includes("практи") || userInput.toLowerCase().includes("задания") || userInput.toLowerCase().includes("задачи")) {
        aiResponse = "Хорошо! На странице Практика вас ждут задания по теме 'Подобие треугольников'. Переходите по ссылке когда будете готовы.";
      } else {
        aiResponse = "Понимаю. Что бы вы хотели изучить сегодня? Я рекомендую тему 'Подобие треугольников', но мы можем заняться и другими темами по вашему выбору.";
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
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <section className="bg-gradient-to-b from-primary/10 to-primary/5 py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3 space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-primary mb-2">Здравствуйте, Афанасий!</h1>
                  <p className="text-gray-700">Рады видеть вас снова! Продолжайте обучение.</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Прогресс подготовки к ОГЭ</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-700">Общий прогресс</span>
                        <span className="text-sm font-medium text-primary">60%</span>
                      </div>
                      <Progress value={60} className="h-3 bg-primary/20" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-700">Алгебра</span>
                        <span className="text-sm font-medium text-primary">75%</span>
                      </div>
                      <Progress value={75} className="h-3 bg-primary/20" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-700">Геометрия</span>
                        <span className="text-sm font-medium text-primary">45%</span>
                      </div>
                      <Progress value={45} className="h-3 bg-primary/20" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-700">Теория вероятностей</span>
                        <span className="text-sm font-medium text-primary">60%</span>
                      </div>
                      <Progress value={60} className="h-3 bg-primary/20" />
                    </div>
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
                  
                  <ScrollArea className="flex-1 bg-gray-50/80">
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
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
