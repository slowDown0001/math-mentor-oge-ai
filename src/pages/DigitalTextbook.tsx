import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun } from "lucide-react";
import Header from "@/components/Header";
import { useTheme } from "@/components/theme-provider"

interface Article {
  id: number;
  title: string;
  content: string;
  topic: string;
  subtopic: string;
}

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const DigitalTextbook = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setTheme } = useTheme();

  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("Все темы");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [articleContent, setArticleContent] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isSelecterActive, setIsSelecterActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Mock data for articles
    const mockArticles: Article[] = [
      {
        id: 1,
        title: "Введение в математический анализ",
        content: "Математический анализ — это раздел математики, изучающий понятия предела, непрерывности, дифференцирования, интегрирования и бесконечных рядов.",
        topic: "Математический анализ",
        subtopic: "Основы анализа",
      },
      {
        id: 2,
        title: "Основы линейной алгебры",
        content: "Линейная алгебра — это раздел математики, изучающий векторы, векторные пространства, линейные отображения и системы линейных уравнений.",
        topic: "Линейная алгебра",
        subtopic: "Векторы и матрицы",
      },
      {
        id: 3,
        title: "Теория вероятностей и статистика",
        content: "Теория вероятностей и статистика — это разделы математики, изучающие случайные события, вероятности и статистические методы анализа данных.",
        topic: "Теория вероятностей",
        subtopic: "Вероятность событий",
      },
      {
        id: 4,
        title: "Дифференциальные уравнения",
        content: "Дифференциальные уравнения — это уравнения, связывающие функцию с её производными. Они используются для моделирования различных процессов в физике, экономике и других науках.",
        topic: "Дифференциальные уравнения",
        subtopic: "Основные понятия",
      },
      {
        id: 5,
        title: "Комплексные числа",
        content: "Комплексные числа — это расширение множества действительных чисел, включающее мнимую единицу i, такую что i² = -1. Они используются в различных областях математики и физики.",
        topic: "Алгебра",
        subtopic: "Комплексные числа",
      },
      {
        id: 6,
        title: "Геометрия",
        content: "Геометрия — это раздел математики, изучающий формы, размеры и взаимное расположение фигур. Она включает в себя планиметрию (изучение фигур на плоскости) и стереометрию (изучение фигур в пространстве).",
        topic: "Геометрия",
        subtopic: "Основные понятия",
      },
      {
        id: 7,
        title: "Тригонометрия",
        content: "Тригонометрия — это раздел математики, изучающий соотношения между сторонами и углами треугольников. Она широко используется в геодезии, навигации и других областях.",
        topic: "Тригонометрия",
        subtopic: "Основные функции",
      },
      {
        id: 8,
        title: "Математическая логика",
        content: "Математическая логика — это раздел математики, изучающий формальные системы и доказательства. Она является основой для информатики и теории алгоритмов.",
        topic: "Математическая логика",
        subtopic: "Основные принципы",
      },
      {
        id: 9,
        title: "Дискретная математика",
        content: "Дискретная математика — это раздел математики, изучающий дискретные структуры, такие как графы, комбинаторика и теория чисел. Она широко используется в информатике и криптографии.",
        topic: "Дискретная математика",
        subtopic: "Основные понятия",
      },
      {
        id: 10,
        title: "Численные методы",
        content: "Численные методы — это методы приближённого решения математических задач с использованием компьютеров. Они широко используются в инженерии, физике и других науках.",
        topic: "Численные методы",
        subtopic: "Основные алгоритмы",
      },
    ];

    setArticles(mockArticles);
    setFilteredArticles(mockArticles);
  }, []);

  useEffect(() => {
    // Filter articles based on search term and selected topic
    let filtered = articles;

    if (searchTerm) {
      filtered = filtered.filter((article) =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTopic !== "Все темы") {
      filtered = filtered.filter((article) => article.topic === selectedTopic);
    }

    setFilteredArticles(filtered);
  }, [searchTerm, selectedTopic, articles]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic);
  };

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setArticleContent(article.content);
  };

  const handleCloseArticle = () => {
    setSelectedArticle(null);
  };

  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value);
  };

  const handleSendMessage = () => {
    if (chatInput.trim() !== "") {
      const newMessage: ChatMessage = {
        id: chatMessages.length + 1,
        text: chatInput,
        isUser: true,
        timestamp: new Date(),
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatInput("");

      // Simulate AI response
      setIsTyping(true);
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: chatMessages.length + 2,
          text: "Это очень интересный вопрос! Я думаю, что...",
          isUser: false,
          timestamp: new Date(),
        };
        setChatMessages([...chatMessages, aiResponse]);
        setIsTyping(false);
      }, 2000);
    }
  };

  const toggleTextSelection = () => {
    setIsSelecterActive(!isSelecterActive);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    setTheme(isDarkMode ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Header and Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button onClick={() => navigate('/')} variant="outline">
              Главная страница
            </Button>
            <div className="flex items-center space-x-4">
              <Input
                type="search"
                placeholder="Поиск по статьям..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="max-w-md"
              />
              <Button variant="outline" onClick={toggleTextSelection}>
                {isSelecterActive ? "Выделение текста: Вкл" : "Выделение текста: Выкл"}
              </Button>
              <Button variant="outline" onClick={toggleTheme}>
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Topics */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Темы</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(100vh-14rem)]">
                    <Accordion type="single" collapsible>
                      <AccordionItem value="mathAnalysis">
                        <AccordionTrigger onClick={() => handleTopicChange("Математический анализ")}>
                          Математический анализ
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul>
                            <li>Основы анализа</li>
                            <li>Пределы и непрерывность</li>
                            <li>Производные и дифференцирование</li>
                            <li>Интегралы и интегрирование</li>
                            <li>Ряды и последовательности</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="linearAlgebra">
                        <AccordionTrigger onClick={() => handleTopicChange("Линейная алгебра")}>
                          Линейная алгебра
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul>
                            <li>Векторы и матрицы</li>
                            <li>Линейные пространства</li>
                            <li>Линейные отображения</li>
                            <li>Системы линейных уравнений</li>
                            <li>Собственные значения и векторы</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="probabilityTheory">
                        <AccordionTrigger onClick={() => handleTopicChange("Теория вероятностей")}>
                          Теория вероятностей
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul>
                            <li>Вероятность событий</li>
                            <li>Случайные величины</li>
                            <li>Математическое ожидание</li>
                            <li>Дисперсия</li>
                            <li>Законы распределения</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="differentialEquations">
                        <AccordionTrigger onClick={() => handleTopicChange("Дифференциальные уравнения")}>
                          Дифференциальные уравнения
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul>
                            <li>Основные понятия</li>
                            <li>Уравнения первого порядка</li>
                            <li>Линейные уравнения</li>
                            <li>Системы уравнений</li>
                            <li>Устойчивость решений</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="algebra">
                        <AccordionTrigger onClick={() => handleTopicChange("Алгебра")}>
                          Алгебра
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul>
                            <li>Комплексные числа</li>
                            <li>Многочлены</li>
                            <li>Группы</li>
                            <li>Кольца</li>
                            <li>Поля</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="geometry">
                        <AccordionTrigger onClick={() => handleTopicChange("Геометрия")}>
                          Геометрия
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul>
                            <li>Основные понятия</li>
                            <li>Планиметрия</li>
                            <li>Стереометрия</li>
                            <li>Аналитическая геометрия</li>
                            <li>Дифференциальная геометрия</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="trigonometry">
                        <AccordionTrigger onClick={() => handleTopicChange("Тригонометрия")}>
                          Тригонометрия
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul>
                            <li>Основные функции</li>
                            <li>Тригонометрические тождества</li>
                            <li>Решение треугольников</li>
                            <li>Обратные функции</li>
                            <li>Применение в физике</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="mathLogic">
                        <AccordionTrigger onClick={() => handleTopicChange("Математическая логика")}>
                          Математическая логика
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul>
                            <li>Основные принципы</li>
                            <li>Логические операции</li>
                            <li>Предикаты и кванторы</li>
                            <li>Формальные системы</li>
                            <li>Теория доказательств</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="discreteMath">
                        <AccordionTrigger onClick={() => handleTopicChange("Дискретная математика")}>
                          Дискретная математика
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul>
                            <li>Основные понятия</li>
                            <li>Графы</li>
                            <li>Комбинаторика</li>
                            <li>Теория чисел</li>
                            <li>Алгоритмы</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="numericalMethods">
                        <AccordionTrigger onClick={() => handleTopicChange("Численные методы")}>
                          Численные методы
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul>
                            <li>Основные алгоритмы</li>
                            <li>Решение уравнений</li>
                            <li>Интегрирование</li>
                            <li>Дифференцирование</li>
                            <li>Оптимизация</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="allTopics">
                        <AccordionTrigger onClick={() => handleTopicChange("Все темы")}>
                          Все темы
                        </AccordionTrigger>
                      </AccordionItem>
                    </Accordion>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Search and Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Статьи</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Выберите тему из списка слева или воспользуйтесь поиском, чтобы найти интересующую вас статью.
                  </p>
                </CardContent>
              </Card>

              {/* Article List */}
              <div className="space-y-4">
                {filteredArticles.map((article) => (
                  <Card key={article.id} className="card-hover">
                    <CardHeader>
                      <CardTitle>{article.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">
                        {article.topic} - {article.subtopic}
                      </p>
                      <Button variant="link" onClick={() => handleArticleClick(article)}>
                        Читать далее
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Article Reader Modal */}
              {selectedArticle && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                  <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
                    <CardHeader className="flex items-center justify-between">
                      <CardTitle>{selectedArticle.title}</CardTitle>
                      <Button variant="ghost" size="sm" onClick={handleCloseArticle}>
                        Закрыть
                      </Button>
                    </CardHeader>
                    <div className="flex-1 overflow-y-auto p-6">
                      <div 
                        className={`prose prose-lg max-w-none leading-relaxed ${
                          isDarkMode ? 'prose-invert' : ''
                        }`}
                        style={{ userSelect: isSelecterActive ? 'text' : 'auto' }}
                      >
                        <div>{articleContent}</div>
                      </div>
                      <Button variant="secondary" onClick={() => navigate(`/mcq-practice?skill=${selectedArticle.id}`)}>
                        Практика по теме
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </div>

            {/* Right Sidebar - AI Chat */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 h-[calc(100vh-8rem)]">
                <CardHeader>
                  <CardTitle>AI Tutor Chat</CardTitle>
                </CardHeader>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-lg text-sm ${
                          message.isUser
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-gray-100 text-gray-900 rounded-tl-none"
                        }`}
                      >
                        <div>{message.text}</div>
                        <div className={`text-xs mt-1 ${message.isUser ? "text-blue-100" : "text-gray-500"}`}>
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] p-3 rounded-lg text-sm bg-gray-100 text-gray-900 rounded-tl-none">
                        AI печатает...
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex rounded-md shadow-sm">
                    <Input
                      type="text"
                      placeholder="Введите сообщение..."
                      value={chatInput}
                      onChange={handleChatInputChange}
                      className="rounded-r-none"
                    />
                    <Button onClick={handleSendMessage} className="rounded-l-none">
                      Отправить
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalTextbook;
