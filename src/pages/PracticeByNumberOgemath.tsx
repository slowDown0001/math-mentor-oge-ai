import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, BookOpen, ArrowRight, Home, ArrowLeft, Camera, X } from "lucide-react";
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
  problem_number_type?: number;
}

const PracticeByNumberOgemath = () => {
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
  
  // Photo attachment states
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [showTelegramNotConnected, setShowTelegramNotConnected] = useState(false);
  const [showUploadPrompt, setShowUploadPrompt] = useState(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [photoFeedback, setPhotoFeedback] = useState<string>("");
  const [photoScores, setPhotoScores] = useState<number | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  const fetchQuestions = async (questionNumber: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('oge_math_fipi_bank')
        .select('question_id, problem_text, answer, solution_text, problem_number_type')
        .eq('problem_number_type', parseInt(questionNumber))
        .order('question_id');

      if (error) throw error;

      const filteredQuestions = data || [];

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
      const { data, error } = await supabase.functions.invoke('start-attempt', {
        body: {
          user_id: user.id,
          question_id: questionId
        }
      });

      if (error) {
        console.error('Error starting attempt:', error);
        return;
      }

      setCurrentAttemptId(data?.data?.attempt_id);
      setAttemptStartTime(new Date());
      console.log('Started attempt:', data?.data?.attempt_id);
    } catch (error) {
      console.error('Error starting attempt:', error);
    }
  };

  // Helper function to check if a string is purely numeric
  const isNumeric = (str: string): boolean => {
    // Remove spaces and check if the string contains only digits, dots, commas, and negative signs
    const cleaned = str.trim();
    // Check if it's purely numeric (digits, decimal separators, negative sign)
    return /^-?\d+([.,]\d+)?$/.test(cleaned);
  };

  // Helper function to sanitize numeric input
  const sanitizeNumericAnswer = (answer: string): string => {
    return answer.trim().replace(/\s/g, '').replace(',', '.');
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
      const correctAnswer = currentQuestion.answer;
      let isCorrect = false;

      // Check if the correct answer is numeric
      if (isNumeric(correctAnswer)) {
        // Simple numeric comparison with sanitization
        const sanitizedUserAnswer = sanitizeNumericAnswer(userAnswer);
        const sanitizedCorrectAnswer = sanitizeNumericAnswer(correctAnswer);
        isCorrect = sanitizedUserAnswer === sanitizedCorrectAnswer;
        
        console.log('Numeric answer check:', {
          user: sanitizedUserAnswer,
          correct: sanitizedCorrectAnswer,
          isCorrect
        });
      } else {
        // Use OpenRouter API for non-numeric answers
        console.log('Non-numeric answer detected, using OpenRouter API');
        
        const { data, error } = await supabase.functions.invoke('check-non-numeric-answer', {
          body: {
            student_answer: userAnswer.trim(),
            correct_answer: correctAnswer,
            problem_text: currentQuestion.problem_text
          }
        });

        if (error) {
          console.error('Error checking non-numeric answer:', error);
          
          // Check if there's a retry message from the API
          if (data?.retry_message) {
            toast.error(data.retry_message);
          } else {
            toast.error('Ошибка при проверке ответа. Пожалуйста, попробуйте ещё раз.');
          }
          return;
        }

        if (data?.retry_message) {
          toast.error(data.retry_message);
          return;
        }

        isCorrect = data?.is_correct || false;
        console.log('OpenRouter API result:', { isCorrect });
      }

      // Call check-text-answer function for logging purposes
      const { data: logData, error: logError } = await supabase.functions.invoke('check-text-answer', {
        body: {
          user_id: user.id,
          question_id: currentQuestion.question_id,
          submitted_answer: userAnswer.trim()
        }
      });

      if (logError) {
        console.error('Error logging answer check:', logError);
      }

      setIsCorrect(isCorrect);
      setIsAnswered(true);

      // Get latest student_activity data and submit to handle_submission
      await submitToHandleSubmission();

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

  // Get latest student_activity data and submit to handle_submission
  const submitToHandleSubmission = async () => {
    if (!user) return;

    try {
      // Get latest student_activity row for current user
      const { data: activityData, error: activityError } = await supabase
        .from('student_activity')
        .select('question_id, attempt_id, finished_or_not, duration_answer, scores_fipi')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (activityError || !activityData) {
        console.error('Error getting latest activity:', activityError);
        return;
      }

      // Create submission_data dictionary
      const submissionData = {
        user_id: user.id,
        question_id: activityData.question_id,
        attempt_id: activityData.attempt_id,
        finished_or_not: activityData.finished_or_not,
        duration: activityData.duration_answer,
        scores_fipi: activityData.scores_fipi
      };

      // Call handle_submission function
      const { data, error } = await supabase.functions.invoke('handle-submission', {
        body: submissionData
      });

      if (error) {
        console.error('Error in handle-submission:', error);
        toast.error('Ошибка при обработке ответа');
        return;
      }

      console.log('Handle submission completed:', data);
    } catch (error) {
      console.error('Error in submitToHandleSubmission:', error);
    }
  };

  // Handle photo submission to student_activity
  const submitPhotoToActivity = async (scores: number) => {
    if (!user) return;

    try {
      // Get latest student_activity row for current user
      const { data: activityData, error: activityError } = await supabase
        .from('student_activity')
        .select('question_id, attempt_id, finished_or_not, duration_answer, scores_fipi, answer_time_start')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (activityError || !activityData) {
        console.error('Error getting latest activity for photo:', activityError);
        return;
      }

      // Calculate duration between now and answer_time_start
      const now = new Date();
      const startTime = new Date(activityData.answer_time_start);
      const durationInSeconds = (now.getTime() - startTime.getTime()) / 1000;

      // Determine if correct based on scores
      const isCorrect = scores > 0;

      // Update the student_activity row with photo results
      const { error: updateError } = await supabase
        .from('student_activity')
        .update({ 
          duration_answer: durationInSeconds,
          is_correct: isCorrect,
          scores_fipi: scores,
          finished_or_not: true
        })
        .eq('user_id', user.id)
        .eq('attempt_id', activityData.attempt_id);

      if (updateError) {
        console.error('Error updating activity for photo:', updateError);
        return;
      }

      // Create submission_data dictionary for photo submission
      const submissionData = {
        user_id: user.id,
        question_id: activityData.question_id,
        attempt_id: activityData.attempt_id,
        finished_or_not: true,
        duration: durationInSeconds,
        scores_fipi: scores
      };

      // Call handle_submission function
      const { data, error } = await supabase.functions.invoke('handle-submission', {
        body: submissionData
      });

      if (error) {
        console.error('Error in photo handle-submission:', error);
      } else {
        console.log('Photo submission completed:', data);
        setIsCorrect(isCorrect);
        setIsAnswered(true);
      }
    } catch (error) {
      console.error('Error in submitPhotoToActivity:', error);
    }
  };

  // Handle skipping a question
  const skipQuestion = async () => {
    if (!currentQuestion) return;

    // If user is authenticated, get latest activity data and calculate duration
    if (user) {
      try {
        // Get latest student_activity row for current user
        const { data: activityData, error: activityError } = await supabase
          .from('student_activity')
          .select('question_id, attempt_id, finished_or_not, duration_answer, scores_fipi, answer_time_start')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        if (activityError || !activityData) {
          console.error('Error getting latest activity for skip:', activityError);
        } else {
          // Calculate duration between now and answer_time_start
          const now = new Date();
          const startTime = new Date(activityData.answer_time_start);
          const durationInSeconds = (now.getTime() - startTime.getTime()) / 1000;

          // Update the duration_answer column for this row
          const { error: updateError } = await supabase
            .from('student_activity')
            .update({ duration_answer: durationInSeconds })
            .eq('user_id', user.id)
            .eq('attempt_id', activityData.attempt_id);

          if (updateError) {
            console.error('Error updating duration for skip:', updateError);
          }

          // Create submission_data dictionary for skip
          const submissionData = {
            user_id: user.id,
            question_id: activityData.question_id,
            attempt_id: activityData.attempt_id,
            finished_or_not: activityData.finished_or_not,
            duration: durationInSeconds,
            scores_fipi: activityData.scores_fipi
          };

          // Call handle_submission function
          const { data, error } = await supabase.functions.invoke('handle-submission', {
            body: submissionData
          });

          if (error) {
            console.error('Error skipping question:', error);
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

  // Photo attachment functionality
  const handlePhotoAttachment = async () => {
    if (!user) {
      setShowAuthRequiredMessage(true);
      setTimeout(() => setShowAuthRequiredMessage(false), 5000);
      return;
    }

    try {
      // Check if user has telegram_user_id
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('telegram_user_id')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking telegram connection:', error);
        toast.error('Ошибка при проверке подключения Telegram');
        return;
      }

      if (!profile?.telegram_user_id) {
        setShowTelegramNotConnected(true);
      } else {
        setShowUploadPrompt(true);
      }
    } catch (error) {
      console.error('Error in handlePhotoAttachment:', error);
      toast.error('Ошибка при проверке подключения Telegram');
    }
  };

  const handlePhotoCheck = async () => {
    if (!user || !currentQuestion) return;

    setIsProcessingPhoto(true);
    
    try {
      // Check telegram_input for data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('telegram_input')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error getting telegram input:', profileError);
        toast.error('Ошибка при получении данных');
        setIsProcessingPhoto(false);
        return;
      }

      if (!profile?.telegram_input) {
        toast.error('Фото не загружено.');
        setIsProcessingPhoto(false);
        return;
      }

      // Make OpenRouter API call
      const { data: apiResponse, error: apiError } = await supabase.functions.invoke('check-photo-solution', {
        body: {
          student_solution: profile.telegram_input,
          problem_text: currentQuestion.problem_text,
          solution_text: currentQuestion.solution_text
        }
      });

      if (apiError) {
        console.error('Error calling check-photo-solution:', apiError);
        if (apiResponse?.retry_message) {
          toast.error(apiResponse.retry_message);
        } else {
          toast.error('Ошибка API. Попробуйте ввести решение снова.');
        }
        setIsProcessingPhoto(false);
        return;
      }

      if (apiResponse?.feedback) {
        try {
          // Parse JSON response
          const feedbackData = JSON.parse(apiResponse.feedback);
          if (feedbackData.review && typeof feedbackData.scores === 'number') {
            setPhotoFeedback(feedbackData.review);
            setPhotoScores(feedbackData.scores);
            
            // Handle photo submission using existing pattern
            await submitPhotoToActivity(feedbackData.scores);
            
            setShowUploadPrompt(false);
            setShowPhotoDialog(true);
          } else {
            toast.error('Неверный формат ответа API');
          }
        } catch (parseError) {
          console.error('Error parsing API response:', parseError);
          // Fallback to treating as plain text
          setPhotoFeedback(apiResponse.feedback);
          setPhotoScores(null);
          setShowUploadPrompt(false);
          setShowPhotoDialog(true);
        }
      } else {
        toast.error('Не удалось получить обратную связь');
      }
    } catch (error) {
      console.error('Error in handlePhotoCheck:', error);
      toast.error('Произошла ошибка при обработке решения');
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const closePhotoDialog = () => {
    setShowPhotoDialog(false);
    setPhotoFeedback("");
    setPhotoScores(null);
  };

  const questionNumbers = Array.from({ length: 25 }, (_, i) => (i + 1).toString());

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-start">
            <Link to="/ogemath-practice">
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
              <p className="text-lg text-gray-600">Выберите номер вопроса (1-25) для практики всех задач этого типа</p>
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
                  <SelectValue placeholder="Выберите номер (1-25)" />
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

                  {/* Photo Attachment Button for questions 20+ */}
                  {currentQuestion.problem_number_type && currentQuestion.problem_number_type >= 20 && (
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        onClick={handlePhotoAttachment}
                        className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Прикрепить фото
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

      {/* Telegram Not Connected Dialog */}
      <Dialog open={showTelegramNotConnected} onOpenChange={setShowTelegramNotConnected}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <X className="w-5 h-5 text-red-500" />
              Telegram не подключен
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-gray-700">
              Зайдите в Дашборд и потвердите Telegram код.
            </p>
          </div>
          <div className="flex justify-center">
            <Button onClick={() => setShowTelegramNotConnected(false)}>
              Понятно
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Prompt Dialog */}
      <Dialog open={showUploadPrompt} onOpenChange={setShowUploadPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Загрузка фото решения</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                Загрузите фото в телеграм бот egechat_bot. Уже загрузили? Нажмите кнопку 'Да'
              </p>
            </div>
            <div className="flex justify-center">
              <Button 
                onClick={handlePhotoCheck}
                disabled={isProcessingPhoto}
                className="min-w-24"
              >
                {isProcessingPhoto ? 'Обработка...' : 'Да'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Feedback Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={closePhotoDialog}>
        <DialogContent className="sm:max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Обратная связь по решению
              <Button variant="ghost" size="sm" onClick={closePhotoDialog}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="prose max-w-none">
              <MathRenderer text={photoFeedback} compiler="mathjax" />
              {photoScores !== null && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border">
                  <p className="text-lg font-semibold text-blue-800">
                    Баллы: {photoScores} из 2
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PracticeByNumberOgemath;