
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfileCard } from "@/components/profile/UserProfileCard";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import { sendChatMessage } from "@/services/chatService";

export interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  problemId?: string;
}

const Profile = () => {
  const { user } = useAuth();
  
  // Extract user information from Supabase user data
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Пользователь';
  const userEmail = user?.email || '';
  const joinedDate = new Date(user?.created_at || Date.now()).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  
  const [messages, setMessages] = useState<Message[]>([{
    id: 1,
    text: `Привет, ${userName}! Я могу помочь тебе разобраться с любыми вопросами по математике. Чем я могу тебе помочь?`,
    isUser: false,
    timestamp: new Date()
  }]);
  
  const [isTyping, setIsTyping] = useState(false);
  
  const handleSendMessage = async (userInput: string) => {
    if (userInput.trim() === "") return;

    // Add user message
    const newUserMessage = {
      id: messages.length + 1,
      text: userInput,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsTyping(true);

    try {
      // Send message to AI and get response using Groq API
      const aiResponse = await sendChatMessage(newUserMessage, messages);
      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const userData = {
    progress: {
      overall: 60,
      algebra: 75,
      geometry: 45,
      probability: 60
    },
    completedLessons: 24,
    practiceProblems: 156,
    quizzesCompleted: 12,
    averageScore: 82,
    streakDays: 15,
    achievements: [
      { id: 1, name: "Первые шаги", description: "Завершено 5 уроков", date: "15 марта 2025", completed: true },
      { id: 2, name: "Математический гений", description: "Решено 100+ задач", date: "2 апреля 2025", completed: true },
      { id: 3, name: "На отлично", description: "Получена оценка 90% или выше на 5 тестах подряд", date: "Не получено", completed: false },
      { id: 4, name: "Геометрический мастер", description: "Завершены все темы по геометрии", date: "Не получено", completed: false }
    ],
    recentActivity: [
      { date: "9 мая 2025", activity: "Завершен урок: Подобие треугольников", type: "lesson" },
      { date: "8 мая 2025", activity: "Решено 12 задач по теме 'Функции и графики'", type: "practice" },
      { date: "7 мая 2025", activity: "Пройден тест: Уравнения и неравенства (89%)", type: "quiz" },
      { date: "5 мая 2025", activity: "Просмотрен видеоурок: Статистика и вероятность", type: "video" }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Column - User Info */}
            <div className="md:w-1/3">
              <UserProfileCard 
                userName={userName}
                userEmail={userEmail}
                joinedDate={joinedDate}
                userData={userData}
              />
              
              {/* Chat with AI Tutor */}
              <Card className="mt-6 bg-white shadow-md rounded-xl overflow-hidden border-0 h-[400px] flex flex-col">
                <div className="bg-gradient-to-r from-primary to-secondary p-3">
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse"></span>
                    Персональный репетитор
                  </h3>
                </div>
                
                <ChatMessages messages={messages} isTyping={isTyping} />
                <ChatInput onSendMessage={handleSendMessage} isTyping={isTyping} />
              </Card>
            </div>
            
            {/* Right Column - Tabs */}
            <div className="md:w-2/3">
              <ProfileTabs userData={userData} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
