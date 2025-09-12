import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, BookOpen, ArrowRight, Home, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import MathRenderer from "@/components/MathRenderer";
import { useStreakTracking } from "@/hooks/useStreakTracking";
import { StreakDisplay } from "@/components/streak/StreakDisplay";
import { StreakRingAnimation } from "@/components/streak/StreakRingAnimation";
import { awardStreakPoints, calculateStreakReward, getCurrentStreakData } from "@/services/streakPointsService";
import { toast } from "sonner";

interface Question {
  question_id: string;
  problem_text: string;
  answer: string;
  solution_text: string;
  difficulty?: string | number;
}

const PracticeByNumberEgeProfMath = () => {
  const { user } = useAuth();
  const { trackActivity } = useStreakTracking();
  const [selectedNumber, setSelectedNumber] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [solutionViewedBeforeAnswer, setSolutionViewedBeforeAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentAttemptId, setCurrentAttemptId] = useState<number | null>(null);
  const [attemptStartTime, setAttemptStartTime] = useState<Date | null>(null);
  
  // Streak animation state
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);
  const [streakData, setStreakData] = useState({
    currentMinutes: 0,
    targetMinutes: 30,
    addedMinutes: 0
  });
  
  // Auth required message state
  const [showAuthRequiredMessage, setShowAuthRequiredMessage] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const fetchQuestions = async (questionNumber: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('egemathprof' as any)
        .select('question_id, problem_text, answer, solution_text')
        .eq('problem_number_type', parseInt(questionNumber))
        .order('question_id');

      if (error) throw error;

      const filteredQuestions = (data || []) as unknown as Question[];

      setQuestions(filteredQuestions);
      setCurrentQuestionIndex(0);
      resetQuestionState();
      
      // Start attempt for the first question if user is logged in
      if (filteredQuestions.length > 0 && user) {
        await startAttempt(filteredQuestions[0].question_id);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Ошибка при загрузке вопросов');
    } finally {
      setLoading(false);
    }
  };

  const resetQuestionState = () => {
    setUserAnswer("");
    setIsAnswered(false);
    setIsCorrect(false);
    setShowSolution(false);
    setSolutionViewedBeforeAnswer(false);
    setCurrentAttemptId(null);
    setAttemptStartTime(null);
  };

  const handleNumberSelect = (value: string) => {
    setSelectedNumber(value);
    fetchQuestions(value);
  };

  // Start attempt logging when question is presented
  const startAttempt = async (questionId: string) => {
    if (!user) return;
    
    try {
      // Get question details first to populate skills and topics
      const { data: questionDetails, error: detailsError } = await supabase.functions.invoke('get-question-details', {
        body: { question_id: questionId }
      });

      if (detailsError) {
        console.error('Error getting question details:', detailsError);
      }

      // Insert new activity record directly
      const { data, error } = await supabase
        .from('student_activity')
        .insert({
          user_id: user.id,
          question_id: questionId,
          answer_time_start: new Date().toISOString(),
          finished_or_not: true,
          problem_number_type: parseInt(selectedNumber) || 0,
          skills: questionDetails?.data?.skills || [],
          topics: questionDetails?.data?.topics || []
        })
        .select('attempt_id')
        .single();

      if (error) {
        console.error('Error starting attempt:', error);
        return;
      }

      setCurrentAttemptId(data?.attempt_id);
      setAttemptStartTime(new Date());
      console.log('Started attempt:', data?.attempt_id);
    } catch (error) {
      console.error('Error starting attempt:', error);
    }
  };

  const checkAnswer = async () => {
    if (!currentQuestion || !userAnswer.trim()) return;

    // Check if user is authenticated
    if (!user) {
      setShowAuthRequiredMessage(true);
      // Hide message after 5 seconds
      setTimeout(() => setShowAuthRequiredMessage(false), 5000);
      return;
    }

    try {
      // Determine if the answer is correct
      const normalizedUserAnswer = userAnswer.trim().toLowerCase().replace(/\s+/g, '');
      const normalizedCorrectAnswer = currentQuestion.answer.trim().toLowerCase().replace(/\s+/g, '');
      const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;

      setIsCorrect(isCorrect);
      setIsAnswered(true);

      // Update the current attempt with answer correctness and duration
      if (currentAttemptId && attemptStartTime) {
        const duration = (new Date().getTime() - attemptStartTime.getTime()) / 1000;
        
        const { error: updateError } = await supabase
          .from('student_activity')
          .update({
            is_correct: isCorrect,
            duration_answer: duration
          })
          .eq('attempt_id', currentAttemptId);

        if (updateError) {
          console.error('Error updating attempt:', updateError);
        }

        // Call handle-submission with course_id=3
        const submissionData = {
          user_id: user.id,
          question_id: currentQuestion.question_id,
          attempt_id: currentAttemptId,
          finished_or_not: true,
          duration: duration,
          course_id: '3' // EGE Prof Math course
        };

        const { data: submissionResult, error: submissionError } = await supabase.functions.invoke('handle-submission', {
          body: submissionData
        });

        if (submissionError) {
          console.error('Error in handle-submission:', submissionError);
        } else {
          console.log('Handle submission completed:', submissionResult);
        }
      }

      // Award streak points immediately (regardless of correctness)
      const reward = calculateStreakReward(currentQuestion.difficulty);
      const currentStreakInfo = await getCurrentStreakData(user.id);
      
      if (currentStreakInfo) {
        setStreakData({
          currentMinutes: currentStreakInfo.todayMinutes,
          targetMinutes: currentStreakInfo.goalMinutes,
          addedMinutes: reward.minutes
        });
        setShowStreakAnimation(true);
      }
      
      await awardStreakPoints(user.id, reward);

      if (isCorrect) {
        toast.success(`Правильно! +${reward.minutes} мин к дневной цели.`);
      } else {
        toast.error(`Неправильно. +${reward.minutes} мин к дневной цели за попытку.`);
      }
    } catch (error) {
      console.error('Error in checkAnswer:', error);
      toast.error('Ошибка при проверке ответа');
    }
  };


  // Handle skipping a question
  const skipQuestion = async () => {
    if (!currentQuestion) return;

    // If user is authenticated, update current attempt and submit
    if (user && currentAttemptId && attemptStartTime) {
      try {
        // Calculate duration
        const duration = (new Date().getTime() - attemptStartTime.getTime()) / 1000;

        // Update the current attempt
        const { error: updateError } = await supabase
          .from('student_activity')
          .update({ 
            duration_answer: duration,
            is_correct: false // skipped questions are marked as incorrect
          })
          .eq('attempt_id', currentAttemptId);

        if (updateError) {
          console.error('Error updating attempt for skip:', updateError);
        } else {
          // Call handle-submission with course_id=3
          const submissionData = {
            user_id: user.id,
            question_id: currentQuestion.question_id,
            attempt_id: currentAttemptId,
            finished_or_not: true,
            duration: duration,
            course_id: '3' // EGE Prof Math course
          };

          const { data, error } = await supabase.functions.invoke('handle-submission', {
            body: submissionData
          });

          if (error) {
            console.error('Error in handle-submission for skip:', error);
          } else {
            console.log('Question skipped successfully:', data);
          }
        }
      } catch (error) {
        console.error('Error skipping question:', error);
      }
    }
    
    // Move to next question regardless of authentication status
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetQuestionState();
      // Start attempt for next question if user is authenticated
      const nextQuestion = questions[currentQuestionIndex + 1];
      if (nextQuestion && user) {
        await startAttempt(nextQuestion.question_id);
      }
    } else {
      toast.success("Все вопросы завершены!");
    }
  };

  const handleShowSolution = () => {
    if (!isAnswered) {
      setSolutionViewedBeforeAnswer(true);
    }
    setShowSolution(true);
  };

  const nextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetQuestionState();
      
      // Start attempt for the next question
      const nextQ = questions[currentQuestionIndex + 1];
      if (nextQ && user) {
        await startAttempt(nextQ.question_id);
      }
    } else {
      toast.success("Все вопросы завершены!");
    }
  };

  const questionNumbers = Array.from({ length: 19 }, (_, i) => (i + 1).toString());

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-start">
            <Link to="/egemathprof-practice">
              <Button className="bg-gradient-to-r from-yellow-200 to-yellow-300 hover:from-yellow-300 hover:to-yellow-400 text-black shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="pt-8 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Практика по номеру вопроса</h1>
              <p className="text-lg text-gray-600">Выберите номер вопроса (1-19) для практики всех задач этого типа</p>
            </div>
            {user && <StreakDisplay />}
          </div>

          {/* Question Number Selection */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Выберите номер вопроса</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedNumber} onValueChange={handleNumberSelect}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Выберите номер (1-19)" />
                </SelectTrigger>
                <SelectContent>
                  {questionNumbers.map(num => (
                    <SelectItem key={num} value={num}>
                      Вопрос {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Question Content */}
          {selectedNumber && questions.length > 0 && currentQuestion && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Вопрос {selectedNumber} ({currentQuestionIndex + 1} из {questions.length})</span>
                  <span className="text-sm font-normal text-gray-500">
                    ID: {currentQuestion.question_id}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Problem Text */}
                <div className="prose max-w-none">
                  <MathRenderer text={currentQuestion.problem_text || "Текст задачи не найден"} compiler="mathjax" />
                </div>

                  {/* Answer Input */}
                <div className="space-y-4">
                  {/* Show photo upload button for problems 13 and higher */}
                  {parseInt(selectedNumber) >= 13 ? (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          placeholder="Введите ваш ответ (или прикрепите фото)"
                          disabled={isAnswered}
                          onKeyPress={(e) => e.key === 'Enter' && !isAnswered && checkAnswer()}
                          className="flex-1"
                        />
                        <Button
                          onClick={checkAnswer}
                          disabled={isAnswered || !userAnswer.trim()}
                          className="min-w-32"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Проверить
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file && user && currentQuestion) {
                              // TODO: Implement photo processing
                              toast.info('Обработка фото пока не реализована');
                            }
                          };
                          input.click();
                        }}
                        className="w-full"
                        disabled={isAnswered}
                      >
                        📷 Прикрепить Фото
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Введите ваш ответ"
                        disabled={isAnswered}
                        onKeyPress={(e) => e.key === 'Enter' && !isAnswered && checkAnswer()}
                        className="flex-1"
                      />
                      <Button
                        onClick={checkAnswer}
                        disabled={isAnswered || !userAnswer.trim()}
                        className="min-w-32"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Проверить
                      </Button>
                    </div>
                  )}

                  {/* Auth Required Message */}
                  {showAuthRequiredMessage && (
                    <Alert className="border-orange-200 bg-orange-50">
                      <AlertDescription className="text-orange-800">
                        Чтобы решать задачи, войдите на платформу.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Answer Result */}
                  {isAnswered && (
                    <Alert className={isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <AlertDescription>
                          {isCorrect ? (
                            <span className="text-green-800">
                              Правильно! {!solutionViewedBeforeAnswer && "Получены очки прогресса."}
                            </span>
                          ) : (
                            <span className="text-red-800">
                              Неправильно. Правильный ответ: <strong>{currentQuestion.answer}</strong>
                            </span>
                          )}
                        </AlertDescription>
                      </div>
                    </Alert>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleShowSolution}
                    className="flex-1"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Показать решение
                  </Button>
                  
                  {!isAnswered && (
                    <Button
                      variant="outline"
                      onClick={skipQuestion}
                      className="flex-1"
                    >
                      Пропустить
                    </Button>
                  )}
                  
                  {isAnswered && currentQuestionIndex < questions.length - 1 && (
                    <Button onClick={nextQuestion} className="flex-1">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Следующий вопрос
                    </Button>
                  )}
                </div>

                {/* Solution */}
                {showSolution && currentQuestion.solution_text && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-blue-800">Решение</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        <MathRenderer text={currentQuestion.solution_text} compiler="mathjax" />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          )}

          {/* Results Summary */}
          {selectedNumber && questions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Статистика</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Найдено {questions.length} вопросов для номера {selectedNumber}
                </p>
                {loading && <p className="text-blue-600">Загрузка...</p>}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Streak Animation */}
      {showStreakAnimation && (
        <StreakRingAnimation
          isVisible={showStreakAnimation}
          onAnimationComplete={() => setShowStreakAnimation(false)}
          currentMinutes={streakData.currentMinutes}
          targetMinutes={streakData.targetMinutes}
          addedMinutes={streakData.addedMinutes}
        />
      )}
    </div>
  );
};

export default PracticeByNumberEgeProfMath;