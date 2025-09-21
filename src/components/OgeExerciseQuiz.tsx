import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, X, ArrowLeft, Trophy, Target, RotateCcw } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useStreakTracking } from '@/hooks/useStreakTracking';
import MathRenderer from '@/components/MathRenderer';
import { toast } from '@/hooks/use-toast';
import { getQuestionsBySkills, OgeQuestion } from '@/services/ogeQuestionsService';

interface OgeExerciseQuizProps {
  title: string;
  skills: number[];
  onBack: () => void;
}

const OgeExerciseQuiz: React.FC<OgeExerciseQuizProps> = ({ title, skills, onBack }) => {
  const { trackActivity } = useStreakTracking();
  
  const [questions, setQuestions] = useState<OgeQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [loading, setLoading] = useState(true);

  const options = ['А', 'Б', 'В', 'Г'];

  useEffect(() => {
    loadQuestions();
  }, [skills]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const questionsData = await getQuestionsBySkills(skills, 4);
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

    if (isCorrect) {
      trackActivity('problem', 2);
      if ((window as any).triggerEnergyPointsAnimation) {
        (window as any).triggerEnergyPointsAnimation(10);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowResult(false);
    } else {
      setShowFinalResults(true);
    }
  };

  const handleRetry = () => {
    setShowFinalResults(false);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer('');
    setShowResult(false);
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

  const getOptionStyle = (optionIndex: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    
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
    
    if (isSelected && !isCorrectAnswer) {
      return 'border-red-500 bg-red-50 text-red-700';
    }
    
    return 'border-border opacity-50';
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
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Загружаем вопросы...</p>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Вопросы не найдены
          </h2>
          <p className="text-gray-600 mb-6">
            К сожалению, для этого упражнения пока нет доступных вопросов.
          </p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <p className="text-muted-foreground">Вопрос {currentQuestionIndex + 1} из {questions.length}</p>
            </div>
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </div>
          <Progress value={(currentQuestionIndex / questions.length) * 100} className="w-full" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Question */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <MathRenderer 
              text={questions[currentQuestionIndex]?.problem_text || ''} 
              className="text-base"
              compiler="mathjax"
            />
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 gap-3">
            {options.map((letter, index) => (
              <div
                key={letter}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${getOptionStyle(index)}`}
                onClick={() => handleAnswerSelect(index)}
              >
                <div className="flex items-start space-x-3">
                  <span className="font-bold text-sm flex-shrink-0">{letter})</span>
                  <MathRenderer 
                    text={getOptionContent(index)} 
                    className="flex-1 text-sm"
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
                <div className="flex items-center justify-center space-x-2">
                  <Check className="w-6 h-6 text-green-500" />
                  <p className="text-lg font-semibold text-green-600">Правильно!</p>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <X className="w-6 h-6 text-red-500" />
                  <p className="text-lg font-semibold text-red-600">Неправильно</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            {!showResult ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="px-8"
              >
                Ответить
              </Button>
            ) : (
              <Button onClick={handleNextQuestion} className="px-8">
                {currentQuestionIndex < questions.length - 1 ? 'Следующий вопрос' : 'Завершить тест'}
              </Button>
            )}
          </div>
        </CardContent>
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