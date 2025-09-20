import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ArrowRight, Zap, Check, ArrowLeft, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ArticleRenderer from "@/components/ArticleRenderer";
import NewTextbookReadButton from "@/components/NewTextbookReadButton";
import SkillPracticeQuiz from "@/components/SkillPracticeQuiz";

interface Skill {
  id: number;
  title: string;
}

interface Topic {
  code: string;
  title: string;
  Skills: Skill[];
}

interface Unit {
  code: string;
  title: string;
  Topics: Topic[];
}

interface Article {
  id: number;
  article_text: string;
  image_recommendations?: string;
  img1?: string;
  img2?: string;
  img3?: string;
  img4?: string;
  img5?: string;
  img6?: string;
  img7?: string;
}

interface NewTextbookArticleProps {
  units: Unit[];
  skill: Skill | null;
  topic: Topic | null;
  article: Article | null;
  loading: boolean;
  isRead: boolean;
  searchTerm: string;
  onMarkAsRead: (skillId: number) => void;
  onSkillSelect: (skill: Skill) => void;
  onTopicSelect: (topic: Topic) => void;
  onBackToSyllabus?: () => void;
}

const NewTextbookArticle = ({ 
  units,
  skill, 
  topic,
  article, 
  loading, 
  isRead,
  searchTerm,
  onMarkAsRead,
  onSkillSelect,
  onTopicSelect,
  onBackToSyllabus
}: NewTextbookArticleProps) => {
  const navigate = useNavigate();
  const [showPractice, setShowPractice] = useState(false);

  const handleGoToExercise = () => {
    if (skill) {
      navigate(`/mcq-practice?skill=${skill.id}`);
    }
  };


  const getImageUrls = (article: Article) => {
    const images: string[] = [];
    for (let i = 1; i <= 7; i++) {
      const imgKey = `img${i}` as keyof Article;
      const imgUrl = article[imgKey];
      if (imgUrl && typeof imgUrl === 'string') {
        images.push(imgUrl);
      }
    }
    return images;
  };

  const filterSkills = (skills: Skill[]) => {
    if (!searchTerm) return skills;
    return skills.filter(skill => 
      skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.id.toString().includes(searchTerm)
    );
  };

  // Show topic view when topic is selected
  if (topic) {
    const filteredSkills = filterSkills(topic.Skills || []);
    
    return (
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">{topic.code} {topic.title}</h1>
                <div className="flex items-center gap-2">
                  <span className="text-blue-100 text-sm">Навыков: {filteredSkills.length}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => onBackToSyllabus?.()}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  К программе
                </Button>
                <Zap className="w-5 h-5 text-yellow-300" />
                <span className="text-sm text-blue-100">Выберите навык</span>
              </div>
            </div>
          </div>

          {/* Skills Grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSkills.map((skill) => (
                <div
                  key={skill.id}
                  onClick={() => onSkillSelect(skill)}
                  className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 hover:border-blue-300 cursor-pointer transition-all duration-200 hover:shadow-lg group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 group-hover:text-blue-700 mb-2">
                        {skill.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Навык #{skill.id}
                        </Badge>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>

            {filteredSkills.length === 0 && searchTerm && (
              <div className="text-center py-8">
                <p className="text-gray-500">Навыки не найдены по запросу "{searchTerm}"</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show syllabus overview when nothing is selected
  if (!skill && !topic) {
    return (
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">Программа курса</h1>
                <p className="text-blue-100">Полная программа математики для подготовки к ОГЭ</p>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-yellow-300" />
              </div>
            </div>
          </div>

          {/* Syllabus Content */}
          <div className="p-8">
            <div className="space-y-6">
              {(units || []).map((unit) => (
                <div key={unit.code} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">{unit.title}</h2>
                    <p className="text-sm text-gray-600 mt-1">{unit.code}</p>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(unit.Topics || []).map((unitTopic) => {
                        const filteredSkills = filterSkills(unitTopic.Skills || []);
                        if (searchTerm && filteredSkills.length === 0) return null;
                        
                        return (
                          <div
                            key={unitTopic.code}
                            onClick={() => onTopicSelect(unitTopic)}
                            className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 hover:border-blue-300 cursor-pointer transition-all duration-200 hover:shadow-lg group"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 group-hover:text-blue-700 mb-2">
                                  {unitTopic.code} {unitTopic.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {searchTerm ? filteredSkills.length : (unitTopic.Skills || []).length} навыков
                                  </Badge>
                                </div>
                              </div>
                              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
              
              {searchTerm && (units || []).every(unit => 
                (unit.Topics || []).every(topic => filterSkills(topic.Skills || []).length === 0)
              ) && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Ничего не найдено по запросу "{searchTerm}"</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!article) {
    return (
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Материал в разработке
            </h2>
            <p className="text-gray-600 max-w-md">
              Статья для навыка "{skill.title}" еще не готова. 
              Попробуйте выбрать другой навык из программы курса.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const images = getImageUrls(article);

  // If showing practice quiz
  if (showPractice) {
    return (
      <SkillPracticeQuiz
        skill={skill}
        onBackToArticle={() => setShowPractice(false)}
      />
    );
  }

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">{skill.title}</h1>
              <div className="flex items-center gap-2">
                <span className="text-blue-100 text-sm">Навык #{skill.id}</span>
                {isRead && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Прочитано
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => onBackToSyllabus?.()}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                К программе
              </Button>
              <Zap className="w-5 h-5 text-yellow-300" />
              <span className="text-sm text-blue-100">Интерактивное обучение</span>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="p-8">
          <div className="textbook-preview prose max-w-none">
            <ArticleRenderer 
              text={article.article_text} 
              article={{
                skill: article.id,
                art: article.article_text,
                img1: article.img1,
                img2: article.img2,
                img3: article.img3,
                img4: article.img4,
                img5: article.img5,
                img6: article.img6,
                img7: article.img7
              }} 
            />
          </div>

          {/* Images Gallery */}
          {images.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Дополнительные материалы
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <img
                      src={imageUrl}
                      alt={`Материал ${index + 1} для ${skill.title}`}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button
              onClick={() => setShowPractice(true)}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              <Target className="w-5 h-5 mr-2" />
              Практиковать навык
            </Button>

            <NewTextbookReadButton
              skillId={skill.id}
              isRead={isRead}
              onMarkAsRead={onMarkAsRead}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewTextbookArticle;