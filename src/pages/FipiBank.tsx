
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Upload, ArrowLeft, ArrowRight, StopCircle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { supabase as supabaseLib } from '@/lib/supabase';
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

type Phase = 'selection' | 'practice' | 'review' | 'summary';

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
  const [showSolution, setShowSolution] = useState(false);
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);
  const [pointsGained, setPointsGained] = useState(0);
  const [markingSolution, setMarkingSolution] = useState<string>('');
  const [isMarking, setIsMarking] = useState(false);
  const [showMarkingSolution, setShowMarkingSolution] = useState(false);

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

      // ⚠️⚠️⚠️ TEMPORARY RULE - REMOVE THIS ASAP ⚠️⚠️⚠️
      // 🚨🚨🚨 WARNING: TEMPORARY CODE BELOW - DELETE IMMEDIATELY 🚨🚨🚨
      // TODO: REMOVE THIS TEMPORARY LOGIC FOR QUESTION 20 WITH ID 2677
      // ⚠️⚠️⚠️ THIS IS A HACK AND SHOULD NOT STAY IN PRODUCTION ⚠️⚠️⚠️
      
      let shuffled = [...data].sort(() => Math.random() - 0.5);
      
      // TEMPORARY: Force question with id 2677 to be first for question type 20
      if (selectedNumbers.includes(20)) {
        const question2677Index = shuffled.findIndex(q => q.question_id === 2677);
        if (question2677Index !== -1) {
          const question2677 = shuffled[question2677Index];
          shuffled = shuffled.filter(q => q.question_id !== 2677);
          shuffled.unshift(question2677); // Put it first
        }
      }
      
      // 🚨🚨🚨 END OF TEMPORARY CODE - DELETE THIS ENTIRE BLOCK 🚨🚨🚨
      
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

    // Auto-show answer after attempting
    setShowAnswer(true);

    if (isCorrect && user) {
      const points = currentQuestion.problem_number_type <= 19 ? 100 : 200;
      setPointsGained(points);
      setShowStreakAnimation(true);
      await awardEnergyPoints(user.id, 'practice_test', points);
      
      // Auto advance only for questions 1-19, not for 20-26
      if (currentQuestion.problem_number_type <= 19) {
        setTimeout(() => {
          setShowStreakAnimation(false);
          nextQuestion();
        }, 3000);
      } else {
        setTimeout(() => {
          setShowStreakAnimation(false);
        }, 3000);
      }
    }
  };

  const nextQuestion = () => {
    setUserInput('');
    setSolutionImage(null);
    setShowAnswer(false);
    setShowSolution(false);
    setShowMarkingSolution(false);
    setMarkingSolution('');
    setIsMarking(false);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setPhase('summary');
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
    setUserInput(userAnswers[index]?.userAnswer || '');
    // If question was already attempted, show the answer
    setShowAnswer(userAnswers[index]?.attempted || false);
    setShowSolution(false);
  };

  const checkSolution = async () => {
    console.log('✨ CHECK SOLUTION CLICKED');
    const currentQuestion = questions[currentIndex];
    const isCorrect = userInput.trim().toLowerCase() === currentQuestion.answer.toLowerCase();
    
    setUserAnswers(prev => prev.map((answer, index) => 
      index === currentIndex 
        ? { ...answer, userAnswer: userInput, isCorrect, attempted: true, solutionImage }
        : answer
    ));

    // Auto-show answer after attempting
    setShowAnswer(true);

    setIsMarking(true);
    
    // Show 2-second animation before displaying marking solution
    setTimeout(async () => {
      try {
        console.log('🔍 FETCHING MARKING SOLUTION...');
        // Fetch marking solution from public/marking_t.md file
        const response = await fetch('/marking_t.md');
        if (!response.ok) {
          throw new Error('Failed to fetch marking file');
        }
        
        const text = await response.text();
        console.log('✅ MARKING FETCH SUCCESS from file:', text);
        setMarkingSolution(text);
        
        setShowMarkingSolution(true);
      } catch (error) {
        console.error('💥 Error fetching marking solution:', error);
        toast.error('Ошибка при загрузке решения');
        setMarkingSolution("Произошла ошибка");
        setShowMarkingSolution(true);
      } finally {
        setIsMarking(false);
      }
    }, 2000);

    if (isCorrect && user) {
      const points = currentQuestion.problem_number_type <= 19 ? 100 : 200;
      setPointsGained(points);
      setShowStreakAnimation(true);
      await awardEnergyPoints(user.id, 'practice_test', points);
      
      setTimeout(() => {
        setShowStreakAnimation(false);
      }, 3000);
    }
  };

  const stopTest = () => {
    setPhase('summary');
  };

  const goToReviewQuestion = (index: number) => {
    setCurrentIndex(index);
    setUserInput(userAnswers[index]?.userAnswer || '');
    setShowAnswer(true); // Always show answers in review mode
    setShowSolution(false);
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
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    Вопрос {currentIndex + 1}
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
                    <div className="text-xs text-muted-foreground mb-2">Номер {currentQuestion.problem_number_type}</div>
                    <MathRenderer 
                      text={currentQuestion.problem_text} 
                      className="text-lg"
                    />
                  </div>


                  {!currentAnswer?.attempted && (
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
                        
                        {/* CHECK ANSWER button for all questions (under answer field) */}
                        <Button onClick={submitAnswer} className="w-full mt-2">
                          Проверить ответ
                        </Button>
                      </div>

                      {currentQuestion.problem_number_type > 19 && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:border-blue-400 animate-fade-in">
                          <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                              <Upload className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">
                              Загрузите ваше решение
                            </h3>
                            <p className="text-sm text-blue-700 mb-4">
                              Покажите ход решения для получения полной оценки
                            </p>
                            
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setSolutionImage(e.target.files?.[0] || null)}
                              className="hidden"
                              id="solution-upload"
                            />
                            <label htmlFor="solution-upload">
                              <Button 
                                variant="default" 
                                size="lg" 
                                asChild
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                              >
                                <span className="cursor-pointer">
                                  <Upload className="w-5 h-5 mr-2" />
                                  Выбрать изображение
                                </span>
                              </Button>
                            </label>
                            
                            {solutionImage && (
                              <div className="mt-4 space-y-3 animate-fade-in">
                                <div className="p-3 bg-white/80 rounded-lg border border-blue-200">
                                  <div className="flex items-center justify-center gap-2 mb-3">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <span className="text-sm font-medium text-green-700">
                                      {solutionImage.name}
                                    </span>
                                  </div>
                                  <div className="flex justify-center">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <img 
                                          src={URL.createObjectURL(solutionImage)} 
                                          alt="Uploaded solution"
                                          className="max-w-full max-h-64 object-contain rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
                                        />
                                      </DialogTrigger>
                                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                                        <img 
                                          src={URL.createObjectURL(solutionImage)} 
                                          alt="Uploaded solution - full size"
                                          className="w-full h-auto"
                                        />
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                </div>
                                <Button 
                                  onClick={checkSolution} 
                                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                >
                                  ✨ Проверить решение
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Show upload solution button and next question button for questions 20-26 when answered */}


                  {(showAnswer || showSolution) && (
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
                        <div className="bg-green-50/50 p-2 rounded-md">
                          <p className="text-green-600 text-sm">
                            +{currentQuestion.problem_number_type <= 19 ? 100 : 200} баллов
                          </p>
                        </div>
                      )}

                      {showAnswer && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">Ваш ответ: {currentAnswer.userAnswer}</h4>
                          <h4 className="font-semibold mb-2">Правильный ответ:</h4>
                          <p>{currentQuestion.answer}</p>
                        </div>
                      )}

                      {showAnswer && currentQuestion.solution_text && (
                        <Button 
                          onClick={() => setShowSolution(true)} 
                          variant="ghost" 
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2"
                        >
                          📚 Показать решение
                        </Button>
                      )}
                      
                      {showSolution && currentQuestion.solution_text && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">Решение:</h4>
                          <MathRenderer text={currentQuestion.solution_text} />
                        </div>
                      )}


                      {/* Enhanced solution upload for questions 20-26 */}
                      {currentQuestion.problem_number_type > 19 && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:border-blue-400 animate-fade-in">
                          <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                              <Upload className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">
                              Загрузите ваше решение
                            </h3>
                            <p className="text-sm text-blue-700 mb-4">
                              Покажите ход решения для получения полной оценки
                            </p>
                            
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setSolutionImage(e.target.files?.[0] || null)}
                              className="hidden"
                              id="solution-upload-after"
                            />
                            <label htmlFor="solution-upload-after">
                              <Button 
                                variant="default" 
                                size="lg" 
                                asChild
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                              >
                                <span className="cursor-pointer">
                                  <Upload className="w-5 h-5 mr-2" />
                                  Выбрать изображение
                                </span>
                              </Button>
                            </label>
                            
                            {solutionImage && (
                              <div className="mt-4 space-y-3 animate-fade-in">
                                <div className="p-3 bg-white/80 rounded-lg border border-blue-200">
                                  <div className="flex items-center justify-center gap-2 mb-3">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <span className="text-sm font-medium text-green-700">
                                      {solutionImage.name}
                                    </span>
                                  </div>
                                  <div className="flex justify-center">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <img 
                                          src={URL.createObjectURL(solutionImage)} 
                                          alt="Uploaded solution"
                                          className="max-w-full max-h-64 object-contain rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
                                        />
                                      </DialogTrigger>
                                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                                        <img 
                                          src={URL.createObjectURL(solutionImage)} 
                                          alt="Uploaded solution - full size"
                                          className="w-full h-auto"
                                        />
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                </div>
                                 <Button 
                                  onClick={checkSolution} 
                                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                >
                                  ✨ Проверить решение
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Marking animation and solution after uploaded image */}
                      {isMarking && (
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 animate-pulse">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-4 h-4 bg-yellow-500 rounded-full animate-bounce"></div>
                            <h4 className="font-semibold text-yellow-800">Проверяем решение...</h4>
                          </div>
                          <p className="text-yellow-700 text-sm">Анализируем ваш ответ и готовим подробную обратную связь</p>
                        </div>
                      )}

                      {showMarkingSolution && markingSolution && (
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200 animate-fade-in">
                          <h4 className="font-semibold mb-4 text-purple-800 flex items-center gap-2">
                            <span className="text-xl">🧑‍🏫</span>
                            Разбор решения от учителя:
                          </h4>
                          <div className="space-y-4">
                            <MathRenderer text={markingSolution} className="text-sm" />
                            <div className="bg-white/50 p-3 rounded border text-xs text-gray-600">
                              <strong>Fallback (raw content):</strong>
                              <pre className="whitespace-pre-wrap mt-1">{markingSolution}</pre>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Debug: showMarkingSolution={String(showMarkingSolution)}, content length={markingSolution.length}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {currentQuestion.problem_number_type <= 19 ? (
                          !currentAnswer.isCorrect && (
                            <Button onClick={nextQuestion} className="flex-1">
                              {currentIndex < questions.length - 1 ? 'Следующий вопрос' : 'Завершить тест'}
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          )
                        ) : (
                          <Button onClick={nextQuestion} className="flex-1">
                            {currentIndex < questions.length - 1 ? 'Следующий вопрос' : 'Завершить тест'}
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>


            </div>
          </div>
        </div>

        {showStreakAnimation && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded-lg shadow-lg animate-fade-in">
              +{pointsGained} баллов
            </div>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'review') {
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
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    Вопрос {currentIndex + 1}
                  </Badge>
                  <Badge variant="secondary">
                    {correctAnswers} / {attemptedAnswers} правильно
                  </Badge>
                </div>
                <Button variant="outline" onClick={() => setPhase('summary')} size="sm">
                  <Eye className="w-4 h-4 mr-1" />
                  Показать сводку
                </Button>
              </div>

              {/* Question navigation grid - only attempted questions */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex justify-center gap-2 flex-wrap">
                    {questions.map((question, index) => {
                      if (!userAnswers[index]?.attempted) return null;
                      
                      return (
                        <Button
                          key={question.question_id}
                          variant={index === currentIndex ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToReviewQuestion(index)}
                          className={`w-12 h-12 p-0 ${
                            userAnswers[index]?.isCorrect
                              ? 'bg-green-100 border-green-300 text-green-700'
                              : 'bg-red-100 border-red-300 text-red-700'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-sm font-medium">{index + 1}</div>
                            <div className="text-[10px]">
                              {userAnswers[index]?.isCorrect ? '✓' : '✗'}
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

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
                    <div className="text-xs text-muted-foreground mb-2">Номер {currentQuestion.problem_number_type}</div>
                    <MathRenderer 
                      text={currentQuestion.problem_text} 
                      className="text-lg"
                    />
                  </div>

                  {/* Show user's answer in review mode */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Ваш ответ:
                      </label>
                      <Input
                        value={userInput}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>

                    {/* Always show answer and result in review mode */}
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

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Правильный ответ:</h4>
                      <p>{currentQuestion.answer}</p>
                    </div>

                    {currentQuestion.solution_text && (
                      <Button 
                        onClick={() => setShowSolution(true)} 
                        variant="ghost" 
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2"
                      >
                        📚 Показать решение
                      </Button>
                    )}
                    
                    {showSolution && currentQuestion.solution_text && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Решение:</h4>
                        <MathRenderer text={currentQuestion.solution_text} />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>


            </div>
          </div>
        </div>
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
                  {questions.map((question, index) => 
                    userAnswers[index]?.attempted ? (
                      <Button
                        key={question.question_id}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentIndex(index);
                          setPhase('review');
                          setShowAnswer(true);
                        }}
                        className={`h-12 ${
                          userAnswers[index]?.isCorrect
                            ? 'bg-green-100 border-green-300 text-green-700'
                            : 'bg-red-100 border-red-300 text-red-700'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-sm font-medium">{index + 1}</div>
                          <div className="text-[10px]">
                            {userAnswers[index]?.isCorrect ? '✓' : '✗'}
                          </div>
                        </div>
                      </Button>
                    ) : null
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center gap-4">
              <Button onClick={resetTest} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Новый тест
              </Button>
              <Button onClick={() => setPhase('review')}>
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
