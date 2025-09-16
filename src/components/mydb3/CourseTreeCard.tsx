import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Circle, AlertCircle, RefreshCw } from 'lucide-react';
import { Course, Topic } from '@/lib/courses.registry';

interface CourseTreeCardProps {
  course: Course;
  onStart: (courseId: string) => void;
}

export const CourseTreeCard: React.FC<CourseTreeCardProps> = ({ 
  course, 
  onStart 
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
    <Card className="rounded-lg shadow-sm h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{course.title}</CardTitle>
          <Badge variant="secondary" className="text-xs px-2 py-1">
            {course.tag}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Topics Tree */}
        <div className="flex-1">
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">Темы курса</h4>
          <ScrollArea className="h-64 border rounded-md p-3">
            {isLoadingTopics ? (
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-4 h-4 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
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
              <div className="space-y-2">
                {topics.map((topic, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm py-1">
                    <Circle className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground leading-relaxed">{topic.name}</span>
                  </div>
                ))}
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
          className="w-full"
          size="sm"
        >
          <Play className="w-4 h-4 mr-2" />
          Начать изучение
        </Button>
      </CardContent>
    </Card>
  );
};