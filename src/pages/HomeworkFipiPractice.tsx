import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, BookOpen, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import MathRenderer from '@/components/MathRenderer';
import FormulaBookletDialog from '@/components/FormulaBookletDialog';

interface Question {
  question_id: string;
  problem_text: string;
  answer: string;
  solution_text: string;
  problem_image?: string;
  problem_number_type?: number;
}

const HomeworkFipiPractice = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { homeworkQuestions, isHomework } = location.state || {};

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFormulaBooklet, setShowFormulaBooklet] = useState(false);
  const [currentAttemptId, setCurrentAttemptId] = useState<number | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (homeworkQuestions && homeworkQuestions.length > 0) {
      fetchQuestions();
    } else {
      navigate('/homework');
    }
  }, [homeworkQuestions]);

  const fetchQuestions = async () => {
    if (!homeworkQuestions) return;

    try {
      const { data, error } = await supabase
        .from('oge_math_fipi_bank')
        .select('question_id, problem_text, answer, solution_text, problem_image, problem_number_type')
        .in('question_id', homeworkQuestions);

      if (error) {
        console.error('Error fetching questions:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить вопросы",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const startAttempt = async (questionId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('student_activity')
        .insert({
          user_id: user.id,
          question_id: questionId,
          answer_time_start: new Date().toISOString(),
          finished_or_not: false,
          problem_number_type: currentQuestion?.problem_number_type || 0
        })
        .select('attempt_id')
        .single();

      if (error) {
        console.error('Error starting attempt:', error);
        return null;
      }

      return data?.attempt_id || null;
    } catch (error) {
      console.error('Error starting attempt:', error);
      return null;
    }
  };

  const updateStudentActivity = async (isCorrect: boolean, scores: number) => {
    if (!user || !currentAttemptId) return;

    try {
      const { error } = await supabase
        .from('student_activity')
        .update({
          is_correct: isCorrect,
          finished_or_not: true,
          scores_fipi: scores,
          updated_at: new Date().toISOString()
        })
        .eq('attempt_id', currentAttemptId);

      if (error) {
        console.error('Error updating student activity:', error);
      }
    } catch (error) {
      console.error('Error updating student activity:', error);
    }
  };

  const sanitizeAnswer = (answer: string): string => {
    return answer.replace(/\s+/g, '').toLowerCase();
  };

  const checkAnswer = async () => {
    if (!currentQuestion || !user) return;

    if (!currentAttemptId) {
      const attemptId = await startAttempt(currentQuestion.question_id);
      setCurrentAttemptId(attemptId);
    }

    const userAnswerSanitized = sanitizeAnswer(userAnswer);
    const correctAnswerSanitized = sanitizeAnswer(currentQuestion.answer);
    const correct = userAnswerSanitized === correctAnswerSanitized;

    setIsCorrect(correct);
    setIsAnswered(true);

    const scores = correct ? (currentQuestion.problem_number_type || 1) : 0;
    await updateStudentActivity(correct, scores);

    if (correct) {
      toast({
        title: "Правильно!",
        description: "Отличная работа!",
      });
    } else {
      toast({
        title: "Неправильно",
        description: `Правильный ответ: ${currentQuestion.answer}`,
        variant: "destructive"
      });
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer("");
      setIsAnswered(false);
      setIsCorrect(false);
      setShowSolution(false);
      setCurrentAttemptId(null);
    } else {
      // All questions completed
      toast({
        title: "Практика завершена!",
        description: "Вы выполнили все задания ФИПИ",
      });
      navigate('/homework');
    }
  };

  const skipQuestion = () => {
    nextQuestion();
  };

  const handleShowSolution = () => {
    setShowSolution(true);
  };

  const handleFinishTest = () => {
    navigate('/homework');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Вопросы не найдены</p>
          <Button onClick={() => navigate('/homework')}>
            Вернуться к домашнему заданию
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/homework')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">{currentQuestionIndex + 1}</span>
              </div>
              <span className="text-sm text-muted-foreground">42м</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Практика по номеру вопроса
          </h1>
          <p className="text-lg text-muted-foreground">
            Практика вопросов: {questions.length}
          </p>
        </div>
      </div>

      {/* Question Content */}
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            {/* Question Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Вопрос №{currentQuestion.problem_number_type || (currentQuestionIndex + 1)} ({currentQuestionIndex + 1} из {questions.length})
              </h2>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFormulaBooklet(true)}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Справочник формул
                </Button>
                <Button
                  variant="outline"
                  onClick={handleFinishTest}
                  className="text-red-600 hover:text-red-700"
                >
                  Завершить тест
                </Button>
              </div>
            </div>

            <div className="text-right text-sm text-muted-foreground mb-6">
              ID: {currentQuestion.question_id}
            </div>

            {/* Question */}
            <div className="mb-8">
              {currentQuestion.problem_image && (
                <img 
                  src={currentQuestion.problem_image} 
                  alt="Problem image" 
                  className="mb-4 max-w-full h-auto"
                />
              )}
              <div className="text-lg text-center">
                <MathRenderer text={currentQuestion.problem_text} />
              </div>
            </div>

            {/* Answer Input */}
            <div className="mb-6">
              <div className="flex gap-4 items-center justify-center">
                <Input
                  type="text"
                  placeholder="Введите ваш ответ"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={isAnswered}
                  className="max-w-sm text-center"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isAnswered && userAnswer.trim()) {
                      checkAnswer();
                    }
                  }}
                />
                <Button
                  onClick={checkAnswer}
                  disabled={!userAnswer.trim() || isAnswered}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-8"
                >
                  Проверить
                </Button>
              </div>

              {/* Answer Result */}
              {isAnswered && (
                <div className="flex items-center justify-center mt-4">
                  {isCorrect ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>Правильно!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="w-5 h-5" />
                      <span>Неправильно. Правильный ответ: {currentQuestion.answer}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Solution */}
            {showSolution && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">Решение:</h3>
                <MathRenderer text={currentQuestion.solution_text} />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={handleShowSolution}
                disabled={showSolution}
              >
                Показать решение
              </Button>
              
              {isAnswered ? (
                <Button onClick={nextQuestion} className="bg-blue-600 hover:bg-blue-700">
                  {currentQuestionIndex < questions.length - 1 ? 'Следующий вопрос' : 'Завершить'}
                </Button>
              ) : (
                <Button variant="outline" onClick={skipQuestion}>
                  Пропустить
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formula Booklet Dialog */}
      <FormulaBookletDialog 
        open={showFormulaBooklet} 
        onOpenChange={setShowFormulaBooklet} 
      />
    </div>
  );
};

export default HomeworkFipiPractice;