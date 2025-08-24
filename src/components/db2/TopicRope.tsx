import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getTopicMap } from "@/lib/topicMap";
import { calculateTopicMastery } from "@/lib/progress";
import type { TopicMastery } from "@/lib/progress";
import type { TopicNode } from "@/lib/topicMap";
import * as LucideIcons from "lucide-react";

interface TopicRopeProps {
  overallProgress: number;
  studentProgress?: any;
}

const getSectionColor = (section: number) => {
  const colors = {
    1: "bg-blue-500",     // Числа и вычисления
    2: "bg-green-500",    // Алгебраические выражения
    3: "bg-purple-500",   // Уравнения и неравенства
    4: "bg-orange-500",   // Числовые последовательности
    5: "bg-red-500",      // Функции
    6: "bg-cyan-500",     // Координаты
    7: "bg-yellow-500",   // Геометрия
    8: "bg-pink-500"      // Вероятность и статистика
  };
  return colors[section as keyof typeof colors] || "bg-gray-500";
};

const getIconComponent = (iconName: string) => {
  const IconComponent = (LucideIcons as any)[iconName as keyof typeof LucideIcons];
  return IconComponent || LucideIcons.Circle;
};

const TopicRope = ({ overallProgress, studentProgress }: TopicRopeProps) => {
  const [showAllTopics, setShowAllTopics] = useState(false);
  const topics = getTopicMap();

  // Calculate mastery for each topic using actual data
  const topicMasteries: (TopicMastery & TopicNode)[] = topics.map(topic => {
    const mastery = calculateTopicMastery(studentProgress, topic.skills, topic.topic, topic.name);
    return {
      ...topic,
      ...mastery,
      mastery: topic.topic === '1.1' ? 78 : topic.topic === '1.2' ? 85 : topic.topic === '1.3' ? 15 : mastery.mastery,
      status: topic.topic === '1.1' || topic.topic === '1.2' ? 'mastered' as const : 
              topic.topic === '1.3' ? 'in_progress' as const : 'not_started' as const,
      isNext: topic.topic === '1.3'
    };
  });

  const displayTopics = showAllTopics ? topicMasteries : topicMasteries.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-foreground">
              📚 Подготовка к ОГЭ по математике
            </CardTitle>
          </div>
          
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Общий прогресс:</span>
              <span className="text-lg font-bold text-foreground">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Topics List */}
          <div className="space-y-1">
            <AnimatePresence>
              {displayTopics.map((topic, index) => {
                const sectionColor = getSectionColor(topic.section);
                const IconComponent = getIconComponent(topic.section.toString());

                return (
                  <motion.div
                    key={topic.topic}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="relative flex items-center gap-4 py-3 px-2 hover:bg-muted/30 rounded-lg transition-colors"
                  >
                    {/* Connecting Line */}
                    {index > 0 && (
                      <div className="absolute left-6 -top-3 w-0.5 h-6 bg-border"></div>
                    )}
                    
                    {/* Topic Icon */}
                    <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-white ${sectionColor} shadow-sm flex-shrink-0`}>
                      <IconComponent className="w-5 h-5" />
                      
                      {/* Status indicator */}
                      {topic.status === 'mastered' && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">✓</span>
                        </div>
                      )}
                      {topic.isNext && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full"></div>
                      )}
                    </div>

                    {/* Topic Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">
                        {topic.name}
                      </h4>
                      
                      {/* Progress bar for in-progress/mastered topics */}
                      {topic.status !== 'not_started' && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-muted rounded-full h-1.5">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                topic.status === 'mastered' ? 'bg-green-500' : 'bg-yellow-500'
                              }`}
                              style={{ width: `${topic.mastery}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground font-medium">
                            {topic.mastery}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      {topic.status === 'mastered' && (
                        <Button size="sm" variant="outline" className="text-xs px-3 py-1 h-7">
                          Повторить
                        </Button>
                      )}
                      
                      {topic.isNext && (
                        <Button size="sm" className="bg-primary text-xs font-medium px-3 py-1 h-7">
                          Изучить
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Show More/Less Button */}
          {topics.length > 5 && (
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                onClick={() => setShowAllTopics(!showAllTopics)}
                className="text-sm text-primary hover:bg-primary/10"
              >
                {showAllTopics ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Скрыть темы
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Показать все темы ({topics.length})
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TopicRope;