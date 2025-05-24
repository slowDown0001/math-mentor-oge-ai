
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronRight, Image as ImageIcon, Calculator, BookOpen } from "lucide-react";
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

interface CategoryGroup {
  id: string;
  name: string;
  codeRange: string[];
  problems: Problem[];
}

const PracticeExercise = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("arithmetic");
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

  // Category definitions
  const categories: CategoryGroup[] = [
    {
      id: "arithmetic",
      name: "Арифметика",
      codeRange: ["1.1", "1.2", "1.3", "1.4", "1.5"],
      problems: []
    },
    {
      id: "algebra", 
      name: "Алгебра",
      codeRange: ["2.1", "2.2", "2.3", "2.4", "2.5", "3.1", "3.2", "3.3", "4.1", "4.2", "5.1", "5.2", "6.1", "6.2"],
      problems: []
    },
    {
      id: "geometry",
      name: "Геометрия", 
      codeRange: ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6"],
      problems: []
    },
    {
      id: "practical",
      name: "Практическая математика",
      codeRange: ["8.1", "8.2", "8.3", "8.4", "8.5"],
      problems: []
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

  // Group problems by category
  const categorizedProblems = categories.map(category => ({
    ...category,
    problems: problems.filter(problem => 
      category.codeRange.includes(problem.code)
    )
  }));

  const currentCategory = categorizedProblems.find(cat => cat.id === selectedCategory);
  
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

        {/* Category Navigation */}
        <div className="flex overflow-x-auto mb-6 pb-2">
          {categorizedProblems.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 mr-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                selectedCategory === category.id
                  ? "bg-primary text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {category.name}
              <span className="text-xs bg-white/20 px-2 py-1 rounded">
                {category.problems.length}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Problem List */}
          <div className="lg:col-span-1 bg-white p-4 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
              {currentCategory?.name}
            </h2>
            
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-2">
                {currentCategory?.problems.map((problem) => (
                  <button
                    key={problem.question_id}
                    onClick={() => handleProblemSelect(problem)}
                    className={`w-full text-left p-3 rounded-lg transition-all flex items-center justify-between ${
                      selectedProblem?.question_id === problem.question_id
                        ? "bg-primary/10 border-l-4 border-primary"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">
                          {problem.code}
                        </span>
                        {problem.calculator_allowed && (
                          <Calculator className="h-3 w-3 text-blue-500" />
                        )}
                        {problem.problem_image && (
                          <ImageIcon className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {problem.problem_text?.substring(0, 80)}...
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
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
