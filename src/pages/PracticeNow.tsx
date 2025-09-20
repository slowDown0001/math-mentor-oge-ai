import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Eye, ArrowRight, Shuffle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import MathRenderer from "@/components/MathRenderer";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { StreakDisplay } from "@/components/streak/StreakDisplay";
import { useStreakTracking } from "@/hooks/useStreakTracking";

interface MCQQuestion {
  type: 'mcq';
  question_id: string;
  problem_text: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  answer: string;
  solution_text: string;
}

interface FRQQuestion {
  type: 'frq';
  question_id: string;
  problem_text: string;
  answer: string;
  solution_text: string;
  problem_image?: string;
}

type Question = MCQQuestion | FRQQuestion;

interface AnswerState {
  selected: boolean;
  userAnswer: string;
  isCorrect: boolean | null;
  showSolution: boolean;
}

const PracticeNow = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>({
    selected: false,
    userAnswer: '',
    isCorrect: null,
    showSolution: false
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { trackActivity } = useStreakTracking();

  const currentQuestion = questions[currentIndex];

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // Fetch MCQ questions
      const { data: mcqData, error: mcqError } = await supabase
        .from('mcq_with_options')
        .select('question_id, problem_text, option1, option2, option3, option4, answer, solution_text')
        .limit(10);

      if (mcqError) throw mcqError;

      // Fetch FRQ questions
      const { data: frqData, error: frqError } = await supabase
        .from('oge_math_fipi_bank')
        .select('question_id, problem_text, answer, solution_text, problem_image')
        .limit(10);

      if (frqError) throw frqError;

      // Format and combine questions
      const mcqQuestions: MCQQuestion[] = (mcqData || []).map(q => ({
        type: 'mcq',
        ...q
      }));

      const frqQuestions: FRQQuestion[] = (frqData || []).map(q => ({
        type: 'frq',
        ...q
      }));

      // Shuffle and combine
      const allQuestions = [...mcqQuestions, ...frqQuestions];
      const shuffled = allQuestions.sort(() => Math.random() - 0.5);
      
      setQuestions(shuffled);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить вопросы",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleMCQAnswer = (option: 'А' | 'Б' | 'В' | 'Г') => {
    setAnswerState({
      ...answerState,
      selected: true,
      userAnswer: option
    });
  };

  const handleFRQAnswer = (value: string) => {
    setAnswerState({
      ...answerState,
      userAnswer: value
    });
  };

  const checkAnswer = () => {
    if (!currentQuestion) return;

    let correctAnswer = '';
    let userAnswer = answerState.userAnswer;

    if (currentQuestion.type === 'mcq') {
      // Map options to letters
      const optionMap: { [key: string]: string } = {
        [currentQuestion.option1]: 'А',
        [currentQuestion.option2]: 'Б', 
        [currentQuestion.option3]: 'В',
        [currentQuestion.option4]: 'Г'
      };
      correctAnswer = optionMap[currentQuestion.answer] || currentQuestion.answer;
    } else {
      correctAnswer = currentQuestion.answer;
      userAnswer = userAnswer.trim();
    }

    const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();

    setAnswerState({
      ...answerState,
      selected: true,
      isCorrect
    });

    // Track activity if correct answer
    if (isCorrect) {
      trackActivity('problem', 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswerState({
        selected: false,
        userAnswer: '',
        isCorrect: null,
        showSolution: false
      });
    } else {
      // No more questions, refetch
      fetchQuestions();
      setCurrentIndex(0);
      setAnswerState({
        selected: false,
        userAnswer: '',
        isCorrect: null,
        showSolution: false
      });
    }
  };

  const showSolution = () => {
    setAnswerState({
      ...answerState,
      showSolution: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка вопросов...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 mb-4">Вопросы не найдены</p>
              <Button onClick={fetchQuestions} className="w-full">
                <Shuffle className="w-4 h-4 mr-2" />
                Попробовать снова
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="pt-20 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Practice Now</h1>
            <div className="flex items-center gap-4">
              <StreakDisplay />
              <div className="text-sm text-gray-600">
                Вопрос {currentIndex + 1} из {questions.length}
              </div>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {currentQuestion.type === 'mcq' ? '🔤 Выберите ответ' : '✍️ Введите ответ'}
                <span className="text-sm font-normal text-gray-500">
                  ({currentQuestion.type === 'mcq' ? 'MCQ' : 'FRQ'})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Question Text */}
              <div className="bg-gray-50 p-4 rounded-lg">
                {currentQuestion.type === 'frq' && currentQuestion.problem_image && (
                  <div className="mb-4">
                    <img 
                      src={currentQuestion.problem_image} 
                      alt="Problem illustration" 
                      className="max-w-full h-auto rounded border"
                    />
                  </div>
                )}
                <MathRenderer text={currentQuestion.problem_text || ''} />
              </div>

              {/* Answer Interface */}
              {currentQuestion.type === 'mcq' ? (
                <div className="space-y-3">
                  {[
                    { letter: 'А', text: currentQuestion.option1 },
                    { letter: 'Б', text: currentQuestion.option2 },
                    { letter: 'В', text: currentQuestion.option3 },
                    { letter: 'Г', text: currentQuestion.option4 }
                  ].map(({ letter, text }) => (
                    <Button
                      key={letter}
                      variant={answerState.userAnswer === letter ? "default" : "outline"}
                      className="w-full justify-start text-left h-auto p-4"
                      onClick={() => handleMCQAnswer(letter as 'А' | 'Б' | 'В' | 'Г')}
                      disabled={answerState.isCorrect !== null}
                    >
                      <span className="font-bold mr-3">{letter}:</span>
                      <MathRenderer text={text || ''} />
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <Input
                    placeholder="Введите ваш ответ..."
                    value={answerState.userAnswer}
                    onChange={(e) => handleFRQAnswer(e.target.value)}
                    disabled={answerState.isCorrect !== null}
                    className="text-lg p-4"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {answerState.isCorrect === null ? (
                  <Button
                    onClick={checkAnswer}
                    disabled={!answerState.userAnswer || (currentQuestion.type === 'mcq' && !answerState.selected)}
                    className="flex-1"
                  >
                    Проверить ответ
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={showSolution}
                      variant="outline"
                      disabled={answerState.showSolution}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Показать решение
                    </Button>
                    <Button onClick={nextQuestion} className="flex-1">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Следующий вопрос
                    </Button>
                  </>
                )}
              </div>

              {/* Feedback */}
              {answerState.isCorrect !== null && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${
                  answerState.isCorrect 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {answerState.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">
                      {answerState.isCorrect ? '✅ Правильно!' : '❌ Неправильно'}
                    </p>
                    {!answerState.isCorrect && (
                      <p className="text-sm mt-1">
                        Правильный ответ: <strong>{
                          currentQuestion.type === 'mcq' 
                            ? (() => {
                                const optionMap: { [key: string]: string } = {
                                  [currentQuestion.option1]: 'А',
                                  [currentQuestion.option2]: 'Б', 
                                  [currentQuestion.option3]: 'В',
                                  [currentQuestion.option4]: 'Г'
                                };
                                return optionMap[currentQuestion.answer] || currentQuestion.answer;
                              })()
                            : currentQuestion.answer
                        }</strong>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Solution */}
              {answerState.showSolution && currentQuestion.solution_text && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Решение:</h4>
                  <MathRenderer text={currentQuestion.solution_text} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PracticeNow;