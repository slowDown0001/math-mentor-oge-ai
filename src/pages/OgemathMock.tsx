import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, ArrowRight, Home, ArrowLeft, Camera, Clock, BookOpen, Menu, Hash } from "lucide-react";
import { Link } from "react-router-dom";
import MathRenderer from "@/components/MathRenderer";
import { toast } from "sonner";
import FormulaBookletDialog from "@/components/FormulaBookletDialog";

interface Question {
  question_id: string;
  problem_text: string;
  answer: string;
  solution_text: string;
  difficulty?: string | number;
  problem_number_type?: number;
  problem_image?: string;
  solutiontextexpanded?: string;
}

interface ExamResult {
  questionIndex: number;
  questionId: string;
  isCorrect: boolean | null;
  userAnswer: string;
  correctAnswer: string;
  problemText: string;
  solutionText: string;
  timeSpent: number;
  photoFeedback?: string;
  photoScores?: number;
  problemNumber: number;
}

const OgemathMock = () => {
  const { user } = useAuth();
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null);
  const [examId, setExamId] = useState<string>("");
  
  // Timer state
  const [examStartTime, setExamStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  // Photo upload states for problems 20-25
  const [showTelegramNotConnected, setShowTelegramNotConnected] = useState(false);
  const [showUploadPrompt, setShowUploadPrompt] = useState(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [photoFeedback, setPhotoFeedback] = useState<string>("");
  const [photoScores, setPhotoScores] = useState<number | null>(null);
  
  // Formula booklet state
  const [showFormulaBooklet, setShowFormulaBooklet] = useState(false);
  
  // Review mode states
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewQuestionIndex, setReviewQuestionIndex] = useState<number | null>(null);
  
  // Question navigation menu state
  const [showQuestionMenu, setShowQuestionMenu] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isPhotoQuestion = currentQuestion?.problem_number_type && currentQuestion.problem_number_type >= 20;
  
  // Timer effect - counts up to 3 hours 55 minutes (235 minutes)
  useEffect(() => {
    if (!examStartTime || examFinished) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - examStartTime.getTime()) / 1000);
      setElapsedTime(elapsed);
      
      // Check if time is up (3 hours 55 minutes = 14,100 seconds)
      if (elapsed >= 14100) {
        setIsTimeUp(true);
        handleFinishExam();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [examStartTime, examFinished]);
  
  // Format timer display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate question selection logic
  const generateQuestionSelection = async () => {
    setLoading(true);
    try {
      const selectedQuestions: Question[] = [];
      
      // Step 1: Select problems 1-5
      const contextTypes = ['uchastki', 'pechi', 'bumaga', 'shini', 'dorogi', 'kvartiri', 'internet'];
      const selectedContext = contextTypes[Math.floor(Math.random() * contextTypes.length)];
      
      let contextQuestions: Question[] = [];
      
      if (selectedContext === 'internet') {
        const Y = Math.floor(Math.random() * 26) + 1;
        for (let i = 0; i < 5; i++) {
          const questionId = `OGE_SHinternet_1_1_${Y + i}`;
          const { data, error } = await supabase
            .from('oge_math_fipi_bank')
            .select('*')
            .eq('question_id', questionId)
            .single();
          
          if (data && !error) {
            contextQuestions.push(data);
          } else {
            // Retry with different Y if question not found
            console.warn(`Question ${questionId} not found, retrying...`);
            const retryY = Math.floor(Math.random() * 26) + 1;
            const retryQuestionId = `OGE_SHinternet_1_1_${retryY + i}`;
            const { data: retryData } = await supabase
              .from('oge_math_fipi_bank')
              .select('*')
              .eq('question_id', retryQuestionId)
              .single();
            if (retryData) contextQuestions.push(retryData);
          }
        }
      } else {
        const ranges = {
          'bumaga': 3,
          'dorogi': 10,
          'kvartiri': 5,
          'pechi': 5,
          'shini': 4,
          'uchastki': 4
        };
        
        const X = Math.floor(Math.random() * ranges[selectedContext as keyof typeof ranges]) + 1;
        
        for (let i = 1; i <= 5; i++) {
          const questionId = `OGE_SH${selectedContext}_1_${X}_${i}`;
          const { data, error } = await supabase
            .from('oge_math_fipi_bank')
            .select('*')
            .eq('question_id', questionId)
            .single();
          
          if (data && !error) {
            contextQuestions.push(data);
          } else {
            // Retry with different X if question not found
            console.warn(`Question ${questionId} not found, retrying...`);
            const retryX = Math.floor(Math.random() * ranges[selectedContext as keyof typeof ranges]) + 1;
            const retryQuestionId = `OGE_SH${selectedContext}_1_${retryX}_${i}`;
            const { data: retryData } = await supabase
              .from('oge_math_fipi_bank')
              .select('*')
              .eq('question_id', retryQuestionId)
              .single();
            if (retryData) contextQuestions.push(retryData);
          }
        }
      }
      
      selectedQuestions.push(...contextQuestions);
      
      // Step 2: Select problems 6-25
      for (let problemNum = 6; problemNum <= 25; problemNum++) {
        const { data, error } = await supabase
          .from('oge_math_fipi_bank')
          .select('*')
          .eq('problem_number_type', problemNum);
        
        if (data && data.length > 0) {
          const randomQuestion = data[Math.floor(Math.random() * data.length)];
          selectedQuestions.push(randomQuestion);
        } else {
          console.warn(`No questions found for problem number ${problemNum}`);
        }
      }
      
      // Ensure we have exactly 25 questions
      if (selectedQuestions.length < 25) {
        toast.error('Не удалось загрузить все вопросы экзамена');
        return;
      }
      
      setQuestions(selectedQuestions.slice(0, 25));
      setCurrentQuestionIndex(0);
      setUserAnswer("");
      setQuestionStartTime(new Date());
      
    } catch (error) {
      console.error('Error generating exam questions:', error);
      toast.error('Ошибка при загрузке вопросов экзамена');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async () => {
    if (!user) {
      toast.error('Войдите в систему для прохождения экзамена');
      return;
    }
    
    // Generate unique exam ID (UUID format)
    const crypto = window.crypto || (window as any).msCrypto;
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const newExamId = `${array[0].toString(16).padStart(2, '0')}${array[1].toString(16).padStart(2, '0')}${array[2].toString(16).padStart(2, '0')}${array[3].toString(16).padStart(2, '0')}-${array[4].toString(16).padStart(2, '0')}${array[5].toString(16).padStart(2, '0')}-${array[6].toString(16).padStart(2, '0')}${array[7].toString(16).padStart(2, '0')}-${array[8].toString(16).padStart(2, '0')}${array[9].toString(16).padStart(2, '0')}-${array[10].toString(16).padStart(2, '0')}${array[11].toString(16).padStart(2, '0')}${array[12].toString(16).padStart(2, '0')}${array[13].toString(16).padStart(2, '0')}${array[14].toString(16).padStart(2, '0')}${array[15].toString(16).padStart(2, '0')}`;
    setExamId(newExamId);
    
    // Save exam_id to profiles table
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ exam_id: newExamId })
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error saving exam_id to profiles:', error);
        toast.error('Ошибка при сохранении идентификатора экзамена');
        return;
      }
    } catch (error) {
      console.error('Error updating profile with exam_id:', error);
      toast.error('Ошибка при подготовке экзамена');
      return;
    }
    
    setExamStarted(true);
    setExamStartTime(new Date());
    await generateQuestionSelection();
  };

  // Helper function to check if answer is non-numeric
  const isNonNumericAnswer = (answer: string): boolean => {
    if (!answer) return false;
    // Check if answer contains units (like кг, м, см, etc.)
    if (/\p{L}/u.test(answer)) return true;
    // Check if answer contains LaTeX expressions (contains backslashes)
    if (answer.includes('\\')) return true;
    // Check if answer contains mathematical expressions that aren't just numbers
    if (/[а-яё]/i.test(answer)) return true;
    return false;
  };

  // Helper function to check if a string is purely numeric
  const isNumeric = (str: string): boolean => {
    const cleaned = str.trim();
    return /^-?\d+([.,]\d+)?$/.test(cleaned);
  };

  // Helper function to sanitize numeric input
  const sanitizeNumericAnswer = (answer: string): string => {
    return answer.trim().replace(/\s/g, '').replace(',', '.');
  };

  const handleNextQuestion = async () => {
    if (!currentQuestion || !questionStartTime) return;
    
    const timeSpent = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000);
    const problemNumber = currentQuestion.problem_number_type || currentQuestionIndex + 1;
    
    // Check answer and process result
    let isCorrect: boolean | null = null;
    let analysisOutput = "";
    let scores = 0;
    
    if (user) {
      // Start attempt for this question
      await startAttempt(currentQuestion.question_id, problemNumber, timeSpent);
      
      // Check if answer was provided
      if (userAnswer.trim()) {
        if (problemNumber >= 20) {
          // For problems 20-25, use photo analysis
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('exam_id')
              .eq('user_id', user.id)
              .single();
            
            const currentExamId = profile?.exam_id || examId;
            
            const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('analyze-photo-solution', {
              body: {
                student_solution: userAnswer.trim(),
                problem_text: currentQuestion.problem_text,
                solution_text: currentQuestion.solution_text,
                user_id: user.id,
                question_id: currentQuestion.question_id,
                exam_id: currentExamId,
                problem_number: problemNumber.toString()
              }
            });
            
            if (analysisError) {
              console.error('Error calling analyze-photo-solution:', analysisError);
              analysisOutput = "Ошибка анализа";
              scores = 0;
              isCorrect = false;
            } else {
              console.log('Photo analysis completed:', analysisResult);
              analysisOutput = analysisResult?.feedback || "Анализ завершен";
              // Parse JSON to get scores if available
              try {
                const feedbackData = JSON.parse(analysisResult?.feedback || "{}");
                scores = feedbackData.scores || 0;
                isCorrect = scores >= 2;
              } catch {
                scores = 0;
                isCorrect = false;
              }
            }
          } catch (error) {
            console.error('Error with photo analysis function:', error);
            analysisOutput = "Ошибка обработки";
            scores = 0;
            isCorrect = false;
          }
        } else {
          // For problems 1-19, save user's answer to photo_analysis_outputs
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('exam_id')
              .eq('user_id', user.id)
              .single();
            
            const currentExamId = profile?.exam_id || examId;
            
            await supabase
              .from('photo_analysis_outputs')
              .insert({
                user_id: user.id,
                question_id: currentQuestion.question_id,
                exam_id: currentExamId,
                problem_number: problemNumber.toString(),
                raw_output: userAnswer.trim(),
                analysis_type: 'solution'
              });
          } catch (error) {
            console.error('Error saving user answer:', error);
          }
          
          // Quick client-side check for immediate feedback
          const correctAnswer = currentQuestion.answer;
          if (isNumeric(correctAnswer)) {
            const sanitizedUserAnswer = sanitizeNumericAnswer(userAnswer);
            const sanitizedCorrectAnswer = sanitizeNumericAnswer(correctAnswer);
            isCorrect = sanitizedUserAnswer === sanitizedCorrectAnswer;
          } else {
            // For non-numeric, we'll do a basic comparison for now
            // Full validation will happen at exam completion
            isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase();
          }
        }
        
        // Complete the attempt
        await completeAttempt(isCorrect, scores);
        
        // Submit to handle-submission for mastery tracking
        await submitToHandleSubmission(isCorrect, scores);
      } else {
        // Question was skipped - save 'False' to photo_analysis_outputs
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('exam_id')
            .eq('user_id', user.id)
            .single();
          
          const currentExamId = profile?.exam_id || examId;
          
          await supabase
            .from('photo_analysis_outputs')
            .insert({
              user_id: user.id,
              question_id: currentQuestion.question_id,
              exam_id: currentExamId,
              problem_number: problemNumber.toString(),
              raw_output: 'False',
              analysis_type: problemNumber >= 20 ? 'photo_solution' : 'solution'
            });
        } catch (error) {
          console.error('Error saving skipped question:', error);
        }
        
        // Complete attempt as not finished
        await completeAttempt(false, 0);
        isCorrect = false;
      }
    }
    
    // Save current question result
    const result: ExamResult = {
      questionIndex: currentQuestionIndex,
      questionId: currentQuestion.question_id,
      isCorrect,
      userAnswer: userAnswer.trim(),
      correctAnswer: currentQuestion.answer,
      problemText: currentQuestion.problem_text,
      solutionText: currentQuestion.solution_text,
      timeSpent,
      photoFeedback: analysisOutput,
      photoScores: scores,
      problemNumber
    };
    
    setExamResults(prev => {
      const newResults = [...prev];
      const existingIndex = newResults.findIndex(r => r && r.questionIndex === currentQuestionIndex);
      if (existingIndex >= 0) {
        newResults[existingIndex] = result;
      } else {
        newResults.push(result);
      }
      return newResults;
    });
    
    // Move to next question or finish exam
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserAnswer("");
      setPhotoFeedback("");
      setPhotoScores(null);
      setQuestionStartTime(new Date());
    } else {
      handleFinishExam();
    }
  };

  // Start attempt logging when question is presented
  const startAttempt = async (questionId: string, problemNumberType: number, timeSpent: number) => {
    if (!user) return null;
    
    try {
      // Fetch question details to populate skills and topics
      let skillsArray: number[] = [];
      let topicsArray: string[] = [];

      try {
        const { data: detailsResp, error: detailsErr } = await supabase.functions.invoke('get-question-details', {
          body: { question_id: questionId, course_id: '1' }
        });
        if (detailsErr) {
          console.warn('get-question-details error (will fallback):', detailsErr);
        } else if (detailsResp?.data) {
          skillsArray = Array.isArray(detailsResp.data.skills_list) ? detailsResp.data.skills_list : [];
          topicsArray = Array.isArray(detailsResp.data.topics_list) ? detailsResp.data.topics_list : [];
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
          answer_time_start: questionStartTime?.toISOString() || new Date().toISOString(),
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
        return null;
      }

      if (data) {
        console.log('Started attempt:', data.attempt_id);
        return data.attempt_id;
      }
    } catch (error) {
      console.error('Error starting attempt:', error);
      return null;
    }
  };

  // Complete attempt
  const completeAttempt = async (isCorrect: boolean, scores: number) => {
    if (!user) return;

    try {
      // Get the most recent attempt for this user and question
      const { data: activityData, error: activityError } = await supabase
        .from('student_activity')
        .select('attempt_id')
        .eq('user_id', user.id)
        .eq('question_id', currentQuestion.question_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (activityError || !activityData) {
        console.error('Error getting attempt for completion:', activityError);
        return;
      }

      // Calculate duration
      const timeSpent = questionStartTime ? 
        Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000) : 0;

      // Complete the attempt using the complete-attempt function
      const { error: completeError } = await supabase.functions.invoke('complete-attempt', {
        body: {
          attempt_id: activityData.attempt_id,
          finished_or_not: true,
          is_correct: isCorrect,
          scores_fipi: scores
        }
      });

      if (completeError) {
        console.error('Error completing attempt:', completeError);
      } else {
        console.log(`Completed attempt: correct=${isCorrect}, scores=${scores}`);
      }
    } catch (error) {
      console.error('Error in completeAttempt:', error);
    }
  };

  // Submit to handle-submission for mastery tracking  
  const submitToHandleSubmission = async (isCorrect: boolean, scores: number) => {
    if (!user) return;

    try {
      // Get latest student_activity row for current user and question
      const { data: activityData, error: activityError } = await supabase
        .from('student_activity')
        .select('question_id, attempt_id, finished_or_not, duration_answer, scores_fipi')
        .eq('user_id', user.id)
        .eq('question_id', currentQuestion.question_id)
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
        finished_or_not: true,
        is_correct: isCorrect,
        duration: activityData.duration_answer,
        scores_fipi: scores
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
        return;
      }

      console.log('Handle submission completed:', data);
    } catch (error) {
      console.error('Error in submitToHandleSubmission:', error);
    }
  };

  const handleFinishExam = async () => {
    setExamFinished(true);
    await checkAllAnswers();
    
    // Fetch exam results from photo_analysis_outputs
    if (user) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('exam_id')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.exam_id) {
          const { data: photoResults, error } = await supabase
            .from('photo_analysis_outputs')
            .select('*')
            .eq('exam_id', profile.exam_id)
            .eq('user_id', user.id);
          
          if (error) {
            console.error('Error fetching exam results:', error);
          } else {
            console.log('Exam results from photo_analysis_outputs:', photoResults);
            // Store results for use in review mode
            setPhotoFeedback(JSON.stringify(photoResults));
          }
        }
      } catch (error) {
        console.error('Error fetching exam results:', error);
      }
    }
  };

  const checkAllAnswers = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get exam_id from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('exam_id')
        .eq('user_id', user.id)
        .single();
      
      const currentExamId = profile?.exam_id || examId;
      
      // Fetch all results from photo_analysis_outputs for this exam
      const { data: analysisResults, error: analysisError } = await supabase
        .from('photo_analysis_outputs')
        .select('question_id, raw_output, problem_number, analysis_type')
        .eq('user_id', user.id)
        .eq('exam_id', currentExamId)
        .order('created_at', { ascending: false });
      
      if (analysisError) {
        console.error('Error fetching analysis results:', analysisError);
        toast.error('Ошибка при получении результатов анализа');
        setLoading(false);
        return;
      }
      
      // Create a map of question answers for easy lookup
      const questionAnswers = new Map();
      questions.forEach((q, index) => {
        questionAnswers.set(q.question_id, { answer: q.answer, problemText: q.problem_text, index });
      });
      
      // Update exam results with proper answer checking
      const updatedResults = [...examResults];
      
      if (analysisResults) {
        for (const analysisResult of analysisResults) {
          const problemNumber = parseInt(analysisResult.problem_number);
          const questionData = questionAnswers.get(analysisResult.question_id);
          
          if (!questionData) continue;
          
          let isCorrect = false;
          let feedback = "";
          let scores = 0;
          
          if (problemNumber >= 20) {
            // For problems 20-25, parse photo analysis JSON
            try {
              const feedbackData = JSON.parse(analysisResult.raw_output);
              if (feedbackData.review && typeof feedbackData.scores === 'number') {
                feedback = feedbackData.review;
                scores = feedbackData.scores;
                isCorrect = feedbackData.scores >= 2;
              } else {
                feedback = analysisResult.raw_output;
                scores = 0;
                isCorrect = false;
              }
            } catch (parseError) {
              console.error('Error parsing stored analysis:', parseError);
              feedback = analysisResult.raw_output;
              scores = 0;
              isCorrect = analysisResult.raw_output !== 'False';
            }
          } else {
            // For problems 1-19, check the stored user answer against correct answer
            const userAnswer = analysisResult.raw_output;
            const correctAnswer = questionData.answer;
            
            if (userAnswer === 'False') {
              // Question was skipped
              isCorrect = false;
              feedback = "Вопрос пропущен";
            } else {
              // Check if answer is correct
              if (isNumeric(correctAnswer)) {
                // Numeric comparison
                const sanitizedUserAnswer = sanitizeNumericAnswer(userAnswer);
                const sanitizedCorrectAnswer = sanitizeNumericAnswer(correctAnswer);
                isCorrect = sanitizedUserAnswer === sanitizedCorrectAnswer;
                feedback = isCorrect ? "Правильно" : "Неправильно";
              } else {
                // Non-numeric answer - use OpenRouter API for validation
                try {
                  const { data, error } = await supabase.functions.invoke('check-non-numeric-answer', {
                    body: {
                      student_answer: userAnswer,
                      correct_answer: correctAnswer,
                      problem_text: questionData.problemText
                    }
                  });

                  if (error) {
                    console.error('Error checking non-numeric answer:', error);
                    isCorrect = false;
                    feedback = "Ошибка проверки";
                  } else {
                    isCorrect = data?.is_correct || false;
                    feedback = isCorrect ? "Правильно" : "Неправильно";
                  }
                } catch (error) {
                  console.error('Error with non-numeric answer check:', error);
                  isCorrect = false;
                  feedback = "Ошибка проверки";
                }
              }
            }
          }
          
          // Update the corresponding result
          const resultIndex = updatedResults.findIndex(r => r.questionId === analysisResult.question_id);
          if (resultIndex >= 0) {
            updatedResults[resultIndex] = {
              ...updatedResults[resultIndex],
              isCorrect,
              photoFeedback: feedback,
              photoScores: scores
            };
          }
        }
      }
      
      setExamResults(updatedResults);
      
      // Calculate and display exam statistics
      const correctAnswers = updatedResults.filter(r => r.isCorrect === true).length;
      const totalQuestions = updatedResults.length;
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      
      toast.success(`Экзамен завершен! Результат: ${correctAnswers}/${totalQuestions} (${score}%)`);
      
    } catch (error) {
      console.error('Error checking answers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Photo attachment functionality
  const handlePhotoAttachment = async () => {
    if (!user) {
      toast.error('Войдите в систему для прохождения экзамена');
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

      // Store the photo solution and trigger analysis immediately (fire and forget)
      setUserAnswer(profile.telegram_input);
      setShowUploadPrompt(false);
      
      // Fire and forget: analyze photo immediately and save to database
      supabase.functions.invoke('check-photo-solution', {
        body: {
          student_solution: profile.telegram_input,
          problem_text: currentQuestion.problem_text,
          solution_text: currentQuestion.solution_text,
          user_id: user.id,
          question_id: currentQuestion.question_id,
          exam_id: examId
        }
      }).catch(error => {
        console.error('Background photo analysis error:', error);
      });
      
      toast.success('Фото решения сохранено и отправлено на анализ');
    } catch (error) {
      console.error('Error in handlePhotoCheck:', error);
      toast.error('Произошла ошибка при обработке решения');
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleGoToQuestion = (questionIndex: number) => {
    setIsReviewMode(true);
    setReviewQuestionIndex(questionIndex);
  };
  
  const handleBackToSummary = () => {
    setIsReviewMode(false);
    setReviewQuestionIndex(null);
  };

  const handleNavigateToQuestion = (questionIndex: number) => {
    // Save current answer before navigating
    if (!isReviewMode) {
      const currentTime = questionStartTime ? Date.now() - questionStartTime.getTime() : 0;
      const newResult: ExamResult = {
        questionIndex: currentQuestionIndex,
        questionId: currentQuestion?.question_id || '',
        isCorrect: null,
        userAnswer,
        correctAnswer: currentQuestion?.answer || '',
        problemText: currentQuestion?.problem_text || '',
        solutionText: currentQuestion?.solution_text || '',
        timeSpent: Math.floor(currentTime / 1000),
        problemNumber: currentQuestion?.problem_number_type || currentQuestionIndex + 1
      };

      setExamResults(prev => {
        const updated = [...prev];
        updated[currentQuestionIndex] = newResult;
        return updated;
      });
    }

    // Navigate to selected question
    setCurrentQuestionIndex(questionIndex);
    setUserAnswer(examResults[questionIndex]?.userAnswer || "");
    setQuestionStartTime(new Date());
    setShowQuestionMenu(false);
  };

  const calculateStatistics = () => {
    const correctAnswers = examResults.filter(r => r.isCorrect === true).length;
    const totalAnswers = examResults.length;
    const percentage = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
    
    // Calculate by problem type
    const part1Results = examResults.filter(r => r.problemNumber <= 19);
    const part2Results = examResults.filter(r => r.problemNumber >= 20);
    
    const part1Correct = part1Results.filter(r => r.isCorrect === true).length;
    const part2Correct = part2Results.filter(r => r.isCorrect === true).length;
    
    return {
      totalCorrect: correctAnswers,
      totalQuestions: totalAnswers,
      percentage,
      part1Correct,
      part1Total: part1Results.length,
      part2Correct,
      part2Total: part2Results.length,
      totalTimeSpent: examResults.reduce((sum, r) => sum + r.timeSpent, 0)
    };
  };

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-start">
              <Link to="/ogemath-practice">
                <Button className="bg-gradient-to-r from-yellow-200 to-yellow-300 hover:from-yellow-300 hover:to-yellow-400 text-black shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                  Назад
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <Clock className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Пробный экзамен ОГЭ</h1>
              <p className="text-lg text-gray-600 mb-6">
                Полноценный экзамен с таймером на 3 часа 55 минут
              </p>
            </div>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Условия экзамена</CardTitle>
              </CardHeader>
              <CardContent className="text-left space-y-3">
                <p>• <strong>25 вопросов</strong> в порядке от 1 до 25</p>
                <p>• <strong>Время:</strong> 3 часа 55 минут (таймер запускается автоматически)</p>
                <p>• <strong>Вопросы 1-19:</strong> текстовые ответы</p>
                <p>• <strong>Вопросы 20-25:</strong> развернутые решения с фото</p>
                <p>• <strong>Результаты:</strong> показываются только в конце экзамена</p>
              </CardContent>
            </Card>
            
            <Button 
              onClick={handleStartExam}
              disabled={loading || !user}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              {loading ? 'Подготовка экзамена...' : 'Начать экзамен'}
            </Button>
            
            {!user && (
              <Alert className="mt-4">
                <AlertDescription>
                  Войдите в систему для прохождения экзамена
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (examFinished && !isReviewMode) {
    const stats = calculateStatistics();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <Link to="/ogemath-practice">
                <Button className="bg-gradient-to-r from-yellow-200 to-yellow-300 hover:from-yellow-300 hover:to-yellow-400 text-black shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                  Назад к практике
                </Button>
              </Link>
              <div className="text-lg font-semibold text-gray-700">
                Экзамен завершен
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Результаты экзамена</h1>
              <div className="text-6xl font-bold mb-4">
                <span className={stats.percentage >= 60 ? 'text-green-600' : 'text-red-600'}>
                  {stats.percentage}%
                </span>
              </div>
              <p className="text-lg text-gray-600">
                {stats.totalCorrect} из {stats.totalQuestions} правильных ответов
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Часть 1 (1-19)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.part1Correct}/{stats.part1Total}
                  </div>
                  <p className="text-gray-600">Базовый уровень</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Часть 2 (20-25)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.part2Correct}/{stats.part2Total}
                  </div>
                  <p className="text-gray-600">Повышенный уровень</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Время</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-600">
                    {formatTime(stats.totalTimeSpent)}
                  </div>
                  <p className="text-gray-600">Общее время</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Подробные результаты</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {examResults.map((result, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className={`h-12 ${
                        result.isCorrect === true 
                          ? 'bg-green-100 border-green-300 hover:bg-green-200' 
                          : result.isCorrect === false 
                          ? 'bg-red-100 border-red-300 hover:bg-red-200'
                          : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                      }`}
                      onClick={() => handleGoToQuestion(index)}
                    >
                      <div className="text-center">
                        <div className="font-semibold">{index + 1}</div>
                        <div className="text-xs">
                          {result.isCorrect === true ? '✓' : result.isCorrect === false ? '✗' : '?'}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isReviewMode && reviewQuestionIndex !== null) {
    const reviewResult = examResults[reviewQuestionIndex];
    const reviewQuestion = questions[reviewQuestionIndex];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <Button onClick={handleBackToSummary}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                К результатам
              </Button>
              <div className="text-lg font-semibold text-gray-700">
                Вопрос {reviewQuestionIndex + 1} из {questions.length}
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Вопрос {reviewQuestionIndex + 1}
                  {reviewResult.isCorrect === true ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : reviewResult.isCorrect === false ? (
                    <XCircle className="w-6 h-6 text-red-600" />
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviewQuestion?.problem_image && (
                  <img 
                    src={reviewQuestion.problem_image} 
                    alt="Problem"
                    className="mb-4 max-w-full h-auto"
                  />
                )}
                <MathRenderer text={reviewQuestion?.problem_text || ''} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ваш ответ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-mono p-3 bg-gray-50 rounded">
                    {reviewResult.userAnswer || 'Не отвечено'}
                  </div>
                  {reviewResult.photoFeedback && (
                    <div className="mt-3">
                      <strong>Оценка:</strong>
                      <div className="mt-1 p-3 bg-blue-50 rounded text-sm">
                        {reviewResult.photoFeedback}
                      </div>
                      <div className="mt-2">
                        <strong>Баллы:</strong> {reviewResult.photoScores || 0}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Правильный ответ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-mono p-3 bg-green-50 rounded">
                    {reviewResult.correctAnswer}
                  </div>
                </CardContent>
              </Card>
            </div>

            {reviewQuestion?.solution_text && (
              <Card>
                <CardHeader>
                  <CardTitle>Решение</CardTitle>
                </CardHeader>
                <CardContent>
                  <MathRenderer text={reviewQuestion.solution_text} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with timer */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button onClick={() => setShowFormulaBooklet(true)} variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                Справочные материалы
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`text-xl font-bold ${isTimeUp ? 'text-red-600' : 'text-blue-600'}`}>
                <Clock className="w-5 h-5 inline mr-2" />
                {formatTime(elapsedTime)}
              </div>
              
              <Button 
                onClick={() => setShowQuestionMenu(true)}
                variant="outline"
                className="bg-blue-50 hover:bg-blue-100 border-blue-200"
              >
                <Menu className="w-4 h-4 mr-2" />
                Вопросы
              </Button>
              
              <Button 
                onClick={handleFinishExam}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Завершить экзамен
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Вопрос {currentQuestionIndex + 1} из {questions.length}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% завершено
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {loading ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-lg">Загрузка вопроса...</div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  Задание {currentQuestionIndex + 1}
                  {currentQuestion?.problem_number_type && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      (Номер {currentQuestion.problem_number_type})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentQuestion?.problem_image && (
                  <img 
                    src={currentQuestion.problem_image} 
                    alt="Problem"
                    className="mb-4 max-w-full h-auto"
                  />
                )}
                
                <div className="mb-6">
                  <MathRenderer text={currentQuestion?.problem_text || ''} />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ваш ответ:
                    </label>
                    <Input
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Введите ваш ответ"
                      className="text-lg"
                    />
                  </div>

                  {isPhotoQuestion && (
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

                  <div className="flex justify-between">
                    <div className="flex gap-3">
                      {currentQuestionIndex > 0 && (
                        <Button 
                          onClick={() => {
                            setCurrentQuestionIndex(prev => prev - 1);
                            setUserAnswer(examResults[currentQuestionIndex - 1]?.userAnswer || "");
                          }}
                          variant="outline"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Предыдущий
                        </Button>
                      )}
                    </div>

                    <Button 
                      onClick={handleNextQuestion}
                      className="flex items-center gap-2"
                    >
                      {currentQuestionIndex === questions.length - 1 ? 'Завершить экзамен' : 'Следующий вопрос'}
                      {currentQuestionIndex < questions.length - 1 && <ArrowRight className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Telegram Not Connected Dialog */}
      <Dialog open={showTelegramNotConnected} onOpenChange={setShowTelegramNotConnected}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
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

      {/* Question Navigation Menu */}
      <Dialog open={showQuestionMenu} onOpenChange={setShowQuestionMenu}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hash className="w-5 h-5" />
              Навигация по вопросам
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-5 gap-3">
              {questions.map((_, index) => {
                const hasAnswer = examResults[index]?.userAnswer;
                const isCurrent = index === currentQuestionIndex;
                return (
                  <Button
                    key={index}
                    variant={isCurrent ? "default" : "outline"}
                    className={`h-14 ${
                      isCurrent 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : hasAnswer 
                        ? 'bg-green-50 border-green-300 hover:bg-green-100' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleNavigateToQuestion(index)}
                  >
                    <div className="text-center">
                      <div className="font-semibold">{index + 1}</div>
                      <div className="text-xs mt-1">
                        {hasAnswer ? '✓' : '○'}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span>Текущий вопрос</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                <span>Отвечен</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-gray-300 rounded"></div>
                <span>Не отвечен</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Formula booklet */}
      <FormulaBookletDialog 
        open={showFormulaBooklet} 
        onOpenChange={setShowFormulaBooklet} 
      />

      {isTimeUp && (
        <Alert className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-red-50 border-red-200">
          <AlertDescription className="text-red-800">
            Время экзамена истекло! Экзамен завершается автоматически.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default OgemathMock;