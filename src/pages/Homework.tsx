import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BookOpen, Trophy, Target, Clock, ArrowRight, Check, X, Eye, BarChart3, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import MathRenderer from '@/components/MathRenderer';

interface HomeworkData {
  mcq_questions: string[];
  fipi_questions: string[];
  assigned_date?: string;
  due_date?: string;
}

interface Question {
  id: string;
  text: string;
  options?: string[];
  correct_answer?: string;
  problem_number?: number;
  solution_text?: string;
  difficulty?: number;
  skills?: number;
}

interface ProgressStats {
  totalTime: number;
  avgTime: number;
  showedSolutionCount: number;
  skillsWorkedOn: number[];
  difficultyBreakdown: Record<string, number>;
}

const Homework = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [homeworkData, setHomeworkData] = useState<HomeworkData | null>(null);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set());
  const [correctAnswers, setCorrectAnswers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionType, setQuestionType] = useState<'mcq' | 'frq'>('mcq');
  const [showCongrats, setShowCongrats] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [homeworkName, setHomeworkName] = useState<string>('');
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null);
  const [existingProgress, setExistingProgress] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Mastery tracking states (for FIPI questions)
  const [currentAttemptId, setCurrentAttemptId] = useState<number | null>(null);
  const [attemptStartTime, setAttemptStartTime] = useState<Date | null>(null);

  const loadUserProfile = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('homework')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }
      
      setUserProfile(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const getLatestSession = async () => {
    if (!user?.id) return null;
    
    try {
      const { data, error } = await supabase
        .from('homework_progress')
        .select('session_id, homework_name')
        .eq('user_id', user.id)
        .eq('homework_name', homeworkName)
        .eq('completion_status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error getting latest session:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting latest session:', error);
      return null;
    }
  };

  // Start attempt for FIPI questions (create student_activity record)
  const startFIPIAttempt = async (questionId: string) => {
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

      // Insert into student_activity table
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
        console.error('Error starting FIPI attempt:', error);
        return;
      }

      if (data) {
        setCurrentAttemptId(data.attempt_id);
        setAttemptStartTime(new Date());
        console.log('Started FIPI attempt:', data.attempt_id);
      }
    } catch (error) {
      console.error('Error starting FIPI attempt:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadHomeworkData();
      loadUserProfile();
    }
  }, [user]);
  
  useEffect(() => {
    if (homeworkData && user && userProfile) {
      checkExistingProgress();
    }
  }, [homeworkData, user, userProfile]);


  useEffect(() => {
    if (currentQuestions.length > 0) {
      setQuestionStartTime(Date.now());
      
      // Start attempt for FIPI questions when shown
      const currentQuestion = currentQuestions[currentQuestionIndex];
      if (currentQuestion && questionType === 'frq' && user) {
        startFIPIAttempt(currentQuestion.id);
      }
    }
  }, [currentQuestionIndex, currentQuestions]);

  useEffect(() => {
    if (user?.id && currentQuestions.length > 0 && homeworkName && !existingProgress) {
      recordSessionStart();
    }
  }, [user?.id, currentQuestions.length, homeworkName, existingProgress]);

  const checkExistingProgress = async () => {
    if (!user?.id || !homeworkData || !userProfile?.homework) return;

    try {
      // Extract homework_name from user profile
      const homeworkJson = typeof userProfile.homework === 'string' 
        ? JSON.parse(userProfile.homework) 
        : userProfile.homework;
      
      const currentHomeworkName = homeworkJson.homework_name || 'Homework';
      setHomeworkName(currentHomeworkName);
      
      // Check for existing homework progress with this homework_name
      const { data: existingSessions, error } = await supabase
        .from('homework_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('homework_name', currentHomeworkName)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error checking existing progress:', error);
        // If no existing progress, start fresh
        loadQuestions();
        return;
      }

      if (existingSessions && existingSessions.length > 0) {
        // Check if homework is already completed
        const completedSession = existingSessions.find(s => s.completion_status === 'completed');
        if (completedSession) {
          // Load questions first, then show congratulations
          await loadQuestions();
          setExistingProgress(completedSession);
          
          // Load progress stats for the completed session
          await loadProgressStats();
          
          setShowCongrats(true);
          return;
        }

        // Get all completed questions for this homework_name
        const completedQuestionsList = existingSessions
          .filter(s => s.question_id)
          .map(s => s.question_id);
        
        const correctQuestions = existingSessions
          .filter(s => s.question_id && s.is_correct)
          .map(s => s.question_id);

        // Load questions and then resume from where they left off
        await loadQuestions();
        
        // Set completed and correct questions
        setCompletedQuestions(new Set(completedQuestionsList));
        setCorrectAnswers(new Set(correctQuestions));
        
        // Check if all MCQ questions are completed and we need to move to FRQ
        const allMCQCompleted = homeworkData.mcq_questions?.every(qid => 
          completedQuestionsList.includes(qid)
        ) || false;
        
        if (allMCQCompleted && homeworkData?.fipi_questions?.length > 0) {
          // User should continue with FRQ questions
          loadFRQQuestions();
        }
        
        // Set existing progress for stats
        setExistingProgress(existingSessions[0]);
        
      } else {
        // No existing progress, start fresh
        loadQuestions();
      }
    } catch (error) {
      console.error('Error checking existing progress:', error);
      // If error, start fresh
      loadQuestions();
    }
  };

  const recordSessionStart = async () => {
    if (!user?.id || !homeworkName) return;
    
    try {
      const { data, error } = await supabase.from('homework_progress').insert({
        user_id: user.id,
        homework_task: `Homework ${new Date().toLocaleDateString()} - Session Start`,
        homework_name: homeworkName,
        total_questions: currentQuestions.length,
        questions_completed: 0,
        questions_correct: 0,
        completion_status: 'in_progress'
      }).select('session_id').single();
      
      if (error) {
        console.error('Error recording session start:', error);
      } else {
        console.log('Session started with ID:', data?.session_id);
      }
    } catch (error) {
      console.error('Error recording session start:', error);
    }
  };

  const loadHomeworkData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading homework:', error);
        setLoading(false);
        return;
      }

      if (data && (data as any).homework) {
        try {
          const parsedHomework = JSON.parse((data as any).homework);
          
          const transformedHomework = {
            mcq_questions: parsedHomework.MCQ || parsedHomework.mcq_questions || [],
            fipi_questions: parsedHomework.FIPI || parsedHomework.fipi_questions || [],
            assigned_date: parsedHomework.assigned_date,
            due_date: parsedHomework.due_date
          };
          
          setHomeworkData(transformedHomework);
        } catch (parseError) {
          console.error('Error parsing homework JSON:', parseError);
          toast({
            title: "Ошибка",
            description: "Неверный формат домашнего задания",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error fetching homework:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    if (!homeworkData) return;
    
    setLoadingQuestions(true);
    
    // Start with MCQ questions
    if (homeworkData.mcq_questions?.length > 0) {
      await loadMCQQuestions();
    } else if (homeworkData.fipi_questions?.length > 0) {
      setQuestionType('frq');
      await loadFRQQuestions();
    }
    
    setLoadingQuestions(false);
  };

  const loadMCQQuestions = async () => {
    if (!homeworkData?.mcq_questions?.length) return;

    try {
      const { data: mcqData, error } = await supabase
        .from('oge_math_skills_questions')
        .select('*')
        .in('question_id', homeworkData.mcq_questions);

      if (error) {
        console.error('Error loading MCQ questions:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить вопросы MCQ",
          variant: "destructive"
        });
        return;
      }

      const mcqQuestions: Question[] = mcqData?.map((q, index) => ({
        id: q.question_id,
        text: q.problem_text || '',
        options: [q.option1, q.option2, q.option3, q.option4].filter(Boolean),
        correct_answer: q.answer || '',
        solution_text: q.solution_text || '',
        problem_number: typeof q.problem_number_type === 'string' ? parseInt(q.problem_number_type) || index + 1 : q.problem_number_type || index + 1,
        difficulty: q.difficulty || null,
        skills: q.skills || null
      })) || [];

      setCurrentQuestions(mcqQuestions);
      setQuestionType('mcq');
      
      // If resuming, find the next uncompleted question
      if (completedQuestions.size > 0) {
        const nextUncompletedIndex = mcqQuestions.findIndex(q => !completedQuestions.has(q.id));
        setCurrentQuestionIndex(nextUncompletedIndex >= 0 ? nextUncompletedIndex : 0);
      } else {
        setCurrentQuestionIndex(0);
      }
    } catch (error) {
      console.error('Error loading MCQ questions:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при загрузке вопросов",
        variant: "destructive"
      });
    }
  };

  const loadFRQQuestions = async () => {
    if (!homeworkData?.fipi_questions?.length) return;

    try {
      const { data: frqData, error } = await supabase
        .from('oge_math_fipi_bank')
        .select('*')
        .in('question_id', homeworkData.fipi_questions);

      if (error) {
        console.error('Error loading FRQ questions:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить задачи ФИПИ",
          variant: "destructive"
        });
        return;
      }

      const frqQuestions: Question[] = frqData?.map((q, index) => ({
        id: q.question_id,
        text: q.problem_text || '',
        correct_answer: q.answer || '',
        solution_text: q.solution_text || '',
        problem_number: q.problem_number_type || index + 1,
        difficulty: q.difficulty || null
      })) || [];

      setCurrentQuestions(frqQuestions);
      setQuestionType('frq');
      
      // If resuming, find the next uncompleted question
      if (completedQuestions.size > 0) {
        const nextUncompletedIndex = frqQuestions.findIndex(q => !completedQuestions.has(q.id));
        setCurrentQuestionIndex(nextUncompletedIndex >= 0 ? nextUncompletedIndex : 0);
      } else {
        setCurrentQuestionIndex(0);
      }
    } catch (error) {
      console.error('Error loading FRQ questions:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при загрузке задач",
        variant: "destructive"
      });
    }
  };

  const recordQuestionProgress = async (
    questionId: string, 
    userAnswer: string, 
    correctAnswer: string, 
    isCorrect: boolean, 
    responseTime: number, 
    showedSolution: boolean
  ) => {
    if (!user?.id || !homeworkName) return;

    try {
      const currentQuestion = currentQuestions.find(q => q.id === questionId);
      const questionType = homeworkData?.mcq_questions?.includes(questionId) ? 'mcq' : 'fipi';
      
      // Get or generate session_id from existing records
      const { data: existingSession } = await supabase
        .from('homework_progress')
        .select('session_id')
        .eq('user_id', user.id)
        .eq('homework_name', homeworkName)
        .eq('completion_status', 'in_progress')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      const sessionId = existingSession?.session_id;
      
      console.log('Recording question progress:', {
        questionId,
        sessionId,
        isCorrect,
        responseTime,
        showedSolution,
        skills: currentQuestion?.skills
      });
      
      await supabase.from('homework_progress').insert({
        user_id: user.id,
        session_id: sessionId, // Use the same session_id
        homework_task: `Homework ${new Date().toLocaleDateString()}`,
        homework_name: homeworkName,
        question_id: questionId,
        question_type: questionType,
        user_answer: userAnswer,
        correct_answer: correctAnswer,
        is_correct: isCorrect,
        showed_solution: showedSolution,
        response_time_seconds: responseTime,
        difficulty_level: currentQuestion?.difficulty || null,
        skill_ids: currentQuestion?.skills ? [currentQuestion.skills] : null,
        problem_number: currentQuestion?.problem_number || null
      });
      
      console.log('Question progress recorded successfully');
    } catch (error) {
      console.error('Error recording progress:', error);
    }
  };

  const loadProgressStats = async () => {
    if (!user?.id || !homeworkName) return;

    try {
      const { data, error } = await supabase
        .from('homework_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('homework_name', homeworkName)
        .not('question_id', 'is', null);

      if (error) throw error;

      if (data) {
        const stats: ProgressStats = {
          totalTime: data.reduce((sum, record) => sum + (record.response_time_seconds || 0), 0),
          avgTime: data.length > 0 ? Math.round(data.reduce((sum, record) => sum + (record.response_time_seconds || 0), 0) / data.length) : 0,
          showedSolutionCount: data.filter(record => record.showed_solution).length,
          skillsWorkedOn: [...new Set(data.flatMap(record => record.skill_ids || []))],
          difficultyBreakdown: data.reduce((acc, record) => {
            const level = record.difficulty_level || 'unknown';
            acc[level] = (acc[level] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        };
        setProgressStats(stats);
      }
    } catch (error) {
      console.error('Error loading progress stats:', error);
    }
  };

  const handleSubmitAnswer = async () => {
    const currentQuestion = currentQuestions[currentQuestionIndex];
    if (!currentQuestion || !user) return;

    const answer = questionType === 'mcq' ? selectedOption : userAnswer;
    if (!answer) {
      toast({
        title: "Ответ не выбран",
        description: "Пожалуйста, выберите или введите ответ",
        variant: "destructive"
      });
      return;
    }

    const correct = answer === currentQuestion.correct_answer;
    const responseTime = Math.floor((Date.now() - questionStartTime) / 1000);
    
    setIsCorrect(correct);
    setShowAnswer(true);

    setCompletedQuestions(prev => new Set([...prev, currentQuestion.id]));
    if (correct) {
      setCorrectAnswers(prev => new Set([...prev, currentQuestion.id]));
    }

    // Record progress in database
    await recordQuestionProgress(currentQuestion.id, answer, currentQuestion.correct_answer || '', correct, responseTime, false);

    // Update mastery tracking
    console.log('About to update mastery tracking, questionType:', questionType, 'skills:', currentQuestion.skills);
    if (questionType === 'mcq' && currentQuestion.skills) {
      // For MCQ questions, call process-mcq-skill-attempt
      console.log('Calling processMCQSkillAttempt for MCQ question');
      await processMCQSkillAttempt(currentQuestion, correct, responseTime);
    } else if (questionType === 'frq') {
      // For FIPI questions, update student_activity and call handle-submission
      console.log('Processing FIPI question');
      await updateFIPIActivity(correct, 0);
      await submitToHandleSubmission(correct);
    } else {
      console.log('Skipping mastery tracking - no matching condition');
    }
  };

  // Process MCQ skill attempt for mastery tracking
  const processMCQSkillAttempt = async (question: Question, isCorrect: boolean, duration: number) => {
    if (!user || !question.skills) {
      console.log('Skipping MCQ skill attempt: no user or skills', { user: !!user, skills: question.skills });
      return;
    }

    console.log('Calling process-mcq-skill-attempt with:', {
      user_id: user.id,
      question_id: question.id,
      skill_id: question.skills,
      is_correct: isCorrect,
      difficulty: question.difficulty || 2,
      duration: duration,
      course_id: '1'
    });

    try {
      const { data, error } = await supabase.functions.invoke('process-mcq-skill-attempt', {
        body: {
          user_id: user.id,
          question_id: question.id,
          skill_id: question.skills,
          finished_or_not: true,
          is_correct: isCorrect,
          difficulty: question.difficulty || 2,
          duration: duration,
          course_id: '1'
        }
      });

      if (error) {
        console.error('Error recording MCQ skill attempt:', error);
        toast({
          title: "Предупреждение",
          description: "Не удалось обновить прогресс навыков: " + error.message,
          variant: "destructive"
        });
      } else {
        console.log('Successfully recorded MCQ skill attempt, response:', data);
      }
    } catch (error) {
      console.error('Error calling process-mcq-skill-attempt:', error);
      toast({
        title: "Предупреждение",
        description: "Ошибка при обновлении прогресса навыков",
        variant: "destructive"
      });
    }
  };

  // Update student_activity for FIPI questions
  const updateFIPIActivity = async (isCorrect: boolean, scores: number) => {
    if (!user || !currentAttemptId) return;

    try {
      const now = new Date();
      const startTime = attemptStartTime || new Date();
      const durationInSeconds = (now.getTime() - startTime.getTime()) / 1000;

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
      console.error('Error in updateFIPIActivity:', error);
    }
  };

  // Submit to handle-submission for FIPI question mastery tracking
  const submitToHandleSubmission = async (isCorrect: boolean) => {
    if (!user) return;

    try {
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

      const submissionData = {
        user_id: user.id,
        question_id: activityData.question_id,
        attempt_id: activityData.attempt_id,
        finished_or_not: activityData.finished_or_not,
        is_correct: isCorrect,
        duration: activityData.duration_answer,
        scores_fipi: activityData.scores_fipi
      };

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

  const handleShowSolution = async () => {
    const currentQuestion = currentQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    const responseTime = Math.floor((Date.now() - questionStartTime) / 1000);
    
    setShowSolution(true);
    setIsCorrect(false);
    setShowAnswer(true);
    setCompletedQuestions(prev => new Set([...prev, currentQuestion.id]));

    // Record that solution was shown
    const answer = questionType === 'mcq' ? selectedOption : userAnswer;
    await recordQuestionProgress(currentQuestion.id, answer || '', currentQuestion.correct_answer || '', false, responseTime, true);

    // Mark as wrong in mastery tracking (solution viewed before answering)
    if (questionType === 'mcq' && currentQuestion.skills) {
      // For MCQ questions, call process-mcq-skill-attempt with is_correct=false
      await processMCQSkillAttempt(currentQuestion, false, responseTime);
    } else if (questionType === 'frq') {
      // For FIPI questions, update student_activity and call handle-submission
      await updateFIPIActivity(false, 0);
      await submitToHandleSubmission(false);
    }
  };

  const handleNextQuestion = () => {
    setShowAnswer(false);
    setIsCorrect(null);
    setUserAnswer('');
    setSelectedOption(null);
    setShowSolution(false);
    setQuestionStartTime(Date.now()); // Reset timer for new question
    
    // Reset FIPI attempt tracking
    setCurrentAttemptId(null);
    setAttemptStartTime(null);

    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Move to next question type or show completion
      if (questionType === 'mcq' && homeworkData?.fipi_questions?.length > 0) {
        loadFRQQuestions();
      } else {
        // All questions completed
        completeHomework();
      }
    }
  };

  const completeHomework = async () => {
    if (!user?.id || !homeworkName) return;

    // Calculate total questions from both MCQ and FRQ
    const totalMCQ = homeworkData?.mcq_questions?.length || 0;
    const totalFRQ = homeworkData?.fipi_questions?.length || 0;
    const totalQuestions = totalMCQ + totalFRQ;
    
    const completedCount = completedQuestions.size;
    const correctCount = correctAnswers.size;
    const accuracy = completedCount > 0 ? (correctCount / completedCount) * 100 : 0;

    try {
      // Get session_id from the most recent in_progress session
      const { data: sessionData } = await supabase
        .from('homework_progress')
        .select('session_id')
        .eq('user_id', user.id)
        .eq('homework_name', homeworkName)
        .eq('completion_status', 'in_progress')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      const sessionId = sessionData?.session_id;
      
      console.log('Completing homework with session_id:', sessionId);
      
      // Record completion summary with the same session_id
      const { data: completionData, error: completionError } = await supabase.from('homework_progress').insert({
        user_id: user.id,
        session_id: sessionId, // Use the same session_id
        homework_task: `Homework ${new Date().toLocaleDateString()} - Summary`,
        homework_name: homeworkName,
        completed_at: new Date().toISOString(),
        total_questions: totalQuestions,
        questions_completed: completedCount,
        questions_correct: correctCount,
        accuracy_percentage: accuracy,
        completion_status: 'completed'
      }).select('session_id').single();

      if (completionError) {
        console.error('Error inserting completion record:', completionError);
      } else {
        console.log('Homework completed, session_id:', completionData?.session_id);
      }

      // Get detailed progress stats
      await loadProgressStats();
      
      setShowCongrats(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (error) {
      console.error('Error completing homework:', error);
      toast({
        title: "Error",
        description: "Failed to save homework completion",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="pt-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg text-muted-foreground">Войдите в систему для доступа к домашнему заданию</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="pt-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Загрузка домашнего задания...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!homeworkData || (!homeworkData.mcq_questions?.length && !homeworkData.fipi_questions?.length)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-start">
              <Button 
                onClick={() => navigate('/ogemath-practice')}
                className="bg-gradient-to-r from-yellow-200 to-yellow-300 hover:from-yellow-300 hover:to-yellow-400 text-black shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                Назад
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-8 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="p-8">
              <CardHeader>
                <BookOpen className="w-16 h-16 mx-auto text-purple-500 mb-4" />
                <CardTitle className="text-2xl text-purple-800">Домашнее задание не назначено</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  У вас пока нет домашнего задания от ИИ помощника. Обратитесь к преподавателю или попробуйте другие виды практики.
                </p>
                <Button 
                  onClick={() => navigate('/ogemath-practice')}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Перейти к другим видам практики
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="pt-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Загрузка вопросов...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = currentQuestions[currentQuestionIndex];
  const totalMCQ = homeworkData.mcq_questions?.length || 0;
  const totalFRQ = homeworkData.fipi_questions?.length || 0;
  const currentProgress = ((completedQuestions.size) / (totalMCQ + totalFRQ)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Navigation Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Button 
              onClick={() => navigate('/ogemath-practice')}
              className="bg-gradient-to-r from-yellow-200 to-yellow-300 hover:from-yellow-300 hover:to-yellow-400 text-black shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              Назад
            </Button>
            <h1 className="text-xl font-bold text-purple-800">Домашнее задание</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      {/* Congratulations Modal */}
      {showCongrats && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            className="bg-white rounded-lg p-8 text-center max-w-md mx-4"
          >
            <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold text-purple-800 mb-4">Поздравляем!</h2>
            <p className="text-gray-600 mb-6">
              Вы успешно выполнили всё домашнее задание! 🎉
            </p>
            
            {/* Main Statistics */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Результаты работы:
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{completedQuestions.size}</div>
                  <div className="text-gray-600">Выполнено</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{correctAnswers.size}</div>
                  <div className="text-gray-600">Правильно</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {completedQuestions.size > 0 ? Math.round((correctAnswers.size / completedQuestions.size) * 100) : 0}%
                  </div>
                  <div className="text-gray-600">Точность</div>
                </div>
              </div>

              {/* Detailed Analytics */}
              {progressStats && (
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Общее время:</span>
                    <span className="font-semibold">{Math.floor(progressStats.totalTime / 60)} мин {progressStats.totalTime % 60} сек</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Среднее время на задачу:</span>
                    <span className="font-semibold">{progressStats.avgTime} сек</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Просмотрено решений:</span>
                    <span className="font-semibold">{progressStats.showedSolutionCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Навыков отработано:</span>
                    <span className="font-semibold">{progressStats.skillsWorkedOn.length}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                onClick={async () => {
                  // Store homework completion data for AI teacher feedback
                  // Get session_id from the latest completed session
                  const latestSession = existingProgress || await getLatestSession();
                  
                  const completionData = {
                    session_id: latestSession?.session_id || '',
                    homeworkName,
                    timestamp: Date.now() // Add timestamp to ensure uniqueness
                  };
                  localStorage.setItem('homeworkCompletionData', JSON.stringify(completionData));
                  
                  // Show toast to confirm data is being sent to AI teacher
                  toast({
                    title: "Данные отправлены ИИ учителю! 🤖",
                    description: "Ваши результаты будут проанализированы автоматически",
                    duration: 2000
                  });
                  
                  navigate('/ogemath');
                }}
                className="bg-purple-600 hover:bg-purple-700 w-full"
              >
                Перейти к ИИ учителю
              </Button>
              <Button 
                onClick={() => setShowCongrats(false)}
                variant="outline"
                className="w-full"
              >
                Закрыть
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <div className="pt-8 px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Header */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Прогресс выполнения
                <Badge variant="secondary" className={questionType === 'mcq' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                  {questionType === 'mcq' ? 'MCQ' : 'ФИПИ'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={currentProgress} className="h-3 mb-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Вопрос {currentQuestionIndex + 1} из {currentQuestions.length}</span>
                <span>{completedQuestions.size} из {totalMCQ + totalFRQ} выполнено</span>
              </div>
            </CardContent>
          </Card>

          {/* Question Card */}
          {currentQuestion && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  {questionType === 'mcq' ? 'Вопрос с выбором ответа' : 'Задача ФИПИ'}
                  {currentQuestion.problem_number && (
                    <Badge variant="outline" className="ml-2">
                      №{currentQuestion.problem_number}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <MathRenderer 
                  text={currentQuestion.text}
                  className="text-lg leading-relaxed"
                  compiler="mathjax"
                />

                {questionType === 'mcq' && currentQuestion.options ? (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => {
                      const cyrillicLetters = ['А', 'Б', 'В', 'Г'];
                      const cyrillicAnswer = cyrillicLetters[index];
                      return (
                        <Button
                          key={index}
                          variant={selectedOption === cyrillicAnswer ? "default" : "outline"}
                          className="w-full text-left justify-start h-auto p-4"
                          onClick={() => setSelectedOption(cyrillicAnswer)}
                          disabled={showAnswer}
                        >
                          <span className="font-bold mr-2">{cyrillicAnswer})</span>
                          <MathRenderer text={option} className="inline-block" compiler="mathjax" />
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ваш ответ:</label>
                    <Input
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Введите ответ..."
                      disabled={showAnswer}
                      className="text-lg"
                    />
                  </div>
                )}

                {showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border-2 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {isCorrect ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <X className="w-5 h-5 text-red-600" />
                      )}
                      <span className={`font-bold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                        {isCorrect ? 'Правильно!' : showSolution ? 'Показано решение' : 'Неправильно'}
                      </span>
                    </div>
                    {!isCorrect && !showSolution && (
                      <p className="text-gray-700">
                        Правильный ответ: <span className="font-bold">{currentQuestion.correct_answer}</span>
                      </p>
                    )}
                    {showSolution && currentQuestion.solution_text && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-bold text-blue-800 mb-2">Решение:</h4>
                        <MathRenderer text={currentQuestion.solution_text} compiler="mathjax" />
                      </div>
                    )}
                  </motion.div>
                )}

                <div className="flex gap-2">
                  {!showAnswer ? (
                    <>
                      <Button
                        onClick={handleSubmitAnswer}
                        className="bg-purple-600 hover:bg-purple-700"
                        disabled={questionType === 'mcq' ? !selectedOption : !userAnswer}
                      >
                        Проверить ответ
                      </Button>
                      <Button
                        onClick={handleShowSolution}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Показать решение
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={handleNextQuestion}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {currentQuestionIndex < currentQuestions.length - 1 || 
                         (questionType === 'mcq' && totalFRQ > 0) ? (
                          <>
                            Следующий вопрос
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        ) : (
                          'Завершить'
                        )}
                      </Button>
                      {!showSolution && (
                        <Button
                          onClick={handleShowSolution}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Показать решение
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Статистика
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {completedQuestions.size}
                  </div>
                  <div className="text-sm text-purple-700">Выполнено</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {correctAnswers.size}
                  </div>
                  <div className="text-sm text-green-700">Правильно</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {completedQuestions.size > 0 ? Math.round((correctAnswers.size / completedQuestions.size) * 100) : 0}%
                  </div>
                  <div className="text-sm text-blue-700">Точность</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {totalMCQ + totalFRQ - completedQuestions.size}
                  </div>
                  <div className="text-sm text-orange-700">Осталось</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Homework;
