export async function getChatCompletion(messages: Message[]): Promise<string> {
  try {
    const lastMessage = messages[messages.length - 1]?.content.toLowerCase();

    // Step 1: Handle follow-up (answer/solution/details)
    if (lastMessage.includes('показать ответ') || lastMessage.includes('покажи решение') || lastMessage.includes('не понял')) {
      const questionId = extractLastQuestionId(messages);
      if (!questionId) return "Я не могу найти последнюю задачу. Пожалуйста, запроси новую.";

      const problem = await getMathProblemById(questionId);
      if (!problem) return "Не удалось найти задачу по ID.";

      if (lastMessage.includes('показать ответ')) {
        return `📌 Ответ: **${problem.answer}**`;
      }

      if (lastMessage.includes('покажи решение')) {
        return problem.solution_text || "Решение пока недоступно.";
      }

      if (lastMessage.includes('не понял')) {
        return problem.solutiontextexpanded || "Подробного объяснения нет.";
      }
    }

    // Step 2: Handle new problem request
    if (lastMessage.includes('задачу')) {
      let category: string | undefined = undefined;

      if (lastMessage.includes('алгебр')) category = 'алгебра';
      else if (lastMessage.includes('арифметик')) category = 'арифметика';
      else if (lastMessage.includes('геометр')) category = 'геометрия';
      else if (lastMessage.includes('практич')) category = 'практическая математика';

      const problem = await getRandomMathProblem(category);

      if (problem) {
        const imageUrl = `https://casohrqgydyyvcclqwqm.supabase.co/storage/v1/object/public/images/${problem.problem_image?.replace(/^\/+/, '')}`;
        const imagePart = problem.problem_image ? `🖼️ ![изображение](${imageUrl})\n\n` : "";

        return `Вот задача по категории *${category ?? 'Общее'}*:\n\n${imagePart}${problem.problem_text}\n\n(📌 ID задачи: ${problem.question_id})\n\nНапиши *показать ответ* или *покажи решение*, если хочешь продолжить.`;
      }

      return "Не удалось найти задачу. Попробуй ещё раз позже.";
    }

    // Step 3: Default to Groq completion
    const fullMessages = [SYSTEM_PROMPT, ...messages];
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VITE_GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: fullMessages
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Chat completion error:', error);
    return 'Произошла ошибка. Попробуй позже.';
  }
}
