import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, ArrowLeft, ArrowRight, StopCircle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { awardEnergyPoints } from '@/services/energyPoints';
import { PointsAnimation } from '@/components/PointsAnimation';
import MathRenderer from '@/components/MathRenderer';
import Header from '@/components/Header';
import { toast } from 'sonner';

interface FipiQuestion {
  question_id: number;
  problem_number_type: number;
  problem_text: string;
  answer: string;
  solution_text: string;
  problem_image: string | null;
}

interface UserAnswer {
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
  attempted: boolean;
  solutionImage?: File;
}

type Phase = 'selection' | 'practice' | 'summary';

const FipiBank = () => {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('selection');
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [questions, setQuestions] = useState<FipiQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [userInput, setUserInput] = useState('');
  const [solutionImage, setSolutionImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);
  const [pointsGained, setPointsGained] = useState(0);

  const questionGroups = [
    { label: 'Все вопросы', numbers: Array.from({length: 26}, (_, i) => i + 1) },
    { label: 'Часть 1', numbers: Array.from({length: 19}, (_, i) => i + 1) },
    { label: 'Часть 2 Алгебра', numbers: [20, 21, 22] },
    { label: 'Часть 2 Геометрия', numbers: [23, 24, 25, 26] }
  ];

  const individualNumbers = [
    { label: '1–5', numbers: [1, 2, 3, 4, 5] },
    ...Array.from({length: 21}, (_, i) => ({ label: String(i + 6), numbers: [i + 6] }))
  ];

  const toggleNumbers = (numbers: number[]) => {
    setSelectedNumbers(prev => {
      const allSelected = numbers.every(num => prev.includes(num));
      if (allSelected) {
        return prev.filter(num => !numbers.includes(num));
      } else {
        return [...new Set([...prev, ...numbers])];
      }
    });
  };

  const startPractice = async () => {
    if (selectedNumbers.length === 0) {
      toast.error('Выберите хотя бы один номер вопроса');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ogemath_fipi_bank')
        .select('*')
        .in('problem_number_type', selectedNumbers);

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error('Вопросы не найдены');
        setLoading(false);
        return;
      }

      // Shuffle questions
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      setUserAnswers(shuffled.map(q => ({
        questionId: q.question_id,
        userAnswer: '',
        isCorrect: false,
        attempted: false
      })));
      setCurrentIndex(0);
      setPhase('practice');
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Ошибка при загрузке вопросов');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userInput.trim()) {
      toast.error('Введите ответ');
      return;
    }

    const currentQuestion = questions[currentIndex];
    const isCorrect = userInput.trim().toLowerCase() === currentQuestion.answer.toLowerCase();
    
    setUserAnswers(prev => prev.map((answer, index) => 
      index === currentIndex 
        ? { ...answer, userAnswer: userInput, isCorrect, attempted: true, solutionImage }
        : answer
    ));

    if (isCorrect && user) {
      const points = currentQuestion.problem_number_type <= 19 ? 100 : 200;
      setPointsGained(points);
      setShowStreakAnimation(true);
      await awardEnergyPoints(user.id, 'practice_test', points);
      setTimeout(() => setShowStreakAnimation(false), 2000);
    }

    setShowAnswer(true);
  };

  const nextQuestion = () => {
    setUserInput('');
    setSolutionImage(null);
    setShowAnswer(false);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setPhase('summary');
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
    setUserInput(userAnswers[index]?.userAnswer || '');
    setShowAnswer(false);
  };

  const stopTest = () => {
    setPhase('summary');
  };

  const resetTest = () => {
    setPhase('selection');
    setSelectedNumbers([]);
    setQuestions([]);
    setUserAnswers([]);
    setCurrentIndex(0);
    setUserInput('');
    setSolutionImage(null);
    setShowAnswer(false);
  };

  const correctAnswers = userAnswers.filter(a => a.isCorrect).length;
  const attemptedAnswers = userAnswers.filter(a => a.attempted).length;
  const totalPoints = userAnswers.reduce((sum, answer, index) => {
    if (answer.isCorrect) {
      const questionType = questions[index]?.problem_number_type;
      return sum + (questionType <= 19 ? 100 : 200);
    }
    return sum;
  }, 0);

  if (phase === 'selection') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">База ФИПИ</h1>
                <p className="text-gray-600">Выберите номера вопросов для практики</p>
              </div>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Группы вопросов</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {questionGroups.map((group) => (
                      <Button
                        key={group.label}
                        variant={group.numbers.every(num => selectedNumbers.includes(num)) ? "default" : "outline"}
                        onClick={() => toggleNumbers(group.numbers)}
                        className="h-auto py-3"
                      >
                        {group.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Отдельные номера</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                    {individualNumbers.map((item) => (
                      <Button
                        key={item.label}
                        variant={item.numbers.every(num => selectedNumbers.includes(num)) ? "default" : "outline"}
                        onClick={() => toggleNumbers(item.numbers)}
                        size="sm"
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button 
                  onClick={startPractice} 
                  disabled={selectedNumbers.length === 0 || loading}
                  size="lg"
                >
                  {loading ? 'Загрузка...' : 'Начать практику'}
                </Button>
              </div>

              {selectedNumbers.length > 0 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Выбрано номеров: {selectedNumbers.sort((a, b) => a - b).join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'practice') {
    const currentQuestion = questions[currentIndex];
    const currentAnswer = userAnswers[currentIndex];

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-8">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Badge variant="outline">
                    Вопрос {currentIndex + 1} из {questions.length}
                  </Badge>
                  <Badge variant="secondary">
                    {correctAnswers} / {attemptedAnswers} правильно
                  </Badge>
                </div>
                <Button variant="destructive" onClick={stopTest} size="sm">
                  <StopCircle className="w-4 h-4 mr-1" />
                  Остановить тест
                </Button>
              </div>

              <Progress value={(currentIndex / questions.length) * 100} className="mb-6" />

              <Card className="mb-6">
                <CardContent className="pt-6">
                  {currentQuestion.problem_image && (
                    <div className="mb-4">
                      <img 
                        src={currentQuestion.problem_image} 
                        alt="Изображение задачи"
                        className="max-w-full h-auto mx-auto"
                      />
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Номер {currentQuestion.problem_number_type}</h3>
                    <MathRenderer 
                      text={currentQuestion.problem_text} 
                      className="text-lg"
                    />
                  </div>

                  {!showAnswer && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Поле для ответа:
                        </label>
                        <Input
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          placeholder="Введите ответ"
                          onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
                        />
                      </div>

                      {currentQuestion.problem_number_type > 19 && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Загрузите решение:
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setSolutionImage(e.target.files?.[0] || null)}
                              className="hidden"
                              id="solution-upload"
                            />
                            <label htmlFor="solution-upload">
                              <Button variant="outline" size="sm" asChild>
                                <span>
                                  <Upload className="w-4 h-4 mr-1" />
                                  Выбрать файл
                                </span>
                              </Button>
                            </label>
                            {solutionImage && (
                              <span className="text-sm text-gray-600">
                                {solutionImage.name}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <Button onClick={submitAnswer} className="w-full">
                        Проверить ответ
                      </Button>
                    </div>
                  )}

                  {showAnswer && (
                    <div className="space-y-4">
                      <div className={`flex items-center gap-2 ${currentAnswer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {currentAnswer.isCorrect ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                        <span className="font-semibold">
                          {currentAnswer.isCorrect ? 'Правильно!' : 'Неправильно'}
                        </span>
                      </div>

                      {currentAnswer.isCorrect && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-green-700 font-medium">
                            🎉 Получено {currentQuestion.problem_number_type <= 19 ? 100 : 200} баллов
                          </p>
                        </div>
                      )}

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Правильный ответ:</h4>
                        <p className="mb-3">{currentQuestion.answer}</p>
                        
                        {currentQuestion.solution_text && (
                          <div>
                            <h4 className="font-semibold mb-2">Решение:</h4>
                            <MathRenderer text={currentQuestion.solution_text} />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={nextQuestion} className="flex-1">
                          {currentIndex < questions.length - 1 ? 'Следующий вопрос' : 'Завершить тест'}
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-center gap-2 flex-wrap">
                {questions.map((_, index) => (
                  <Button
                    key={index}
                    variant={index === currentIndex ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToQuestion(index)}
                    className={`w-8 h-8 p-0 ${
                      userAnswers[index]?.attempted
                        ? userAnswers[index]?.isCorrect
                          ? 'bg-green-100 border-green-300'
                          : 'bg-red-100 border-red-300'
                        : ''
                    }`}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {showStreakAnimation && (
          <PointsAnimation 
            points={pointsGained}
            onComplete={() => setShowStreakAnimation(false)}
          />
        )}
      </div>
    );
  }

  // Summary phase
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Результаты теста</h1>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-blue-600">{attemptedAnswers}</div>
                  <div className="text-sm text-gray-600">Отвечено вопросов</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                  <div className="text-sm text-gray-600">Правильных ответов</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
                  <div className="text-sm text-gray-600">Всего баллов</div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Обзор вопросов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                  {questions.map((question, index) => (
                    <Button
                      key={question.question_id}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentIndex(index);
                        setPhase('practice');
                        setShowAnswer(true);
                      }}
                      className={`h-12 ${
                        userAnswers[index]?.attempted
                          ? userAnswers[index]?.isCorrect
                            ? 'bg-green-100 border-green-300 text-green-700'
                            : 'bg-red-100 border-red-300 text-red-700'
                          : 'bg-gray-100'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-xs">№{question.problem_number_type}</div>
                        <div className="text-[10px]">
                          {userAnswers[index]?.attempted ? (
                            userAnswers[index]?.isCorrect ? '✓' : '✗'
                          ) : '—'}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center gap-4">
              <Button onClick={resetTest} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Новый тест
              </Button>
              <Button onClick={() => setPhase('practice')}>
                <Eye className="w-4 h-4 mr-1" />
                Просмотреть ответы
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FipiBank;