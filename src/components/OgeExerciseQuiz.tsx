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
        ? 'border-purple-500 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 text-purple-900 shadow-2xl transform scale-105 border-4' 
        : 'border-purple-300 hover:border-pink-400 hover:bg-gradient-to-br hover:from-pink-100 hover:to-purple-100 hover:shadow-xl hover:scale-102 border-3';
    }
    
    const answerLetter = options[optionIndex];
    const isSelected = selectedAnswer === answerLetter;
    const isCorrectAnswer = answerLetter === currentQuestion?.answer?.toUpperCase();
    
    if (isCorrectAnswer) {
      return 'border-green-500 bg-gradient-to-br from-green-200 via-emerald-200 to-lime-200 text-green-900 shadow-2xl border-4 animate-pulse';
    }
    
    if (isSelected && !isCorrectAnswer) {
      return 'border-red-500 bg-gradient-to-br from-red-200 via-pink-200 to-orange-200 text-red-900 shadow-2xl border-4';
    }
    
    return 'border-gray-300 opacity-50 bg-gray-100';
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
      <Card className="shadow-2xl border-4 border-purple-400 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 backdrop-blur-lg mx-auto rounded-3xl">
        <CardContent className="p-8 text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-300 border-t-purple-600 mx-auto mb-4"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-purple-600 animate-pulse" />
          </div>
          <p className="text-lg font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
            ✨ загружаем вопросы...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="shadow-2xl border-4 border-orange-400 bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 backdrop-blur-lg mx-auto rounded-3xl">
        <CardContent className="p-8 text-center">
          <Target className="w-16 h-16 text-orange-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-black text-orange-600 mb-2">
            😅 упс! вопросы не найдены
          </h2>
          <p className="text-orange-700 mb-4 text-base font-medium">
            для этого упражнения пока нет доступных вопросов
          </p>
          <Button onClick={onBack} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-full px-6 py-3 shadow-lg hover:scale-105 transition-transform">
            <ArrowLeft className="w-5 h-5 mr-2" />
            назад
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-2xl border-4 border-purple-400 bg-white backdrop-blur-lg overflow-hidden mx-auto rounded-3xl">
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-1.5">
          <div className="bg-white rounded-2xl">
            <CardHeader className="bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    🔥 {title}
                  </CardTitle>
                  <p className="text-purple-700 font-bold text-base mt-1">вопрос {currentQuestionIndex + 1} из {questions.length} 💪</p>
                </div>
                <Button onClick={onBack} className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold rounded-full px-4 py-2 shadow-lg hover:scale-105 transition-transform">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  назад
                </Button>
              </div>
              <div className="relative">
                <div className="h-3 bg-purple-200 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full transition-all duration-500 shadow-lg" 
                       style={{width: `${(currentQuestionIndex / questions.length) * 100}%`}} />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-5 p-6">
              {/* Question */}
              <div className="p-5 bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 rounded-2xl border-4 border-purple-300 shadow-lg">
                <MathRenderer 
                  text={questions[currentQuestionIndex]?.problem_text || ''} 
                  className="text-lg font-bold text-purple-900"
                  compiler="mathjax"
                />
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-1 gap-4">
                {options.map((letter, index) => (
                  <div
                    key={letter}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 ${getOptionStyle(index)}`}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-black text-base flex-shrink-0 shadow-lg
                        ${!showResult && selectedAnswer === letter 
                          ? 'bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 text-white' 
                          : showResult && letter === questions[currentQuestionIndex]?.answer?.toUpperCase()
                          ? 'bg-gradient-to-br from-green-400 to-lime-400 text-white animate-bounce'
                          : showResult && selectedAnswer === letter && letter !== questions[currentQuestionIndex]?.answer?.toUpperCase()
                          ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white'
                          : 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700'
                        }
                      `}>
                        {letter}
                      </div>
                      <MathRenderer 
                        text={getOptionContent(index)} 
                        className="flex-1 text-base font-bold"
                        compiler="mathjax"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Result */}
              {showResult && (
                <div className="text-center py-6">
                  {selectedAnswer === questions[currentQuestionIndex]?.answer?.toUpperCase() ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-3 bg-gradient-to-r from-green-200 to-lime-200 rounded-2xl p-4 border-4 border-green-400 shadow-lg">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-lime-400 rounded-full flex items-center justify-center animate-bounce shadow-xl">
                          <Check className="w-6 h-6 text-white" strokeWidth={4} />
                        </div>
                        <div>
                          <p className="text-2xl font-black text-green-700">ПРАВИЛЬНО! 🎉</p>
                          <p className="text-green-600 text-lg font-bold">ты огонь! 🔥</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-3 bg-gradient-to-r from-red-200 to-orange-200 rounded-2xl p-4 border-4 border-red-400 shadow-lg">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-orange-400 rounded-full flex items-center justify-center shadow-xl">
                          <X className="w-6 h-6 text-white" strokeWidth={4} />
                        </div>
                        <div>
                          <p className="text-2xl font-black text-red-700">упс! 😅</p>
                          <p className="text-red-600 text-lg font-bold">не переживай, попробуй еще! 💪</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Solution Display */}
                  {showSolution && questions[currentQuestionIndex]?.solution_text && (
                    <div 
                      ref={solutionRef}
                      className="mt-4 p-5 bg-gradient-to-br from-purple-200 via-blue-200 to-pink-200 rounded-2xl border-4 border-purple-400 shadow-xl"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <BookOpen className="w-6 h-6 text-purple-700" />
                        <h4 className="font-black text-purple-900 text-lg">💡 Решение:</h4>
                      </div>
                      <div className="space-y-3 bg-white/50 backdrop-blur-sm rounded-xl p-4">
                        {questions[currentQuestionIndex].solution_text.split('\\n').map((line: string, index: number) => (
                          <div key={index} className="text-left">
                            <MathRenderer 
                              text={line.trim()} 
                              className="text-purple-900 text-base leading-relaxed font-semibold"
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
              <div className="flex justify-between items-center space-x-4 pt-2">
                {/* Solution Button - Left Side */}
                {questions[currentQuestionIndex]?.solution_text && showResult && (
                  <Button
                    onClick={handleShowSolution}
                    className="bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-full px-6 py-3 shadow-lg hover:scale-105 transition-transform border-3 border-white"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    {showSolution ? '👀 скрыть' : '💡 решение'}
                  </Button>
                )}
                
                {/* Empty div to push Next button to the right when no solution button */}
                {(!questions[currentQuestionIndex]?.solution_text || !showResult) && <div />}
                
                {/* Submit/Next Button - Right Side */}
                {!showResult ? (
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer}
                    className="px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white font-black text-lg rounded-full shadow-2xl transform hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-4 border-white"
                  >
                    ✨ ответить
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNextQuestion} 
                    className="px-8 py-4 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 hover:from-green-500 hover:to-purple-500 text-white font-black text-lg rounded-full shadow-2xl transform hover:scale-110 transition-all duration-200 border-4 border-white"
                  >
                    {currentQuestionIndex < questions.length - 1 ? '➡️ дальше' : '🏁 финиш'}
                  </Button>
                )}
              </div>
            </CardContent>
          </div>
        </div>
      </Card>

      {/* Final Results Dialog */}
      <AlertDialog open={showFinalResults} onOpenChange={setShowFinalResults}>
        <AlertDialogContent className="sm:max-w-md border-4 border-purple-400 rounded-3xl bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
          <AlertDialogHeader className="text-center">
            <div className="flex justify-center mb-6 animate-bounce">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 rounded-full flex items-center justify-center shadow-2xl">
                {getResultMessage().icon}
              </div>
            </div>
            <AlertDialogTitle className={`text-3xl font-black ${getResultMessage().color}`}>
              {getResultMessage().title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg font-bold text-purple-700">
              {getResultMessage().message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="text-center space-y-4 my-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-2xl border-4 border-blue-400 shadow-lg">
                <div className="text-4xl font-black text-blue-700">{correctAnswers}</div>
                <div className="text-base font-bold text-blue-800">из {questions.length} 🎯</div>
              </div>
              <div className="p-5 bg-gradient-to-br from-purple-200 to-pink-200 rounded-2xl border-4 border-purple-400 shadow-lg">
                <div className="text-4xl font-black text-purple-700">{score}%</div>
                <div className="text-base font-bold text-purple-800">точность 💯</div>
              </div>
            </div>
          </div>

          <AlertDialogFooter className="flex-col sm:flex-row gap-3">
            {correctAnswers < 3 && (
              <AlertDialogAction
                onClick={handleRetry}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-full px-6 py-3 shadow-lg hover:scale-105 transition-transform"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                🔄 попробовать еще раз
              </AlertDialogAction>
            )}
            <AlertDialogAction 
              onClick={onBack}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-full px-6 py-3 shadow-lg hover:scale-105 transition-transform"
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