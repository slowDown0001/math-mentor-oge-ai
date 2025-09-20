import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import MathRenderer from '@/components/MathRenderer';
import topicMapping from '../../../documentation/topic_skill_mapping_with_names.json';
import { useAuth } from '@/contexts/AuthContext';
import { awardStreakPoints, calculateStreakReward, getCurrentStreakData } from '@/services/streakPointsService';
import { StreakRingAnimation } from '@/components/streak/StreakRingAnimation';
import { toast } from 'sonner';

interface PracticeQuestion {
  question_id: string;
  problem_text: string;
  answer: string;
  solution_text?: string;
  problem_number_type: number;
  problem_image?: string;
  difficulty?: string | number;
}

interface UserAnswer {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

interface PracticeProps {
  onComplete?: (results: { totalQuestions: number; correctAnswers: number }) => void;
}

const Practice: React.FC<PracticeProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [currentPhase, setCurrentPhase] = useState<'setup' | 'practicing' | 'results'>('setup');
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSolution, setShowSolution] = useState<{ [key: string]: boolean }>({});
  
  // Streak animation state
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);
  const [streakData, setStreakData] = useState({
    currentMinutes: 0,
    targetMinutes: 30,
    addedMinutes: 0
  });

  // Handle topic selection
  const handleTopicToggle = (topicCode: string, checked: boolean) => {
    if (checked) {
      setSelectedTopics(prev => [...prev, topicCode]);
    } else {
      setSelectedTopics(prev => prev.filter(t => t !== topicCode));
    }
  };

  // Start the practice session
  const startPractice = async () => {
    if (selectedTopics.length === 0) {
      alert('Пожалуйста, выберите хотя бы одну тему');
      return;
    }

    setIsLoading(true);
    try {
      // Fetch questions for each selected topic separately to ensure representation
      const allQuestions: PracticeQuestion[] = [];
      const questionsPerTopic = Math.ceil(questionCount / selectedTopics.length);
      
      for (const topic of selectedTopics) {
        const { data, error } = await supabase
          .from('oge_math_fipi_bank')
          .select('*')
          .eq('problem_number_type', parseFloat(topic))
          .limit(questionsPerTopic * 2); // Get more to have variety

        if (error) {
          console.error(`Error fetching questions for topic ${topic}:`, error);
          continue;
        }

        if (data && data.length > 0) {
          // Shuffle and take the required number for this topic
          const shuffled = data.sort(() => 0.5 - Math.random());
          const selectedForTopic = shuffled.slice(0, Math.min(questionsPerTopic, shuffled.length));
          allQuestions.push(...selectedForTopic);
        }
      }

      // If we don't have enough questions, try to get more from any selected topic
      if (allQuestions.length < questionCount) {
        const remainingNeeded = questionCount - allQuestions.length;
        const usedQuestionIds = new Set(allQuestions.map(q => q.question_id));

        const { data: additionalData, error: additionalError } = await supabase
          .from('oge_math_fipi_bank')
          .select('*')
          .in('problem_number_type', selectedTopics.map(t => parseFloat(t)))
          .not('question_id', 'in', `(${Array.from(usedQuestionIds).map(id => `'${id}'`).join(',')})`)
          .limit(remainingNeeded);

        if (!additionalError && additionalData) {
          const shuffledAdditional = additionalData.sort(() => 0.5 - Math.random());
          allQuestions.push(...shuffledAdditional.slice(0, remainingNeeded));
        }
      }

      if (allQuestions.length === 0) {
        alert('Не найдено вопросов для выбранных тем');
        return;
      }

      // Final shuffle and trim to exact count
      const finalQuestions = allQuestions
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(questionCount, allQuestions.length));

      setQuestions(finalQuestions);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setUserInput('');
      setCurrentPhase('practicing');
    } catch (error) {
      console.error('Error starting practice:', error);
      alert('Произошла ошибка при запуске теста');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user answer is correct
  const checkAnswer = (userAnswer: string, correctAnswer: string): boolean => {
    // Normalize both answers for comparison
    const normalizeAnswer = (answer: string) => {
      return answer.toLowerCase().trim().replace(/\s+/g, ' ');
    };
    
    return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
  };

  // Handle answer submission
  const submitAnswer = async () => {
    if (!userInput.trim() || !user) {
      toast.error('Пожалуйста, введите ответ');
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = checkAnswer(userInput, currentQuestion.answer);

    // Award streak points immediately (regardless of correctness)
    const reward = calculateStreakReward(currentQuestion.difficulty || 'medium');
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

    const newAnswer: UserAnswer = {
      questionId: currentQuestion.question_id,
      userAnswer: userInput,
      correctAnswer: currentQuestion.answer,
      isCorrect
    };

    setUserAnswers(prev => [...prev, newAnswer]);

    if (isCorrect) {
      toast.success(`Правильно! +${reward.minutes} мин к дневной цели.`);
    } else {
      toast.error(`Неправильно. +${reward.minutes} мин к дневной цели за попытку.`);
    }

    // Move to next question or finish
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserInput('');
    } else {
      // Practice completed
      setCurrentPhase('results');
      if (onComplete) {
        const correctCount = [...userAnswers, newAnswer].filter(a => a.isCorrect).length;
        onComplete({
          totalQuestions: questions.length,
          correctAnswers: correctCount
        });
      }
    }
  };

  // Reset practice
  const resetPractice = () => {
    setCurrentPhase('setup');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setUserInput('');
    setShowSolution({});
  };

  // Toggle solution visibility
  const toggleSolution = (questionId: string) => {
    setShowSolution(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Render setup phase
  if (currentPhase === 'setup') {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Настройка практического теста</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Topic Selection */}
          <div>
            <Label className="text-base font-semibold mb-4 block">Выберите темы для практики:</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border rounded-lg p-4">
              {topicMapping.map((topic) => (
                <div key={topic.topic} className="flex items-center space-x-2">
                  <Checkbox
                    id={topic.topic}
                    checked={selectedTopics.includes(topic.topic)}
                    onCheckedChange={(checked) => handleTopicToggle(topic.topic, !!checked)}
                  />
                  <Label htmlFor={topic.topic} className="text-sm">
                    {topic.topic} - {topic.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div>
            <Label htmlFor="questionCount" className="text-base font-semibold mb-2 block">
              Количество вопросов:
            </Label>
            <Input
              id="questionCount"
              type="number"
              min="1"
              max="50"
              value={questionCount}
              onChange={(e) => setQuestionCount(Math.max(1, parseInt(e.target.value) || 5))}
              className="w-32"
            />
          </div>

          {/* Selected Topics Summary */}
          {selectedTopics.length > 0 && (
            <div>
              <Label className="text-base font-semibold mb-2 block">Выбранные темы:</Label>
              <div className="flex flex-wrap gap-2">
                {selectedTopics.map(topic => (
                  <Badge key={topic} variant="secondary">{topic}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Start Button */}
          <Button 
            onClick={startPractice} 
            disabled={selectedTopics.length === 0 || isLoading}
            className="w-full"
          >
            {isLoading ? 'Загрузка...' : 'Начать тест'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Render practice phase
  if (currentPhase === 'practicing') {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Вопрос {currentQuestionIndex + 1} из {questions.length}</CardTitle>
            <Badge variant="outline">{currentQuestion.problem_number_type}</Badge>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Content */}
          <div className="space-y-4">
            {/* Show image first if it exists */}
            {currentQuestion.problem_image && (
              <div className="flex justify-center">
                <img 
                  src={currentQuestion.problem_image} 
                  alt="Изображение задачи" 
                  className="max-w-full h-auto rounded-lg border shadow-sm"
                />
              </div>
            )}
            {/* Question text below the image */}
            <MathRenderer text={currentQuestion.problem_text || ''} className="text-lg" compiler="mathjax" />
          </div>

          {/* Answer Input */}
          <div className="space-y-3">
            <Label htmlFor="userAnswer" className="text-base font-semibold">
              Введите ваш ответ:
            </Label>
            <Input
              id="userAnswer"
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Введите ответ здесь..."
              className="text-lg"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  submitAnswer();
                }
              }}
            />
            <p className="text-sm text-gray-600">
              Нажмите Enter или кнопку "Ответить" для отправки ответа
            </p>
          </div>

          {/* Submit Button */}
          <Button 
            onClick={submitAnswer} 
            disabled={!userInput.trim()}
            className="w-full"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Следующий вопрос' : 'Завершить тест'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Render results phase
  if (currentPhase === 'results') {
    const correctAnswers = userAnswers.filter(a => a.isCorrect).length;
    const incorrectAnswers = userAnswers.length - correctAnswers;
    const percentage = Math.round((correctAnswers / userAnswers.length) * 100);

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Результаты теста</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
              <div className="text-sm text-gray-600">Правильных ответов</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-red-600">{incorrectAnswers}</div>
              <div className="text-sm text-gray-600">Неправильных ответов</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-600">{percentage}%</div>
              <div className="text-sm text-gray-600">Результат</div>
            </div>
          </div>

          {/* Review Questions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Обзор вопросов:</h3>
            {questions.map((question, index) => {
              const userAnswer = userAnswers[index];
              return (
                <Card key={question.question_id} className="border-l-4 border-l-gray-200">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">Вопрос {index + 1}:</span>
                        {userAnswer.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <Badge variant="outline">{question.problem_number_type}</Badge>
                    </div>
                    
                    {/* Show image first if it exists in results */}
                    {question.problem_image && (
                      <div className="flex justify-center mb-3">
                        <img 
                          src={question.problem_image} 
                          alt="Изображение задачи" 
                          className="max-w-full h-auto rounded-lg border shadow-sm"
                        />
                      </div>
                    )}
                    
                    <MathRenderer text={question.problem_text || ''} className="mb-3" compiler="mathjax" />
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold">Ваш ответ: </span>
                        <span className={userAnswer.isCorrect ? 'text-green-600' : 'text-red-600'}>
                          {userAnswer.userAnswer}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold">Правильный ответ: </span>
                        <span className="text-green-600">{userAnswer.correctAnswer}</span>
                      </div>
                    </div>

                    {question.solution_text && (
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSolution(question.question_id)}
                        >
                          {showSolution[question.question_id] ? 'Скрыть решение' : 'Показать решение'}
                        </Button>
                        {showSolution[question.question_id] && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <MathRenderer text={question.solution_text} compiler="mathjax" />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Reset Button */}
          <Button onClick={resetPractice} className="w-full" variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Начать новый тест
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      {/* Streak Animation */}
      <StreakRingAnimation
        currentMinutes={streakData.currentMinutes}
        targetMinutes={streakData.targetMinutes}
        addedMinutes={streakData.addedMinutes}
        isVisible={showStreakAnimation}
        onAnimationComplete={() => setShowStreakAnimation(false)}
      />
    </>
  );
};

export default Practice;
