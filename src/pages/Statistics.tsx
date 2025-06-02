import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Target, TrendingUp } from "lucide-react";
import Header from "@/components/Header";
import { useStudentSkills } from "@/hooks/useStudentSkills";

const Statistics = () => {
  const [practiceHours, setPracticeHours] = useState([2]);
  const { topicProgress, generalPreparedness, isLoading, error } = useStudentSkills();

  // Calculate predicted grade based on general preparedness and practice hours
  const calculatePredictedGrade = () => {
    const baseGrade = generalPreparedness;
    const hoursBonus = Math.min(practiceHours[0] * 2, 15); // Max 15 points bonus for practice hours
    return Math.min(baseGrade + hoursBonus, 100);
  };

  // Calculate days until exam (May 20th, 2026)
  const examDate = new Date('2026-05-20');
  const today = new Date();
  const daysUntilExam = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const getRecommendation = () => {
    const hours = practiceHours[0];
    if (hours < 1) return "Рекомендуем увеличить время занятий для лучшей подготовки";
    if (hours <= 2) return "Хороший темп! Постарайтесь заниматься регулярно";
    if (hours <= 4) return "Отличный темп подготовки! Не забывайте про отдых";
    return "Интенсивная подготовка! Убедитесь, что не переутомляетесь";
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 80) return "text-green-600";
    if (grade >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Ошибка загрузки статистики</h1>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Статистика</h1>
            <p className="text-gray-600">Отслеживайте свой прогресс подготовки к ОГЭ</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Topic Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Прогресс по темам
                </CardTitle>
                <CardDescription>
                  Ваш текущий уровень подготовки по каждой категории
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="text-gray-500">Загрузка данных...</div>
                  </div>
                ) : (
                  <>
                    {topicProgress.map((topic) => (
                      <div key={topic.topic}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">{topic.topic}. {topic.name}</span>
                          <span className="text-sm text-gray-500">{topic.averageScore}%</span>
                        </div>
                        <Progress value={topic.averageScore} className="h-2" />
                      </div>
                    ))}
                  </>
                )}

                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link to="/statistics/detailed">
                    Подробная статистика
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* General Preparedness */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Общая готовность к экзамену
                </CardTitle>
                <CardDescription>
                  Средний показатель подготовки по всем навыкам
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Загрузка...</div>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-primary mb-2">
                        {generalPreparedness}%
                      </div>
                      <div className="text-sm text-gray-500">
                        {generalPreparedness >= 75 ? "Отличная подготовка!" : 
                         generalPreparedness >= 50 ? "Хорошая подготовка" : 
                         "Требуется больше практики"}
                      </div>
                    </div>
                    <Progress value={generalPreparedness} className="h-3" />
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Practice Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Время занятий в день
                </CardTitle>
                <CardDescription>
                  Сколько часов в день вы можете заниматься?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-4">
                    <span className="text-sm font-medium">Часов в день:</span>
                    <span className="text-sm font-bold">{practiceHours[0]}</span>
                  </div>
                  <Slider
                    value={practiceHours}
                    onValueChange={setPracticeHours}
                    max={8}
                    min={0.5}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>0.5ч</span>
                    <span>8ч</span>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Рекомендация:</strong> {getRecommendation()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Exam Countdown and Predicted Grade */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  До экзамена
                </CardTitle>
                <CardDescription>
                  ОГЭ - 20 мая 2026 года
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {daysUntilExam}
                  </div>
                  <div className="text-sm text-gray-500">дней осталось</div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-3">Прогнозируемая оценка</h4>
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-2 ${getGradeColor(calculatePredictedGrade())}`}>
                      {calculatePredictedGrade()}%
                    </div>
                    <div className="text-sm text-gray-500">
                      На основе текущей подготовки и времени занятий
                    </div>
                  </div>
                  <Progress value={calculatePredictedGrade()} className="h-2 mt-4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Statistics;
