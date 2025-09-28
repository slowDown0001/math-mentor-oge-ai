import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Play, Lock, Trophy, Target, Clock, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface HomeworkData {
  mcq_questions: string[];
  fipi_questions: string[];
  assigned_date?: string;
  due_date?: string;
}

interface HomeworkProgress {
  mcq_completed: number;
  fipi_completed: number;
  mcq_correct: number;
  fipi_correct: number;
}

const Homework = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [homeworkData, setHomeworkData] = useState<HomeworkData | null>(null);
  const [progress, setProgress] = useState<HomeworkProgress>({
    mcq_completed: 0,
    fipi_completed: 0,
    mcq_correct: 0,
    fipi_correct: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);

  useEffect(() => {
    if (user) {
      loadHomeworkData();
      loadProgress();
    }
  }, [user]);

  const loadHomeworkData = async () => {
    if (!user) return;

    try {
      // Use generic select to bypass TypeScript strict typing
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading homework:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить домашнее задание",
          variant: "destructive"
        });
        return;
      }

      if (data && (data as any).homework) {
        try {
          const parsedHomework = JSON.parse((data as any).homework);
          console.log('Parsed homework data:', parsedHomework);
          
          // Transform the data structure if needed (handle uppercase format)
          const transformedHomework = {
            mcq_questions: parsedHomework.MCQ || parsedHomework.mcq_questions || [],
            fipi_questions: parsedHomework.FIPI || parsedHomework.fipi_questions || [],
            assigned_date: parsedHomework.assigned_date,
            due_date: parsedHomework.due_date
          };
          
          console.log('Transformed homework data:', transformedHomework);
          setHomeworkData(transformedHomework);
        } catch (parseError) {
          console.error('Error parsing homework JSON:', parseError);
          toast({
            title: "Ошибка",
            description: "Неверный формат домашнего задания",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error fetching homework:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    if (!user || !homeworkData) return;

    try {
      // Get MCQ progress
      if (homeworkData.mcq_questions?.length > 0) {
        const { data: mcqData } = await supabase
          .from('student_activity')
          .select('question_id, is_correct, finished_or_not')
          .eq('user_id', user.id)
          .in('question_id', homeworkData.mcq_questions);

        if (mcqData) {
          const completed = mcqData.filter(item => item.finished_or_not).length;
          const correct = mcqData.filter(item => item.is_correct).length;
          setProgress(prev => ({
            ...prev,
            mcq_completed: completed,
            mcq_correct: correct
          }));
        }
      }

      // Get FIPI progress
      if (homeworkData.fipi_questions?.length > 0) {
        const { data: fipiData } = await supabase
          .from('student_activity')
          .select('question_id, is_correct, finished_or_not')
          .eq('user_id', user.id)
          .in('question_id', homeworkData.fipi_questions);

        if (fipiData) {
          const completed = fipiData.filter(item => item.finished_or_not).length;
          const correct = fipiData.filter(item => item.is_correct).length;
          setProgress(prev => ({
            ...prev,
            fipi_completed: completed,
            fipi_correct: correct
          }));
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  useEffect(() => {
    if (homeworkData) {
      loadProgress();
    }
  }, [homeworkData]);

  useEffect(() => {
    // Check if homework is completed
    if (homeworkData && 
        progress.mcq_completed === homeworkData.mcq_questions?.length &&
        progress.fipi_completed === homeworkData.fipi_questions?.length &&
        homeworkData.mcq_questions?.length > 0 &&
        homeworkData.fipi_questions?.length > 0) {
      triggerCongrats();
    }
  }, [progress, homeworkData]);

  const triggerCongrats = () => {
    setShowCongrats(true);
    
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Auto-hide after 5 seconds
    setTimeout(() => setShowCongrats(false), 5000);
  };

  const handleStartMCQ = () => {
    if (!homeworkData?.mcq_questions?.length) {
      toast({
        title: "Нет вопросов",
        description: "MCQ вопросы не назначены",
        variant: "destructive"
      });
      return;
    }

    // Navigate to revision page with homework questions
    navigate('/ogemath-revision', { 
      state: { 
        homeworkQuestions: homeworkData.mcq_questions,
        isHomework: true 
      } 
    });
  };

  const handleStartFIPI = () => {
    if (!homeworkData?.fipi_questions?.length) {
      toast({
        title: "Нет вопросов",
        description: "ФИПИ вопросы не назначены",
        variant: "destructive"
      });
      return;
    }

    // For now, show that FIPI is not available
    toast({
      title: "Скоро будет доступно",
      description: "ФИПИ вопросы находятся в разработке",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="pt-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg text-muted-foreground">Войдите в систему для доступа к домашнему заданию</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="pt-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Загрузка домашнего задания...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!homeworkData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
        {/* Navigation Bar */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-start">
              <Button 
                onClick={() => navigate('/ogemath-practice')}
                className="bg-gradient-to-r from-yellow-200 to-yellow-300 hover:from-yellow-300 hover:to-yellow-400 text-black shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                Назад
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-8 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="p-8">
              <CardHeader>
                <BookOpen className="w-16 h-16 mx-auto text-purple-500 mb-4" />
                <CardTitle className="text-2xl text-purple-800">Домашнее задание не назначено</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  У вас пока нет домашнего задания от ИИ помощника. Обратитесь к преподавателю или попробуйте другие виды практики.
                </p>
                <Button 
                  onClick={() => navigate('/ogemath-practice')}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Перейти к другим видам практики
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const totalMCQ = homeworkData.mcq_questions?.length || 0;
  const totalFIPI = homeworkData.fipi_questions?.length || 0;
  const mcqProgress = totalMCQ > 0 ? (progress.mcq_completed / totalMCQ) * 100 : 0;
  const fipiProgress = totalFIPI > 0 ? (progress.fipi_completed / totalFIPI) * 100 : 0;
  const overallProgress = (progress.mcq_completed + progress.fipi_completed) / (totalMCQ + totalFIPI) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Navigation Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Button 
              onClick={() => navigate('/ogemath-practice')}
              className="bg-gradient-to-r from-yellow-200 to-yellow-300 hover:from-yellow-300 hover:to-yellow-400 text-black shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              Назад
            </Button>
            <h1 className="text-xl font-bold text-purple-800">Домашнее задание</h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="pt-8 px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Congratulations Modal */}
          {showCongrats && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                className="bg-white rounded-lg p-8 text-center max-w-md mx-4"
              >
                <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold text-purple-800 mb-2">Поздравляем!</h2>
                <p className="text-gray-600 mb-6">
                  Вы успешно выполнили всё домашнее задание! Отличная работа! 🎉
                </p>
                <Button 
                  onClick={() => setShowCongrats(false)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Продолжить
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-purple-900 mb-4">
              Домашнее задание от ИИ
            </h1>
            <p className="text-lg text-purple-600">
              Персональные задания для улучшения ваших навыков
            </p>
          </div>

          {/* Overall Progress */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Общий прогресс
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={overallProgress} className="h-3" />
                <div className="text-center">
                  <span className="text-2xl font-bold text-purple-800">
                    {Math.round(overallProgress)}%
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {progress.mcq_completed + progress.fipi_completed} из {totalMCQ + totalFIPI} заданий выполнено
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MCQ Card */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  MCQ
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BookOpen className="w-6 h-6 text-green-600" />
                  Вопросы с выбором ответа
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Прогресс:</span>
                  <span className="font-bold text-green-600">
                    {progress.mcq_completed}/{totalMCQ}
                  </span>
                </div>
                <Progress value={mcqProgress} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span>Правильно: {progress.mcq_correct}</span>
                  <span>Точность: {totalMCQ > 0 ? Math.round((progress.mcq_correct / totalMCQ) * 100) : 0}%</span>
                </div>

                <Button
                  onClick={handleStartMCQ}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={totalMCQ === 0}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {progress.mcq_completed === totalMCQ ? 'Повторить MCQ' : 'Начать MCQ'}
                </Button>
              </CardContent>
            </Card>

            {/* FIPI Card */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  ФИПИ
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Star className="w-6 h-6 text-blue-600" />
                  Банк заданий ФИПИ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Прогресс:</span>
                  <span className="font-bold text-blue-600">
                    {progress.fipi_completed}/{totalFIPI}
                  </span>
                </div>
                <Progress value={fipiProgress} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span>Правильно: {progress.fipi_correct}</span>
                  <span>Точность: {totalFIPI > 0 ? Math.round((progress.fipi_correct / totalFIPI) * 100) : 0}%</span>
                </div>

                <Button
                  onClick={handleStartFIPI}
                  className="w-full relative"
                  variant="outline"
                  disabled
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Скоро будет доступно
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  ФИПИ задания находятся в разработке
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stats Summary */}
          {(progress.mcq_completed > 0 || progress.fipi_completed > 0) && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Статистика выполнения
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {progress.mcq_completed + progress.fipi_completed}
                    </div>
                    <div className="text-sm text-purple-700">Заданий решено</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {progress.mcq_correct + progress.fipi_correct}
                    </div>
                    <div className="text-sm text-green-700">Правильных ответов</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(((progress.mcq_correct + progress.fipi_correct) / Math.max(1, progress.mcq_completed + progress.fipi_completed)) * 100)}%
                    </div>
                    <div className="text-sm text-blue-700">Общая точность</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {totalMCQ + totalFIPI - progress.mcq_completed - progress.fipi_completed}
                    </div>
                    <div className="text-sm text-orange-700">Осталось</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Homework;