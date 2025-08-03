import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfileCard } from "@/components/profile/UserProfileCard";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import { sendChatMessage } from "@/services/chatService";
import { useChatContext } from "@/contexts/ChatContext";
import { useStudentSkills } from "@/hooks/useStudentSkills";
import { useUserStatistics } from "@/hooks/useUserStatistics";
import { useProfile } from "@/hooks/useProfile";

export interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  problemId?: string;
}

const Profile = () => {
  const { user } = useAuth();
  const { getDisplayName } = useProfile();
  const { messages, isTyping, isDatabaseMode, setMessages, setIsTyping, addMessage } = useChatContext();
  const { topicProgress, generalPreparedness, isLoading: skillsLoading } = useStudentSkills();
  const { completedLessons, practiceProblems, quizzesCompleted, averageScore, isLoading: statsLoading } = useUserStatistics();
  
  // Extract user information from Supabase user data and profile
  const userName = getDisplayName();
  const userEmail = user?.email || '';
  const joinedDate = new Date(user?.created_at || Date.now()).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  
  // Initialize welcome message if chat is empty
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 1,
        text: `Привет, ${userName}! Я могу помочь тебе разобраться с любыми вопросами по математике. Чем я могу тебе помочь?`,
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, [messages.length, userName, setMessages]);
  
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
      const studentName = getDisplayName();
      const aiResponse = await sendChatMessage(newUserMessage, messages, isDatabaseMode, studentName);
      addMessage(aiResponse);
    } finally {
      setIsTyping(false);
    }
  };
  
  // Create progress data from topic progress
  const progressData = {
    overall: generalPreparedness,
    algebra: topicProgress.find(t => t.topic === "2")?.averageScore || 0,
    geometry: topicProgress.find(t => t.topic === "7")?.averageScore || 0,
    probability: topicProgress.find(t => t.topic === "8")?.averageScore || 0
  };

  const userData = {
    progress: progressData,
    topicProgress: topicProgress,
    completedLessons,
    practiceProblems,
    quizzesCompleted,
    averageScore: Math.round(averageScore),
    streakDays: 15, // TODO: Get from user_streaks table
    achievements: [
      { id: 1, name: "Первые шаги", description: "Завершено 5 уроков", date: "15 марта 2025", completed: completedLessons >= 5 },
      { id: 2, name: "Математический гений", description: "Решено 100+ задач", date: "2 апреля 2025", completed: practiceProblems >= 100 },
      { id: 3, name: "На отлично", description: "Получена оценка 90% или выше на 5 тестах подряд", date: "Не получено", completed: averageScore >= 90 && quizzesCompleted >= 5 },
      { id: 4, name: "Геометрический мастер", description: "Завершены все темы по геометрии", date: "Не получено", completed: (topicProgress.find(t => t.topic === "7")?.averageScore || 0) >= 80 }
    ],
    recentActivity: [
      { date: "9 мая 2025", activity: "Завершен урок: Подобие треугольников", type: "lesson" },
      { date: "8 мая 2025", activity: "Решено 12 задач по теме 'Функции и графики'", type: "practice" },
      { date: "7 мая 2025", activity: "Пройден тест: Уравнения и неравенства (89%)", type: "quiz" },
      { date: "5 мая 2025", activity: "Просмотрен видеоурок: Статистика и вероятность", type: "video" }
    ]
  };

  if (skillsLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка профиля...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
