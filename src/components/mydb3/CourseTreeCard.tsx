import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, AlertCircle, RefreshCw, Calculator, Square, Triangle, Circle, Hexagon, Star, Zap, Target, BookOpen, Brain, Layers } from 'lucide-react';
import { Course, Topic } from '@/lib/courses.registry';

interface CourseTreeCardProps {
  course: Course;
  onStart: (courseId: string) => void;
}

// Icon mapping for different topics - using mathematical/educational icons
const getTopicIcon = (index: number, topicName: string) => {
  const icons = [
    Calculator, Square, Triangle, Circle, Hexagon, Star, 
    Zap, Target, BookOpen, Brain, Layers, Play
  ];
  
  // Choose icon based on topic content or just cycle through
  if (topicName.toLowerCase().includes('алгебра') || topicName.toLowerCase().includes('algebra')) return Calculator;
  if (topicName.toLowerCase().includes('геометр') || topicName.toLowerCase().includes('geometry')) return Triangle;
  if (topicName.toLowerCase().includes('функц') || topicName.toLowerCase().includes('function')) return Zap;
  if (topicName.toLowerCase().includes('число') || topicName.toLowerCase().includes('number')) return Circle;
  if (topicName.toLowerCase().includes('уравн') || topicName.toLowerCase().includes('equation')) return Target;
  
  // Default to cycling through icons
  return icons[index % icons.length];
};

// Color mapping for topic icons
const getTopicColor = (index: number) => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 
    'bg-pink-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-red-500',
    'bg-yellow-500', 'bg-teal-500', 'bg-violet-500', 'bg-emerald-500'
  ];
  return colors[index % colors.length];
};

export const CourseTreeCard: React.FC<CourseTreeCardProps> = ({ 
  course, 
  onStart 
}) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [topicsError, setTopicsError] = useState<string | null>(null);

  // Mock progress - should be calculated from real data
  const progress = Math.floor(Math.random() * 80) + 10; // 10-90%

  useEffect(() => {
    fetchTopics();
  }, [course.topicsUrl]);

  const fetchTopics = async () => {
    setIsLoadingTopics(true);
    setTopicsError(null);
    
    try {
      const response = await fetch(course.topicsUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch topics: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Normalize the data
      let topicsArray: Topic[] = [];
      if (Array.isArray(data)) {
        topicsArray = data.map(item => ({
          name: item.name || item.title || String(item),
          number: item.number,
          importance: item.importance
        }));
      } else if (data && typeof data === 'object') {
        const possibleKeys = ['topics', 'data', 'items'];
        for (const key of possibleKeys) {
          if (data[key] && Array.isArray(data[key])) {
            topicsArray = data[key].map((item: any) => ({
              name: item.name || item.title || String(item),
              number: item.number,
              importance: item.importance
            }));
            break;
          }
        }
      }
      
      // Take only first 8 topics for display
      setTopics(topicsArray.slice(0, 8));
    } catch (error) {
      console.error('Error fetching topics:', error);
      setTopicsError('Не удалось загрузить темы');
    } finally {
      setIsLoadingTopics(false);
    }
  };

  const retryFetchTopics = () => {
    fetchTopics();
  };

  return (
    <Card className="rounded-lg shadow-sm h-full flex flex-col bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{course.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                Всего ({topics.length})
              </span>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs px-2 py-1 bg-blue-100 text-blue-700">
            {course.tag}
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Общий прогресс</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Topics Tree */}
        <div className="flex-1">
          <ScrollArea className="h-80">
            {isLoadingTopics ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-1" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : topicsError ? (
              <div className="text-center py-8 space-y-3">
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">{topicsError}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={retryFetchTopics}
                  className="text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Повторить попытку
                </Button>
              </div>
            ) : topics.length > 0 ? (
              <div className="space-y-3 relative">
                {/* Vertical line connecting topics */}
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200"></div>
                
                {topics.map((topic, index) => {
                  const IconComponent = getTopicIcon(index, topic.name);
                  const colorClass = getTopicColor(index);
                  
                  return (
                    <div key={`${topic.name}-${index}`} className="flex items-center gap-4 relative z-10">
                      {/* Topic Icon */}
                      <div className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      
                      {/* Topic Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-blue-600 hover:underline cursor-pointer leading-tight">
                          {topic.name}
                        </h4>
                      </div>
                      
                      {/* Resume button for first topic */}
                      {index === 2 && (
                        <Button 
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 text-xs"
                          onClick={() => onStart(course.id)}
                        >
                          Resume
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Темы не найдены</p>
              </div>
            )}
          </ScrollArea>
        </div>
        
        {/* Action Button */}
        <Button 
          onClick={() => onStart(course.id)}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          <Play className="w-4 h-4 mr-2" />
          Начать изучение
        </Button>
      </CardContent>
    </Card>
  );
};