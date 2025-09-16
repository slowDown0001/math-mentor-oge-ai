import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, RotateCcw, Circle, CheckCircle, Loader2 } from 'lucide-react';
import { Course, Topic } from '@/lib/courses.registry';

interface CourseCardProps {
  course: Course;
  progress: number;
  onStart: (courseId: string) => void;
  onReview?: (courseId: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  progress, 
  onStart, 
  onReview 
}) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [topicsError, setTopicsError] = useState<string | null>(null);

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
      
      // Normalize the data - assuming it could be an array of topics or an object
      let topicsArray: Topic[] = [];
      if (Array.isArray(data)) {
        topicsArray = data.map(item => ({
          name: item.name || item.title || String(item),
          number: item.number,
          importance: item.importance
        }));
      } else if (data && typeof data === 'object') {
        // If it's an object, try to extract topics from common keys
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
      
      setTopics(topicsArray);
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
    <Card className="rounded-2xl shadow-sm h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{course.title}</CardTitle>
          <Badge variant="secondary" className="text-xs px-2 py-1">
            {course.tag}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Общий прогресс</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="topics" className="border-none">
            <AccordionTrigger className="py-2 text-sm font-medium">
              Темы
            </AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-80 pr-4">
                {isLoadingTopics ? (
                  <div className="space-y-2">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="w-3 h-3 rounded-full" />
                        <Skeleton className="h-4 flex-1" />
                      </div>
                    ))}
                  </div>
                ) : topicsError ? (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-sm text-muted-foreground">{topicsError}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={retryFetchTopics}
                      className="text-xs"
                    >
                      Повторить попытку
                    </Button>
                  </div>
                ) : topics.length > 0 ? (
                  <div className="space-y-2">
                    {topics.map((topic, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Circle className="w-3 h-3 text-muted-foreground" />
                        <span className="text-foreground">{topic.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">Темы не найдены</p>
                  </div>
                )}
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <div className="flex gap-2 mt-auto">
          <Button 
            onClick={() => onStart(course.id)}
            className="flex-1"
            size="sm"
          >
            <Play className="w-4 h-4 mr-2" />
            Изучать
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onReview?.(course.id)}
            className="flex-1"
            size="sm"
            disabled={!onReview}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Повторить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};