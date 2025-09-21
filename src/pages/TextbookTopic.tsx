import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '../components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen } from 'lucide-react';
import newSyllabusData from '../data/newSyllabusStructure.json';

interface Skill {
  number: number;
  name: string;
  importance: number;
}

interface Topic {
  name: string;
  skills: Skill[];
}

interface Module {
  [topicKey: string]: Topic;
}

interface SyllabusStructure {
  [moduleName: string]: Module;
}

interface Article {
  ID: number;
  article_text: string;
  img1?: string;
  img2?: string;
  img3?: string;
  img4?: string;
  img5?: string;
  img6?: string;
  img7?: string;
}

const TextbookTopic = () => {
  const { topicCode } = useParams<{ topicCode: string }>();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [topicTitle, setTopicTitle] = useState<string>('');
  const [articles, setArticles] = useState<{ [skillId: number]: Article }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const findTopicByCode = () => {
      const syllabusData = newSyllabusData as SyllabusStructure;
      
      for (const [moduleName, module] of Object.entries(syllabusData)) {
        for (const [topicKey, topicData] of Object.entries(module)) {
          if (topicKey === topicCode) {
            setTopic(topicData);
            setTopicTitle(`${topicKey} ${topicData.name}`);
            return topicData;
          }
        }
      }
      return null;
    };

    const foundTopic = findTopicByCode();
    if (foundTopic) {
      loadArticlesForTopic(foundTopic.skills);
    } else {
      setLoading(false);
    }
  }, [topicCode]);

  const loadArticlesForTopic = async (skills: Skill[]) => {
    try {
      const articlePromises = skills.map(async (skill) => {
        const { data, error } = await supabase
          .from('articles_oge_full')
          .select('*')
          .eq('ID', skill.number)
          .single();

        if (error) {
          console.error(`Error fetching article for skill ${skill.number}:`, error);
          return null;
        }

        return { skillId: skill.number, article: data };
      });

      const results = await Promise.all(articlePromises);
      const articlesMap: { [skillId: number]: Article } = {};

      results.forEach(result => {
        if (result && result.article) {
          articlesMap[result.skillId] = result.article;
        }
      });

      setArticles(articlesMap);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillClick = (skillNumber: number) => {
    navigate(`/textbook?skill=${skillNumber}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка статей...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Тема не найдена</h1>
            <Button onClick={() => navigate('/textbook')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Вернуться к учебнику
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/textbook')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Вернуться к учебнику
          </Button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{topicTitle}</h1>
          <p className="text-xl text-gray-600 mb-6">
            Все статьи по теме - выберите навык для изучения
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid gap-6">
          {topic.skills.map((skill) => {
            const hasArticle = articles[skill.number];
            
            return (
              <Card 
                key={skill.number} 
                className={`transition-all duration-200 ${
                  hasArticle 
                    ? 'hover:shadow-lg cursor-pointer hover:bg-primary/5' 
                    : 'opacity-60'
                }`}
                onClick={() => hasArticle && handleSkillClick(skill.number)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={`
                      p-2 rounded-full
                      ${hasArticle ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}
                    `}>
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-lg font-semibold">
                        {skill.number}. {skill.name}
                      </span>
                      {!hasArticle && (
                        <span className="block text-sm font-normal text-gray-500 mt-1">
                          Статья скоро появится
                        </span>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                
                {hasArticle && (
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600 text-sm">
                        Статья доступна для изучения
                      </p>
                      <Button variant="outline" size="sm">
                        Читать статью
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-8 bg-white/80 rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-4">Сводка по теме</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{topic.skills.length}</div>
              <div className="text-sm text-gray-600">Всего навыков</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(articles).length}
              </div>
              <div className="text-sm text-gray-600">Доступных статей</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((Object.keys(articles).length / topic.skills.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Готовность темы</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {topic.skills.reduce((sum, skill) => sum + skill.importance, 0)}
              </div>
              <div className="text-sm text-gray-600">Общая важность</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextbookTopic;