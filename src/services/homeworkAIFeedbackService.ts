import { supabase } from "@/integrations/supabase/client";
import { HomeworkStats } from "./homeworkFeedbackService";

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

export function createHomeworkSummaryJSON(sessionData: any[]): HomeworkSessionData {
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

  const questions = questionRecords.map(record => ({
    question_id: record.question_id,
    question_type: record.question_type || 'unknown',
    difficulty_level: record.difficulty_level || 1,
    skill_ids: record.skill_ids || [],
    user_answer: record.user_answer || '',
    correct_answer: record.correct_answer || '',
    is_correct: record.is_correct || false,
    response_time_seconds: record.response_time_seconds || 0,
    showed_solution: record.showed_solution || false,
    problem_number: record.problem_number || 0
  }));

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
    const homeworkJSON = createHomeworkSummaryJSON(sessionData);
    
    // Create specialized system prompt for homework feedback
    const systemPrompt = `Ты "Ёжик" - доброжелательный и опытный учитель математики, специализирующийся на подготовке к ОГЭ. 

Твоя задача - проанализировать результаты выполнения домашнего задания учеником и дать ПЕРСОНАЛЬНУЮ обратную связь.

Важные принципы:
- Говори на русском языке
- Будь поддерживающим и конструктивным
- Давай конкретные рекомендации на основе данных
- Отмечай как успехи, так и области для улучшения
- Используй эмодзи для большей дружелюбности
- Упоминай конкретные навыки и типы задач из данных
- Предлагай следующие шаги для развития

Структура ответа:
1. Краткий обзор результатов
2. Анализ сильных сторон
3. Области для улучшения
4. Конкретные рекомендации
5. Мотивирующее заключение

Отвечай так, будто ты разговариваешь лично с учеником. Максимум 10-12 предложений.`;

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