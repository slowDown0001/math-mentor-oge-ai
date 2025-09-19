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
import TestStatisticsWindow from "@/components/TestStatisticsWindow";

interface Question {
  question_id: string;
  problem_text: string;
  answer: string;
  solution_text: string;
  difficulty?: string | number;
  problem_number_type?: number;
  status?: 'correct' | 'wrong' | 'unseen' | 'unfinished';
}

const PracticeByNumberOgemath = () => {
  const { user } = useAuth();
  const { trackActivity } = useStreakTracking();
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [practiceStarted, setPracticeStarted] = useState(false);
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
  
  // Test session tracking
  const [showStatistics, setShowStatistics] = useState(false);
  const [sessionResults, setSessionResults] = useState<Array<{
    questionIndex: number;
    questionId: string;
    isCorrect: boolean;
    userAnswer: string;
    correctAnswer: string;
    problemText: string;
    solutionText: string;
    isAnswered: boolean;
  }>>([]);
  
  // Review mode states
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewQuestionIndex, setReviewQuestionIndex] = useState<number | null>(null);
  
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

  const fetchQuestions = async (questionNumbers: string[]) => {
    setLoading(true);
    try {
      let allQuestions: Question[] = [];
      
      for (const questionNumber of questionNumbers) {
        const { data, error } = await supabase
          .from('oge_math_fipi_bank')
          .select('question_id, problem_text, answer, solution_text, problem_number_type')
          .eq('problem_number_type', parseInt(questionNumber))
          .order('question_id');

        if (error) throw error;
        
        if (data) {
          allQuestions = [...allQuestions, ...data];
        }
      }

      // Get user's activity history for these questions if logged in
      let userActivity: any[] = [];
      let questionStatusMap: { [key: string]: { status: 'correct' | 'wrong' | 'unseen' | 'unfinished', priority: number } } = {};
      
      if (user && allQuestions.length > 0) {
        const questionIds = allQuestions.map(q => q.question_id);
        const { data: activityData } = await supabase
          .from('student_activity')
          .select('question_id, is_correct, finished_or_not, updated_at')
          .eq('user_id', user.id)
          .in('question_id', questionIds)
          .order('updated_at', { ascending: false });
        
        userActivity = activityData || [];

        // Create status map for each question based on most recent attempt
        allQuestions.forEach(question => {
          const questionActivity = userActivity.filter(a => a.question_id === question.question_id);
          
          if (questionActivity.length === 0) {
            questionStatusMap[question.question_id] = { status: 'unseen', priority: 3 };
          } else {
            // Get most recent attempt based on updated_at
            const mostRecent = questionActivity[0];
            
            if (!mostRecent.finished_or_not) {
              questionStatusMap[question.question_id] = { status: 'unfinished', priority: 2 };
            } else if (mostRecent.is_correct === false) {
              questionStatusMap[question.question_id] = { status: 'wrong', priority: 1 };
            } else if (mostRecent.is_correct === true) {
              questionStatusMap[question.question_id] = { status: 'correct', priority: 4 };
            } else {
              questionStatusMap[question.question_id] = { status: 'unfinished', priority: 2 };
            }
          }
        });
      } else {
        // If no user, mark all as unseen
        allQuestions.forEach(question => {
          questionStatusMap[question.question_id] = { status: 'unseen', priority: 3 };
        });
      }

      // Sort questions by priority (1=highest priority, 4=lowest priority) and then randomly within each priority group
      const questionsWithStatus = allQuestions.map(question => ({
        ...question,
        status: questionStatusMap[question.question_id]?.status || 'unseen',
        priority: questionStatusMap[question.question_id]?.priority || 3
      }));

      // Group by priority and shuffle within each group
      const priorityGroups = {
        1: questionsWithStatus.filter(q => q.priority === 1), // wrong
        2: questionsWithStatus.filter(q => q.priority === 2), // unfinished
        3: questionsWithStatus.filter(q => q.priority === 3), // unseen
        4: questionsWithStatus.filter(q => q.priority === 4)  // correct
      };

      // Shuffle each group
      Object.values(priorityGroups).forEach(group => {
        for (let i = group.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [group[i], group[j]] = [group[j], group[i]];
        }
      });

      // Combine groups in priority order
      const sortedQuestions = [
        ...priorityGroups[1], // unseen first
        ...priorityGroups[2], // unfinished second
        ...priorityGroups[3], // wrong third
        ...priorityGroups[4]  // correct last
      ];

      const selectedQuestions = sortedQuestions.slice(0, Math.min(20, sortedQuestions.length));

      setQuestions(selectedQuestions);
      setCurrentQuestionIndex(0);
      resetQuestionState();
      
      // Start attempt for the first question if user is logged in
      if (selectedQuestions.length > 0 && user) {
        await startAttempt(selectedQuestions[0].question_id);
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

  const toggleQuestionGroup = (groupType: string) => {
    let groupNumbers: string[] = [];
    
    switch (groupType) {
      case 'all':
        groupNumbers = Array.from({ length: 25 }, (_, i) => (i + 1).toString());
        break;
      case 'part1':
        groupNumbers = ['1-5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'];
        break;
      case 'part2_algebra':
        groupNumbers = ['15', '16', '17', '18', '19', '20', '21'];
        break;
      case 'part2_geometry':
        groupNumbers = ['22', '23', '24', '25'];
        break;
    }
    
    // Expand grouped numbers
    const expandedNumbers: string[] = [];
    groupNumbers.forEach(num => {
      if (num === '1-5') {
        expandedNumbers.push('1', '2', '3', '4', '5');
      } else {
        expandedNumbers.push(num);
      }
    });
    
    // Check if all numbers in the group are currently selected
    const allSelected = expandedNumbers.every(num => selectedNumbers.includes(num));
    
    // If all selected, deselect the group; otherwise, select the group
    if (allSelected) {
      setSelectedNumbers(prev => prev.filter(n => !expandedNumbers.includes(n)));
    } else {
      setSelectedNumbers(prev => {
        const newSelected = [...prev];
        expandedNumbers.forEach(num => {
          if (!newSelected.includes(num)) {
            newSelected.push(num);
          }
        });
        return newSelected;
      });
    }
  };

  const toggleIndividualNumber = (number: string) => {
    setSelectedNumbers(prev => {
      if (prev.includes(number)) {
        return prev.filter(n => n !== number);
      } else {
        return [...prev, number];
      }
    });
  };

  const handleStartPractice = () => {
    if (selectedNumbers.length === 0) {
      toast.error('Выберите хотя бы один номер вопроса');
      return;
    }
    
    setPracticeStarted(true);
    fetchQuestions(selectedNumbers);
  };

  const handleBackToSelection = () => {
    setPracticeStarted(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    resetQuestionState();
    setSessionResults([]);
    setShowStatistics(false);
  };

  const handleFinishTest = () => {
    setShowStatistics(true);
    setIsReviewMode(false);
  };

  const handleNewTest = () => {
    setShowStatistics(false);
    setSessionResults([]);
    setIsReviewMode(false);
    setReviewQuestionIndex(null);
    handleBackToSelection();
  };

  const handleGoToQuestion = (questionIndex: number) => {
    setIsReviewMode(true);
    setReviewQuestionIndex(questionIndex);
  };
  
  const handleBackToSummary = () => {
    setIsReviewMode(false);
    setReviewQuestionIndex(null);
  };

  // Start attempt logging when question is presented
  const startAttempt = async (questionId: string) => {
    if (!user) return;
    
    try {
      // Fetch question details to populate skills and topics
      let skillsArray: number[] = [];
      let topicsArray: string[] = [];
      let problemNumberType = 1;

      try {
        const { data: detailsResp, error: detailsErr } = await supabase.functions.invoke('get-question-details', {
          body: { question_id: questionId, course_id: '1' }
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

      // Track result in session
      setSessionResults(prev => {
        const newResults = [...prev];
        const existingIndex = newResults.findIndex(r => r.questionIndex === currentQuestionIndex);
        const result = {
          questionIndex: currentQuestionIndex,
          questionId: currentQuestion.question_id,
          isCorrect,
          userAnswer: userAnswer.trim(),
          correctAnswer: currentQuestion.answer,
          problemText: currentQuestion.problem_text,
          solutionText: currentQuestion.solution_text,
          isAnswered: true
        };
        
        if (existingIndex >= 0) {
          newResults[existingIndex] = result;
        } else {
          newResults.push(result);
        }
        return newResults;
      });

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

      // Call handle_submission function
      const { data, error } = await supabase.functions.invoke('handle-submission', {
        body: { 
          course_id: '1',
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
    
    // Track skipped question in session
    setSessionResults(prev => {
      const newResults = [...prev];
      const existingIndex = newResults.findIndex(r => r.questionIndex === currentQuestionIndex);
      const result = {
        questionIndex: currentQuestionIndex,
        questionId: currentQuestion.question_id,
        isCorrect: false,
        userAnswer: '',
        correctAnswer: currentQuestion.answer,
        problemText: currentQuestion.problem_text,
        solutionText: currentQuestion.solution_text,
        isAnswered: false
      };
      
      if (existingIndex >= 0) {
        newResults[existingIndex] = result;
      } else {
        newResults.push(result);
      }
      return newResults;
    });
    
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
            
            // Handle photo submission using direct update
            const isCorrect = feedbackData.scores > 0;
            await updateStudentActivity(isCorrect, feedbackData.scores);
            
            // Update UI states
            setIsCorrect(isCorrect);
            setIsAnswered(true);
            
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
            {practiceStarted ? (
              <Button 
                onClick={handleBackToSelection}
                className="bg-gradient-to-r from-yellow-200 to-yellow-300 hover:from-yellow-300 hover:to-yellow-400 text-black shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                К выбору вопросов
              </Button>
            ) : (
              <Link to="/ogemath-practice">
                <Button className="bg-gradient-to-r from-yellow-200 to-yellow-300 hover:from-yellow-300 hover:to-yellow-400 text-black shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Назад
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="pt-8 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Практика по номеру вопроса</h1>
              <p className="text-lg text-gray-600">
                {practiceStarted 
                  ? `Практика вопросов: ${selectedNumbers.join(', ')}`
                  : "Выберите номера вопросов для практики"
                }
              </p>
            </div>
            {user && <StreakDisplay />}
          </div>

          {!practiceStarted ? (
            /* Question Selection Interface */
            <div className="space-y-6">
              {/* Question Groups */}
              <Card>
                <CardHeader>
                  <CardTitle>Группы вопросов</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => toggleQuestionGroup('all')}
                      className="p-4 h-auto text-center hover:bg-blue-50"
                    >
                      Все вопросы
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => toggleQuestionGroup('part1')}
                      className="p-4 h-auto text-center hover:bg-blue-50"
                    >
                      Часть 1
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => toggleQuestionGroup('part2_algebra')}
                      className="p-4 h-auto text-center hover:bg-blue-50"
                    >
                      Часть 2 Алгебра
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => toggleQuestionGroup('part2_geometry')}
                      className="p-4 h-auto text-center hover:bg-blue-50"
                    >
                      Часть 2 Геометрия
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Individual Numbers */}
              <Card>
                <CardHeader>
                  <CardTitle>Отдельные номера</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                    {/* Special button for questions 1-5 */}
                    <Button
                      variant={selectedNumbers.includes('1') && selectedNumbers.includes('2') && 
                              selectedNumbers.includes('3') && selectedNumbers.includes('4') && 
                              selectedNumbers.includes('5') ? "default" : "outline"}
                      onClick={() => {
                        const group = ['1', '2', '3', '4', '5'];
                        const allSelected = group.every(n => selectedNumbers.includes(n));
                        if (allSelected) {
                          setSelectedNumbers(prev => prev.filter(n => !group.includes(n)));
                        } else {
                          setSelectedNumbers(prev => [...new Set([...prev, ...group])]);
                        }
                      }}
                      className="p-3 h-auto"
                    >
                      1-5
                    </Button>
                    
                    {/* Individual number buttons 6-25 */}
                    {Array.from({ length: 20 }, (_, i) => i + 6).map(num => (
                      <Button
                        key={num}
                        variant={selectedNumbers.includes(num.toString()) ? "default" : "outline"}
                        onClick={() => toggleIndividualNumber(num.toString())}
                        className="p-3 h-auto"
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Start Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleStartPractice}
                  disabled={selectedNumbers.length === 0}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Начать практику
                </Button>
              </div>

              {/* Selection Summary */}
              {selectedNumbers.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <p className="text-blue-800">
                      <strong>Выбрано номеров:</strong> {selectedNumbers.join(', ')}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : showStatistics ? (
            /* Statistics Window */
            <TestStatisticsWindow
              sessionResults={sessionResults}
              onGoToQuestion={handleGoToQuestion}
              onStartNewTest={handleNewTest}
              isReviewMode={isReviewMode}
              currentQuestionData={
                isReviewMode && reviewQuestionIndex !== null
                  ? {
                      question: sessionResults[reviewQuestionIndex],
                      onBackToSummary: handleBackToSummary,
                    }
                  : undefined
              }
            />
          ) : (
            /* Practice Interface */
            questions.length > 0 && currentQuestion ? (
            <Card className="mb-6">
              <CardHeader>
                 <CardTitle className="flex justify-between items-center">
                   <span>Вопрос №{currentQuestion.problem_number_type} ({currentQuestionIndex + 1} из {questions.length})</span>
                   <div className="flex items-center gap-4">
                     <Button
                       onClick={handleFinishTest}
                       variant="outline"
                       className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                     >
                       Завершить тест
                     </Button>
                     <div className="flex items-center gap-2">
                       <span className="text-sm font-normal text-gray-500">
                         ID: {currentQuestion.question_id}
                       </span>
                       {currentQuestion.status === 'correct' && (
                         <CheckCircle className="w-4 h-4 text-green-600" />
                       )}
                       {currentQuestion.status === 'wrong' && (
                         <XCircle className="w-4 h-4 text-red-600" />
                       )}
                       {currentQuestion.status === 'unfinished' && (
                         <div className="w-4 h-4 rounded-full border-2 border-yellow-500 bg-yellow-100" title="Начато, но не завершено" />
                       )}
                     </div>
                   </div>
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
                <div className="flex gap-3 flex-wrap">
                  <Button
                    variant="outline"
                    onClick={handleShowSolution}
                    className="flex-1 min-w-32"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Показать решение
                  </Button>
                  
                  {!isAnswered && (
                    <Button
                      variant="outline"
                      onClick={skipQuestion}
                      className="flex-1 min-w-32"
                    >
                      Пропустить
                    </Button>
                  )}
                  
                  {isAnswered && currentQuestionIndex < questions.length - 1 && (
                    <Button onClick={nextQuestion} className="flex-1 min-w-32">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Следующий вопрос
                    </Button>
                  )}
                  
                  <Button variant="outline" onClick={handleBackToSelection} className="flex-1 min-w-32">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Назад к выбору
                  </Button>
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
            ) : null
          )}


          {/* Results Summary */}
          {practiceStarted && questions.length > 0 && !showStatistics && (
            <Card>
              <CardHeader>
                <CardTitle>Статистика</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Найдено {questions.length} вопросов для выбранных номеров
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
