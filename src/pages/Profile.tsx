import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfileCard } from "@/components/profile/UserProfileCard";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { sendChatMessage } from "@/services/chatService";
import { useChatContext } from "@/contexts/ChatContext";
import { useStudentSkills } from "@/hooks/useStudentSkills";
import { useOptimizedProfile } from "@/hooks/useOptimizedProfile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare } from "lucide-react";

export interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  problemId?: string;
}

const Profile = () => {
  const { user } = useAuth();
  const { messages, isTyping, isDatabaseMode, setMessages, setIsTyping, addMessage } = useChatContext();
  const { topicProgress, generalPreparedness, isLoading: skillsLoading } = useStudentSkills();
  
  // Use optimized hook for all profile data (consolidates multiple queries)
  const {
    profile,
    streak,
    statistics,
    isLoading: profileLoading,
    getDisplayName,
    getLastActivityText,
  } = useOptimizedProfile();
  
  const { toast } = useToast();
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  
  // Extract user information from Supabase user data and profile
  const userName = getDisplayName();
  const userEmail = user?.email || '';
  const joinedDate = new Date(user?.created_at || Date.now()).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  const lastActivityDate = getLastActivityText();

  const generateTelegramCode = async () => {
    if (!user || !profile) return;

    setIsGeneratingCode(true);
    // Generate random 6-digit number
    const randomCode = Math.floor(100000 + Math.random() * 900000);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ telegram_code: randomCode })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving telegram code:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось создать Telegram код",
          variant: "destructive",
        });
        return;
      }

      // Update local state (optimized hook will refetch on next mount)
      toast({
        title: "Telegram код создан",
        description: "Обновите страницу чтобы увидеть изменения",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error creating telegram code:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать Telegram код",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCode(false);
    }
  };

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
      const aiResponse = await sendChatMessage(newUserMessage, messages, isDatabaseMode);
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
    completedLessons: statistics?.completed_lessons || 0,
    practiceProblems: statistics?.practice_problems || 0,
    quizzesCompleted: statistics?.quizzes_completed || 0,
    averageScore: Math.round(statistics?.average_score || 0),
    streakDays: streak?.current_streak || 0,
    achievements: [
      { id: 1, name: "Первые шаги", description: "Завершено 5 уроков", date: "15 марта 2025", completed: (statistics?.completed_lessons || 0) >= 5 },
      { id: 2, name: "Математический гений", description: "Решено 100+ задач", date: "2 апреля 2025", completed: (statistics?.practice_problems || 0) >= 100 },
      { id: 3, name: "На отлично", description: "Получена оценка 90% или выше на 5 тестах подряд", date: "Не получено", completed: (statistics?.average_score || 0) >= 90 && (statistics?.quizzes_completed || 0) >= 5 },
      { id: 4, name: "Геометрический мастер", description: "Завершены все темы по геометрии", date: "Не получено", completed: (topicProgress.find(t => t.topic === "7")?.averageScore || 0) >= 80 }
    ],
    recentActivity: [
      { date: "9 мая 2025", activity: "Завершен урок: Подобие треугольников", type: "lesson" },
      { date: "8 мая 2025", activity: "Решено 12 задач по теме 'Функции и графики'", type: "practice" },
      { date: "7 мая 2025", activity: "Пройден тест: Уравнения и неравенства (89%)", type: "quiz" },
      { date: "5 мая 2025", activity: "Просмотрен видеоурок: Статистика и вероятность", type: "video" }
    ]
  };

  if (skillsLoading || profileLoading) {
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
                lastActivityDate={lastActivityDate}
              />
              
              {/* Telegram Bot Integration - Fancy Card */}
              <Card className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg rounded-xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Telegram Бот</h3>
                      <p className="text-sm text-gray-600">Загружай фото решений</p>
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                        <Button 
                          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 transform hover:scale-105"
                          size="lg"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          {profile?.telegram_user_id ? 'Управление Telegram ботом' : 'Подключить Telegram бот'}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                          Telegram бот
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-700 font-medium">
                            Через бот в Telegram ты сможешь загружать фото решения и задач на платформу
                          </p>
                        </div>
                        {profile?.telegram_code ? (
                          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600 mb-2">Ваш Telegram код:</p>
                                <p className="text-blue-800 font-mono text-xl font-bold">
                                  {profile.telegram_code}
                                </p>
                              </div>
                              {profile?.telegram_user_id ? (
                                <div className="flex items-center text-green-600 text-sm font-medium bg-green-100 px-3 py-1 rounded-full">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  Telegram код подтвержден
                                </div>
                              ) : null}
                            </div>
                            {!profile?.telegram_user_id && (
                              <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                                <p className="text-sm text-blue-700 font-medium">
                                  📱 Введите этот код в телеграм-боте @egechat_bot
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <Button
                            onClick={generateTelegramCode}
                            disabled={isGeneratingCode}
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                            size="lg"
                          >
                            {isGeneratingCode ? 'Создаю код...' : 'Создать Telegram код'}
                          </Button>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
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
