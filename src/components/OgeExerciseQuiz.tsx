import React, { useState, useEffect, useRef } from 'react';
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
  
  const [questions, setQuestions] = useState<OgeQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSolution, setShowSolution] = useState(false);
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
    const isCorrect = selectedAnswer === currentQuestion.answer?.toUpperCase();
    
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
      setShowSolution(false); // Reset solution visibility
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

  const getOptionStyle = (optionIndex: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    
    if (!showResult) {
      return selectedAnswer === options[optionIndex] 
        ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-lg transform scale-105' 
        : 'border-gray-200 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md';
    }
    
    const answerLetter = options[optionIndex];
    const isSelected = selectedAnswer === answerLetter;
    const isCorrectAnswer = answerLetter === currentQuestion?.answer?.toUpperCase();
    
    if (isCorrectAnswer) {
      return 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 shadow-lg';
    }
    
    if (isSelected && !isCorrectAnswer) {
      return 'border-red-500 bg-gradient-to-r from-red-50 to-pink-50 text-red-700 shadow-lg';
    }
    
    return 'border-gray-200 opacity-60 bg-gray-50';
  };

  const correctAnswers = answers.filter(Boolean).length;
  const score = answers.length > 0 ? Math.round((correctAnswers / answers.length) * 100) : 0;

  const getResultMessage = () => {
    if (correctAnswers < 2) {
      return {
        title: "Попробуйте еще раз!",
        message: "Вы можете лучше! Изучите материал еще раз и попробуйте снова.",
        icon: <RotateCcw className="w-8 h-8 text-orange-500" />,
        color: "text-orange-600"
      };
    } else if (correctAnswers === 2) {
      return {
        title: "Неплохо!",
        message: "Хороший результат! Но есть куда расти.",
        icon: <Target className="w-8 h-8 text-blue-500" />,
        color: "text-blue-600"
      };
    } else if (correctAnswers === 3) {
      return {
        title: "Отлично!",
        message: "Очень хороший результат! Продолжайте в том же духе.",
        icon: <Trophy className="w-8 h-8 text-yellow-500" />,
        color: "text-yellow-600"
      };
    } else {
      return {
        title: "Превосходно!",
        message: "Идеальный результат! Вы отлично освоили этот навык.",
        icon: <Trophy className="w-8 h-8 text-green-500" />,
        color: "text-green-600"
      };
    }
  };

  if (loading) {
    return (
      <Card className="shadow-2xl border-0 bg-white backdrop-blur-lg mx-auto">
        <CardContent className="p-8 text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
          </div>
          <p className="text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Загружаем вопросы...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="shadow-2xl border-0 bg-white backdrop-blur-lg mx-auto">
        <CardContent className="p-8 text-center">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Вопросы не найдены
          </h2>
          <p className="text-gray-600 mb-4 text-sm">
            К сожалению, для этого упражнения пока нет доступных вопросов.
          </p>
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-2xl border-0 bg-white backdrop-blur-lg overflow-hidden mx-auto">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-1">
          <div className="bg-white rounded-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    🎯 {title}
                  </CardTitle>
                  <p className="text-gray-600 font-medium text-sm">Вопрос {currentQuestionIndex + 1} из {questions.length}</p>
                </div>
                <Button onClick={onBack} variant="outline" size="sm" className="hover:bg-purple-50">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Назад
                </Button>
              </div>
              <Progress value={(currentQuestionIndex / questions.length) * 100} className="w-full h-2 bg-gray-200">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" 
                     style={{width: `${(currentQuestionIndex / questions.length) * 100}%`}} />
              </Progress>
            </CardHeader>
            
            <CardContent className="space-y-4 p-4">
              {/* Question */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <MathRenderer 
                  text={questions[currentQuestionIndex]?.problem_text || ''} 
                  className="text-base font-medium"
                  compiler="mathjax"
                />
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-1 gap-3">
                {options.map((letter, index) => (
                  <div
                    key={letter}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 ${getOptionStyle(index)}`}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0
                        ${!showResult && selectedAnswer === letter 
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md' 
                          : showResult && letter === questions[currentQuestionIndex]?.answer?.toUpperCase()
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                          : showResult && selectedAnswer === letter && letter !== questions[currentQuestionIndex]?.answer?.toUpperCase()
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600'
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
                <div className="text-center py-4">
                  {selectedAnswer === questions[currentQuestionIndex]?.answer?.toUpperCase() ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-600">Правильно!</p>
                          <p className="text-green-500 text-sm">Отличная работа! 🎉</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center">
                          <X className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-red-600">Неправильно</p>
                          <p className="text-red-500 text-sm">Не расстраивайтесь! 💪</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Solution Display */}
                  {showSolution && questions[currentQuestionIndex]?.solution_text && (
                    <div 
                      ref={solutionRef}
                      className="mt-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-4 w-4 text-purple-600" />
                        <h4 className="font-bold text-purple-700 text-sm">Решение:</h4>
                      </div>
                      <div className="space-y-2">
                        {questions[currentQuestionIndex].solution_text.split('\\n').map((line: string, index: number) => (
                          <div key={index} className="text-left">
                            <MathRenderer 
                              text={line.trim()} 
                              className="text-gray-700 text-sm leading-relaxed"
                              compiler="mathjax"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons - Side by Side */}
              <div className="flex justify-between items-center space-x-3">
                {/* Solution Button - Left Side */}
                {questions[currentQuestionIndex]?.solution_text && showResult && (
                  <Button
                    onClick={handleShowSolution}
                    variant="outline"
                    size="sm"
                    className="bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border-purple-200"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showSolution ? 'Скрыть' : 'Решение'}
                  </Button>
                )}
                
                {/* Empty div to push Next button to the right when no solution button */}
                {(!questions[currentQuestionIndex]?.solution_text || !showResult) && <div />}
                
                {/* Submit/Next Button - Right Side */}
                {!showResult ? (
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md transform hover:scale-105 transition-all duration-200"
                  >
                    ✨ Ответить
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNextQuestion} 
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md transform hover:scale-105 transition-all duration-200"
                  >
                    {currentQuestionIndex < questions.length - 1 ? '➡️ Далее' : '🏁 Завершить'}
                  </Button>
                )}
              </div>
            </CardContent>
          </div>
        </div>
      </Card>

      {/* Final Results Dialog */}
      <AlertDialog open={showFinalResults} onOpenChange={setShowFinalResults}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getResultMessage().icon}
            </div>
            <AlertDialogTitle className={`text-2xl ${getResultMessage().color}`}>
              {getResultMessage().title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {getResultMessage().message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="text-center space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{correctAnswers}</div>
                <div className="text-sm text-blue-700">из {questions.length}</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{score}%</div>
                <div className="text-sm text-purple-700">точность</div>
              </div>
            </div>
          </div>

          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            {correctAnswers < 3 && (
              <AlertDialogAction
                onClick={handleRetry}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Попробовать еще раз
              </AlertDialogAction>
            )}
            <AlertDialogAction onClick={onBack}>
              Назад к модулю
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default OgeExerciseQuiz;