import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, BookOpen, CheckCircle, Settings, BarChart3, Calendar, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

const Profile = () => {
  const { user } = useAuth();
  
  // Extract user information from Supabase user data
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Пользователь';
  const userEmail = user?.email || '';
  const joinedDate = new Date(user?.created_at || Date.now()).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  
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
              <Card className="p-6 bg-white shadow-md rounded-xl border-0">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800">{userName}</h1>
                  <p className="text-gray-600">{userEmail}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <span>Присоединился: {joinedDate}</span>
                    <span>•</span>
                    <span>Активность: Сегодня</span>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Прогресс подготовки к ОГЭ</h2>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-700">Общий прогресс</span>
                          <span className="text-sm font-medium text-primary">{userData.progress.overall}%</span>
                        </div>
                        <Progress value={userData.progress.overall} className="h-2 bg-primary/20" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-700">Алгебра</span>
                          <span className="text-sm font-medium text-primary">{userData.progress.algebra}%</span>
                        </div>
                        <Progress value={userData.progress.algebra} className="h-2 bg-primary/20" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-700">Геометрия</span>
                          <span className="text-sm font-medium text-primary">{userData.progress.geometry}%</span>
                        </div>
                        <Progress value={userData.progress.geometry} className="h-2 bg-primary/20" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-700">Теория вероятностей</span>
                          <span className="text-sm font-medium text-primary">{userData.progress.probability}%</span>
                        </div>
                        <Progress value={userData.progress.probability} className="h-2 bg-primary/20" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{userData.completedLessons}</div>
                      <div className="text-sm text-gray-600">Пройдено уроков</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{userData.practiceProblems}</div>
                      <div className="text-sm text-gray-600">Решено задач</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{userData.quizzesCompleted}</div>
                      <div className="text-sm text-gray-600">Пройдено тестов</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{userData.averageScore}%</div>
                      <div className="text-sm text-gray-600">Средний балл</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-center">
                    <Button className="flex items-center gap-2" asChild>
                      <Link to="/dashboard">
                        <BarChart3 className="h-4 w-4" />
                        Перейти к учебе
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Right Column - Tabs */}
            <div className="md:w-2/3">
              <Tabs defaultValue="activity" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="activity">Активность</TabsTrigger>
                  <TabsTrigger value="achievements">Достижения</TabsTrigger>
                  <TabsTrigger value="settings">Настройки</TabsTrigger>
                </TabsList>
                
                <TabsContent value="activity" className="bg-white rounded-xl shadow-md p-6 border-0">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Недавняя активность
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 font-medium text-primary">
                          <span>Текущая серия:</span>
                          <span className="text-lg">{userData.streakDays} дней</span>
                        </div>
                        <div className="text-sm text-gray-500">Продолжайте заниматься каждый день!</div>
                      </div>
                      <Progress value={userData.streakDays > 30 ? 100 : userData.streakDays / 30 * 100} className="h-2 bg-primary/20" />
                    </div>
                    
                    <ScrollArea className="h-80 pr-4">
                      <div className="space-y-4">
                        {userData.recentActivity.map((item, i) => (
                          <div key={i} className="border-l-2 border-primary pl-4 ml-2 relative">
                            <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5"></div>
                            <div className="text-sm text-gray-500">{item.date}</div>
                            <div className="font-medium text-gray-800">{item.activity}</div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    <Button variant="outline" className="w-full mt-2">
                      Показать всю историю активности
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="achievements" className="bg-white rounded-xl shadow-md p-6 border-0">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Ваши достижения
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userData.achievements.map(achievement => (
                      <div 
                        key={achievement.id} 
                        className={`p-4 rounded-lg ${achievement.completed ? 'bg-primary/5 border border-primary/20' : 'bg-gray-100 border border-gray-200'}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${achievement.completed ? 'bg-primary/20 text-primary' : 'bg-gray-200 text-gray-500'}`}>
                            {achievement.completed ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <Star className="h-4 w-4" />
                            )}
                          </div>
                          <h3 className={`font-medium ${achievement.completed ? 'text-primary' : 'text-gray-500'}`}>
                            {achievement.name}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        <div className="text-xs mt-2 text-gray-500">
                          {achievement.completed ? `Получено: ${achievement.date}` : achievement.date}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="bg-white rounded-xl shadow-md p-6 border-0">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Настройки профиля
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-gray-600">Функции настройки профиля будут доступны в ближайшем обновлении.</p>
                    </div>
                    
                    <Button variant="outline" className="w-full text-gray-700">
                      Изменить пароль
                    </Button>
                    
                    <Button variant="outline" className="w-full text-gray-700">
                      Настройки уведомлений
                    </Button>
                    
                    <Button variant="destructive" className="w-full mt-8">
                      Выйти из аккаунта
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
