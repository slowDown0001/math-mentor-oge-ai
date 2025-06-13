
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Search, Bookmark, ChevronDown, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import mathSkills from '/documentation/math_skills_full.json';

// Topic mapping based on topics.md
const topicMapping = {
  1: "Числа и вычисления",
  2: "Алгебраические выражения", 
  3: "Уравнения и неравенства",
  4: "Числовые последовательности",
  5: "Функции",
  6: "Координаты на прямой и плоскости",
  7: "Геометрия",
  8: "Вероятность и статистика"
};

const skillToTopicMap: { [key: number]: number } = {
  // Numbers and calculations (1-34)
  1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1, 12: 1, 13: 1, 14: 1, 15: 1, 16: 1, 17: 1, 18: 1, 19: 1, 20: 1, 21: 1, 22: 1, 23: 1, 24: 1, 25: 1, 26: 1, 27: 1, 28: 1, 29: 1, 30: 1, 31: 1, 32: 1, 33: 1, 34: 1,
  // Algebraic expressions (35-58)
  35: 2, 36: 2, 37: 2, 38: 2, 39: 2, 40: 2, 41: 2, 42: 2, 43: 2, 44: 2, 45: 2, 46: 2, 47: 2, 48: 2, 49: 2, 50: 2, 51: 2, 52: 2, 53: 2, 54: 2, 55: 2, 56: 2, 57: 2, 58: 2,
  // Equations and inequalities (59-76)
  59: 3, 60: 3, 61: 3, 62: 3, 63: 3, 64: 3, 65: 3, 66: 3, 67: 3, 68: 3, 69: 3, 70: 3, 71: 3, 72: 3, 73: 3, 74: 3, 75: 3, 76: 3,
  // Number sequences (77-89)
  77: 4, 78: 4, 79: 4, 80: 4, 81: 4, 82: 4, 83: 4, 84: 4, 85: 4, 86: 4, 87: 4, 88: 4, 89: 4,
  // Functions (90-103)
  90: 5, 91: 5, 92: 5, 93: 5, 94: 5, 95: 5, 96: 5, 97: 5, 98: 5, 99: 5, 100: 5, 101: 5, 102: 5, 103: 5,
  // Coordinates (104-112)
  104: 6, 105: 6, 106: 6, 107: 6, 108: 6, 109: 6, 110: 6, 111: 6, 112: 6,
  // Geometry (113-162)
  113: 7, 114: 7, 115: 7, 116: 7, 117: 7, 118: 7, 119: 7, 120: 7, 121: 7, 122: 7, 123: 7, 124: 7, 125: 7, 126: 7, 127: 7, 128: 7, 129: 7, 130: 7, 131: 7, 132: 7, 133: 7, 134: 7, 135: 7, 136: 7, 137: 7, 138: 7, 139: 7, 140: 7, 141: 7, 142: 7, 143: 7, 144: 7, 145: 7, 146: 7, 147: 7, 148: 7, 149: 7, 150: 7, 151: 7, 152: 7, 153: 7, 154: 7, 155: 7, 156: 7, 157: 7, 158: 7, 159: 7, 160: 7, 161: 7, 162: 7,
  // Probability and statistics (163-179)
  163: 8, 164: 8, 165: 8, 166: 8, 167: 8, 168: 8, 169: 8, 170: 8, 171: 8, 172: 8, 173: 8, 174: 8, 175: 8, 176: 8, 177: 8, 178: 8, 179: 8,
  // Special skills
  180: 1, 181: 1, 182: 1
};

interface Article {
  skill: number;
  art: string;
}

interface GroupedArticles {
  [topicId: number]: Article[];
}

const DigitalTextbook: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [groupedArticles, setGroupedArticles] = useState<GroupedArticles>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [readArticles, setReadArticles] = useState<Set<number>>(new Set());
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<number>>(new Set());
  const [openTopics, setOpenTopics] = useState<Set<number>>(new Set([1, 2, 3, 4, 5, 6, 7, 8]));
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('skill, art')
        .not('art', 'is', null)
        .not('art', 'eq', '');

      if (error) throw error;

      setArticles(data || []);
      groupArticlesByTopic(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить статьи",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const groupArticlesByTopic = (articlesData: Article[]) => {
    const grouped: GroupedArticles = {};
    
    articlesData.forEach(article => {
      const topicId = skillToTopicMap[article.skill] || 1;
      if (!grouped[topicId]) {
        grouped[topicId] = [];
      }
      grouped[topicId].push(article);
    });

    setGroupedArticles(grouped);
  };

  const getSkillName = (skillId: number): string => {
    const skill = mathSkills.find(s => s.id === skillId);
    return skill?.skill || `Навык ${skillId}`;
  };

  const getArticlePreview = (content: string): string => {
    const plainText = content.replace(/<[^>]*>/g, '').replace(/\$[^$]*\$/g, '[формула]');
    return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  };

  const toggleTopic = (topicId: number) => {
    const newOpenTopics = new Set(openTopics);
    if (newOpenTopics.has(topicId)) {
      newOpenTopics.delete(topicId);
    } else {
      newOpenTopics.add(topicId);
    }
    setOpenTopics(newOpenTopics);
  };

  const markAsRead = (skillId: number) => {
    setReadArticles(prev => new Set([...prev, skillId]));
  };

  const toggleBookmark = (skillId: number) => {
    const newBookmarks = new Set(bookmarkedArticles);
    if (newBookmarks.has(skillId)) {
      newBookmarks.delete(skillId);
      toast({
        title: "Закладка удалена",
        description: "Статья удалена из закладок"
      });
    } else {
      newBookmarks.add(skillId);
      toast({
        title: "Закладка добавлена",
        description: "Статья добавлена в закладки"
      });
    }
    setBookmarkedArticles(newBookmarks);
  };

  const filteredArticles = articles.filter(article => {
    const skillName = getSkillName(article.skill);
    const content = article.art;
    return skillName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           content.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (selectedArticle) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20">
          <div className="container mx-auto px-4 py-8">
            <Button 
              onClick={() => setSelectedArticle(null)}
              className="mb-6"
              variant="outline"
            >
              ← Назад к учебнику
            </Button>
            
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-3xl font-bold text-primary">
                  {getSkillName(selectedArticle.skill)}
                </h1>
                <Button
                  onClick={() => toggleBookmark(selectedArticle.skill)}
                  variant={bookmarkedArticles.has(selectedArticle.skill) ? "default" : "outline"}
                  size="sm"
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  {bookmarkedArticles.has(selectedArticle.skill) ? "В закладках" : "Добавить"}
                </Button>
              </div>
              
              <Card>
                <CardContent className="prose max-w-none p-8">
                  <div 
                    dangerouslySetInnerHTML={{ __html: selectedArticle.art }}
                    className="math-content"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <div className="bg-gradient-to-b from-primary/10 to-primary/5 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 font-heading">
              Электронный учебник
            </h1>
            <p className="text-gray-700 max-w-3xl mb-8">
              Изучайте математику с помощью наших подробных статей, организованных по темам. 
              Каждая статья содержит теоретические объяснения и примеры.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-1/4">
              <div className="sticky top-24">
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Поиск по статьям..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <nav className="space-y-2">
                  {Object.entries(topicMapping).map(([topicId, topicName]) => {
                    const id = parseInt(topicId);
                    const topicArticles = groupedArticles[id] || [];
                    const isOpen = openTopics.has(id);
                    
                    return (
                      <Collapsible key={id} open={isOpen} onOpenChange={() => toggleTopic(id)}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-left rounded-lg hover:bg-gray-100 transition-colors">
                          <span className="font-medium text-gray-900">{topicName}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">({topicArticles.length})</span>
                            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-4 space-y-1">
                          {topicArticles.map((article) => (
                            <button
                              key={article.skill}
                              onClick={() => {
                                setSelectedArticle(article);
                                markAsRead(article.skill);
                              }}
                              className={`block w-full text-left p-2 rounded text-sm hover:bg-blue-50 transition-colors ${
                                readArticles.has(article.skill) ? 'text-gray-600' : 'text-gray-900'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{getSkillName(article.skill)}</span>
                                {bookmarkedArticles.has(article.skill) && (
                                  <Bookmark className="w-3 h-3 text-primary fill-current" />
                                )}
                              </div>
                            </button>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-gray-600">Загрузка статей...</p>
                </div>
              ) : searchTerm ? (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">
                    Результаты поиска: "{searchTerm}"
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {filteredArticles.map((article) => (
                      <Card key={article.skill} className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center justify-between">
                            <span>{getSkillName(article.skill)}</span>
                            {bookmarkedArticles.has(article.skill) && (
                              <Bookmark className="w-4 h-4 text-primary fill-current" />
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 mb-4">
                            {getArticlePreview(article.art)}
                          </p>
                          <div className="flex justify-between items-center">
                            <Button 
                              onClick={() => {
                                setSelectedArticle(article);
                                markAsRead(article.skill);
                              }}
                              variant="outline"
                              size="sm"
                            >
                              <BookOpen className="w-4 h-4 mr-2" />
                              Читать
                            </Button>
                            <Button
                              onClick={() => toggleBookmark(article.skill)}
                              variant="ghost"
                              size="sm"
                            >
                              <Bookmark className={`w-4 h-4 ${bookmarkedArticles.has(article.skill) ? 'fill-current text-primary' : ''}`} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Все темы</h2>
                  <div className="space-y-8">
                    {Object.entries(topicMapping).map(([topicId, topicName]) => {
                      const id = parseInt(topicId);
                      const topicArticles = groupedArticles[id] || [];
                      
                      if (topicArticles.length === 0) return null;
                      
                      return (
                        <div key={id}>
                          <h3 className="text-xl font-semibold mb-4 text-primary">
                            {topicName}
                          </h3>
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {topicArticles.slice(0, 6).map((article) => (
                              <Card key={article.skill} className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                  <CardTitle className="text-base flex items-center justify-between">
                                    <span>{getSkillName(article.skill)}</span>
                                    {bookmarkedArticles.has(article.skill) && (
                                      <Bookmark className="w-4 h-4 text-primary fill-current" />
                                    )}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-gray-600 text-sm mb-4">
                                    {getArticlePreview(article.art)}
                                  </p>
                                  <div className="flex justify-between items-center">
                                    <Button 
                                      onClick={() => {
                                        setSelectedArticle(article);
                                        markAsRead(article.skill);
                                      }}
                                      variant="outline"
                                      size="sm"
                                    >
                                      <BookOpen className="w-4 h-4 mr-2" />
                                      Читать
                                    </Button>
                                    <Button
                                      onClick={() => toggleBookmark(article.skill)}
                                      variant="ghost"
                                      size="sm"
                                    >
                                      <Bookmark className={`w-4 h-4 ${bookmarkedArticles.has(article.skill) ? 'fill-current text-primary' : ''}`} />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                          {topicArticles.length > 6 && (
                            <Button variant="ghost" className="mt-4">
                              Показать еще ({topicArticles.length - 6})
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DigitalTextbook;
