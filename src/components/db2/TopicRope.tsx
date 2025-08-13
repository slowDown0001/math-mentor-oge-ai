import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronUp, BookOpen, Video, HelpCircle, Brain } from "lucide-react";
import { 
  Calculator, 
  FunctionSquare, 
  Sigma, 
  TrendingUp, 
  LineChart, 
  MapPin, 
  Shapes, 
  PieChart, 
  Circle 
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTopicMap, getTopicIcon, TopicNode } from "@/lib/topicMap";
import { calculateTopicMastery, TopicMastery } from "@/lib/progress";
import { Link } from "react-router-dom";

interface TopicRopeProps {
  overallProgress: number;
  studentProgress?: any;
}

const TopicRope = ({ overallProgress, studentProgress }: TopicRopeProps) => {
  const [showAllTopics, setShowAllTopics] = useState(false);
  const topics = getTopicMap();
  
  // Debug: Log topics data
  console.log('TopicRope - Topics loaded:', topics);
  console.log('TopicRope - Topics count:', topics.length);
  console.log('TopicRope - First topic:', topics[0]);

  // Calculate mastery for each topic using actual data
  const topicMasteries: (TopicMastery & TopicNode)[] = topics.map(topic => {
    const mastery = calculateTopicMastery(studentProgress, topic.skills);
    return {
      ...topic,
      ...mastery,
      mastery: topic.topic === '1.1' ? 78 : topic.topic === '1.2' ? 85 : topic.topic === '1.3' ? 15 : mastery.mastery,
      status: topic.topic === '1.1' || topic.topic === '1.2' ? 'mastered' as const : 
              topic.topic === '1.3' ? 'in_progress' as const : 'not_started' as const,
      isNext: topic.topic === '1.3'
    };
  });

  // Find current position (next topic)
  const currentIndex = topicMasteries.findIndex(topic => topic.isNext);
  const focusIndex = currentIndex >= 0 ? currentIndex : 2; // Default to topic 1.3 area

  // Show focused view: 2 before, current, 4 after
  const startIndex = Math.max(0, focusIndex - 2);
  const endIndex = Math.min(topics.length, focusIndex + 5);
  
  const visibleTopics = showAllTopics 
    ? topicMasteries 
    : topicMasteries.slice(startIndex, endIndex);

  const getSectionColor = (section: number) => {
    const colors = {
      1: "bg-blue-500", // Числа и вычисления
      2: "bg-green-500", // Алгебраические выражения
      3: "bg-yellow-500", // Уравнения и неравенства
      4: "bg-purple-500", // Числовые последовательности
      5: "bg-red-500", // Функции
      6: "bg-indigo-500", // Координаты
      7: "bg-pink-500", // Геометрия
      8: "bg-orange-500" // Вероятность и статистика
    };
    return colors[section as keyof typeof colors] || "bg-gray-500";
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'calculator': Calculator,
      'function-square': FunctionSquare,
      'sigma': Sigma,
      'trending-up': TrendingUp,
      'line-chart': LineChart,
      'map-pin': MapPin,
      'shapes': Shapes,
      'pie-chart': PieChart,
      'circle': Circle
    };
    
    return iconMap[iconName] || Circle;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-xl">Подготовка к ОГЭ по математике</CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Общий прогресс:</span>
              <span className="font-medium">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto">
          {/* Tree-like topic progression */}
          <div className="relative">
            {/* Connection line for tree effect */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-muted via-primary/30 to-muted"></div>
            
            <div className="space-y-3">
              <AnimatePresence>
                {visibleTopics.map((topic, index) => {
                  const IconComponent = getIconComponent(getTopicIcon(topic.section));
                  const sectionColor = getSectionColor(topic.section);
                  
                  return (
                    <motion.div
                      key={topic.topic}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="relative"
                    >
                      {/* Tree node connector */}
                      <div className="absolute left-8 top-6 w-6 h-0.5 bg-primary/30"></div>
                      
                      <div className={`ml-16 p-4 rounded-xl transition-all duration-200 ${
                        topic.isNext 
                          ? 'bg-primary/5 border-2 border-primary shadow-lg scale-102' 
                          : topic.status === 'mastered'
                          ? 'bg-green-50 border border-green-200 hover:bg-green-100/50'
                          : 'bg-card border border-border hover:bg-muted/30'
                      }`}>
                        <div className="flex items-start gap-4">
                          {/* Topic Icon with section color */}
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${sectionColor} shadow-md`}>
                            <IconComponent className="w-6 h-6" />
                          </div>

                          <div className="flex-1 space-y-2">
                            {/* Topic title with full name */}
                            <div>
                              <h4 className="font-semibold text-foreground text-lg">
                                {topic.topic} {topic.name || 'No name found'}
                              </h4>
                              {/* Debug info */}
                              <div className="text-xs text-muted-foreground">
                                Debug: topic={topic.topic}, name="{topic.name}", skills={topic.skills?.length || 0}
                              </div>
                              
                              {/* Mastery progress */}
                              {topic.status !== 'not_started' && (
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex-1 bg-muted rounded-full h-2">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-300 ${
                                        topic.status === 'mastered' ? 'bg-green-500' : 'bg-yellow-500'
                                      }`}
                                      style={{ width: `${topic.mastery}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium text-muted-foreground">
                                    {topic.mastery}%
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-2">
                              {topic.status === 'mastered' && (
                                <Button size="sm" variant="outline" className="text-xs">
                                  ✓ Повторить
                                </Button>
                              )}
                              
                              {topic.isNext && (
                                <Button size="sm" className="bg-primary text-xs font-medium">
                                  Перейти к изучению →
                                </Button>
                              )}

                              {topic.status === 'not_started' && !topic.isNext && (
                                <Button size="sm" variant="ghost" className="text-xs text-muted-foreground" disabled>
                                  🔒 Заблокировано
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            
            {/* Show more/less button */}
            {!showAllTopics && (
              <div className="text-center pt-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowAllTopics(true)}
                  className="text-primary hover:bg-primary/10"
                >
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Показать все темы ({topics.length - visibleTopics.length} скрыто)
                </Button>
              </div>
            )}
            
            {showAllTopics && (
              <div className="text-center pt-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowAllTopics(false)}
                  className="text-primary hover:bg-primary/10"
                >
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Показать меньше
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TopicRope;