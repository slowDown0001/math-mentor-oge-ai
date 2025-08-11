
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Check, X, Eye, ArrowRight, Trophy, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useStreakTracking } from '@/hooks/useStreakTracking';
import MathRenderer from '@/components/MathRenderer';
import Header from '@/components/Header';
import { toast } from '@/hooks/use-toast';

interface Question {
  question_id: string;
  problem_text: string;
  answer: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  difficulty: number;
}

interface PracticeSession {
  questionsAttempted: number;
  correctAnswers: number;
  pointsEarned: number;
  startTime: Date;
}

const DailyPractice = () => {
  const { user } = useAuth();
  const { trackActivity } = useStreakTracking();
  const navigate = useNavigate();
  
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<PracticeSession>({
    questionsAttempted: 0,
    correctAnswers: 0,
    pointsEarned: 0,
    startTime: new Date()
  });
  const [showSummary, setShowSummary] = useState(false);

  const options = ['А', 'Б', 'В', 'Г'];

  useEffect(() => {
    if (user) {
      loadNextQuestion();
    }
  }, [user]);

  const loadNextQuestion = async () => {
    try {
      setLoading(true);
      setSelectedAnswer('');
      setShowResult(false);
      setShowSolution(false);

      // Get total count first
      const { count } = await supabase
        .from('mcq_with_options')
        .select('*', { count: 'exact', head: true })
        .not('problem_text', 'is', null)
        .not('option1', 'is', null)
        .not('option2', 'is', null)
        .not('option3', 'is', null)
        .not('option4', 'is', null);

      if (!count || count === 0) {
        toast({
          title: "Ошибка",
          description: "Вопросы не найдены",
          variant: "destructive"
        });
        return;
      }

      // Generate random offset
      const randomOffset = Math.floor(Math.random() * count);

      // Fetch one question with the random offset
      const { data, error } = await supabase
        .from('mcq_with_options')
        .select('question_id, problem_text, answer, option1, option2, option3, option4, difficulty')
        .not('problem_text', 'is', null)
        .not('option1', 'is', null)
        .not('option2', 'is', null)
        .not('option3', 'is', null)
        .not('option4', 'is', null)
        .range(randomOffset, randomOffset)
        .limit(1);

      if (error) {
        console.error('Error loading question:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить вопрос. Попробуйте еще раз.",
          variant: "destructive"
        });
        return;
      }

      if (data && data.length > 0) {
        setCurrentQuestion(data[0]);
      } else {
        toast({
          title: "Ошибка",
          description: "Вопрос не найден",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading question:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при загрузке вопроса",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (showResult) return;
    
    const answerLetter = options[optionIndex];
    setSelectedAnswer(answerLetter);
    
    // Check if answer is correct
    const correct = answerLetter === currentQuestion?.answer?.toUpperCase();
    setIsCorrect(correct);
    setShowResult(true);
    
    // Update session stats
    const newSession = {
      ...session,
      questionsAttempted: session.questionsAttempted + 1,
      correctAnswers: session.correctAnswers + (correct ? 1 : 0),
      pointsEarned: session.pointsEarned + (correct ? 10 : 0)
    };
    setSession(newSession);

    // Track activity for streak (2 minutes per question)
    if (correct) {
      trackActivity('problem', 2);
      // Trigger energy points animation in header
      if ((window as any).triggerEnergyPointsAnimation) {
        (window as any).triggerEnergyPointsAnimation(10);
      }
    }
  };

  const handleNextQuestion = () => {
    loadNextQuestion();
  };

  const handleStopPractice = () => {
    setShowSummary(true);
  };

  const handleFinishSession = () => {
    navigate('/dashboard');
  };

  const getOptionContent = (optionIndex: number) => {
    const question = currentQuestion;
    if (!question) return '';
    
    switch (optionIndex) {
      case 0: return question.option1;
      case 1: return question.option2;
      case 2: return question.option3;
      case 3: return question.option4;
      default: return '';
    }
  };

  const getOptionStyle = (optionIndex: number) => {
    if (!showResult) {
      return selectedAnswer === options[optionIndex] 
        ? 'border-primary bg-primary/10' 
        : 'border-border hover:border-primary/50 hover:bg-muted/50';
    }
    
    const answerLetter = options[optionIndex];
    const isSelected = selectedAnswer === answerLetter;
    const isCorrectAnswer = answerLetter === currentQuestion?.answer?.toUpperCase();
    
    if (isCorrectAnswer) {
      return 'border-green-500 bg-green-50 text-green-700';
    }
    
    if (isSelected && !isCorrect) {
      return 'border-red-500 bg-red-50 text-red-700';
    }
    
    return 'border-border opacity-50';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="pt-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg text-muted-foreground">Войдите в систему для доступа к ежедневной практике</p>
          </div>
        </div>
      </div>
    );
  }

  if (showSummary) {
    const accuracy = session.questionsAttempted > 0 
      ? Math.round((session.correctAnswers / session.questionsAttempted) * 100) 
      : 0;
    
    const sessionMinutes = Math.max(1, Math.round((new Date().getTime() - session.startTime.getTime()) / (1000 * 60)));

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="pt-20 px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-primary">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  Практика завершена!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{session.questionsAttempted}</div>
                    <div className="text-sm text-blue-700">Вопросов решено</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{session.correctAnswers}</div>
                    <div className="text-sm text-green-700">Правильных ответов</div>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">{accuracy}%</div>
                  <div className="text-sm text-purple-700">Точность</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{session.pointsEarned}</div>
                  <div className="text-sm text-orange-700">Баллов заработано</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-600">{sessionMinutes} мин</div>
                  <div className="text-sm text-gray-700">Время практики</div>
                </div>
                
                <Button onClick={handleFinishSession} className="w-full" size="lg">
                  Вернуться на главную
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="pt-20 px-4 pb-4">
        <div className="max-w-6xl mx-auto">
          {/* Main Content - Single Row Layout */}
          <div className="grid grid-cols-12 gap-4 h-[calc(100vh-120px)]">
            
            {/* Left Column - Stats */}
            <div className="col-span-2 space-y-3">
              <Card className="p-3 text-center">
                <div className="text-lg font-bold text-blue-600">{session.questionsAttempted}</div>
                <div className="text-xs text-muted-foreground">Вопросов</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-lg font-bold text-green-600">{session.correctAnswers}</div>
                <div className="text-xs text-muted-foreground">Правильно</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-lg font-bold text-purple-600">{session.pointsEarned}</div>
                <div className="text-xs text-muted-foreground">Баллов</div>
              </Card>
              <Button 
                onClick={handleStopPractice} 
                variant="outline" 
                size="sm"
                className="w-full bg-white hover:bg-red-50 border-red-200 text-red-600 hover:text-red-700"
              >
                <X className="w-3 h-3 mr-1" />
                Стоп
              </Button>
            </div>

            {/* Center Column - Question */}
            <div className="col-span-6">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-center">Ежедневная практика</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Загрузка...</p>
                      </div>
                    </div>
                  ) : currentQuestion ? (
                    <div className="flex-1 flex flex-col space-y-4">
                      {/* Question Text - Compact */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <MathRenderer 
                          text={currentQuestion.problem_text} 
                          className="text-base leading-snug"
                        />
                      </div>

                      {/* Result Animation - Compact */}
                      {showResult && (
                        <div className="text-center py-2">
                          {isCorrect ? (
                            <div className="flex items-center justify-center space-x-2">
                              <Check className="w-6 h-6 text-green-500" />
                              <p className="text-sm font-semibold text-green-600">Правильно! +10 баллов</p>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center space-x-2">
                              <X className="w-6 h-6 text-red-500" />
                              <p className="text-sm font-semibold text-red-600">Неправильно</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons - Compact */}
                      {showResult && (
                        <div className="flex justify-center space-x-2">
                          <Button
                            onClick={() => setShowSolution(!showSolution)}
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Решение
                          </Button>
                          <Button
                            onClick={handleNextQuestion}
                            size="sm"
                          >
                            <ArrowRight className="w-3 h-3 mr-1" />
                            Далее
                          </Button>
                        </div>
                      )}

                      {/* Solution Display - Compact */}
                      {showSolution && (
                        <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                          <h4 className="font-medium text-blue-800 text-sm mb-1">Решение:</h4>
                          <p className="text-blue-700 text-sm">
                            Правильный ответ: <strong>{currentQuestion.answer?.toUpperCase()}</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">Ошибка загрузки</p>
                        <Button onClick={loadNextQuestion} size="sm">Повторить</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Answer Options */}
            <div className="col-span-4">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-center">Варианты ответов</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  {currentQuestion && (
                    <div className="grid grid-cols-1 gap-2 h-full">
                      {options.map((letter, index) => (
                        <div
                          key={letter}
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${getOptionStyle(index)} hover:shadow-sm`}
                          onClick={() => handleAnswerSelect(index)}
                        >
                          <div className="flex items-start space-x-2">
                            <span className="font-bold text-sm flex-shrink-0">{letter})</span>
                            <MathRenderer 
                              text={getOptionContent(index)} 
                              className="flex-1 text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyPractice;
