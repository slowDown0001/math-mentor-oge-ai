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

interface PracticeQuestion {
  question_id: string;
  problem_text: string;
  option1?: string;
  option2?: string;
  option3?: string;
  option4?: string;
  answer: string;
  solution_text?: string;
  code: number;
  problem_image?: string;
}

interface UserAnswer {
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
}

interface PracticeProps {
  onComplete?: (results: { totalQuestions: number; correctAnswers: number }) => void;
}

const Practice: React.FC<PracticeProps> = ({ onComplete }) => {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [currentPhase, setCurrentPhase] = useState<'setup' | 'practicing' | 'results'>('setup');
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSolution, setShowSolution] = useState<{ [key: string]: boolean }>({});

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
      // Build query to get questions from selected topics
      let query = supabase.from('OGE_SHFIPI_problems_1_25').select('*');
      
      if (selectedTopics.length > 0) {
        const topicConditions = selectedTopics.map(topic => `code.eq.${parseFloat(topic)}`).join(',');
        query = query.or(topicConditions);
      }

      const { data, error } = await query.limit(questionCount * 3); // Get more to have variety

      if (error) {
        console.error('Error fetching questions:', error);
        alert('Ошибка при загрузке вопросов');
        return;
      }

      if (!data || data.length === 0) {
        alert('Не найдено вопросов для выбранных тем');
        return;
      }

      // Shuffle and select the required number of questions
      const shuffled = data.sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, Math.min(questionCount, shuffled.length));

      setQuestions(selectedQuestions);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setSelectedOption('');
      setCurrentPhase('practicing');
    } catch (error) {
      console.error('Error starting practice:', error);
      alert('Произошла ошибка при запуске теста');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle answer submission
  const submitAnswer = () => {
    if (!selectedOption) {
      alert('Пожалуйста, выберите ответ');
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.answer;

    const newAnswer: UserAnswer = {
      questionId: currentQuestion.question_id,
      selectedOption,
      isCorrect
    };

    setUserAnswers(prev => [...prev, newAnswer]);

    // Move to next question or finish
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption('');
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
    setSelectedOption('');
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
            <Badge variant="outline">{currentQuestion.code}</Badge>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Text */}
          <div className="space-y-4">
            <MathRenderer text={currentQuestion.problem_text || ''} className="text-lg" />
            {currentQuestion.problem_image && (
              <img 
                src={currentQuestion.problem_image} 
                alt="Изображение задачи" 
                className="max-w-full h-auto rounded-lg"
              />
            )}
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Выберите ответ:</Label>
            {[
              { key: 'А', value: currentQuestion.option1 },
              { key: 'Б', value: currentQuestion.option2 },
              { key: 'В', value: currentQuestion.option3 },
              { key: 'Г', value: currentQuestion.option4 }
            ].map(({ key, value }) => (
              value && (
                <div key={key} className="flex items-start space-x-3">
                  <input
                    type="radio"
                    id={`option-${key}`}
                    name="answer"
                    value={key}
                    checked={selectedOption === key}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="mt-1"
                  />
                  <Label htmlFor={`option-${key}`} className="flex-1 cursor-pointer">
                    <span className="font-semibold">{key}) </span>
                    <MathRenderer text={value} />
                  </Label>
                </div>
              )
            ))}
          </div>

          {/* Submit Button */}
          <Button 
            onClick={submitAnswer} 
            disabled={!selectedOption}
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
                      <Badge variant="outline">{question.code}</Badge>
                    </div>
                    
                    <MathRenderer text={question.problem_text || ''} className="mb-3" />
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold">Ваш ответ: </span>
                        <span className={userAnswer.isCorrect ? 'text-green-600' : 'text-red-600'}>
                          {userAnswer.selectedOption}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold">Правильный ответ: </span>
                        <span className="text-green-600">{question.answer}</span>
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
                            <MathRenderer text={question.solution_text} />
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

  return null;
};

export default Practice;
