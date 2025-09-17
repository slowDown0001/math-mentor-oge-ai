import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, CheckCircle, XCircle, Highlighter, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import MathRenderer from "@/components/MathRenderer";
import { supabase } from "@/integrations/supabase/client";
import { useChatContext } from "@/contexts/ChatContext";
import ChatSection from "@/components/ChatSection";

interface MCQQuestion {
  question_id: string;
  problem_text: string;
  answer: string;
  skills: number;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  problem_image: string | null;
  solution_text: string | null;
}

const MCQPracticeSkill120 = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [isSelecterActive, setIsSelecterActive] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { addMessage } = useChatContext();

  // Russian option labels
  const optionLabels = ['А', 'Б', 'В', 'Г'];

  useEffect(() => {
    fetchQuestions();
  }, []);

  const toggleSelecter = () => {
    setIsSelecterActive(!isSelecterActive);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      
      if (isSelecterActive) {
        const range = selection.getRangeAt(0);
        const text = range.toString().trim();
        
        if (text.length > 0) {
          setSelectedText(text);
          
          // Add message to chat
          const userMessage = {
            id: Date.now(),
            text: `Объясни: "${text}"`,
            isUser: true,
            timestamp: new Date(),
            problemId: currentQuestion?.question_id
          };
          
          addMessage(userMessage);
          setIsChatOpen(true);
          
          // Clear selection
          selection.removeAllRanges();
          setIsSelecterActive(false);
        }
      }
    }
  };

  useEffect(() => {
    if (isSelecterActive) {
      document.addEventListener('mouseup', handleTextSelection);
      return () => {
        document.removeEventListener('mouseup', handleTextSelection);
      };
    }
  }, [isSelecterActive]);

  const handleChatClose = () => {
    setIsChatOpen(false);
    setIsSelecterActive(false);
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mcq_with_options')
        .select('question_id, problem_text, answer, skills, option1, option2, option3, option4, problem_image, solution_text')
        .eq('skills', 120)
        .order('problem_number', { ascending: true })
        .limit(10);

      if (error) {
        console.error('Error fetching questions:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить вопросы",
          variant: "destructive",
        });
      } else {
        setQuestions(data || []);
      }
    } catch (error) {
      console.error('Error in fetchQuestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerClick = (optionIndex: number) => {
    if (isAnswered) return;
    
    const clickedOption = optionLabels[optionIndex];
    setSelectedAnswer(clickedOption);
    setIsAnswered(true);
    
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = currentQuestion.answer.trim();
    
    // Compare the clicked option (А, Б, В, Г) with the correct answer from database
    const isCorrect = clickedOption === correctAnswer;

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      toast({
        title: "🎉 ПОЗДРАВЛЯЕМ!",
        description: "Правильный ответ!",
        className: "bg-green-50 border-green-200",
      });
    } else {
      toast({
        title: "❌ Неправильно!",
        description: `Правильный ответ: ${correctAnswer}`,
        variant: "destructive",
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowSolution(false);
    } else {
      // Quiz completed
      toast({
        title: "Квиз завершен!",
        description: `Вы правильно ответили на ${correctAnswers} из ${questions.length} вопросов`,
      });
      navigate('/mydb3');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 pb-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Загрузка вопросов...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 pb-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Button
                onClick={() => navigate('/mydb3')}
                variant="outline"
                className="mb-6"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Назад к панели
              </Button>
              <Card>
                <CardContent className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">
                    Упражнения не найдены
                  </h3>
                  <p className="text-muted-foreground">
                    Для навыка 120 пока нет доступных упражнений
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answerOptions = [
    currentQuestion.option1,
    currentQuestion.option2,
    currentQuestion.option3,
    currentQuestion.option4
  ].filter(option => option && option.trim().length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 pb-4">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Compact Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => navigate('/mydb3')}
              variant="ghost"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Назад
            </Button>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                {currentQuestionIndex + 1}/{questions.length}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Правильных: {correctAnswers}
              </span>
            </div>
          </div>

          {/* Skill Info - Compact */}
          <div className="mb-3 p-3 bg-muted/30 rounded-lg">
            <span className="text-sm font-medium">Специальная практика - Навык 120</span>
          </div>

          {/* Question Card - Compact */}
          <Card className="mb-4">
            <CardContent className="p-4">
              {/* Problem Image */}
              {currentQuestion.problem_image && (
                <div className="mb-4 flex justify-center">
                  <img 
                    src={currentQuestion.problem_image} 
                    alt="Изображение к задаче" 
                    className="max-w-sm w-full h-auto object-contain rounded border"
                  />
                </div>
              )}
              
              {/* Problem Text */}
              <div 
                className={`mb-4 ${isSelecterActive ? 'cursor-text select-text' : ''}`}
                style={{ userSelect: isSelecterActive ? 'text' : 'auto' }}
              >
                <MathRenderer text={currentQuestion.problem_text} compiler="mathjax" />
              </div>

              {/* Answer Options - Grid Layout */}
              {answerOptions.length > 0 ? (
                <div className="grid gap-2 mb-4">
                  {answerOptions.map((option, index) => {
                    const optionLetter = optionLabels[index];
                    const isSelected = selectedAnswer === optionLetter;
                    const isCorrect = currentQuestion.answer.trim() === optionLetter;
                    
                    let buttonStyle = "w-full text-left p-3 h-auto justify-start text-sm ";
                    
                    if (isAnswered) {
                      if (isSelected && isCorrect) {
                        buttonStyle += "bg-green-100 border-green-500 text-green-800";
                      } else if (isSelected && !isCorrect) {
                        buttonStyle += "bg-red-100 border-red-500 text-red-800";
                      } else if (!isSelected && isCorrect) {
                        buttonStyle += "bg-green-50 border-green-300 text-green-700";
                      } else {
                        buttonStyle += "bg-muted/50 border-border text-muted-foreground";
                      }
                      buttonStyle += " cursor-not-allowed opacity-75";
                    } else {
                      buttonStyle += "bg-background border-border hover:bg-muted/50 cursor-pointer";
                    }

                    return (
                      <Button
                        key={index}
                        onClick={() => handleAnswerClick(index)}
                        disabled={isAnswered}
                        variant="outline"
                        className={buttonStyle}
                      >
                        <span className="font-bold text-primary mr-2">
                          {optionLetter}.
                        </span>
                        <div className="flex-1">
                          <MathRenderer text={option} className="inline-block" compiler="mathjax" />
                        </div>
                        {isAnswered && isCorrect && (
                          <CheckCircle className="w-4 h-4 text-green-600 ml-2" />
                        )}
                        {isAnswered && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-red-600 ml-2" />
                        )}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Варианты ответов не найдены
                </div>
              )}

              {/* Action Buttons */}
              {isAnswered && (
                <div className="flex justify-center gap-2 flex-wrap">
                  {currentQuestion.solution_text && (
                    <Button
                      onClick={() => setShowSolution(!showSolution)}
                      variant="outline"
                      size="sm"
                    >
                      {showSolution ? 'Скрыть решение' : 'Показать решение'}
                    </Button>
                  )}
                  <Button
                    onClick={toggleSelecter}
                    variant={isSelecterActive ? "default" : "outline"}
                    size="sm"
                    className={`flex items-center gap-1 ${
                      isSelecterActive ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''
                    }`}
                  >
                    <Highlighter className="w-3 h-3" />
                    {isSelecterActive ? 'Выключить' : 'Включить'} селектор
                  </Button>
                  <Button 
                    onClick={() => setIsChatOpen(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <MessageCircle className="w-3 h-3" />
                    Чат с ИИ
                  </Button>
                  <Button onClick={handleNextQuestion} size="sm">
                    {currentQuestionIndex < questions.length - 1 ? 'Далее' : 'Завершить'}
                  </Button>
                </div>
              )}

              {/* Selecter Active Indicator */}
              {isAnswered && isSelecterActive && (
                <div className="mt-2 text-center">
                  <p className="text-sm text-yellow-600 flex items-center justify-center gap-1 px-2 py-1 bg-yellow-50 rounded">
                    <Highlighter className="w-3 h-3" />
                    Выделите текст для вопроса к ИИ
                  </p>
                </div>
              )}

              {/* Solution */}
              {showSolution && currentQuestion.solution_text && (
                <div className="mt-4 p-3 bg-muted/30 rounded-lg border-l-4 border-primary">
                  <h4 className="font-medium mb-2 text-sm">Решение:</h4>
                  <div 
                    className={`text-sm ${isSelecterActive ? 'cursor-text select-text' : ''}`}
                    style={{ userSelect: isSelecterActive ? 'text' : 'auto' }}
                  >
                    <MathRenderer text={currentQuestion.solution_text} compiler="mathjax" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Chat Section */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">ИИ Помощник по математике</h3>
              <Button onClick={handleChatClose} variant="outline" size="sm">
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatSection />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCQPracticeSkill120;