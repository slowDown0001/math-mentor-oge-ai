
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
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

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        Настройки дневных целей
      </h3>
      
      <p className="text-muted-foreground mb-6">
        Выберите, сколько времени в день вы хотите уделять изучению математики:
      </p>

      <div className="space-y-6 mb-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <Clock className="h-4 w-4" />
              Дневная цель
            </div>
            <div className="text-lg font-semibold text-primary">
              {selectedGoal} {selectedGoal === 1 ? 'минута' : selectedGoal < 5 ? 'минуты' : 'минут'}
            </div>
          </div>
          
          <Slider
            value={[selectedGoal]}
            onValueChange={(value) => setSelectedGoal(value[0])}
            max={90}
            min={1}
            step={1}
            className="w-full"
          />
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>1 мин</span>
            <span>90 мин</span>
          </div>
        </div>
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
