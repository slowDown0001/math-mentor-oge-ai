import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BookOpen, Trophy, Target, Clock, ArrowRight, Check, X, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import MathRenderer from '@/components/MathRenderer';

interface HomeworkData {
  mcq_questions: string[];
  fipi_questions: string[];
  assigned_date?: string;
  due_date?: string;
}

interface Question {
  id: string;
  text: string;
  options?: string[];
  correct_answer?: string;
  problem_number?: number;
  solution_text?: string;
}

const Homework = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [homeworkData, setHomeworkData] = useState<HomeworkData | null>(null);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set());
  const [correctAnswers, setCorrectAnswers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionType, setQuestionType] = useState<'mcq' | 'frq'>('mcq');
  const [showCongrats, setShowCongrats] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    if (user) {
      loadHomeworkData();
    }
  }, [user]);

  useEffect(() => {
    if (homeworkData) {
      loadQuestions();
    }
  }, [homeworkData]);

  const loadHomeworkData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading homework:', error);
        setLoading(false);
        return;
      }

      if (data && (data as any).homework) {
        try {
          const parsedHomework = JSON.parse((data as any).homework);
          
          const transformedHomework = {
            mcq_questions: parsedHomework.MCQ || parsedHomework.mcq_questions || [],
            fipi_questions: parsedHomework.FIPI || parsedHomework.fipi_questions || [],
            assigned_date: parsedHomework.assigned_date,
            due_date: parsedHomework.due_date
          };
          
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

  const loadQuestions = async () => {
    if (!homeworkData) return;
    
    setLoadingQuestions(true);
    
    // Start with MCQ questions
    if (homeworkData.mcq_questions?.length > 0) {
      await loadMCQQuestions();
    } else if (homeworkData.fipi_questions?.length > 0) {
      setQuestionType('frq');
      await loadFRQQuestions();
    }
    
    setLoadingQuestions(false);
  };

  const loadMCQQuestions = async () => {
    if (!homeworkData?.mcq_questions?.length) return;

    try {
      const { data: mcqData, error } = await supabase
        .from('oge_math_skills_questions')
        .select('*')
        .in('question_id', homeworkData.mcq_questions);

      if (error) {
        console.error('Error loading MCQ questions:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить вопросы MCQ",
          variant: "destructive"
        });
        return;
      }

      const mcqQuestions: Question[] = mcqData?.map((q, index) => ({
        id: q.question_id,
        text: q.problem_text || '',
        options: [q.option1, q.option2, q.option3, q.option4].filter(Boolean),
        correct_answer: q.answer || '',
        solution_text: q.solution_text || '',
        problem_number: typeof q.problem_number_type === 'string' ? parseInt(q.problem_number_type) || index + 1 : q.problem_number_type || index + 1
      })) || [];

      setCurrentQuestions(mcqQuestions);
      setQuestionType('mcq');
      setCurrentQuestionIndex(0);
    } catch (error) {
      console.error('Error loading MCQ questions:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при загрузке вопросов",
        variant: "destructive"
      });
    }
  };

  const loadFRQQuestions = async () => {
    if (!homeworkData?.fipi_questions?.length) return;

    try {
      const { data: frqData, error } = await supabase
        .from('oge_math_fipi_bank')
        .select('*')
        .in('question_id', homeworkData.fipi_questions);

      if (error) {
        console.error('Error loading FRQ questions:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить задачи ФИПИ",
          variant: "destructive"
        });
        return;
      }

      const frqQuestions: Question[] = frqData?.map((q, index) => ({
        id: q.question_id,
        text: q.problem_text || '',
        correct_answer: q.answer || '',
        solution_text: q.solution_text || '',
        problem_number: q.problem_number_type || index + 1
      })) || [];

      setCurrentQuestions(frqQuestions);
      setQuestionType('frq');
      setCurrentQuestionIndex(0);
    } catch (error) {
      console.error('Error loading FRQ questions:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при загрузке задач",
        variant: "destructive"
      });
    }
  };

  const handleSubmitAnswer = async () => {
    const currentQuestion = currentQuestions[currentQuestionIndex];
    if (!currentQuestion || !user) return;

    const answer = questionType === 'mcq' ? selectedOption : userAnswer;
    if (!answer) {
      toast({
        title: "Ответ не выбран",
        description: "Пожалуйста, выберите или введите ответ",
        variant: "destructive"
      });
      return;
    }

    const correct = answer === currentQuestion.correct_answer;
    setIsCorrect(correct);
    setShowAnswer(true);

    setCompletedQuestions(prev => new Set([...prev, currentQuestion.id]));
    if (correct) {
      setCorrectAnswers(prev => new Set([...prev, currentQuestion.id]));
    }
  };

  const handleShowSolution = () => {
    setShowSolution(true);
    setIsCorrect(false);
    setShowAnswer(true);
    setCompletedQuestions(prev => new Set([...prev, currentQuestions[currentQuestionIndex].id]));
  };

  const handleNextQuestion = () => {
    setShowAnswer(false);
    setIsCorrect(null);
    setUserAnswer('');
    setSelectedOption(null);
    setShowSolution(false);

    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Move to next question type or show completion
      if (questionType === 'mcq' && homeworkData?.fipi_questions?.length > 0) {
        loadFRQQuestions();
      } else {
        // All questions completed
        triggerCongrats();
      }
    }
  };

  const triggerCongrats = () => {
    setShowCongrats(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => setShowCongrats(false), 5000);
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

  if (!homeworkData || (!homeworkData.mcq_questions?.length && !homeworkData.fipi_questions?.length)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
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

  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="pt-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Загрузка вопросов...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = currentQuestions[currentQuestionIndex];
  const totalMCQ = homeworkData.mcq_questions?.length || 0;
  const totalFRQ = homeworkData.fipi_questions?.length || 0;
  const currentProgress = ((completedQuestions.size) / (totalMCQ + totalFRQ)) * 100;

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
            <div className="w-24"></div>
          </div>
        </div>
      </div>

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

      <div className="pt-8 px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Header */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Прогресс выполнения
                <Badge variant="secondary" className={questionType === 'mcq' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                  {questionType === 'mcq' ? 'MCQ' : 'ФИПИ'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={currentProgress} className="h-3 mb-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Вопрос {currentQuestionIndex + 1} из {currentQuestions.length}</span>
                <span>{completedQuestions.size} из {totalMCQ + totalFRQ} выполнено</span>
              </div>
            </CardContent>
          </Card>

          {/* Question Card */}
          {currentQuestion && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  {questionType === 'mcq' ? 'Вопрос с выбором ответа' : 'Задача ФИПИ'}
                  {currentQuestion.problem_number && (
                    <Badge variant="outline" className="ml-2">
                      №{currentQuestion.problem_number}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <MathRenderer 
                  text={currentQuestion.text}
                  className="text-lg leading-relaxed"
                  compiler="mathjax"
                />

                {questionType === 'mcq' && currentQuestion.options ? (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => {
                      const cyrillicLetters = ['А', 'Б', 'В', 'Г'];
                      const cyrillicAnswer = cyrillicLetters[index];
                      return (
                        <Button
                          key={index}
                          variant={selectedOption === cyrillicAnswer ? "default" : "outline"}
                          className="w-full text-left justify-start h-auto p-4"
                          onClick={() => setSelectedOption(cyrillicAnswer)}
                          disabled={showAnswer}
                        >
                          <span className="font-bold mr-2">{cyrillicAnswer})</span>
                          <MathRenderer text={option} className="inline-block" compiler="mathjax" />
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ваш ответ:</label>
                    <Input
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Введите ответ..."
                      disabled={showAnswer}
                      className="text-lg"
                    />
                  </div>
                )}

                {showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border-2 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {isCorrect ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <X className="w-5 h-5 text-red-600" />
                      )}
                      <span className={`font-bold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                        {isCorrect ? 'Правильно!' : showSolution ? 'Показано решение' : 'Неправильно'}
                      </span>
                    </div>
                    {!isCorrect && !showSolution && (
                      <p className="text-gray-700">
                        Правильный ответ: <span className="font-bold">{currentQuestion.correct_answer}</span>
                      </p>
                    )}
                    {showSolution && currentQuestion.solution_text && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-bold text-blue-800 mb-2">Решение:</h4>
                        <MathRenderer text={currentQuestion.solution_text} compiler="mathjax" />
                      </div>
                    )}
                  </motion.div>
                )}

                <div className="flex gap-2">
                  {!showAnswer ? (
                    <>
                      <Button
                        onClick={handleSubmitAnswer}
                        className="bg-purple-600 hover:bg-purple-700"
                        disabled={questionType === 'mcq' ? !selectedOption : !userAnswer}
                      >
                        Проверить ответ
                      </Button>
                      <Button
                        onClick={handleShowSolution}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Показать решение
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={handleNextQuestion}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {currentQuestionIndex < currentQuestions.length - 1 || 
                         (questionType === 'mcq' && totalFRQ > 0) ? (
                          <>
                            Следующий вопрос
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        ) : (
                          'Завершить'
                        )}
                      </Button>
                      {!showSolution && (
                        <Button
                          onClick={handleShowSolution}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Показать решение
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Статистика
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {completedQuestions.size}
                  </div>
                  <div className="text-sm text-purple-700">Выполнено</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {correctAnswers.size}
                  </div>
                  <div className="text-sm text-green-700">Правильно</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {completedQuestions.size > 0 ? Math.round((correctAnswers.size / completedQuestions.size) * 100) : 0}%
                  </div>
                  <div className="text-sm text-blue-700">Точность</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {totalMCQ + totalFRQ - completedQuestions.size}
                  </div>
                  <div className="text-sm text-orange-700">Осталось</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Homework;