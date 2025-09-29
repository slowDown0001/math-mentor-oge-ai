export interface HomeworkStats {
  totalQuestions: number;
  questionsCompleted: number;
  questionsCorrect: number;
  accuracy: number;
  totalTime: number;
  avgTime: number;
  showedSolutionCount: number;
  skillsWorkedOn: number[];
  difficultyBreakdown: Record<string, number>;
}

export function generateHomeworkFeedback(stats: HomeworkStats): string {
  const { accuracy, avgTime, showedSolutionCount, questionsCompleted, skillsWorkedOn, totalTime } = stats;
  
  let feedback = `🎯 **Анализ вашего домашнего задания**\n\n`;
  
  // Performance overview
  feedback += `📊 **Общие результаты:**\n`;
  feedback += `• Выполнено заданий: ${questionsCompleted}\n`;
  feedback += `• Правильных ответов: ${stats.questionsCorrect}\n`;
  feedback += `• Точность: ${Math.round(accuracy)}%\n`;
  feedback += `• Общее время: ${Math.floor(totalTime / 60)} мин ${totalTime % 60} сек\n`;
  feedback += `• Среднее время на задачу: ${avgTime} сек\n\n`;

  // Performance-based feedback
  feedback += `💡 **Обратная связь по результатам:**\n`;
  
  if (accuracy >= 90) {
    feedback += `🌟 **Превосходная работа!** Ваша точность ${Math.round(accuracy)}% показывает отличное понимание материала. Вы готовы к более сложным задачам!\n\n`;
    feedback += `🚀 **Рекомендации:**\n`;
    feedback += `• Переходите к задачам повышенной сложности\n`;
    feedback += `• Попробуйте решать задачи на время\n`;
    feedback += `• Изучите продвинутые методы решения\n`;
  } else if (accuracy >= 70) {
    feedback += `👍 **Хорошие результаты!** Точность ${Math.round(accuracy)}% демонстрирует хорошее понимание. Есть небольшие области для улучшения.\n\n`;
    feedback += `📈 **Рекомендации:**\n`;
    feedback += `• Разберите ошибки в неправильно решённых задачах\n`;
    feedback += `• Повторите теорию по слабым темам\n`;
    feedback += `• Решите ещё несколько похожих задач\n`;
  } else if (accuracy >= 50) {
    feedback += `⚠️ **Средние результаты.** Точность ${Math.round(accuracy)}% говорит о том, что материал усвоен частично. Требуется дополнительная работа.\n\n`;
    feedback += `📚 **Рекомендации:**\n`;
    feedback += `• Внимательно изучите теорию по пройденным темам\n`;
    feedback += `• Разберите все ошибки с подробными решениями\n`;
    feedback += `• Потренируйтесь на базовых задачах\n`;
    feedback += `• Обратитесь за помощью к учителю\n`;
  } else {
    feedback += `🔄 **Требуется дополнительная подготовка.** Точность ${Math.round(accuracy)}% показывает, что нужно основательно повторить материал.\n\n`;
    feedback += `🎯 **План действий:**\n`;
    feedback += `• Вернитесь к изучению основ по данным темам\n`;
    feedback += `• Разберите каждую задачу пошагово\n`;
    feedback += `• Начните с самых простых задач\n`;
    feedback += `• Регулярно практикуйтесь\n`;
  }

  // Time-based insights
  if (avgTime > 300) { // More than 5 minutes per question
    feedback += `⏰ **Работа со временем:** Среднее время ${avgTime} секунд на задачу довольно большое. Попробуйте:\n`;
    feedback += `• Ограничить время на каждую задачу\n`;
    feedback += `• Изучить быстрые методы решения\n`;
    feedback += `• Больше практиковаться для автоматизма\n\n`;
  } else if (avgTime < 60) { // Less than 1 minute
    feedback += `⚡ **Отличная скорость!** Вы решаете задачи очень быстро (${avgTime} сек). Убедитесь, что не торопитесь и проверяете ответы.\n\n`;
  }

  // Solution usage analysis
  const solutionUsageRate = showedSolutionCount / questionsCompleted;
  if (solutionUsageRate > 0.6) {
    feedback += `🤔 **Самостоятельность:** Вы часто смотрите решения (${showedSolutionCount} из ${questionsCompleted}). Попробуйте:\n`;
    feedback += `• Тратить больше времени на самостоятельные попытки\n`;
    feedback += `• Разбивать сложные задачи на простые шаги\n`;
    feedback += `• Использовать подсказки вместо полных решений\n\n`;
  } else if (solutionUsageRate < 0.2) {
    feedback += `💪 **Отличная самостоятельность!** Вы редко обращаетесь к готовым решениям. Это развивает навыки решения задач!\n\n`;
  }

  // Skills analysis
  if (skillsWorkedOn.length > 0) {
    feedback += `🧠 **Отработанные навыки:** ${skillsWorkedOn.length} различных математических навыков\n`;
    feedback += `Это показывает хорошее разнообразие в практике!\n\n`;
  }

  // Next steps
  feedback += `🎯 **Что дальше?**\n`;
  if (accuracy >= 80) {
    feedback += `• Переходите к следующей теме\n`;
    feedback += `• Решайте задачи из реальных экзаменов\n`;
    feedback += `• Попробуйте олимпиадные задачи\n`;
  } else {
    feedback += `• Повторите эту тему ещё раз\n`;
    feedback += `• Решите дополнительные задачи\n`;
    feedback += `• Изучите теорию глубже\n`;
  }
  
  feedback += `\n💬 **Есть вопросы?** Я готов помочь разобрать любую задачу или объяснить сложные моменты!`;

  return feedback;
}

export function createHomeworkStatsFromData(sessionData: any[]): HomeworkStats {
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

  return {
    totalQuestions: summaryRecord?.total_questions || questionRecords.length,
    questionsCompleted: summaryRecord?.questions_completed || questionRecords.length,
    questionsCorrect: summaryRecord?.questions_correct || questionRecords.filter(r => r.is_correct).length,
    accuracy: summaryRecord?.accuracy_percentage || 0,
    totalTime,
    avgTime: questionRecords.length > 0 ? Math.round(totalTime / questionRecords.length) : 0,
    showedSolutionCount,
    skillsWorkedOn,
    difficultyBreakdown
  };
}