import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Target, Edit, Save, X } from 'lucide-react';

interface CourseGoal {
  courseId: number;
  courseName: string;
  goal: string;
  goalField: string;
}

const COURSE_MAPPING = {
  1: 'ОГЭ Математика',
  2: 'ЕГЭ Математика (Базовый)',
  3: 'ЕГЭ Математика (Профильный)'
};

export const GoalsTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courseGoals, setCourseGoals] = useState<CourseGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    if (user) {
      fetchCourseGoals();
    }
  }, [user]);

  const fetchCourseGoals = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('courses, course_1_goal, course_2_goal, course_3_goal')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (profile?.courses) {
        const goals = profile.courses.map((courseId: number) => {
          const goalValue = profile[`course_${courseId}_goal` as keyof typeof profile];
          return {
            courseId,
            courseName: COURSE_MAPPING[courseId as keyof typeof COURSE_MAPPING],
            goal: typeof goalValue === 'string' ? goalValue : '',
            goalField: `course_${courseId}_goal`
          };
        });
        
        setCourseGoals(goals);
      }
    } catch (error) {
      console.error('Error fetching course goals:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить цели курсов",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditGoal = (courseId: number, currentGoal: string) => {
    setEditingGoal(courseId);
    setEditValue(currentGoal);
  };

  const handleSaveGoal = async (courseId: number, goalField: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [goalField]: editValue })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating goal:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось сохранить цель",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setCourseGoals(goals => 
        goals.map(goal => 
          goal.courseId === courseId 
            ? { ...goal, goal: editValue }
            : goal
        )
      );

      setEditingGoal(null);
      setEditValue('');
      
      toast({
        title: "Цель сохранена",
        description: "Ваша цель успешно обновлена",
      });
    } catch (error) {
      console.error('Error saving goal:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить цель",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingGoal(null);
    setEditValue('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (courseGoals.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>У вас нет подключенных курсов</p>
            <p className="text-sm">Подключите курсы, чтобы установить цели</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Ваши цели по курсам</h3>
      </div>
      
      {courseGoals.map((courseGoal) => (
        <Card key={courseGoal.courseId}>
          <CardHeader>
            <CardTitle className="text-base">{courseGoal.courseName}</CardTitle>
          </CardHeader>
          <CardContent>
            {editingGoal === courseGoal.courseId ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor={`goal-${courseGoal.courseId}`}>Цель по курсу</Label>
                  <Input
                    id={`goal-${courseGoal.courseId}`}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Опишите вашу цель по этому курсу..."
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSaveGoal(courseGoal.courseId, courseGoal.goalField)}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {courseGoal.goal ? (
                    <p className="text-muted-foreground">{courseGoal.goal}</p>
                  ) : (
                    <p className="text-muted-foreground italic">Цель не установлена</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditGoal(courseGoal.courseId, courseGoal.goal)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Изменить
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};