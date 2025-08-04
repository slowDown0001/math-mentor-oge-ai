import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Trophy, Flame, Star, Target, ChevronRight, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import { useStudentSkills } from '@/hooks/useStudentSkills';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import topicMappingData from '../../documentation/topic_skill_mapping_with_names.json';
import skillsData from '../../documentation/math_skills_full.json';

// Metatopic configuration with icons and colors
const METATOPICS = [
  { id: "1", name: "Числа и вычисления", icon: "🧮", color: "hsl(220, 70%, 50%)" },
  { id: "2", name: "Алгебраические выражения", icon: "📐", color: "hsl(280, 70%, 50%)" },
  { id: "3", name: "Уравнения и неравенства", icon: "⚖️", color: "hsl(340, 70%, 50%)" },
  { id: "4", name: "Числовые последовательности", icon: "🔢", color: "hsl(20, 70%, 50%)" },
  { id: "5", name: "Функции", icon: "📈", color: "hsl(120, 70%, 50%)" },
  { id: "6", name: "Координаты на прямой и плоскости", icon: "📊", color: "hsl(180, 70%, 50%)" },
  { id: "7", name: "Геометрия", icon: "🔺", color: "hsl(40, 70%, 50%)" },
  { id: "8", name: "Вероятность и статистика", icon: "🎲", color: "hsl(260, 70%, 50%)" },
];

const StatisticsVisual = () => {
  const { topicProgress, generalPreparedness, isLoading } = useStudentSkills();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [skillDetails, setSkillDetails] = useState<any[]>([]);
  const [studentSkillData, setStudentSkillData] = useState<any>({});
  const { user } = useAuth();

  // Fetch actual skill data from Supabase
  useEffect(() => {
    const fetchStudentSkills = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('student_skills')
          .select('*')
          .eq('uid', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching student skills:', error);
          return;
        }
        
        setStudentSkillData(data || {});
      } catch (err) {
        console.error('Error:', err);
      }
    };

    fetchStudentSkills();
  }, [user]);

  // Group topics by metatopic and calculate real progress
  const getMetatopicProgress = () => {
    return METATOPICS.map(metatopic => {
      // Get all topics that belong to this metatopic (e.g., 1.1, 1.2, 1.3 for metatopic "1")
      const relevantTopics = topicMappingData.filter(topic => 
        topic.topic.startsWith(metatopic.id + ".")
      );
      
      // Get all skills for this metatopic
      const allSkills: number[] = [];
      relevantTopics.forEach(topic => {
        topic.skills.forEach(skillId => {
          const skillKey = `skill_${skillId}`;
          const skillValue = studentSkillData[skillKey] || 0;
          allSkills.push(skillValue);
        });
      });
      
      // Calculate average progress
      const avgScore = allSkills.length > 0 
        ? Math.round(allSkills.reduce((sum, skill) => sum + skill, 0) / allSkills.length)
        : 0;
      
      return {
        ...metatopic,
        progress: avgScore,
        topicCount: relevantTopics.length,
        skillCount: allSkills.length
      };
    });
  };

  // Get all topics grouped by metatopic with real progress
  const getTopicsByMetatopic = () => {
    const grouped: { [key: string]: any[] } = {};
    
    topicMappingData.forEach(topicData => {
      const metatopicId = topicData.topic.split('.')[0];
      if (!grouped[metatopicId]) grouped[metatopicId] = [];
      
      // Calculate real progress for this topic
      const topicSkills = topicData.skills.map(skillId => {
        const skillKey = `skill_${skillId}`;
        return studentSkillData[skillKey] || 0;
      });
      
      const topicProgress = topicSkills.length > 0
        ? Math.round(topicSkills.reduce((sum, skill) => sum + skill, 0) / topicSkills.length)
        : 0;
      
      grouped[metatopicId].push({
        ...topicData,
        progress: topicProgress,
        skillCount: topicSkills.length
      });
    });
    
    return grouped;
  };

  // Get skills for selected topic with real progress
  const getTopicSkills = (topicId: string) => {
    const topic = topicMappingData.find(t => t.topic === topicId);
    if (!topic) return [];

    return topic.skills.map(skillId => {
      const skillInfo = skillsData.find(s => s.id === skillId);
      const skillKey = `skill_${skillId}`;
      const skillProgress = studentSkillData[skillKey] || 0;
      
      return {
        id: skillId,
        name: skillInfo?.skill || `Навык ${skillId}`,
        progress: skillProgress,
      };
    });
  };

  const metatopicData = getMetatopicProgress();
  const topicsByMetatopic = getTopicsByMetatopic();
  const totalSkills = 181;
  const masteredSkills = Math.round(totalSkills * (generalPreparedness / 100));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загружаем вашу статистику...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-8 space-y-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Ваш прогресс в математике
          </h1>
          <p className="text-xl text-muted-foreground">
            Отслеживайте свои достижения в изучении математики
          </p>
        </motion.div>

        {/* Personal Stats Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center space-y-2">
                  <div className="text-2xl">🌟</div>
                  <div className="text-2xl font-bold">{masteredSkills}/{totalSkills}</div>
                  <div className="text-sm text-muted-foreground">Освоено навыков</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl">🎯</div>
                  <div className="text-2xl font-bold">{generalPreparedness}%</div>
                  <div className="text-sm text-muted-foreground">Общая подготовка</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl">🔥</div>
                  <div className="text-2xl font-bold">7</div>
                  <div className="text-sm text-muted-foreground">Дней подряд</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl">🏆</div>
                  <div className="text-2xl font-bold">Мастер</div>
                  <div className="text-sm text-muted-foreground">Ваш ранг</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Radial Progress Wheel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Прогресс по разделам
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metatopicData.map((metatopic, index) => (
                  <motion.div
                    key={metatopic.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="text-center space-y-3 p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedTopic(metatopic.id)}
                  >
                    <div className="text-4xl">{metatopic.icon}</div>
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm">{metatopic.name}</h3>
                      <div className="relative w-16 h-16 mx-auto">
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="hsl(var(--muted))"
                            strokeWidth="2"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke={metatopic.color}
                            strokeWidth="2"
                            strokeDasharray={`${metatopic.progress}, 100`}
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold">{metatopic.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Topics Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Детальный прогресс по темам
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {METATOPICS.map((metatopic, index) => (
                  <div key={metatopic.id} className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <span className="text-xl">{metatopic.icon}</span>
                      {metatopic.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {topicsByMetatopic[metatopic.id]?.map((topic: any, topicIndex: number) => (
                        <motion.div
                          key={topic.topic}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 + topicIndex * 0.05 }}
                          className="group cursor-pointer"
                          onClick={() => {
                            setSelectedTopic(topic.topic);
                            setSkillDetails(getTopicSkills(topic.topic));
                          }}
                        >
                          <Card className="hover:shadow-md transition-all duration-200 group-hover:scale-105">
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm">{topic.name}</h4>
                                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Прогресс</span>
                                  <span className="font-medium">{topic.progress}%</span>
                                </div>
                                <Progress value={topic.progress} className="h-2" />
                              </div>
                              {topic.progress >= 80 && (
                                <Badge variant="secondary" className="text-xs">
                                  🏆 Почти готово!
                                </Badge>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Share Progress */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Button className="gap-2" size="lg">
            <Share2 className="h-4 w-4" />
            Поделиться прогрессом
          </Button>
        </motion.div>
      </div>

      {/* Skills Detail Modal */}
      <AnimatePresence>
        {selectedTopic && skillDetails.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTopic(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Детали навыков</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTopic(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {skillDetails.map((skill, index) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{skill.progress}%</span>
                        {skill.progress >= 90 && <span className="text-lg">🥇</span>}
                        {skill.progress >= 70 && skill.progress < 90 && <span className="text-lg">⭐</span>}
                      </div>
                    </div>
                    <Progress value={skill.progress} className="h-2" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StatisticsVisual;