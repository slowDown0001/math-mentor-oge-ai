import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ChevronLeft, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import MathRenderer from "@/components/MathRenderer";
import { supabase } from "@/integrations/supabase/client";
import mathSkillsData from "../../documentation/math_skills_full.json";

interface MCQQuestion {
  question_id: string;
  problem_text: string;
  answer: string;
  skills: number;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
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
        .from('mcq_with_options')
        .select('question_id, problem_text, answer, skills, option1, option2, option3, option4')
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
  const answerOptions = [
    currentQuestion.option1,
    currentQuestion.option2,
    currentQuestion.option3,
    currentQuestion.option4
  ].filter(option => option && option.trim().length > 0);

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
                <div className="mb-6">
                  <MathRenderer text={currentQuestion.problem_text} />
                </div>

                {/* Answer Options */}
                {answerOptions.length > 0 ? (
                  <div className="space-y-3">
                    {answerOptions.map((option, index) => {
                      const optionLetter = optionLabels[index];
                      const isSelected = selectedAnswer === optionLetter;
                      const isCorrect = currentQuestion.answer.trim() === optionLetter;
                      
                      let buttonStyle = "w-full text-left p-6 h-auto justify-start ";
                      
                      if (isAnswered) {
                        if (isSelected && isCorrect) {
                          buttonStyle += "bg-green-100 border-green-500 text-green-800";
                        } else if (isSelected && !isCorrect) {
                          buttonStyle += "bg-red-100 border-red-500 text-red-800";
                        } else if (!isSelected && isCorrect) {
                          buttonStyle += "bg-green-50 border-green-300 text-green-700";
                        } else {
                          buttonStyle += "bg-gray-50 border-gray-200 text-gray-600";
                        }
                        buttonStyle += " cursor-not-allowed opacity-75";
                      } else {
                        buttonStyle += "bg-white border-gray-200 hover:bg-gray-50 cursor-pointer";
                      }

                      return (
                        <Button
                          key={index}
                          onClick={() => handleAnswerClick(index)}
                          disabled={isAnswered}
                          variant="outline"
                          className={buttonStyle}
                        >
                          <span className="font-bold text-blue-600 mr-3 text-lg">
                            {optionLetter}.
                          </span>
                          <div className="flex-1">
                            <MathRenderer text={option} className="inline-block" />
                          </div>
                          {isAnswered && isCorrect && (
                            <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                          )}
                          {isAnswered && isSelected && !isCorrect && (
                            <XCircle className="w-5 h-5 text-red-600 ml-2" />
                          )}
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Варианты ответов не найдены
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
