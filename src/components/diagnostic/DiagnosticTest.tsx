
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { diagnosticEngine, DiagnosticQuestion, DiagnosticResponse, DiagnosticSession } from '@/services/diagnosticTestService';
import { toast } from 'sonner';

interface DiagnosticTestProps {
  onComplete?: (results: Record<string, number>) => void;
}

export const DiagnosticTest: React.FC<DiagnosticTestProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [session, setSession] = useState<DiagnosticSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      initializeDiagnosticTest();
    }
  }, [user]);

  const initializeDiagnosticTest = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Create session in database
      const newSessionId = await diagnosticEngine.createDiagnosticSession(user.id);
      if (!newSessionId) {
        toast.error('Не удалось создать диагностическую сессию');
        return;
      }

      // Generate test questions
      const questions = await diagnosticEngine.generateDiagnosticTest();
      if (questions.length === 0) {
        toast.error('Не удалось загрузить вопросы для теста');
        return;
      }

      // Get current skills
      const currentSkills = await diagnosticEngine.getCurrentSkills(user.id);

      // Initialize session
      const newSession: DiagnosticSession = {
        id: newSessionId,
        uid: user.id,
        questions,
        responses: [],
        current_difficulty: 2,
        correct_streak: 0,
        incorrect_streak: 0,
        skill_updates: currentSkills
      };

      setSession(newSession);
      setSessionId(newSessionId);
      setStartTime(new Date());
    } catch (error) {
      console.error('Error initializing diagnostic test:', error);
      toast.error('Ошибка при инициализации теста');
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!session || !sessionId || !startTime) return;

    const currentQuestion = session.questions[currentQuestionIndex];
    const responseTime = Math.floor((Date.now() - startTime.getTime()) / 1000);
    
    // Check if answer is correct (simple string comparison)
    const isCorrect = userAnswer.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase();
    
    // Create response object
    const response: DiagnosticResponse = {
      question_id: currentQuestion.question_id,
      skill_id: currentQuestion.skill_id,
      difficulty: currentQuestion.difficulty,
      user_answer: userAnswer,
      correct_answer: currentQuestion.answer,
      is_correct: isCorrect,
      response_time_seconds: responseTime
    };

    // Save response to database
    await diagnosticEngine.saveResponse(sessionId, response);

    // Update session
    const updatedSession = { ...session };
    updatedSession.responses.push(response);

    // Update skill estimates
    diagnosticEngine.updateSkillEstimates(updatedSession, response);

    // Adjust difficulty for next question
    if (currentQuestionIndex < session.questions.length - 1) {
      const newDifficulty = diagnosticEngine.adjustDifficulty(updatedSession, isCorrect);
      console.log('New difficulty:', newDifficulty);
    }

    setSession(updatedSession);

    // Show feedback
    if (isCorrect) {
      toast.success('Правильно!');
    } else {
      toast.error(`Неверно. Правильный ответ: ${currentQuestion.answer}`);
    }

    // Move to next question or complete test
    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setStartTime(new Date());
    } else {
      await completeTest(updatedSession);
    }
  };

  const completeTest = async (finalSession: DiagnosticSession) => {
    if (!sessionId) return;

    setIsLoading(true);
    try {
      // Save final results to database
      const success = await diagnosticEngine.completeDiagnosticSession(sessionId, finalSession);
      
      if (success) {
        toast.success('Диагностический тест завершен!');
        onComplete?.(finalSession.skill_updates);
      } else {
        toast.error('Ошибка при сохранении результатов теста');
      }
    } catch (error) {
      console.error('Error completing test:', error);
      toast.error('Ошибка при завершении теста');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Загрузка диагностического теста...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Диагностический тест</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Пройдите диагностический тест для оценки ваших математических навыков.
          </p>
          <Button onClick={initializeDiagnosticTest}>
            Начать тест
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = session.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / session.questions.length) * 100;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          Диагностический тест - Вопрос {currentQuestionIndex + 1} из {session.questions.length}
        </CardTitle>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            Код задачи: {currentQuestion.code} | Сложность: {currentQuestion.difficulty}
          </p>
          <div className="text-lg whitespace-pre-wrap">
            {currentQuestion.problem_text}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="answer" className="block text-sm font-medium text-gray-700">
            Ваш ответ:
          </label>
          <Input
            id="answer"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Введите ответ..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                submitAnswer();
              }
            }}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Правильных ответов: {session.responses.filter(r => r.is_correct).length} / {session.responses.length}
          </div>
          <Button 
            onClick={submitAnswer} 
            disabled={!userAnswer.trim()}
            className="px-6"
          >
            {currentQuestionIndex < session.questions.length - 1 ? 'Следующий вопрос' : 'Завершить тест'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
