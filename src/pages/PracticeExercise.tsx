
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronRight, Image as ImageIcon, Calculator, BookOpen, ChevronDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import LatexRenderer from "@/components/chat/LatexRenderer";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Problem {
  question_id: string;
  problem_text: string;
  answer: string;
  solution_text: string;
  solutiontextexpanded: string;
  problem_image?: string;
  code: string;
  difficulty?: string;
  calculator_allowed?: boolean;
}

interface SubTopic {
  id: string;
  name: string;
  problems: Problem[];
}

interface MainTopic {
  id: string;
  name: string;
  subtopics: SubTopic[];
}

const PracticeExercise = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string>("1");
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [expandedStates, setExpandedStates] = useState<{
    answer: boolean;
    solution: boolean;
    expanded: boolean;
  }>({
    answer: false,
    solution: false,
    expanded: false
  });

  // Main topic definitions with subtopics
  const mainTopics: MainTopic[] = [
    {
      id: "1",
      name: "Числа и вычисления",
      subtopics: [
        { id: "1.1", name: "Натуральные и целые числа", problems: [] },
        { id: "1.2", name: "Дроби и проценты", problems: [] },
        { id: "1.3", name: "Рациональные числа и арифметические действия", problems: [] },
        { id: "1.4", name: "Действительные числа", problems: [] },
        { id: "1.5", name: "Приближённые вычисления", problems: [] },
        { id: "1.6", name: "Работа с данными и графиками", problems: [] },
        { id: "1.7", name: "Прикладная геометрия: площади и расстояния в жизни", problems: [] }
      ]
    },
    {
      id: "2",
      name: "Алгебраические выражения",
      subtopics: [
        { id: "2.1", name: "Буквенные выражения", problems: [] },
        { id: "2.2", name: "Степени", problems: [] },
        { id: "2.3", name: "Многочлены", problems: [] },
        { id: "2.4", name: "Алгебраические дроби", problems: [] },
        { id: "2.5", name: "Арифметические корни", problems: [] }
      ]
    },
    {
      id: "3",
      name: "Уравнения и неравенства",
      subtopics: [
        { id: "3.1", name: "Уравнения и системы", problems: [] },
        { id: "3.2", name: "Неравенства и системы", problems: [] },
        { id: "3.3", name: "Текстовые задачи", problems: [] }
      ]
    },
    {
      id: "4",
      name: "Числовые последовательности",
      subtopics: [
        { id: "4.1", name: "Последовательности", problems: [] },
        { id: "4.2", name: "Арифметическая и геометрическая прогрессии", problems: [] }
      ]
    },
    {
      id: "5",
      name: "Функции",
      subtopics: [
        { id: "5.1", name: "Свойства и графики функций", problems: [] }
      ]
    },
    {
      id: "6",
      name: "Координаты на прямой и плоскости",
      subtopics: [
        { id: "6.1", name: "Координатная прямая", problems: [] },
        { id: "6.2", name: "Декартовы координаты", problems: [] }
      ]
    },
    {
      id: "7",
      name: "Геометрия",
      subtopics: [
        { id: "7.1", name: "Геометрические фигуры", problems: [] },
        { id: "7.2", name: "Треугольники", problems: [] },
        { id: "7.3", name: "Многоугольники", problems: [] },
        { id: "7.4", name: "Окружность и круг", problems: [] },
        { id: "7.5", name: "Измерения", problems: [] },
        { id: "7.6", name: "Векторы", problems: [] },
        { id: "7.7", name: "Дополнительные темы по геометрии", problems: [] }
      ]
    },
    {
      id: "8",
      name: "Вероятность и статистика",
      subtopics: [
        { id: "8.1", name: "Описательная статистика", problems: [] },
        { id: "8.2", name: "Вероятность", problems: [] },
        { id: "8.3", name: "Комбинаторика", problems: [] },
        { id: "8.4", name: "Множества", problems: [] },
        { id: "8.5", name: "Графы", problems: [] }
      ]
    }
  ];

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const { data, error } = await supabase
        .from('copy')
        .select('question_id, problem_text, answer, solution_text, solutiontextexpanded, problem_image, code, difficulty, calculator_allowed')
        .order('code');

      if (error) {
        console.error('Error fetching problems:', error);
        return;
      }

      if (data) {
        setProblems(data);
        // Set first problem as selected if available
        if (data.length > 0) {
          setSelectedProblem(data[0]);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group problems by topics and subtopics
  const organizedTopics = mainTopics.map(topic => ({
    ...topic,
    subtopics: topic.subtopics.map(subtopic => ({
      ...subtopic,
      problems: problems.filter(problem => problem.code === subtopic.id)
    }))
  }));

  const currentTopic = organizedTopics.find(topic => topic.id === selectedTopic);
  
  const handleProblemSelect = (problem: Problem) => {
    setSelectedProblem(problem);
    setExpandedStates({
      answer: false,
      solution: false,
      expanded: false
    });
  };

  const toggleSection = (section: 'answer' | 'solution' | 'expanded') => {
    setExpandedStates(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
        <h1 className="text-3xl font-bold mb-6">Практические задачи ОГЭ</h1>

        {/* Main Topic Navigation */}
        <div className="flex overflow-x-auto mb-6 pb-2">
          {organizedTopics.map((topic) => {
            const totalProblems = topic.subtopics.reduce((sum, subtopic) => sum + subtopic.problems.length, 0);
            return (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`px-4 py-3 mr-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                  selectedTopic === topic.id
                    ? "bg-primary text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {topic.id}. {topic.name}
                <span className="text-xs bg-white/20 px-2 py-1 rounded">
                  {totalProblems}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Subtopics and Problems */}
          <div className="lg:col-span-1 bg-white p-4 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
              {currentTopic?.name}
            </h2>
            
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-4">
                {currentTopic?.subtopics.map((subtopic) => (
                  <div key={subtopic.id} className="border rounded-lg p-3">
                    <h3 className="font-medium text-gray-800 mb-2 flex items-center justify-between">
                      <span>{subtopic.id}. {subtopic.name}</span>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {subtopic.problems.length}
                      </span>
                    </h3>
                    
                    {subtopic.problems.length > 0 ? (
                      <div className="space-y-2">
                        {subtopic.problems.map((problem) => (
                          <button
                            key={problem.question_id}
                            onClick={() => handleProblemSelect(problem)}
                            className={`w-full text-left p-2 rounded transition-all flex items-center justify-between text-sm ${
                              selectedProblem?.question_id === problem.question_id
                                ? "bg-primary/10 border-l-4 border-primary"
                                : "bg-gray-50 hover:bg-gray-100"
                            }`}
                          >
                            <div className="flex-grow">
                              <div className="flex items-center gap-1 mb-1">
                                {problem.calculator_allowed && (
                                  <Calculator className="h-3 w-3 text-blue-500" />
                                )}
                                {problem.problem_image && (
                                  <ImageIcon className="h-3 w-3 text-green-500" />
                                )}
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {problem.problem_text?.substring(0, 60)}...
                              </p>
                            </div>
                            <ChevronRight className="h-3 w-3 text-gray-400" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic">Задачи не найдены</p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right Side - Problem Detail */}
          <div className="lg:col-span-2">
            {selectedProblem ? (
              <Card className="shadow-sm">
                <div className="bg-white p-6 rounded-t-xl border-b">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-mono text-lg bg-primary text-white px-3 py-1 rounded">
                      {selectedProblem.code}
                    </span>
                    {selectedProblem.calculator_allowed && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Калькулятор разрешён
                      </span>
                    )}
                    {selectedProblem.difficulty && (
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        {selectedProblem.difficulty}
                      </span>
                    )}
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <ScrollArea className="h-[calc(100vh-400px)] min-h-[400px]">
                    <div className="space-y-6">
                      {/* Problem Image */}
                      {selectedProblem.problem_image && (
                        <div className="flex justify-center">
                          <img
                            src={selectedProblem.problem_image}
                            alt="Изображение задачи"
                            className="max-w-full h-auto rounded-lg shadow-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {/* Problem Text */}
                      <div className="prose max-w-none">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          Условие задачи
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <LatexRenderer content={selectedProblem.problem_text || ""} />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <Button
                          onClick={() => toggleSection('answer')}
                          variant="outline"
                          className="w-full justify-start"
                        >
                          Показать ответ
                        </Button>
                        
                        <Collapsible open={expandedStates.answer} onOpenChange={() => toggleSection('answer')}>
                          <CollapsibleContent>
                            <div className="bg-green-50 border border-green-200 p-4 rounded-lg mt-2">
                              <h4 className="font-semibold text-green-800 mb-2">Ответ:</h4>
                              <LatexRenderer content={selectedProblem.answer || "Ответ не указан"} />
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        <Button
                          onClick={() => toggleSection('solution')}
                          variant="outline"
                          className="w-full justify-start"
                        >
                          Показать решение
                        </Button>
                        
                        <Collapsible open={expandedStates.solution} onOpenChange={() => toggleSection('solution')}>
                          <CollapsibleContent>
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mt-2">
                              <h4 className="font-semibold text-blue-800 mb-2">Решение:</h4>
                              <LatexRenderer content={selectedProblem.solution_text || "Решение не указано"} />
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        {selectedProblem.solutiontextexpanded && (
                          <>
                            <Button
                              onClick={() => toggleSection('expanded')}
                              variant="outline"
                              className="w-full justify-start"
                            >
                              Я всё ещё не понял(а). Покажи подробнее.
                            </Button>
                            
                            <Collapsible open={expandedStates.expanded} onOpenChange={() => toggleSection('expanded')}>
                              <CollapsibleContent>
                                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg mt-2">
                                  <h4 className="font-semibold text-purple-800 mb-2">Подробное объяснение:</h4>
                                  <LatexRenderer content={selectedProblem.solutiontextexpanded} />
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </>
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-sm">
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Выберите задачу для решения
                  </h3>
                  <p className="text-gray-500">
                    Выберите задачу из списка слева, чтобы начать решение
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
