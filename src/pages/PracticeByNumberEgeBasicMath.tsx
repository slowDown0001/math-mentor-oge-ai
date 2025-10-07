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
import { awardEnergyPoints } from "@/services/energyPoints";
import { toast } from "sonner";

interface Question {
  question_id: string;
  problem_text: string;
  answer: string;
  solution_text: string;
  difficulty?: string | number;
  problem_number_type?: number;
}

const PracticeByNumberEgeBasicMath = () => {
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
        .from('egemathbase')
        .select('question_id, problem_text, answer, solution_text, problem_number_type')
        .eq('problem_number_type', questionNumber)
        .order('question_id');

      if (error) throw error;

      const filteredQuestions = (data || []).map(q => ({
        ...q,
        problem_number_type: parseInt(q.problem_number_type || '0')
      }));

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
      // Fetch question details to populate skills and topics
      let skillsArray: number[] = [];
      let topicsArray: string[] = [];
      let problemNumberType = parseInt(selectedNumber || '1');

      try {
        const { data: detailsResp, error: detailsErr } = await supabase.functions.invoke('get-question-details', {
          body: { question_id: questionId, course_id: '2' }
        });
        if (detailsErr) {
          console.warn('get-question-details error (will fallback):', detailsErr);
        } else if (detailsResp?.data) {
          skillsArray = Array.isArray(detailsResp.data.skills_list) ? detailsResp.data.skills_list : [];
          topicsArray = Array.isArray(detailsResp.data.topics_list) ? detailsResp.data.topics_list : [];
          if (detailsResp.data.problem_number_type) {
            problemNumberType = parseInt(detailsResp.data.problem_number_type.toString(), 10);
          }
        }
      } catch (e) {
        console.warn('Failed to fetch question details, proceeding without skills/topics:', e);
      }

      // Insert into student_activity table with skills and topics
      const { data, error } = await supabase
        .from('student_activity')
        .insert({
          user_id: user.id,
          question_id: questionId,
          answer_time_start: new Date().toISOString(),
          finished_or_not: false,
          problem_number_type: problemNumberType,
          is_correct: null,
          duration_answer: null,
          scores_fipi: null,
          skills: skillsArray.length ? skillsArray : null,
          topics: topicsArray.length ? topicsArray : null
        })
        .select('attempt_id')
        .single();

      if (error) {
        console.error('Error starting attempt:', error);
        return;
      }

      if (data) {
        setCurrentAttemptId(data.attempt_id);
        setAttemptStartTime(new Date());
        console.log('Started attempt:', data.attempt_id);
      }
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

      // Update student_activity directly instead of using failing edge function
      await updateStudentActivity(isCorrect, 0);

      // Call handle-submission to update mastery data
      await submitToHandleSubmission(isCorrect);

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
      
      // Award energy points if correct (egemathbase table = 2 points)
      if (isCorrect) {
        const result = await awardEnergyPoints(user.id, 'problem', undefined, 'egemathbase');
        if (result.success && result.pointsAwarded && (window as any).triggerEnergyPointsAnimation) {
          (window as any).triggerEnergyPointsAnimation(result.pointsAwarded);
        }
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
  const submitToHandleSubmission = async (isCorrect: boolean) => {
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
        is_correct: isCorrect,
        duration: activityData.duration_answer,
        scores_fipi: activityData.scores_fipi
      };

      // Call handle_submission function with course_id=2
      const { data, error } = await supabase.functions.invoke('handle-submission', {
        body: { 
          course_id: '2',
          submission_data: submissionData
        }
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

  // Update student_activity directly with answer results
  const updateStudentActivity = async (isCorrect: boolean, scores: number, isSkipped: boolean = false) => {
    if (!user || !currentAttemptId) return;

    try {
      // Calculate duration from attempt start time
      const now = new Date();
      const startTime = attemptStartTime || new Date();
      const durationInSeconds = (now.getTime() - startTime.getTime()) / 1000;

      // Update the student_activity row
      const { error: updateError } = await supabase
        .from('student_activity')
        .update({ 
          duration_answer: durationInSeconds,
          is_correct: isCorrect,
          scores_fipi: scores,
          finished_or_not: true
        })
        .eq('user_id', user.id)
        .eq('attempt_id', currentAttemptId);

      if (updateError) {
        console.error('Error updating student_activity:', updateError);
        return;
      }

      console.log(`Updated student_activity: correct=${isCorrect}, scores=${scores}, duration=${durationInSeconds}s`);
    } catch (error) {
      console.error('Error in updateStudentActivity:', error);
    }
  };


  // Handle skipping a question
  const skipQuestion = async () => {
    if (!currentQuestion) return;

    // Optimized skip: minimal database operations
    if (user && currentAttemptId && attemptStartTime) {
      try {
        // Calculate duration
        const now = new Date();
        const durationInSeconds = (now.getTime() - attemptStartTime.getTime()) / 1000;

        // Single UPDATE operation to mark as skipped
        const { error: updateError } = await supabase
          .from('student_activity')
          .update({ 
            duration_answer: durationInSeconds,
            is_correct: false,
            scores_fipi: 0,
            finished_or_not: true
          })
          .eq('user_id', user.id)
          .eq('attempt_id', currentAttemptId);

        if (updateError) {
          console.error('Error updating activity for skip:', updateError);
        }

        // Fire-and-forget mastery update (don't wait for it)
        submitToHandleSubmission(false).catch(error => 
          console.error('Background mastery update failed:', error)
        );
      } catch (error) {
        console.error('Error skipping question:', error);
      }
    }
    
    // Immediately move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetQuestionState();
      
      // Start next attempt in background (don't block UI)
      const nextQuestion = questions[currentQuestionIndex + 1];
      if (nextQuestion && user) {
        startAttempt(nextQuestion.question_id).catch(error => 
          console.error('Background attempt start failed:', error)
        );
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

  const questionNumbers = Array.from({ length: 21 }, (_, i) => (i + 1).toString());

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-start">
            <Link to="/egemathbasic">
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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Практика по номеру вопроса - ЕГЭ Базовая Математика</h1>
              <p className="text-lg text-gray-600">Выберите номер вопроса (1-21) для практики всех задач этого типа</p>
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
                  <SelectValue placeholder="Выберите номер (1-21)" />
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
                    <Button
                      onClick={nextQuestion}
                      className="flex-1"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Следующий вопрос
                    </Button>
                  )}
                </div>

                {/* Solution Display */}
                {showSolution && currentQuestion.solution_text && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-blue-900">Решение</CardTitle>
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

          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Загрузка вопросов...</p>
              </CardContent>
            </Card>
          )}

          {/* No Questions Found */}
          {selectedNumber && !loading && questions.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600">Вопросы не найдены для выбранного номера.</p>
              </CardContent>
            </Card>
          )}

          {/* Completion Message */}
          {selectedNumber && questions.length > 0 && currentQuestionIndex >= questions.length && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-900 mb-2">Поздравляем!</h3>
                <p className="text-green-800 mb-6">Вы завершили все вопросы номера {selectedNumber}.</p>
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={() => {
                      setSelectedNumber("");
                      setQuestions([]);
                      resetQuestionState();
                    }}
                    variant="outline"
                  >
                    Выбрать другой номер
                  </Button>
                  <Link to="/egemathbasic">
                    <Button>
                      <Home className="w-4 h-4 mr-2" />
                      Вернуться на главную
                    </Button>
                  </Link>
                </div>
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

export default PracticeByNumberEgeBasicMath;