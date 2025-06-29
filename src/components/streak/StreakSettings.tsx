
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Target, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const StreakSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedGoal, setSelectedGoal] = useState(30);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCurrentGoal();
    }
  }, [user]);

  const fetchCurrentGoal = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_streaks')
        .select('daily_goal_minutes')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setSelectedGoal(data.daily_goal_minutes);
      }
    } catch (error) {
      console.error('Error fetching current goal:', error);
    }
  };

  const updateGoal = async (minutes: number) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_streaks')
        .upsert({
          user_id: user.id,
          daily_goal_minutes: minutes
        });

      if (error) throw error;

      setSelectedGoal(minutes);
      toast({
        title: "Цель обновлена!",
        description: `Ваша дневная цель установлена на ${minutes} минут.`,
      });
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить цель. Попробуйте еще раз.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goals = [
    { minutes: 5, label: '5 минут', description: 'Для начинающих' },
    { minutes: 30, label: '30 минут', description: 'Рекомендуемая цель' }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        Настройки дневных целей
      </h3>
      
      <p className="text-gray-600 mb-6">
        Выберите, сколько времени в день вы хотите уделять изучению математики:
      </p>

      <div className="space-y-3 mb-6">
        {goals.map((goal) => (
          <div
            key={goal.minutes}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              selectedGoal === goal.minutes
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedGoal(goal.minutes)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {goal.label}
                </div>
                <div className="text-sm text-gray-500">{goal.description}</div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ${
                selectedGoal === goal.minutes
                  ? 'border-primary bg-primary'
                  : 'border-gray-300'
              }`} />
            </div>
          </div>
        ))}
      </div>

      <Button 
        onClick={() => updateGoal(selectedGoal)}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Сохранение...' : 'Сохранить цель'}
      </Button>
    </Card>
  );
};
