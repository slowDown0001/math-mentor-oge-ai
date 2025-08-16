import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Play, FileText, PenTool, HelpCircle, CheckCircle, ArrowLeft, Trophy, Menu } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import MathRenderer from "@/components/MathRenderer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { awardEnergyPoints } from "@/services/energyPoints";
import { trackStreakActivity } from "@/services/streakService";
import confetti from "canvas-confetti";
import newSyllabusData from "@/data/new_syllabus_hierarchy_topics_skills.json";

// Import the new syllabus structure
const syllabusData = newSyllabusData;

// Types based on new syllabus structure
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

interface TopicArticle {
  topic_id: string;
  topic_text: string;
}

interface SkillArticle {
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

const Textbook3 = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [currentView, setCurrentView] = useState<'units' | 'topics' | 'topic-detail'>('units');
  const [topicArticles, setTopicArticles] = useState<TopicArticle[]>([]);
  const [skillArticles, setSkillArticles] = useState<SkillArticle[]>([]);
  const [readArticles, setReadArticles] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [expandedSkills, setExpandedSkills] = useState(false);

  // Fetch topic articles from Supabase (placeholder - would need real table)
  const fetchTopicArticles = async () => {
    try {
      // Placeholder - topic_articles table doesn't exist yet
      setTopicArticles([]);
    } catch (error) {
      console.error('Error fetching topic articles:', error);
    }
  };

  // Fetch skill articles from Supabase
  const fetchSkillArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles2')
        .select('*');
      
      if (error) throw error;
      // Convert to expected format
      const convertedData = data?.map(item => ({
        ID: item.skill,
        article_text: item.art,
        img1: item.img1,
        img2: item.img2,
        img3: item.img3,
        img4: item.img4,
        img5: item.img5,
        img6: item.img6,
        img7: item.img7
      })) || [];
      setSkillArticles(convertedData);
    } catch (error) {
      console.error('Error fetching skill articles:', error);
    }
  };

  // Fetch read articles for current user
  const fetchReadArticles = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('read_articles')
        .select('skill_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const readSkillIds = new Set(data?.map(item => item.skill_id) || []);
      setReadArticles(readSkillIds);
    } catch (error) {
      console.error('Error fetching read articles:', error);
    }
  };

  useEffect(() => {
    fetchTopicArticles();
    fetchSkillArticles();
    fetchReadArticles();
  }, [user]);

  // Mark article as read
  const handleMarkAsRead = async (skillId: number) => {
    if (!user) return;

    setLoading(true);
    try {
      // Save to database
      const { error } = await supabase
        .from('read_articles')
        .insert({
          user_id: user.id,
          skill_id: skillId,
          date_read: new Date().toISOString(),
        });

      if (error) throw error;

      // Update local state
      setReadArticles(prev => new Set([...prev, skillId]));

      // Award energy points
      await awardEnergyPoints(user.id, 'article');

      // Track streak activity
      await trackStreakActivity(user.id, 'article', 10);

      // Show success feedback
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast({
        title: "Отлично!",
        description: "Статья отмечена как прочитанная. +50 баллов энергии!",
      });

    } catch (error) {
      console.error('Error marking article as read:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отметить статью как прочитанную",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate progress for topic
  const getTopicProgress = (topic: Topic): number => {
    const totalSkills = topic.Skills.length;
    const readSkillsCount = topic.Skills.filter(skill => readArticles.has(skill.id)).length;
    return totalSkills > 0 ? Math.round((readSkillsCount / totalSkills) * 100) : 0;
  };

  // Calculate progress for unit
  const getUnitProgress = (unit: Unit): number => {
    const allSkills = unit.Topics.flatMap(topic => topic.Skills);
    const totalSkills = allSkills.length;
    const readSkillsCount = allSkills.filter(skill => readArticles.has(skill.id)).length;
    return totalSkills > 0 ? Math.round((readSkillsCount / totalSkills) * 100) : 0;
  };

  // Get current topic article
  const getCurrentTopicArticle = (): TopicArticle | null => {
    if (!selectedTopic) return null;
    return topicArticles.find(article => article.topic_id === selectedTopic.code) || null;
  };

  // Handle quiz for topic
  const handleTopicQuiz = (topic: Topic) => {
    const skillIds = topic.Skills.map(skill => skill.id);
    navigate(`/mcq-practice?skills=${skillIds.join(',')}&count=5`);
  };

  // Handle practice for skill
  const handleSkillPractice = (skillId: number) => {
    navigate(`/mcq-practice?skills=${skillId}&count=10`);
  };

  // Handle video placeholder
  const handleVideoClick = (videoNumber: number) => {
    toast({
      title: `Видео ${videoNumber}`,
      description: "Видео в разработке, скоро появится!",
    });
  };

  // Render units view
  const renderUnitsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {syllabusData.units.map((unit: Unit) => {
        const progress = getUnitProgress(unit);
        return (
          <Card key={unit.code} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{unit.title}</CardTitle>
                {progress > 0 && <CheckCircle className="w-5 h-5 text-green-500" />}
              </div>
              <CardDescription>Модуль {unit.code}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  Прогресс: {progress}% ({unit.Topics.length} тем)
                </p>
                <Button 
                  onClick={() => {
                    setSelectedUnit(unit);
                    setCurrentView('topics');
                  }}
                  className="w-full"
                >
                  Изучать
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  // Render topics view
  const renderTopicsView = () => {
    if (!selectedUnit) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentView('units')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад к модулям
          </Button>
          <h1 className="text-2xl font-bold">{selectedUnit.title}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedUnit.Topics.map((topic: Topic) => {
            const progress = getTopicProgress(topic);
            return (
              <Card key={topic.code} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{topic.title}</CardTitle>
                    {progress === 100 && <CheckCircle className="w-5 h-5 text-green-500" />}
                  </div>
                  <CardDescription>Тема {topic.code}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-muted-foreground">
                      Прогресс: {progress}% ({topic.Skills.length} навыков)
                    </p>
                    <Button 
                      onClick={() => {
                        setSelectedTopic(topic);
                        setCurrentView('topic-detail');
                      }}
                      className="w-full"
                    >
                      Открыть тему
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  // Render topic detail view
  const renderTopicDetailView = () => {
    if (!selectedTopic) return null;

    const topicArticle = getCurrentTopicArticle();
    const progress = getTopicProgress(selectedTopic);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentView('topics')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад к темам
          </Button>
          <h1 className="text-2xl font-bold">{selectedTopic.title}</h1>
          <Badge variant="outline">{selectedTopic.code}</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Topic Article */}
            {topicArticle && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Статья по теме
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <MathRenderer text={topicArticle.topic_text} />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline"
                      onClick={() => setExpandedSkills(!expandedSkills)}
                    >
                      Читать больше
                    </Button>
                    <Button onClick={() => handleTopicQuiz(selectedTopic)}>
                      Больше практики
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Expanded Skills Articles */}
            {expandedSkills && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Статьи по навыкам</h3>
                {selectedTopic.Skills.map((skill) => {
                  const skillArticle = skillArticles.find(article => article.ID === skill.id);
                  const isRead = readArticles.has(skill.id);
                  
                  return (
                    <Card key={skill.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="text-base">{skill.title}</span>
                          {isRead && <CheckCircle className="w-5 h-5 text-green-500" />}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {skillArticle && (
                          <div className="prose max-w-none mb-4">
                            <MathRenderer text={skillArticle.article_text} />
                          </div>
                        )}
                        <div className="flex gap-2">
                          {!isRead ? (
                            <Button 
                              onClick={() => handleMarkAsRead(skill.id)}
                              disabled={loading}
                              className="flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              {loading ? "Засчитываем..." : "Я прочитал это!"}
                            </Button>
                          ) : (
                            <Button variant="outline" disabled>
                              Прочитано ✓
                            </Button>
                          )}
                          <Button 
                            variant="outline"
                            onClick={() => handleSkillPractice(skill.id)}
                          >
                            Практика
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Прогресс
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Завершено</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedTopic.Skills.filter(skill => readArticles.has(skill.id)).length} из {selectedTopic.Skills.length} навыков изучено
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Videos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Видео
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[1, 2, 3].map((videoNum) => (
                  <Button 
                    key={videoNum}
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleVideoClick(videoNum)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Видео {videoNum}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Quiz */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Проверка знаний
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleTopicQuiz(selectedTopic)}
                  className="w-full"
                >
                  Викторина (5 вопросов)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <Sidebar className="w-64">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Модули</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {syllabusData.units.map((unit: Unit) => {
                    const progress = getUnitProgress(unit);
                    return (
                      <SidebarMenuItem key={unit.code}>
                        <SidebarMenuButton 
                          onClick={() => {
                            setSelectedUnit(unit);
                            setCurrentView('topics');
                          }}
                          className="flex items-center justify-between"
                        >
                          <span>{unit.title}</span>
                          {progress > 0 && (
                            <Badge variant="secondary" className="ml-2">
                              {progress}%
                            </Badge>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Header />
          
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-4 p-4 border-b">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">Интерактивный учебник (v3)</h1>
            </div>

            <ScrollArea className="flex-1 p-6">
              {currentView === 'units' && renderUnitsView()}
              {currentView === 'topics' && renderTopicsView()}
              {currentView === 'topic-detail' && renderTopicDetailView()}
            </ScrollArea>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Textbook3;