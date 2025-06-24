import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronRight, Calculator, BookOpen, Brain, PenTool, Check, X } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import LatexRenderer from "@/components/chat/LatexRenderer";

// Import the topic mapping data - use relative path
import topicMapping from "../../documentation/topic_skill_mapping_with_names.json";

interface FRQProblem {
  question_id: string;
  problem_text: string;
  answer: string;
  solution_text: string;
  solutiontextexpanded?: string;
  problem_image?: string;
  code: string;
  difficulty?: string;
  calculator_allowed?: boolean;
}

interface MCQProblem {
  question_id: string;
  problem_text: string;
  answer: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  skills: number;
  problem_image?: string;
}

interface SubTopic {
  topic: string;
  name: string;
  skills: number[];
}

type QuestionType = "frq" | "mcq";

const PracticeExercise = () => {
  const [frqProblems, setFrqProblems] = useState<FRQProblem[]>([]);
  const [mcqProblems, setMcqProblems] = useState<MCQProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubtopic, setSelectedSubtopic] = useState<SubTopic | null>(null);
  const [questionType, setQuestionType] = useState<QuestionType>("frq");
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [checkedAnswers, setCheckedAnswers] = useState<Record<string, boolean>>({});
  const [selectedMCQAnswers, setSelectedMCQAnswers] = useState<Record<string, string>>({});

  // Main topics from topics.md
  const mainTopics = [
    { id: "1", name: "Числа и вычисления" },
    { id: "2", name: "Алгебраические выражения" },
    { id: "3", name: "Уравнения и неравенства" },
    { id: "4", name: "Числовые последовательности" },
    { id: "5", name: "Функции" },
    { id: "6", name: "Координаты на прямой и плоскости" },
    { id: "7", name: "Геометрия" },
    { id: "8", name: "Вероятность и статистика" }
  ];

  // Get subtopics for each main topic
  const getSubtopicsForTopic = (topicId: string): SubTopic[] => {
    return topicMapping.filter(item => item.topic.startsWith(topicId + "."));
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      // Fetch FRQ problems
      const { data: frqData, error: frqError } = await supabase
        .from('OGE_SHFIPI_problems_1_25')
        .select('question_id, problem_text, answer, solution_text, solutiontextexpanded, problem_image, code, difficulty, calculator_allowed')
        .order('code');

      if (frqError) {
        console.error('Error fetching FRQ problems:', frqError);
      } else if (frqData) {
        // Convert code from number to string to match interface
        const formattedFrqData = frqData.map(problem => ({
          ...problem,
          code: problem.code?.toString() || ''
        }));
        setFrqProblems(formattedFrqData);
      }

      // Fetch MCQ problems
      const { data: mcqData, error: mcqError } = await supabase
        .from('mcq_with_options')
        .select('question_id, problem_text, answer, option1, option2, option3, option4, skills, problem_image')
        .not('skills', 'is', null);

      if (mcqError) {
        console.error('Error fetching MCQ problems:', mcqError);
      } else if (mcqData) {
        setMcqProblems(mcqData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredFRQProblems = (): FRQProblem[] => {
    if (!selectedSubtopic) return [];
    return frqProblems.filter(problem => problem.code === selectedSubtopic.topic);
  };

  const getFilteredMCQProblems = (): MCQProblem[] => {
    if (!selectedSubtopic) return [];
    return mcqProblems.filter(problem => 
      selectedSubtopic.skills.includes(problem.skills)
    );
  };

  const handleFRQAnswerCheck = (questionId: string) => {
    const problem = frqProblems.find(p => p.question_id === questionId);
    const userAnswer = userAnswers[questionId]?.trim().toLowerCase();
    const correctAnswer = problem?.answer?.trim().toLowerCase();
    
    if (userAnswer && correctAnswer) {
      const isCorrect = userAnswer === correctAnswer;
      setCheckedAnswers(prev => ({ ...prev, [questionId]: isCorrect }));
    }
  };

  const handleMCQAnswerSelect = (questionId: string, selectedOption: string) => {
    setSelectedMCQAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
    
    const problem = mcqProblems.find(p => p.question_id === questionId);
    if (problem) {
      const isCorrect = selectedOption === problem.answer;
      setCheckedAnswers(prev => ({ ...prev, [questionId]: isCorrect }));
    }
  };

  const handleQuestionTypeChange = (value: string | undefined) => {
    if (value && (value === "frq" || value === "mcq")) {
      setQuestionType(value as QuestionType);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Загружаем задачи...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 text-gray-900">Практические задачи ОГЭ</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Выберите тему и подтему для практики. Решайте задачи с развернутыми ответами и тестовые вопросы.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Window - Topics & Subtopics */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0">
              <div className="p-6 border-b bg-gradient-to-r from-primary to-primary/90 text-white rounded-t-lg">
                <h2 className="text-xl font-semibold">Темы ОГЭ</h2>
                <p className="text-sm text-primary-foreground/80 mt-1">
                  Выберите раздел для изучения
                </p>
              </div>
              
              <ScrollArea className="h-[calc(100vh-300px)] p-4">
                <Accordion type="single" collapsible className="w-full space-y-2">
                  {mainTopics.map((topic) => {
                    const subtopics = getSubtopicsForTopic(topic.id);
                    
                    return (
                      <AccordionItem key={topic.id} value={topic.id} className="border rounded-lg overflow-hidden">
                        <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-left">
                          <div className="flex items-center gap-3">
                            <span className="bg-primary text-white text-sm font-medium px-2 py-1 rounded">
                              {topic.id}
                            </span>
                            <span className="font-medium text-gray-800">{topic.name}</span>
                          </div>
                        </AccordionTrigger>
                        
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-2 mt-2">
                            {subtopics.map((subtopic) => (
                              <button
                                key={subtopic.topic}
                                onClick={() => setSelectedSubtopic(subtopic)}
                                className={`w-full text-left p-3 rounded-lg transition-all text-sm border ${
                                  selectedSubtopic?.topic === subtopic.topic
                                    ? "bg-primary/10 border-primary/30 shadow-sm"
                                    : "bg-white hover:bg-gray-50 border-gray-200"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-gray-800">
                                      {subtopic.topic}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                      {subtopic.name}
                                    </div>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-gray-400" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </ScrollArea>
            </Card>
          </div>

          {/* Right Window - Question Viewer */}
          <div className="lg:col-span-3">
            {selectedSubtopic ? (
              <Card className="shadow-lg border-0">
                <div className="bg-gradient-to-r from-secondary to-accent text-white p-6 rounded-t-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{selectedSubtopic.topic}</h3>
                      <p className="text-secondary-foreground/80">{selectedSubtopic.name}</p>
                    </div>
                    <ToggleGroup 
                      type="single" 
                      value={questionType} 
                      onValueChange={handleQuestionTypeChange}
                      className="bg-white/20 rounded-lg p-1"
                    >
                      <ToggleGroupItem value="frq" className="text-white data-[state=on]:bg-white data-[state=on]:text-gray-900">
                        <PenTool className="h-4 w-4 mr-2" />
                        FRQ
                      </ToggleGroupItem>
                      <ToggleGroupItem value="mcq" className="text-white data-[state=on]:bg-white data-[state=on]:text-gray-900">
                        <Brain className="h-4 w-4 mr-2" />
                        MCQ
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <ScrollArea className="h-[calc(100vh-350px)]">
                    <div className="space-y-6">
                      {/* FRQ Questions */}
                      {questionType === "frq" && (
                        <div>
                          {getFilteredFRQProblems().length > 0 && (
                            <div className="mb-6">
                              <div className="flex items-center gap-2 mb-4">
                                <PenTool className="h-5 w-5 text-blue-600" />
                                <h4 className="text-lg font-semibold text-gray-800">
                                  Развернутые ответы ({getFilteredFRQProblems().length})
                                </h4>
                              </div>
                              <div className="space-y-4">
                                {getFilteredFRQProblems().map((problem) => (
                                  <Card key={problem.question_id} className="border-l-4 border-l-blue-500">
                                    <CardContent className="p-6">
                                      <Tabs defaultValue="zadanie" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                          <TabsTrigger value="zadanie">Задание</TabsTrigger>
                                          <TabsTrigger value="reshenie">Решение</TabsTrigger>
                                        </TabsList>
                                        
                                        <TabsContent value="zadanie" className="space-y-4">
                                          {problem.problem_image && (
                                            <div className="flex justify-center bg-gray-50 p-4 rounded-lg">
                                              <img
                                                src={problem.problem_image}
                                                alt="Изображение задачи"
                                                className="max-w-full h-auto rounded-lg shadow-sm"
                                              />
                                            </div>
                                          )}
                                          
                                          <div className="bg-gray-50 p-4 rounded-lg">
                                            <LatexRenderer content={problem.problem_text || ""} />
                                          </div>
                                          
                                          <div className="flex items-center gap-2 mb-4">
                                            {problem.calculator_allowed && (
                                              <Badge variant="secondary">
                                                <Calculator className="h-3 w-3 mr-1" />
                                                Калькулятор разрешён
                                              </Badge>
                                            )}
                                            {problem.difficulty && (
                                              <Badge variant="outline">{problem.difficulty}</Badge>
                                            )}
                                          </div>
                                          
                                          <div className="space-y-3">
                                            <Label htmlFor={`answer-${problem.question_id}`}>Ваш ответ:</Label>
                                            <div className="flex gap-2">
                                              <Input
                                                id={`answer-${problem.question_id}`}
                                                value={userAnswers[problem.question_id] || ""}
                                                onChange={(e) => setUserAnswers(prev => ({
                                                  ...prev,
                                                  [problem.question_id]: e.target.value
                                                }))}
                                                placeholder="Введите ответ..."
                                                className="flex-grow"
                                              />
                                              <Button 
                                                onClick={() => handleFRQAnswerCheck(problem.question_id)}
                                                disabled={!userAnswers[problem.question_id]?.trim()}
                                              >
                                                Проверить ответ
                                              </Button>
                                            </div>
                                            {checkedAnswers[problem.question_id] !== undefined && (
                                              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                                                checkedAnswers[problem.question_id] 
                                                  ? 'bg-green-50 text-green-800' 
                                                  : 'bg-red-50 text-red-800'
                                              }`}>
                                                {checkedAnswers[problem.question_id] ? (
                                                  <Check className="h-4 w-4" />
                                                ) : (
                                                  <X className="h-4 w-4" />
                                                )}
                                                <span className="font-medium">
                                                  {checkedAnswers[problem.question_id] ? 'Правильно!' : 'Неправильно'}
                                                </span>
                                                {!checkedAnswers[problem.question_id] && (
                                                  <span className="ml-2">
                                                    Правильный ответ: {problem.answer}
                                                  </span>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </TabsContent>
                                        
                                        <TabsContent value="reshenie" className="space-y-4">
                                          <div className="bg-blue-50 p-4 rounded-lg">
                                            <h5 className="font-semibold text-blue-800 mb-2">Решение:</h5>
                                            <LatexRenderer content={problem.solution_text || "Решение не указано"} />
                                          </div>
                                          
                                          {problem.solutiontextexpanded && (
                                            <div className="bg-purple-50 p-4 rounded-lg">
                                              <h5 className="font-semibold text-purple-800 mb-2">Подробное объяснение:</h5>
                                              <LatexRenderer content={problem.solutiontextexpanded} />
                                            </div>
                                          )}
                                        </TabsContent>
                                      </Tabs>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* MCQ Questions */}
                      {questionType === "mcq" && (
                        <div>
                          {getFilteredMCQProblems().length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-4">
                                <Brain className="h-5 w-5 text-green-600" />
                                <h4 className="text-lg font-semibold text-gray-800">
                                  Тестовые вопросы ({getFilteredMCQProblems().length})
                                </h4>
                              </div>
                              <div className="space-y-4">
                                {getFilteredMCQProblems().map((problem) => (
                                  <Card key={problem.question_id} className="border-l-4 border-l-green-500">
                                    <CardContent className="p-6">
                                      {problem.problem_image && (
                                        <div className="flex justify-center bg-gray-50 p-4 rounded-lg mb-4">
                                          <img
                                            src={problem.problem_image}
                                            alt="Изображение задачи"
                                            className="max-w-full h-auto rounded-lg shadow-sm"
                                          />
                                        </div>
                                      )}
                                      
                                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                        <LatexRenderer content={problem.problem_text || ""} />
                                      </div>
                                      
                                      <RadioGroup
                                        value={selectedMCQAnswers[problem.question_id] || ""}
                                        onValueChange={(value) => handleMCQAnswerSelect(problem.question_id, value)}
                                        className="space-y-3"
                                      >
                                        {[problem.option1, problem.option2, problem.option3, problem.option4].map((option, index) => {
                                          const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
                                          const isSelected = selectedMCQAnswers[problem.question_id] === optionLabel;
                                          const isCorrect = problem.answer === optionLabel;
                                          const showResult = selectedMCQAnswers[problem.question_id] !== undefined;
                                          
                                          return (
                                            <div 
                                              key={index}
                                              className={`flex items-center space-x-2 p-3 rounded-lg border transition-all ${
                                                showResult && isSelected && isCorrect
                                                  ? 'bg-green-50 border-green-200'
                                                  : showResult && isSelected && !isCorrect
                                                  ? 'bg-red-50 border-red-200'
                                                  : showResult && !isSelected && isCorrect
                                                  ? 'bg-green-50 border-green-200'
                                                  : 'bg-white border-gray-200 hover:bg-gray-50'
                                              }`}
                                            >
                                              <RadioGroupItem value={optionLabel} id={`${problem.question_id}-${optionLabel}`} />
                                              <Label htmlFor={`${problem.question_id}-${optionLabel}`} className="flex-grow cursor-pointer">
                                                <span className="font-medium mr-2">{optionLabel})</span>
                                                <LatexRenderer content={option || ""} />
                                              </Label>
                                              {showResult && isSelected && (
                                                isCorrect ? (
                                                  <Check className="h-4 w-4 text-green-600" />
                                                ) : (
                                                  <X className="h-4 w-4 text-red-600" />
                                                )
                                              )}
                                              {showResult && !isSelected && isCorrect && (
                                                <Check className="h-4 w-4 text-green-600" />
                                              )}
                                            </div>
                                          );
                                        })}
                                      </RadioGroup>
                                      
                                      {checkedAnswers[problem.question_id] !== undefined && (
                                        <div className={`mt-4 p-3 rounded-lg ${
                                          checkedAnswers[problem.question_id] 
                                            ? 'bg-green-50 text-green-800' 
                                            : 'bg-red-50 text-red-800'
                                        }`}>
                                          <span className="font-medium">
                                            {checkedAnswers[problem.question_id] ? 'Правильно! ✓' : 'Неправильно ✗'}
                                          </span>
                                          {!checkedAnswers[problem.question_id] && (
                                            <span className="ml-2">
                                              Правильный ответ: {problem.answer}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* No questions found */}
                      {((questionType === "frq" && getFilteredFRQProblems().length === 0) ||
                        (questionType === "mcq" && getFilteredMCQProblems().length === 0)) && (
                        <div className="text-center py-12">
                          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            Задачи не найдены
                          </h3>
                          <p className="text-gray-500">
                            Для выбранной подтемы пока нет доступных задач
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg border-0">
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-600 mb-3">
                    Выберите подтему для практики
                  </h3>
                  <p className="text-gray-500 text-lg">
                    Выберите тему и подтему из списка слева, чтобы начать решение задач ОГЭ
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PracticeExercise;
