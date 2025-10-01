// For problems 1-19, check the stored user answer against correct answer
const userAnswerStored = analysisResult.raw_output as string;
const correctAnswer = questionData.answer;

if (userAnswerStored === 'False') {
  // Question was skipped
  isCorrect = false;
  feedback = "Вопрос пропущен";
} else {
  // OPTIONAL: normalize number words so "six" -> "6"
  const userAnsNorm = normalizeNumberWords ? normalizeNumberWords(userAnswerStored) : userAnswerStored;

  const willUseServer = shouldUseServerCheck(userAnsNorm, correctAnswer);
  console.group(`[RESULTS CHECK] Q${problemNumber} ${analysisResult.question_id}`);
  console.log("stored:", userAnswerStored, "norm:", userAnsNorm, "correct:", correctAnswer, "willUseServer:", willUseServer);

  if (willUseServer) {
    // Use the SAME edge function so final matches per-question marking
    try {
      console.log("[invoke @results] check-text-answer START");
      const { data, error } = await supabase.functions.invoke('check-text-answer', {
        body: {
          user_id: user.id,
          question_id: analysisResult.question_id,
          submitted_answer: userAnsNorm.trim()
        }
      });
      console.log("[invoke @results] check-text-answer DONE", { data, error });

      if (error) {
        console.warn("[invoke @results] error -> fallback local compare", error);
        if (isNumeric(correctAnswer)) {
          const su = sanitizeNumericAnswer(userAnsNorm);
          const sc = sanitizeNumericAnswer(correctAnswer);
          isCorrect = su === sc;
        } else {
          isCorrect = userAnsNorm.trim().toLowerCase() === correctAnswer.toLowerCase();
        }
      } else {
        isCorrect = (data as any)?.is_correct ?? false;
      }
    } catch (e) {
      console.error("[invoke @results] exception -> fallback local compare", e);
      if (isNumeric(correctAnswer)) {
        const su = sanitizeNumericAnswer(userAnsNorm);
        const sc = sanitizeNumericAnswer(correctAnswer);
        isCorrect = su === sc;
      } else {
        isCorrect = userAnsNorm.trim().toLowerCase() === correctAnswer.toLowerCase();
      }
    }
  } else {
    // Fast local path
    if (isNumeric(correctAnswer)) {
      const su = sanitizeNumericAnswer(userAnsNorm);
      const sc = sanitizeNumericAnswer(correctAnswer);
      isCorrect = su === sc;
    } else {
      isCorrect = userAnsNorm.trim().toLowerCase() === correctAnswer.toLowerCase();
    }
  }

  feedback = isCorrect ? "Правильно" : "Неправильно";
  console.log("[results isCorrect] =", isCorrect);
  console.groupEnd();
}
