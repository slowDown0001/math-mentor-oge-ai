
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Clock, BookOpen, ListCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Define types for our data
interface Problem {
  id: string;
  name: string;
  topic: string;
  subtopic: string;
  difficulty: "легкий" | "средний" | "сложный";
  timeMinutes: number;
  content: string;
  solution: string;
}

interface TopicSection {
  id: string;
  name: string;
  subtopics: {
    id: string;
    name: string;
    problems: Problem[];
  }[];
}

// Sample data - organized by main topics and subtopics
const topicSections: TopicSection[] = [
  {
    id: "algebra",
    name: "Алгебра",
    subtopics: [
      {
        id: "equations",
        name: "Уравнения",
        problems: [
          {
            id: "alg-eq-1",
            name: "Линейные уравнения",
            topic: "Алгебра",
            subtopic: "Уравнения",
            difficulty: "легкий",
            timeMinutes: 5,
            content: "Решите уравнение: 2x + 5 = 15",
            solution: "2x + 5 = 15\n2x = 10\nx = 5\nОтвет: x = 5"
          },
          {
            id: "alg-eq-2",
            name: "Квадратные уравнения",
            topic: "Алгебра",
            subtopic: "Уравнения",
            difficulty: "средний",
            timeMinutes: 8,
            content: "Решите квадратное уравнение: x² - 5x + 6 = 0",
            solution: "x² - 5x + 6 = 0\nИспользуем формулу дискриминанта: D = b² - 4ac = (-5)² - 4 × 1 × 6 = 25 - 24 = 1\nx₁ = (5 + √1)/2 = 3\nx₂ = (5 - √1)/2 = 2\nОтвет: x₁ = 3, x₂ = 2"
          }
        ]
      },
      {
        id: "functions",
        name: "Функции",
        problems: [
          {
            id: "alg-func-1",
            name: "Линейная функция",
            topic: "Алгебра",
            subtopic: "Функции",
            difficulty: "легкий",
            timeMinutes: 6,
            content: "Постройте график функции y = 2x - 3 и определите, при каком значении x значение функции равно 7.",
            solution: "y = 2x - 3\nПри y = 7:\n7 = 2x - 3\n10 = 2x\nx = 5\nОтвет: x = 5"
          }
        ]
      }
    ]
  },
  {
    id: "arithmetic",
    name: "Арифметика",
    subtopics: [
      {
        id: "operations",
        name: "Операции с числами",
        problems: [
          {
            id: "arith-op-1",
            name: "Проценты",
            topic: "Арифметика",
            subtopic: "Операции с числами",
            difficulty: "средний",
            timeMinutes: 7,
            content: "В магазине товар стоил 800 рублей. После снижения цены он стал стоить 680 рублей. На сколько процентов была снижена цена?",
            solution: "Изначальная цена: 800 рублей\nНовая цена: 680 рублей\nСнижение: 800 - 680 = 120 рублей\nПроцент снижения: (120 / 800) × 100% = 15%\nОтвет: цена была снижена на 15%"
          }
        ]
      }
    ]
  },
  {
    id: "geometry",
    name: "Геометрия",
    subtopics: [
      {
        id: "triangles",
        name: "Треугольники",
        problems: [
          {
            id: "geo-tri-1",
            name: "Теорема Пифагора",
            topic: "Геометрия",
            subtopic: "Треугольники",
            difficulty: "средний",
            timeMinutes: 8,
            content: "Найдите гипотенузу прямоугольного треугольника, если длины его катетов равны 6 см и 8 см.",
            solution: "По теореме Пифагора: c² = a² + b²\nc² = 6² + 8² = 36 + 64 = 100\nc = √100 = 10\nОтвет: длина гипотенузы равна 10 см"
          }
        ]
      }
    ]
  },
  {
    id: "practical",
    name: "Практическая математика",
    subtopics: [
      {
        id: "word-problems",
        name: "Текстовые задачи",
        problems: [
          {
            id: "prac-wp-1",
            name: "Задача на движение",
            topic: "Практическая математика",
            subtopic: "Текстовые задачи",
            difficulty: "сложный",
            timeMinutes: 12,
            content: "Из пункта А и пункта В, расстояние между которыми 150 км, одновременно навстречу друг другу выехали два автомобиля. Скорость первого автомобиля 60 км/ч, а второго - 70 км/ч. Через сколько часов автомобили встретятся?",
            solution: "Пусть x - время до встречи (в часах)\nЗа это время первый автомобиль проедет 60x км\nВторой автомобиль проедет 70x км\nПо условию: 60x + 70x = 150\n130x = 150\nx = 150/130 = 15/13 ≈ 1.15 часа\nОтвет: автомобили встретятся через 1 час 9 минут"
          }
        ]
      }
    ]
  }
];

const PracticeExercise = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>(topicSections[0].id);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(
    topicSections[0].subtopics[0].problems[0]
  );

  // Helper to get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "легкий":
        return "text-green-500";
      case "средний":
        return "text-orange-500";
      case "сложный":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-6">Практические задачи ОГЭ</h1>

        {/* Topic Navigation */}
        <div className="flex overflow-x-auto mb-6 pb-2">
          {topicSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setSelectedTopic(section.id)}
              className={`px-6 py-3 mr-2 rounded-lg font-medium transition-all ${
                selectedTopic === section.id
                  ? "bg-primary text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {section.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Side - Problem List */}
          <div className="md:col-span-1 bg-white p-4 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Список задач</h2>
            
            {topicSections
              .find(section => section.id === selectedTopic)
              ?.subtopics.map((subtopic) => (
                <div key={subtopic.id} className="mb-6">
                  <h3 className="text-lg font-medium mb-2 text-gray-800">
                    {subtopic.name}
                  </h3>
                  <div className="space-y-2">
                    {subtopic.problems.map((problem) => (
                      <button
                        key={problem.id}
                        onClick={() => setSelectedProblem(problem)}
                        className={`w-full text-left p-3 rounded-lg transition-all flex items-center ${
                          selectedProblem?.id === problem.id
                            ? "bg-primary/10 border-l-4 border-primary"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex-grow">
                          <p className="font-medium">{problem.name}</p>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <span className={`mr-2 ${getDifficultyColor(problem.difficulty)}`}>
                              {problem.difficulty}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {problem.timeMinutes} мин
                            </span>
                          </div>
                        </div>
                        {selectedProblem?.id === problem.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {/* Right Side - Problem Detail */}
          <div className="md:col-span-2">
            {selectedProblem && (
              <Card className="shadow-sm">
                <div className="bg-white p-4 rounded-t-xl border-b flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {selectedProblem.name}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>{selectedProblem.topic} • {selectedProblem.subtopic}</span>
                      <span className={`${getDifficultyColor(selectedProblem.difficulty)}`}>
                        {selectedProblem.difficulty}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {selectedProblem.timeMinutes} мин
                      </span>
                    </div>
                  </div>
                </div>
                
                <Tabs defaultValue="problem" className="w-full">
                  <div className="px-4 border-b">
                    <TabsList className="grid w-full max-w-[400px] grid-cols-2 mt-2">
                      <TabsTrigger value="problem" className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>Задача</span>
                      </TabsTrigger>
                      <TabsTrigger value="solution" className="flex items-center gap-1">
                        <ListCheck className="h-4 w-4" />
                        <span>Решение</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="problem" className="m-0">
                    <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
                      <CardContent className="p-6">
                        <div className="prose max-w-none">
                          <p className="whitespace-pre-wrap">{selectedProblem.content}</p>
                        </div>
                      </CardContent>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="solution" className="m-0">
                    <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
                      <CardContent className="p-6 bg-gray-50">
                        <div className="prose max-w-none">
                          <p className="whitespace-pre-wrap">{selectedProblem.solution}</p>
                        </div>
                      </CardContent>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
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
