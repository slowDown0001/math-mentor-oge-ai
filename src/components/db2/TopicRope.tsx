import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronUp, BookOpen, Video, HelpCircle, Brain } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTopicMap, getTopicIcon, TopicNode } from "@/lib/topicMap";
import { calculateTopicMastery, TopicMastery } from "@/lib/progress";
import { Link } from "react-router-dom";
import Icon from "lucide-react";

interface TopicRopeProps {
  overallProgress: number;
  studentProgress?: any;
}

const TopicRope = ({ overallProgress, studentProgress }: TopicRopeProps) => {
  const [showAllTopics, setShowAllTopics] = useState(false);
  const topics = getTopicMap();

  // Calculate mastery for each topic
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

  // Show focused view or all topics
  const visibleTopics = showAllTopics 
    ? topicMasteries 
    : topicMasteries.slice(0, 8); // Show first 8 topics

  const getMasteryColor = (mastery: number, status: string) => {
    if (status === 'mastered') return 'bg-green-500/20 text-green-700 border-green-300';
    if (status === 'in_progress') return 'bg-yellow-500/20 text-yellow-700 border-yellow-300';
    return 'bg-gray-500/20 text-gray-700 border-gray-300';
  };

  const getMasteryText = (mastery: number, status: string) => {
    if (status === 'mastered') return `Освоено ${mastery}%`;
    if (status === 'in_progress') return `В процессе ${mastery}%`;
    return 'Не начато';
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'calculator': require('lucide-react').Calculator,
      'function-square': require('lucide-react').FunctionSquare,
      'sigma': require('lucide-react').Sigma,
      'trending-up': require('lucide-react').TrendingUp,
      'line-chart': require('lucide-react').LineChart,
      'map-pin': require('lucide-react').MapPin,
      'shapes': require('lucide-react').Shapes,
      'pie-chart': require('lucide-react').PieChart,
      'circle': require('lucide-react').Circle
    };
    
    const IconComponent = iconMap[iconName] || iconMap['circle'];
    return IconComponent;
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
          <div className="space-y-4">
            <AnimatePresence>
              {visibleTopics.map((topic, index) => {
                const IconComponent = getIconComponent(getTopicIcon(topic.section));
                
                return (
                  <motion.div
                    key={topic.topic}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      topic.isNext 
                        ? 'border-primary bg-primary/5 shadow-md' 
                        : 'border-border bg-card hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Topic Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        topic.status === 'mastered' ? 'bg-green-100 text-green-600' :
                        topic.status === 'in_progress' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>

                      <div className="flex-1 space-y-2">
                        {/* Topic title */}
                        <div>
                          <h4 className="font-medium text-foreground">
                            {topic.topic} {topic.name}
                          </h4>
                          
                          {/* Mastery badge */}
                          <Badge variant="secondary" className={`mt-1 ${getMasteryColor(topic.mastery, topic.status)}`}>
                            {getMasteryText(topic.mastery, topic.status)}
                          </Badge>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2">
                          {topic.status === 'mastered' && (
                            <>
                              <Button size="sm" variant="outline" asChild>
                                <Link to={`/practice?topic=${topic.topic}`}>
                                  Повторить
                                </Link>
                              </Button>
                              <Button size="sm" variant="outline" asChild>
                                <Link to={`/mcq-practice?topics=${topic.topic}`}>
                                  Тренировка
                                </Link>
                              </Button>
                            </>
                          )}
                          
                          {topic.isNext && (
                            <Button size="sm" asChild className="bg-primary">
                              <Link to={`/textbook?topic=${topic.topic}`}>
                                Перейти к учебнику
                              </Link>
                            </Button>
                          )}
                        </div>

                        {/* Available materials */}
                        <div className="flex gap-1">
                          <div title="Теория">
                            <BookOpen className="w-4 h-4 text-green-500" />
                          </div>
                          <div title="Видео">
                            <Video className="w-4 h-4 text-blue-500" />
                          </div>
                          <div title="Тест">
                            <HelpCircle className="w-4 h-4 text-yellow-500" />
                          </div>
                          <div title="Задачи">
                            <Brain className="w-4 h-4 text-purple-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Show more/less button */}
            <div className="text-center pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowAllTopics(!showAllTopics)}
                className="text-primary"
              >
                {showAllTopics ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Скрыть
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Показать все темы
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TopicRope;