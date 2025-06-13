
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
import mathSkillsData from "../../documentation/math_skills_full.json";
import topicSkillMapping from "../../documentation/topic_skill_mapping_with_names.json";

// Main topics mapping
const mainTopics = {
  "1": "Числа и вычисления",
  "2": "Алгебраические выражения", 
  "3": "Уравнения и неравенства",
  "4": "Числовые последовательности",
  "5": "Функции",
  "6": "Координаты на прямой и плоскости",
  "7": "Геометрия",
  "8": "Вероятность и статистика"
};

interface Article {
  id: string;
  title: string;
  content: string;
  skill: number;
  created_at: string;
  author?: string;
}

interface MathSkill {
  skill: string;
  id: number;
}

interface TopicMapping {
  topic: string;
  name: string;
  skills: number[];
}

const DigitalTextbook = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>("all");
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(new Set());
  const [readArticles, setReadArticles] = useState<Set<string>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set(["1"]));
  const [loading, setLoading] = useState(true);

  const skills = mathSkillsData as MathSkill[];
  const mappings = topicSkillMapping as TopicMapping[];

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

  // Get main topic number from topic string (e.g., "1.1" -> "1")
  const getMainTopicNumber = (topicStr: string): string => {
    if (topicStr === "Special") return "Special";
    return topicStr.split(".")[0];
  };

  // Get subtopics for a main topic
  const getSubtopicsForMainTopic = (mainTopicNum: string) => {
    return mappings.filter(mapping => 
      getMainTopicNumber(mapping.topic) === mainTopicNum
    );
  };

  // Get skill name by ID
  const getSkillNameById = (skillId: number): string => {
    const skill = skills.find(s => s.id === skillId);
    return skill ? skill.skill : `Навык ${skillId}`;
  };

  // Get articles for a specific skill
  const getArticlesForSkill = (skillId: number) => {
    return articles.filter(article => article.skill === skillId);
  };

  // Filter articles based on current selection
  const getFilteredArticles = () => {
    let filtered = articles;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getSkillNameById(article.skill).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by main topic
    if (selectedTopic !== "all") {
      const subtopics = getSubtopicsForMainTopic(selectedTopic);
      const relevantSkills = subtopics.flatMap(subtopic => subtopic.skills);
      filtered = filtered.filter(article => relevantSkills.includes(article.skill));
    }

    // Filter by subtopic
    if (selectedSubtopic !== "all") {
      const subtopic = mappings.find(m => m.topic === selectedSubtopic);
      if (subtopic) {
        filtered = filtered.filter(article => subtopic.skills.includes(article.skill));
      }
    }

    return filtered;
  };

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

  const handleTopicSelect = (topicNum: string) => {
    setSelectedTopic(topicNum);
    setSelectedSubtopic("all");
  };

  const handleSubtopicSelect = (subtopicId: string) => {
    setSelectedSubtopic(subtopicId);
  };

  if (selectedArticle) {
    const skillName = getSkillNameById(selectedArticle.skill);
    const subtopic = mappings.find(mapping => mapping.skills.includes(selectedArticle.skill));
    const mainTopicNum = subtopic ? getMainTopicNumber(subtopic.topic) : "1";
    const mainTopicName = mainTopics[mainTopicNum as keyof typeof mainTopics] || "Общие";

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
                  <div className="flex flex-col gap-2">
                    <Badge variant="secondary">
                      {mainTopicName}
                    </Badge>
                    {subtopic && (
                      <Badge variant="outline">
                        {subtopic.name}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {skillName}
                    </Badge>
                  </div>
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

  const filteredArticles = getFilteredArticles();

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
              Изучайте математику с помощью наших подробных статей и материалов по 180 навыкам ОГЭ
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Поиск статей и навыков..."
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
                  <ScrollArea className="h-96">
                    <div className="space-y-2 p-4">
                      <Button
                        variant={selectedTopic === "all" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => {
                          setSelectedTopic("all");
                          setSelectedSubtopic("all");
                        }}
                      >
                        Все разделы
                      </Button>
                      
                      {Object.entries(mainTopics).map(([topicNum, topicName]) => {
                        const subtopics = getSubtopicsForMainTopic(topicNum);
                        const hasArticles = subtopics.some(subtopic => 
                          subtopic.skills.some(skillId => 
                            articles.some(article => article.skill === skillId)
                          )
                        );

                        return (
                          <Collapsible 
                            key={topicNum}
                            open={expandedTopics.has(topicNum)}
                            onOpenChange={() => toggleTopic(topicNum)}
                          >
                            <CollapsibleTrigger asChild>
                              <Button
                                variant={selectedTopic === topicNum ? "default" : "ghost"}
                                className="w-full justify-between text-sm"
                                onClick={() => handleTopicSelect(topicNum)}
                              >
                                <span className="text-left flex-1">
                                  {topicNum}. {topicName}
                                </span>
                                {expandedTopics.has(topicNum) ? 
                                  <ChevronDown className="w-4 h-4" /> : 
                                  <ChevronRight className="w-4 h-4" />
                                }
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-1 ml-2 mt-1">
                              {subtopics.map((subtopic) => {
                                const hasSubtopicArticles = subtopic.skills.some(skillId => 
                                  articles.some(article => article.skill === skillId)
                                );
                                
                                return (
                                  <Button
                                    key={subtopic.topic}
                                    variant={selectedSubtopic === subtopic.topic ? "default" : "ghost"}
                                    className="w-full justify-start text-xs"
                                    size="sm"
                                    onClick={() => handleSubtopicSelect(subtopic.topic)}
                                    disabled={!hasSubtopicArticles}
                                  >
                                    {subtopic.topic} {subtopic.name}
                                  </Button>
                                );
                              })}
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                    </div>
                  </ScrollArea>
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
                  {/* Show current selection info */}
                  {selectedTopic !== "all" && (
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedTopic}. {mainTopics[selectedTopic as keyof typeof mainTopics]}
                      </h2>
                      {selectedSubtopic !== "all" && (
                        <p className="text-gray-600">
                          {mappings.find(m => m.topic === selectedSubtopic)?.name}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Articles Grid */}
                  <div className="grid gap-4">
                    {filteredArticles.map((article) => {
                      const skillName = getSkillNameById(article.skill);
                      const subtopic = mappings.find(mapping => mapping.skills.includes(article.skill));
                      const mainTopicNum = subtopic ? getMainTopicNumber(subtopic.topic) : "1";
                      const mainTopicName = mainTopics[mainTopicNum as keyof typeof mainTopics] || "Общие";

                      return (
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
                              <div className="flex flex-wrap gap-1">
                                <Badge variant="secondary" className="text-xs">
                                  {mainTopicName}
                                </Badge>
                                {subtopic && (
                                  <Badge variant="outline" className="text-xs">
                                    {subtopic.name}
                                  </Badge>
                                )}
                              </div>
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
                            <CardDescription className="text-sm">
                              <span className="font-medium">Навык:</span> {skillName}
                            </CardDescription>
                            <CardDescription>
                              {article.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>

                  {filteredArticles.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Статьи не найдены
                      </h3>
                      <p className="text-gray-600">
                        {searchTerm 
                          ? "Попробуйте изменить поисковый запрос или выбрать другой раздел"
                          : "В выбранном разделе пока нет статей"
                        }
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
