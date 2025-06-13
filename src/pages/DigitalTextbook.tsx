
import { useState, useEffect } from "react";
import { Book, Search, Star, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

// Mock data structures for math_skills_full.json and topics mapping
const mathSkillsMapping = {
  1: "Числа и вычисления",
  2: "Алгебраические выражения", 
  3: "Уравнения и неравенства",
  4: "Функции",
  5: "Координаты и графики",
  6: "Арифметическая прогрессия",
  7: "Геометрические фигуры",
  8: "Площади и объёмы"
};

const topicMapping = {
  "Числа и вычисления": "Алгебра",
  "Алгебраические выражения": "Алгебра", 
  "Уравнения и неравенства": "Алгебра",
  "Функции": "Алгебра",
  "Координаты и графики": "Алгебра",
  "Арифметическая прогрессия": "Алгебра",
  "Геометрические фигуры": "Геометрия",
  "Площади и объёмы": "Геометрия"
};

interface Article {
  id: string;
  title: string;
  content: string;
  skill: number;
  created_at: string;
  author?: string;
}

const DigitalTextbook = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(new Set());
  const [readArticles, setReadArticles] = useState<Set<string>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set(["Алгебра"]));
  const [loading, setLoading] = useState(true);

  // Group articles by topics
  const topics = ["Алгебра", "Геометрия"];

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching articles:', error);
        return;
      }

      setArticles(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTopicForSkill = (skill: number): string => {
    const skillName = mathSkillsMapping[skill] || "Общие";
    return topicMapping[skillName] || "Общие";
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = selectedTopic === "all" || getTopicForSkill(article.skill) === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  const articlesByTopic = topics.reduce((acc, topic) => {
    acc[topic] = filteredArticles.filter(article => getTopicForSkill(article.skill) === topic);
    return acc;
  }, {} as Record<string, Article[]>);

  const toggleBookmark = (articleId: string) => {
    const newBookmarks = new Set(bookmarkedArticles);
    if (newBookmarks.has(articleId)) {
      newBookmarks.delete(articleId);
    } else {
      newBookmarks.add(articleId);
    }
    setBookmarkedArticles(newBookmarks);
  };

  const markAsRead = (articleId: string) => {
    setReadArticles(prev => new Set([...prev, articleId]));
  };

  const toggleTopic = (topic: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topic)) {
      newExpanded.delete(topic);
    } else {
      newExpanded.add(topic);
    }
    setExpandedTopics(newExpanded);
  };

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <Button 
              variant="outline" 
              onClick={() => setSelectedArticle(null)}
              className="mb-6"
            >
              ← Назад к статьям
            </Button>
            
            <Card className="mb-6">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {mathSkillsMapping[selectedArticle.skill] || "Общие"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBookmark(selectedArticle.id)}
                  >
                    <Star 
                      className={`w-4 h-4 ${
                        bookmarkedArticles.has(selectedArticle.id) 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-400'
                      }`} 
                    />
                  </Button>
                </div>
                <CardTitle className="text-2xl font-bold">
                  {selectedArticle.title}
                </CardTitle>
                {selectedArticle.author && (
                  <p className="text-sm text-gray-600">Автор: {selectedArticle.author}</p>
                )}
              </CardHeader>
              <CardContent>
                <div 
                  className="math-content prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 font-heading">
              Электронный учебник
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Изучайте математику с помощью наших подробных статей и материалов
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Поиск статей..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="w-5 h-5" />
                    Разделы
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-2">
                    <Button
                      variant={selectedTopic === "all" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedTopic("all")}
                    >
                      Все разделы
                    </Button>
                    
                    {topics.map((topic) => (
                      <Collapsible 
                        key={topic}
                        open={expandedTopics.has(topic)}
                        onOpenChange={() => toggleTopic(topic)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button
                            variant={selectedTopic === topic ? "default" : "ghost"}
                            className="w-full justify-between"
                            onClick={() => setSelectedTopic(topic)}
                          >
                            <span>{topic}</span>
                            {expandedTopics.has(topic) ? 
                              <ChevronDown className="w-4 h-4" /> : 
                              <ChevronRight className="w-4 h-4" />
                            }
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-1 ml-4 mt-1">
                          {Object.entries(mathSkillsMapping)
                            .filter(([_, skillName]) => topicMapping[skillName] === topic)
                            .map(([skillId, skillName]) => (
                              <div key={skillId} className="text-sm text-gray-600 py-1">
                                {skillName}
                              </div>
                            ))}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-gray-600">Загрузка статей...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedTopic === "all" ? (
                    // Show all articles grouped by topic
                    topics.map((topic) => (
                      <div key={topic}>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">{topic}</h2>
                        <div className="grid gap-4 mb-8">
                          {articlesByTopic[topic].map((article) => (
                            <Card 
                              key={article.id} 
                              className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                              onClick={() => {
                                setSelectedArticle(article);
                                markAsRead(article.id);
                              }}
                            >
                              <CardHeader>
                                <div className="flex items-center justify-between">
                                  <Badge variant="secondary">
                                    {mathSkillsMapping[article.skill] || "Общие"}
                                  </Badge>
                                  <div className="flex items-center gap-2">
                                    {readArticles.has(article.id) && (
                                      <Badge variant="outline" className="text-xs">
                                        Прочитано
                                      </Badge>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleBookmark(article.id);
                                      }}
                                    >
                                      <Star 
                                        className={`w-4 h-4 ${
                                          bookmarkedArticles.has(article.id) 
                                            ? 'fill-yellow-400 text-yellow-400' 
                                            : 'text-gray-400'
                                        }`} 
                                      />
                                    </Button>
                                  </div>
                                </div>
                                <CardTitle className="text-lg">{article.title}</CardTitle>
                                <CardDescription>
                                  {article.content.substring(0, 150)}...
                                </CardDescription>
                              </CardHeader>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    // Show articles for selected topic
                    <div className="grid gap-4">
                      {filteredArticles.map((article) => (
                        <Card 
                          key={article.id} 
                          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                          onClick={() => {
                            setSelectedArticle(article);
                            markAsRead(article.id);
                          }}
                        >
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary">
                                {mathSkillsMapping[article.skill] || "Общие"}
                              </Badge>
                              <div className="flex items-center gap-2">
                                {readArticles.has(article.id) && (
                                  <Badge variant="outline" className="text-xs">
                                    Прочитано
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleBookmark(article.id);
                                  }}
                                >
                                  <Star 
                                    className={`w-4 h-4 ${
                                      bookmarkedArticles.has(article.id) 
                                        ? 'fill-yellow-400 text-yellow-400' 
                                        : 'text-gray-400'
                                    }`} 
                                  />
                                </Button>
                              </div>
                            </div>
                            <CardTitle className="text-lg">{article.title}</CardTitle>
                            <CardDescription>
                              {article.content.substring(0, 150)}...
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  )}

                  {filteredArticles.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Статьи не найдены
                      </h3>
                      <p className="text-gray-600">
                        Попробуйте изменить поисковый запрос или выбрать другой раздел
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalTextbook;
