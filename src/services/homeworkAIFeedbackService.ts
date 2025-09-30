import { supabase } from "@/integrations/supabase/client";
import { HomeworkStats } from "./homeworkFeedbackService";

interface QuestionDetails {
  question_id: string;
  problem_text?: string;
  solution_text?: string;
  solutiontextexpanded?: string;
  answer?: string;
  problem_image?: string;
  difficulty?: number;
  skills?: string;
  problem_number_type?: string | number;
}

interface HomeworkSessionData {
  session_id: string;
  user_id: string;
  homework_name?: string;
  questions: Array<{
    question_id: string;
    question_type: string;
    difficulty_level: number;
    skill_ids: number[];
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    response_time_seconds: number;
    showed_solution: boolean;
    problem_number: number;
    // Enhanced with full question content
    problem_text?: string;
    solution_text?: string;
    solutiontextexpanded?: string;
    problem_image?: string;
  }>;
  summary: {
    total_questions: number;
    questions_completed: number;
    questions_correct: number;
    accuracy_percentage: number;
    total_time_minutes: number;
    average_time_per_question: number;
    skills_practiced: number[];
    difficulty_breakdown: Record<string, number>;
    solution_usage_rate: number;
  };
  completion_date: string;
}

export async function createHomeworkSummaryJSON(sessionData: any[]): Promise<HomeworkSessionData> {
  const questionRecords = sessionData.filter(record => record.question_id);
  const summaryRecord = sessionData.find(record => record.completion_status === 'completed');
  
  const totalTime = questionRecords.reduce((sum, record) => sum + (record.response_time_seconds || 0), 0);
  const showedSolutionCount = questionRecords.filter(record => record.showed_solution).length;
  const skillsWorkedOn = [...new Set(questionRecords.flatMap(record => record.skill_ids || []))];
  
  const difficultyBreakdown = questionRecords.reduce((acc, record) => {
    const level = record.difficulty_level?.toString() || 'unknown';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Fetch detailed question content from database
  const questionIds = questionRecords.map(record => record.question_id).filter(Boolean);
  let questionDetailsMap: Record<string, QuestionDetails> = {};
  
  if (questionIds.length > 0) {
    try {
      const { data: questionDetailsResponse, error } = await supabase.functions.invoke('get-homework-questions-details', {
        body: { questionIds }
      });
      
      if (!error && questionDetailsResponse?.questions) {
        questionDetailsMap = questionDetailsResponse.questions.reduce((acc: Record<string, QuestionDetails>, q: QuestionDetails) => {
          acc[q.question_id] = q;
          return acc;
        }, {});
      }
    } catch (error) {
      console.error('Error fetching question details:', error);
    }
  }

  const questions = questionRecords.map(record => {
    const details: QuestionDetails = questionDetailsMap[record.question_id] || {} as QuestionDetails;
    return {
      question_id: record.question_id,
      question_type: record.question_type || 'unknown',
      difficulty_level: record.difficulty_level || 1,
      skill_ids: record.skill_ids || [],
      user_answer: record.user_answer || '',
      correct_answer: record.correct_answer || '',
      is_correct: record.is_correct || false,
      response_time_seconds: record.response_time_seconds || 0,
      showed_solution: record.showed_solution || false,
      problem_number: record.problem_number || 0,
      // Enhanced with full question content
      problem_text: details.problem_text,
      solution_text: details.solution_text,
      solutiontextexpanded: details.solutiontextexpanded,
      problem_image: details.problem_image
    };
  });

  const questionsCompleted = summaryRecord?.questions_completed || questionRecords.length;
  const questionsCorrect = summaryRecord?.questions_correct || questionRecords.filter(r => r.is_correct).length;
  const accuracy = questionsCompleted > 0 ? (questionsCorrect / questionsCompleted) * 100 : 0;

  return {
    session_id: sessionData[0]?.session_id || '',
    user_id: sessionData[0]?.user_id || '',
    homework_name: sessionData[0]?.homework_name || 'Домашнее задание',
    questions,
    summary: {
      total_questions: summaryRecord?.total_questions || questionRecords.length,
      questions_completed: questionsCompleted,
      questions_correct: questionsCorrect,
      accuracy_percentage: Math.round(accuracy),
      total_time_minutes: Math.round(totalTime / 60),
      average_time_per_question: questionRecords.length > 0 ? Math.round(totalTime / questionRecords.length) : 0,
      skills_practiced: skillsWorkedOn,
      difficulty_breakdown: difficultyBreakdown,
      solution_usage_rate: questionsCompleted > 0 ? Math.round((showedSolutionCount / questionsCompleted) * 100) : 0
    },
    completion_date: sessionData[0]?.completed_at || new Date().toISOString()
  };
}

export async function generateAIHomeworkFeedback(sessionData: any[]): Promise<string> {
  try {
    const homeworkJSON = await createHomeworkSummaryJSON(sessionData);
    
    // Create specialized system prompt for homework feedback with access to question content
    const systemPrompt = `Ты "Ёжик" - доброжелательный и опытный учитель математики, специализирующийся на подготовке к ОГЭ. 

Твоя задача - проанализировать результаты выполнения домашнего задания учеником и дать ПЕРСОНАЛЬНУЮ обратную связь.

ВАЖНО: Теперь у тебя есть доступ к полному содержанию каждого вопроса, включая:
- Текст задачи (problem_text)
- Правильное решение (solution_text и solutiontextexpanded)
- Правильный ответ
- Ответ ученика
- Было ли показано решение

Используй эту информацию для:
- Анализа конкретных ошибок в решении
- Объяснения правильных подходов к решению
- Выявления пробелов в понимании конкретных тем
- Сравнения ответа ученика с правильным решением

Важные принципы:
- Говори на русском языке
- Будь поддерживающим и конструктивным
- Ссылайся на конкретные задачи и их содержание
- Объясняй математические концепции простым языком
- Давай конкретные рекомендации на основе анализа ошибок
- Отмечай как успехи, так и области для улучшения
- Используй эмодзи для большей дружелюбности
- Предлагай следующие шаги для развития

Структура ответа:
1. Краткий обзор результатов
2. Анализ конкретных задач и ошибок
3. Области для улучшения с примерами
4. Конкретные рекомендации по изучению
5. Мотивирующее заключение

Отвечай так, будто ты разговариваешь лично с учеником. Максимум 12-15 предложений.`;

    const userMessage = `Проанализируй результаты домашнего задания ученика:

${JSON.stringify(homeworkJSON, null, 2)}

Дай персональную обратную связь на основе этих данных.`;

    // Call Groq API for AI-generated feedback
    const { data, error } = await supabase.functions.invoke('groq-chat', {
      body: { 
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ], 
        stream: false 
      }
    });

    if (error) {
      console.error('Error generating AI homework feedback:', error);
      throw new Error(`AI feedback error: ${error.message}`);
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error in generateAIHomeworkFeedback:', error);
    // Fallback to original feedback service
    const { generateHomeworkFeedback, createHomeworkStatsFromData } = await import('./homeworkFeedbackService');
    const stats = createHomeworkStatsFromData(sessionData);
    return generateHomeworkFeedback(stats);
  }
}