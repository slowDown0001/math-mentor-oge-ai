import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ChevronLeft, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import LatexRenderer from "@/components/chat/LatexRenderer";
import { supabase } from "@/integrations/supabase/client";
import mathSkillsData from "../../documentation/math_skills_full.json";

interface MCQQuestion {
  question_id: string;
  problem_text: string;
  answer: string;
  skills: number;
}

interface MathSkill {
  skill: string;
  id: number;
}

const MCQPractice = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const skillId = parseInt(searchParams.get('skill') || '1');
  
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const skills = mathSkillsData as MathSkill[];
  const currentSkill = skills.find(s => s.id === skillId);

  // Russian option labels
  const optionLabels = ['А', 'Б', 'В', 'Г'];

  useEffect(() => {
    fetchQuestions();
  }, [skillId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mcq')
        .select('question_id, problem_text, answer, skills')
        .eq('skills', skillId)
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

  const parseAnswerOptions = (problemText: string) => {
    // Extract answer options from problem text
    // Look for patterns like "1) option" or "А) option" or "а) option"
    const optionRegex = /[1-4АБВГабвг]\)\s*([^1-4АБВГабвг)]+?)(?=[1-4АБВГабвг]\)|$)/g;
    const options: string[] = [];
    let match;
    
    while ((match = optionRegex.exec(problemText)) !== null) {
      const cleanOption = match[1].trim();
      if (cleanOption && cleanOption.length > 0) {
        options.push(cleanOption);
      }
    }
    
    // If the above doesn't work, try a simpler approach
    if (options.length === 0) {
      // Split by common delimiters and filter for meaningful content
      const parts = problemText.split(/[1-4]\)|[АБВГабвг]\)/).slice(1);
      parts.forEach(part => {
        const cleaned = part.trim();
        if (cleaned && cleaned.length > 0 && cleaned.length < 200) {
          options.push(cleaned);
        }
      });
    }
    
    return options.slice(0, 4); // Only take first 4 options
  };

  const handleAnswerClick = (selectedOption: string, optionIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(selectedOption);
    setIsAnswered(true);
    
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = currentQuestion.answer.trim();
    
    // Check if the selected answer is correct
    // We'll compare by option number (1, 2, 3, 4) or by text content
    const isCorrect = 
      selectedOption.toLowerCase().includes(correctAnswer.toLowerCase()) ||
      correctAnswer === (optionIndex + 1).toString() ||
      correctAnswer === selectedOption;

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
        description: "Попробуйте еще раз или переходите к следующему вопросу",
        variant: "destructive",
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      // Quiz completed
      toast({
        title: "Квиз завершен!",
        description: `Вы правильно ответили на ${correctAnswers} из ${questions.length} вопросов`,
      });
      navigate('/textbook');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка вопросов...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Button
                onClick={() => navigate('/textbook')}
                variant="outline"
                className="mb-6"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Назад к учебнику
              </Button>
              <Card>
                <CardContent className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Упражнения не найдены
                  </h3>
                  <p className="text-gray-600">
                    Для навыка "{currentSkill?.skill}" пока нет доступных упражнений
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
  const answerOptions = parseAnswerOptions(currentQuestion.problem_text);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <Button
                onClick={() => navigate('/textbook')}
                variant="outline"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Назад к учебнику
              </Button>
              <Badge variant="outline">
                Вопрос {currentQuestionIndex + 1} из {questions.length}
              </Badge>
            </div>

            {/* Skill Info */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Навык {skillId}:</span>
                  <span className="text-lg">{currentSkill?.skill}</span>
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Question */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Вопрос {currentQuestionIndex + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none mb-6">
                  <LatexRenderer content={currentQuestion.problem_text} />
                </div>

                {/* Answer Options */}
                {answerOptions.length > 0 ? (
                  <div className="space-y-3">
                    {answerOptions.map((option, index) => (
                      <Button
                        key={index}
                        onClick={() => handleAnswerClick(option, index)}
                        disabled={isAnswered}
                        variant="outline"
                        className={`w-full text-left p-6 h-auto justify-start ${
                          selectedAnswer === option
                            ? 'bg-blue-50 border-blue-300'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        } ${isAnswered ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                      >
                        <span className="font-bold text-blue-600 mr-3 text-lg">{optionLabels[index]}.</span>
                        <div className="flex-1">
                          <LatexRenderer content={option} />
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Варианты ответов не найдены в тексте вопроса
                  </div>
                )}

                {/* Next Button */}
                {isAnswered && (
                  <div className="flex justify-center mt-6">
                    <Button onClick={handleNextQuestion} className="px-8">
                      {currentQuestionIndex < questions.length - 1 ? 'Следующий вопрос' : 'Завершить'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Прогресс: {currentQuestionIndex + 1} / {questions.length}
                  </span>
                  <span className="text-sm text-gray-600">
                    Правильных ответов: {correctAnswers}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCQPractice;
