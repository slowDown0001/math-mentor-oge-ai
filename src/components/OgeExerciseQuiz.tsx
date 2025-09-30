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
}

const OgeExerciseQuiz: React.FC<OgeExerciseQuizProps> = ({ 
  title, 
  skills, 
  onBack, 
  questionCount = 4,
  isModuleTest = false,
  moduleTopics = [],
  courseId = "1"
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

  const options = ['А', 'Б', 'В', 'Г'];

  useEffect(() => {
    loadQuestions();
  }, [skills]);

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

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || showResult) return;

    const currentQuestion = questions[currentQuestionIndex];
    // If user viewed solution before answering, mark as incorrect
    const isCorrect = viewedSolutionBeforeAnswer ? false : selectedAnswer === currentQuestion.answer?.toUpperCase();
    
    setAnswers(prev => [...prev, isCorrect]);
    setShowResult(true);

    // Log exercise progress
    const solvedCount = answers.length + 1;
    const correctCount = [...answers, isCorrect].filter(Boolean).length;
    logTextbookActivity({
      activity_type: "exercise",
      activity: title,
      solved_count: solvedCount,
      correct_count: correctCount,
      total_questions: questionCount,
      skills_involved: skills.join(","),
      item_id: `exercise-${skills.join("-")}`
    });

    if (isCorrect) {
      trackActivity('problem', 2);
      if ((window as any).triggerEnergyPointsAnimation) {
        (window as any).triggerEnergyPointsAnimation(10);
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
      logTextbookActivity({
        activity_type: "exercise",
        activity: title,
        solved_count: solvedCount,
        correct_count: correctCount,
        total_questions: questionCount,
        skills_involved: skills.join(","),
        item_id: `exercise-${skills.join("-")}`
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
        ? 'border-2 border-purple-500 bg-purple-50' 
        : 'border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50';
    }
    
    const answerLetter = options[optionIndex];
    const isSelected = selectedAnswer === answerLetter;
    const isCorrectAnswer = answerLetter === currentQuestion?.answer?.toUpperCase();
    
    if (isCorrectAnswer) {
      return 'border-2 border-green-500 bg-green-50';
    }
    
    if (isSelected && !isCorrectAnswer) {
      return 'border-2 border-red-500 bg-red-50';
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
      <Card className="shadow-lg border-2 border-purple-300 bg-white mx-auto rounded-xl">
        <CardContent className="p-4 text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-300 border-t-purple-600 mx-auto mb-2"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-purple-600 animate-pulse" />
          </div>
          <p className="text-sm font-semibold text-purple-600">
            загружаем вопросы...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="shadow-lg border-2 border-orange-300 bg-white mx-auto rounded-xl">
        <CardContent className="p-4 text-center">
          <Target className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-orange-600 mb-1">
            упс! вопросы не найдены
          </h2>
          <p className="text-orange-700 mb-3 text-sm">
            для этого упражнения пока нет доступных вопросов
          </p>
          <Button onClick={onBack} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg px-4 py-2 text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            назад
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-lg border-2 border-purple-300 bg-white overflow-hidden mx-auto rounded-xl max-w-4xl">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <CardTitle className="text-base font-bold text-purple-900">
                {title}
              </CardTitle>
              <p className="text-purple-600 text-xs mt-0.5">вопрос {currentQuestionIndex + 1} из {questions.length}</p>
            </div>
            <Button onClick={onBack} size="sm" variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded-lg px-3 py-1.5 text-sm">
              <ArrowLeft className="w-3 h-3 mr-1" />
              назад
            </Button>
          </div>
          <div className="relative">
            <div className="h-1.5 bg-purple-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full transition-all duration-500" 
                   style={{width: `${(currentQuestionIndex / questions.length) * 100}%`}} />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 p-4">
              {/* Question */}
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <MathRenderer 
                  text={questions[currentQuestionIndex]?.problem_text || ''} 
                  className="text-sm font-semibold text-purple-900"
                  compiler="mathjax"
                />
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-1 gap-2">
                {options.map((letter, index) => (
                  <div
                    key={letter}
                    className={`p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${getOptionStyle(index)}`}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <div className="flex items-start space-x-2">
                      <div className={`
                        w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0
                        ${!showResult && selectedAnswer === letter 
                          ? 'bg-purple-500 text-white' 
                          : showResult && letter === questions[currentQuestionIndex]?.answer?.toUpperCase()
                          ? 'bg-green-500 text-white'
                          : showResult && selectedAnswer === letter && letter !== questions[currentQuestionIndex]?.answer?.toUpperCase()
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                        }
                      `}>
                        {letter}
                      </div>
                      <MathRenderer 
                        text={getOptionContent(index)} 
                        className="flex-1 text-sm font-medium"
                        compiler="mathjax"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Result */}
              {showResult && (
                <div className="text-center py-2">
                  {selectedAnswer === questions[currentQuestionIndex]?.answer?.toUpperCase() ? (
                    <div className="flex items-center justify-center space-x-2 bg-green-50 rounded-lg p-2 border border-green-300">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                      <p className="text-sm font-bold text-green-700">Правильно!</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2 bg-red-50 rounded-lg p-2 border border-red-300">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <X className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                      <p className="text-sm font-bold text-red-700">Неверно</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Solution Display - Can be viewed before or after answering */}
              {showSolution && questions[currentQuestionIndex]?.solution_text && (
                <div 
                  ref={solutionRef}
                  className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <h4 className="font-bold text-purple-900 text-sm">Решение:</h4>
                  </div>
                  {viewedSolutionBeforeAnswer && !showResult && (
                    <div className="mb-2 p-2 bg-orange-50 border border-orange-300 rounded-lg">
                      <p className="text-orange-700 font-medium text-xs">⚠️ Внимание: просмотр решения до ответа засчитается как неверный ответ</p>
                    </div>
                  )}
                  <div className="space-y-2 bg-white rounded-lg p-2">
                    {questions[currentQuestionIndex].solution_text.split('\\n').map((line: string, index: number) => (
                      <div key={index} className="text-left">
                        <MathRenderer 
                          text={line.trim()} 
                          className="text-purple-900 text-xs leading-relaxed"
                          compiler="mathjax"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons - Side by Side */}
              <div className="flex justify-between items-center gap-2 pt-1">
                {/* Left Side Buttons */}
                <div className="flex gap-2">
                  {/* Solution Button - Always visible if solution exists */}
                  {questions[currentQuestionIndex]?.solution_text && (
                    <Button
                      size="sm"
                      onClick={handleShowSolution}
                      variant="outline"
                      className="text-purple-600 border-purple-300 hover:bg-purple-50 rounded-lg px-3 py-1.5 text-xs"
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
                      className="text-blue-600 border-blue-300 hover:bg-blue-50 rounded-lg px-3 py-1.5 text-xs"
                    >
                      <BookOpen className="w-3 h-3 mr-1" />
                      статья
                    </Button>
                  )}
                </div>
                
                {/* Submit/Next Button - Right Side */}
                {!showResult ? (
                  <Button
                    size="sm"
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-1.5 text-sm disabled:opacity-50"
                  >
                    ответить
                  </Button>
                ) : (
                  <Button 
                    size="sm"
                    onClick={handleNextQuestion} 
                    className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-1.5 text-sm"
                  >
                    {currentQuestionIndex < questions.length - 1 ? 'дальше →' : 'финиш'}
                  </Button>
                )}
              </div>
            </CardContent>
      </Card>

      {/* Final Results Dialog */}
      <AlertDialog open={showFinalResults} onOpenChange={setShowFinalResults}>
        <AlertDialogContent className="sm:max-w-md border-2 border-purple-300 rounded-xl bg-white">
          <AlertDialogHeader className="text-center">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
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
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">{correctAnswers}</div>
                <div className="text-xs font-medium text-blue-600">из {questions.length}</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-700">{score}%</div>
                <div className="text-xs font-medium text-purple-600">точность</div>
              </div>
            </div>
          </div>

          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            {correctAnswers < 3 && (
              <AlertDialogAction
                onClick={handleRetry}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg px-4 py-2 text-sm"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                попробовать еще раз
              </AlertDialogAction>
            )}
            <AlertDialogAction 
              onClick={onBack}
              className="bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg px-4 py-2 text-sm"
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