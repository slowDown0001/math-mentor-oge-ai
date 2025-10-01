if (willUseServer) {
  console.log("[PATH] Server check via check-text-answer");

  try {
    const payload = {
      user_id: user.id,
      question_id: currentQuestion.question_id,
      submitted_answer: userAnsNorm.trim(),
    };
    console.log("[invoke] check-text-answer START with payload:", payload);
    console.time("[invoke] check-text-answer duration");

    const { data, error } = await supabase.functions.invoke('check-text-answer', {
      body: payload
    });

    console.timeEnd("[invoke] check-text-answer duration");
    console.log("[invoke] check-text-answer DONE", { data, error });

    if (error) {
      console.warn("[invoke] check-text-answer ERROR -> falling back to local compare", error);
      if (isNumeric(correctAnswer)) {
        const sanitizedUserAnswer = sanitizeNumericAnswer(userAnsNorm);
        const sanitizedCorrectAnswer = sanitizeNumericAnswer(correctAnswer);
        isCorrect = sanitizedUserAnswer === sanitizedCorrectAnswer;
      } else {
        isCorrect = userAnsNorm.trim().toLowerCase() === correctAnswer.toLowerCase();
      }
    } else {
      isCorrect = (data as any)?.is_correct ?? false;
      console.log("[server result] isCorrect =", isCorrect);
    }

    // 🔽 NEW: persist the server decision into photo_analysis_outputs.openrouter_check
    try {
      // get exam_id (same logic you used earlier)
      const { data: profile } = await supabase
        .from('profiles')
        .select('exam_id')
        .eq('user_id', user.id)
        .single();
      const currentExamIdForUpdate = profile?.exam_id || examId;

      const { error: updateErr } = await supabase
        .from('photo_analysis_outputs')
        .update({ openrouter_check: isCorrect })
        .eq('user_id', user.id)
        .eq('question_id', currentQuestion.question_id)
        .eq('exam_id', currentExamIdForUpdate)
        .eq('analysis_type', 'solution');

      if (updateErr) {
        console.warn("[photo_analysis_outputs] failed to update openrouter_check:", updateErr);
      } else {
        console.log("[photo_analysis_outputs] openrouter_check saved:", isCorrect);
      }
    } catch (uerr) {
      console.warn("[photo_analysis_outputs] exception while updating openrouter_check:", uerr);
    }

  } catch (err) {
    console.error("[invoke] check-text-answer EXCEPTION -> local fallback", err);
    if (isNumeric(correctAnswer)) {
      const sanitizedUserAnswer = sanitizeNumericAnswer(userAnsNorm);
      const sanitizedCorrectAnswer = sanitizeNumericAnswer(correctAnswer);
      isCorrect = sanitizedUserAnswer === sanitizedCorrectAnswer;
    } else {
      isCorrect = userAnsNorm.trim().toLowerCase() === correctAnswer.toLowerCase();
    }
  }
} else {
  // ... your existing local path remains unchanged
}
