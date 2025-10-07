import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, X, ArrowLeft, Trophy, Target, RotateCcw, BookOpen, Eye, Sparkles } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useStreakTracking } from '@/hooks/useStreakTracking';
import MathRenderer from '@/components/MathRenderer';
import { toast } from '@/hooks/use-toast';
import { getQuestionsBySkills, OgeQuestion } from '@/services/ogeQuestionsService';
import { logTextbookActivity } from '@/utils/logTextbookActivity';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface OgeExerciseQuizProps {
  title: string;
  skills: number[];
  onBack: () => void;
  questionCount?: number;
  isModuleTest?: boolean;
  moduleTopics?: string[];
  courseId?: string;
  itemId?: string; // Add itemId prop for tracking
}

const OgeExerciseQuiz: React.FC<OgeExerciseQuizProps> = ({ 
  title, 
  skills, 
  onBack, 
  questionCount = 4,
  isModuleTest = false,
  moduleTopics = [],
  courseId = "1",
  itemId // Accept itemId prop
}) => {
  const { trackActivity } = useStreakTracking();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<OgeQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSolution, setShowSolution] = useState(false);
  const [viewedSolutionBeforeAnswer, setViewedSolutionBeforeAnswer] = useState(false);
  const [boostingSkills, setBoostingSkills] = useState(false);
  const solutionRef = useRef<HTMLDivElement>(null);
  
  // Track question start time for duration calculation
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null);

  const options = ['А', 'Б', 'В', 'Г'];

  useEffect(() => {
    loadQuestions();
  }, [skills]);

  // Start timing when question changes
  useEffect(() => {
    if (questions.length > 0 && !showResult) {
      setQuestionStartTime(new Date());
    }
  }, [currentQuestionIndex, questions, showResult]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const questionsData = await getQuestionsBySkills(skills, questionCount);
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить вопросы",
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
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || showResult) return;

    const currentQuestion = questions[currentQuestionIndex];
    // If user viewed solution before answering, mark as incorrect
    const isCorrect = viewedSolutionBeforeAnswer ? false : selectedAnswer === currentQuestion.answer?.toUpperCase();
    
    setAnswers(prev => [...prev, isCorrect]);
    setShowResult(true);

    // Calculate duration in seconds
    const duration = questionStartTime 
      ? Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000)
      : 0;

    // Log exercise progress
    const solvedCount = answers.length + 1;
    const correctCount = [...answers, isCorrect].filter(Boolean).length;
    
    // Determine activity type based on question count
    let activityType: "exercise" | "test" | "exam";
    if (questionCount === 10 || isModuleTest) {
      activityType = "exam";
    } else if (questionCount === 6) {
      activityType = "test";
    } else {
      activityType = "exercise";
    }
    
    logTextbookActivity({
      activity_type: activityType,
      activity: title,
      solved_count: solvedCount,
      correct_count: correctCount,
      total_questions: questionCount,
      skills_involved: skills.join(","),
      item_id: itemId || `exercise-${skills.join("-")}`
    });

    if (isCorrect) {
      trackActivity('problem', 2);
      if ((window as any).triggerEnergyPointsAnimation) {
        (window as any).triggerEnergyPointsAnimation(10);
      }
    }

    // Record to database if user is logged in
    if (user && currentQuestion.skills) {
      try {
        const { error } = await supabase.functions.invoke('process-mcq-skill-attempt', {
          body: {
            user_id: user.id,
            question_id: currentQuestion.question_id,
            skill_id: currentQuestion.skills,
            finished_or_not: true,
            is_correct: isCorrect,
            difficulty: currentQuestion.difficulty || 2,
            duration: duration,
            course_id: courseId
          }
        });

        if (error) {
          console.error('Error recording MCQ skill attempt:', error);
        } else {
          console.log('Successfully recorded MCQ skill attempt');
        }
      } catch (error) {
        console.error('Error calling process-mcq-skill-attempt:', error);
      }
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowResult(false);
      setShowSolution(false);
      setViewedSolutionBeforeAnswer(false); // Reset for next question
      setQuestionStartTime(new Date()); // Start timing for next question
    } else {
      setShowFinalResults(true);
      
      // If this is a module test and user passed (8+ correct answers), boost low mastery skills
      const correctCount = answers.filter(Boolean).length;
      if (isModuleTest && correctCount >= 8 && moduleTopics.length > 0 && user) {
        setBoostingSkills(true);
        try {
          console.log('Calling boost-low-mastery-skills function...');
          const { data, error } = await supabase.functions.invoke('boost-low-mastery-skills', {
            body: {
              user_id: user.id,
              topics: moduleTopics,
              course_id: courseId
            }
          });

          if (error) {
            console.error('Error boosting skills:', error);
          } else {
            console.log('Skills boost result:', data);
            if (data?.boosted_skills && data.boosted_skills.length > 0) {
              toast({
                title: "Прогресс обновлен! 🎉",
                description: `Улучшено понимание для ${data.boosted_skills.length} навыков!`,
              });
            }
          }
        } catch (error) {
          console.error('Error calling boost function:', error);
        } finally {
          setBoostingSkills(false);
        }
      }
    }
  };

  const handleRetry = () => {
    setShowFinalResults(false);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer('');
    setShowResult(false);
    setShowSolution(false);
    setViewedSolutionBeforeAnswer(false);
    setQuestionStartTime(new Date()); // Start timing for first question
    loadQuestions();
  };

  const getOptionContent = (optionIndex: number) => {
    const question = questions[currentQuestionIndex];
    if (!question) return '';
    
    switch (optionIndex) {
      case 0: return question.option1 || '';
      case 1: return question.option2 || '';
      case 2: return question.option3 || '';
      case 3: return question.option4 || '';
      default: return '';
    }
  };

  const handleShowSolution = () => {
    // If viewing solution before answering, immediately mark as wrong
    if (!showResult && !viewedSolutionBeforeAnswer) {
      setViewedSolutionBeforeAnswer(true);
      
      // Auto-submit as incorrect
      setAnswers(prev => [...prev, false]);
      setShowResult(true);
      
      // Log exercise progress
      const solvedCount = answers.length + 1;
      const correctCount = answers.filter(Boolean).length; // Don't count this one as correct
      
      // Determine activity type based on question count
      let activityType: "exercise" | "test" | "exam";
      if (questionCount === 10 || isModuleTest) {
        activityType = "exam";
      } else if (questionCount === 6) {
        activityType = "test";
      } else {
        activityType = "exercise";
      }
      
      logTextbookActivity({
        activity_type: activityType,
        activity: title,
        solved_count: solvedCount,
        correct_count: correctCount,
        total_questions: questionCount,
        skills_involved: skills.join(","),
        item_id: itemId || `exercise-${skills.join("-")}`
      });
    }
    
    setShowSolution(!showSolution);
    // Scroll to bottom of modal after state update
    if (!showSolution) {
      setTimeout(() => {
        const modal = document.querySelector('.max-h-\\[95vh\\]');
        if (modal) {
          modal.scrollTo({ 
            top: modal.scrollHeight, 
            behavior: 'smooth' 
          });
        }
      }, 100);
    }
  };

  const handleReadArticle = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion?.skills) {
      navigate(`/textbook?skill=${currentQuestion.skills}`);
    }
  };

  const getOptionStyle = (optionIndex: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    
    if (!showResult) {
      return selectedAnswer === options[optionIndex] 
        ? 'border border-yellow-400 bg-yellow-50' 
        : 'border border-gray-200 hover:border-gray-300 hover:bg-gray-50';
    }
    
    const answerLetter = options[optionIndex];
    const isSelected = selectedAnswer === answerLetter;
    const isCorrectAnswer = answerLetter === currentQuestion?.answer?.toUpperCase();
    
    if (isCorrectAnswer) {
      return 'border border-green-500 bg-green-50';
    }
    
    if (isSelected && !isCorrectAnswer) {
      return 'border border-red-500 bg-red-50';
    }
    
    return 'border border-gray-200 opacity-60 bg-gray-50';
  };

  const correctAnswers = answers.filter(Boolean).length;
  const score = answers.length > 0 ? Math.round((correctAnswers / answers.length) * 100) : 0;

  const getResultMessage = () => {
    if (correctAnswers < 2) {
      return {
        title: "Попробуйте еще раз!",
        message: "Вы можете лучше! Изучите материал еще раз и попробуйте снова.",
        icon: <RotateCcw className="w-5 h-5 text-white" />,
        color: "text-orange-600"
      };
    } else if (correctAnswers === 2) {
      return {
        title: "Неплохо!",
        message: "Хороший результат! Но есть куда расти.",
        icon: <Target className="w-5 h-5 text-white" />,
        color: "text-blue-600"
      };
    } else if (correctAnswers === 3) {
      return {
        title: "Отлично!",
        message: "Очень хороший результат! Продолжайте в том же духе.",
        icon: <Trophy className="w-5 h-5 text-white" />,
        color: "text-yellow-600"
      };
    } else {
      return {
        title: "Превосходно!",
        message: "Идеальный результат! Вы отлично освоили этот навык.",
        icon: <Trophy className="w-5 h-5 text-white" />,
        color: "text-green-600"
      };
    }
  };

  if (loading) {
    return (
      <Card className="shadow-lg border border-white/20 bg-white/95 mx-auto rounded-lg backdrop-blur-sm">
        <CardContent className="p-4 text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-yellow-500 mx-auto mb-2"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-sm font-semibold text-gray-700">
            загружаем вопросы...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="shadow-lg border border-white/20 bg-white/95 mx-auto rounded-lg backdrop-blur-sm">
        <CardContent className="p-4 text-center">
          <Target className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Вопросы не найдены
          </h2>
          <p className="text-gray-600 mb-3 text-sm">
            Для этого упражнения пока нет доступных вопросов
          </p>
          <Button onClick={onBack} className="bg-gradient-to-r from-yellow-500 to-emerald-500 hover:from-yellow-600 hover:to-emerald-600 text-white rounded-lg px-4 py-2 text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            назад
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-lg border border-white/20 bg-white/95 overflow-hidden mx-auto rounded-lg max-w-4xl backdrop-blur-sm">
        <CardHeader className="p-3 border-b border-black/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <CardTitle className="text-base font-bold bg-gradient-to-r from-yellow-500 to-emerald-500 bg-clip-text text-transparent">
                {title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <p className="text-gray-600 text-xs">вопрос {currentQuestionIndex + 1} из {questions.length}</p>
                {questions[currentQuestionIndex]?.skills && (
                  <span className="text-[10px] text-muted-foreground/40 font-mono">
                    #{questions[currentQuestionIndex].skills}
                  </span>
                )}
              </div>
            </div>
            <Button onClick={onBack} size="sm" variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg px-2 py-1 text-xs">
              <ArrowLeft className="w-3 h-3 mr-1" />
              назад
            </Button>
          </div>
          <div className="relative">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-500 to-emerald-500 rounded-full transition-all duration-500" 
                   style={{width: `${(currentQuestionIndex / questions.length) * 100}%`}} />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-2 p-3">
              {/* Question */}
              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                <MathRenderer 
                  text={questions[currentQuestionIndex]?.problem_text || ''} 
                  className="text-sm text-gray-900"
                  compiler="mathjax"
                />
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-1 gap-1.5">
                {options.map((letter, index) => (
                  <div
                    key={letter}
                    className={`p-2 rounded-lg cursor-pointer transition-all duration-200 ${getOptionStyle(index)}`}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <div className="flex items-start space-x-2">
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0
                        ${!showResult && selectedAnswer === letter 
                          ? 'bg-gradient-to-r from-yellow-500 to-emerald-500 text-white' 
                          : showResult && letter === questions[currentQuestionIndex]?.answer?.toUpperCase()
                          ? 'bg-green-600 text-white'
                          : showResult && selectedAnswer === letter && letter !== questions[currentQuestionIndex]?.answer?.toUpperCase()
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                        }
                      `}>
                        {letter}
                      </div>
                      <MathRenderer 
                        text={getOptionContent(index)} 
                        className="flex-1 text-xs"
                        compiler="mathjax"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Result */}
              {showResult && (
                <div className="py-1">
                  {selectedAnswer === questions[currentQuestionIndex]?.answer?.toUpperCase() ? (
                    <div className="flex items-center justify-center space-x-2 bg-green-50 rounded-lg p-1.5 border border-green-200">
                      <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                      <p className="text-xs font-semibold text-green-700">Правильно</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2 bg-red-50 rounded-lg p-1.5 border border-red-200">
                      <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                        <X className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                      <p className="text-xs font-semibold text-red-700">Неверно</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Solution Display */}
              {showSolution && questions[currentQuestionIndex]?.solution_text && (
                <div 
                  ref={solutionRef}
                  className="p-2.5 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-gray-600" />
                    <h4 className="font-semibold text-gray-900 text-xs">Решение</h4>
                  </div>
                  {viewedSolutionBeforeAnswer && !showResult && (
                    <div className="mb-1.5 p-1.5 bg-orange-50 border border-orange-200 rounded">
                      <p className="text-orange-700 text-[10px]">⚠️ Просмотр решения до ответа засчитается как неверный ответ</p>
                    </div>
                  )}
                  <div className="space-y-1 bg-white rounded p-1.5">
                    {questions[currentQuestionIndex].solution_text.split('\\n').map((line: string, index: number) => (
                      <div key={index} className="text-left">
                        <MathRenderer 
                          text={line.trim()} 
                          className="text-gray-900 text-[11px] leading-relaxed"
                          compiler="mathjax"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center gap-2">
                {/* Left Side Buttons */}
                <div className="flex gap-1.5">
                  {/* Solution Button */}
                  {questions[currentQuestionIndex]?.solution_text && (
                    <Button
                      size="sm"
                      onClick={handleShowSolution}
                      variant="outline"
                      className="text-gray-600 border-gray-300 hover:bg-gray-50 rounded px-2 py-1 text-[11px] h-auto"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      {showSolution ? 'скрыть' : 'решение'}
                    </Button>
                  )}
                  
                  {/* Read Article Button */}
                  {questions[currentQuestionIndex]?.skills && (
                    <Button
                      size="sm"
                      onClick={handleReadArticle}
                      variant="outline"
                      className="text-gray-600 border-gray-300 hover:bg-gray-50 rounded px-2 py-1 text-[11px] h-auto"
                    >
                      <BookOpen className="w-3 h-3 mr-1" />
                      статья
                    </Button>
                  )}
                </div>
                
                {/* Submit/Next Button */}
                {!showResult ? (
                  <Button
                    size="sm"
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer}
                    className="bg-gradient-to-r from-yellow-500 to-emerald-500 hover:from-yellow-600 hover:to-emerald-600 text-white rounded px-3 py-1 text-xs h-auto disabled:opacity-50"
                  >
                    ответить
                  </Button>
                ) : (
                  <Button 
                    size="sm"
                    onClick={handleNextQuestion} 
                    className="bg-green-600 hover:bg-green-700 text-white rounded px-3 py-1 text-xs h-auto"
                  >
                    {currentQuestionIndex < questions.length - 1 ? 'дальше →' : 'финиш'}
                  </Button>
                )}
              </div>
            </CardContent>
      </Card>

      {/* Final Results Dialog */}
      <AlertDialog open={showFinalResults} onOpenChange={setShowFinalResults}>
        <AlertDialogContent className="sm:max-w-md border border-white/20 rounded-lg bg-white/95 backdrop-blur-sm">
          <AlertDialogHeader className="text-center">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-emerald-500 rounded-full flex items-center justify-center">
                {getResultMessage().icon}
              </div>
            </div>
            <AlertDialogTitle className={`text-xl font-bold ${getResultMessage().color}`}>
              {getResultMessage().title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600">
              {getResultMessage().message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="text-center space-y-2 my-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{correctAnswers}</div>
                <div className="text-xs font-medium text-gray-600">из {questions.length}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{score}%</div>
                <div className="text-xs font-medium text-gray-600">точность</div>
              </div>
            </div>
          </div>

          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            {correctAnswers < 3 && (
              <AlertDialogAction
                onClick={handleRetry}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-4 py-2 text-sm"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                попробовать еще раз
              </AlertDialogAction>
            )}
            <AlertDialogAction 
              onClick={() => {
                // Store exercise completion data for AI feedback
                const completionData = {
                  activityName: title,
                  activityType: questionCount === 10 || isModuleTest ? "exam" : questionCount === 6 ? "test" : "exercise",
                  totalQuestions: questions.length,
                  questionsCorrect: correctAnswers,
                  accuracy: score,
                  skills: skills,
                  itemId: itemId || `exercise-${skills.join("-")}`,
                  completedAt: new Date().toISOString(),
                  timestamp: Date.now()
                };
                localStorage.setItem('textbookExerciseCompletionData', JSON.stringify(completionData));
                
                navigate('/ogemath');
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 text-sm"
            >
              💬 к ИИ ассистенту
            </AlertDialogAction>
            <AlertDialogAction 
              onClick={onBack}
              className="bg-gradient-to-r from-yellow-500 to-emerald-500 hover:from-yellow-600 hover:to-emerald-600 text-white rounded-lg px-4 py-2 text-sm"
            >
              ← назад к модулю
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default OgeExerciseQuiz;
