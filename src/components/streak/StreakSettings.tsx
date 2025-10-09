
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Target, Clock, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { GOAL_BADGE_CATEGORIES, getBadgeForGoal, getPointsLabel } from '@/utils/streakBadges';

export const StreakSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedGoal, setSelectedGoal] = useState(60);
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

  const updateGoal = async (points: number) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Update user_streaks
      const { error: streakError } = await supabase
        .from('user_streaks')
        .upsert({
          user_id: user.id,
          daily_goal_minutes: points
        }, {
          onConflict: 'user_id'
        });

      if (streakError) throw streakError;

      // Update user_statistics to set weekly_goal_set_at
      const { error: statsError } = await supabase
        .from('user_statistics')
        .upsert({
          user_id: user.id,
          weekly_goal_set_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (statsError) throw statsError;

      setSelectedGoal(points);
      const badge = getBadgeForGoal(points);
      toast({
        title: "Цель обновлена!",
        description: `Ваша недельная цель установлена на ${points} ${getPointsLabel(points)}. Вы в категории ${badge.emoji} ${badge.name}!`,
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

  const currentBadge = getBadgeForGoal(selectedGoal);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        Настройки недельных целей
      </h3>
      
      <div className="flex items-center gap-2 mb-6">
        <p className="text-muted-foreground">
          Выберите, сколько энергетических очков в неделю вы хотите заработать:
        </p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">Задача из учебника = 1 очко, задача ФИПИ = 2 очка. Бонус за серию 3 дня подряд = x10 очков!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-6 mb-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <Clock className="h-4 w-4" />
              Недельная цель
            </div>
            <div className="text-lg font-semibold text-primary flex items-center gap-2">
              <span className="text-2xl">{currentBadge.emoji}</span>
              <span>{selectedGoal} {getPointsLabel(selectedGoal)}</span>
            </div>
          </div>
          
          <div className="relative">
            <Slider
              value={[selectedGoal]}
              onValueChange={(value) => setSelectedGoal(value[0])}
              max={1000}
              min={10}
              step={10}
              className="w-full"
            />
            
            {/* Visual threshold markers */}
            <div className="relative w-full h-6 mt-1">
              {GOAL_BADGE_CATEGORIES.map((badge, index) => {
                const position = ((badge.minPoints - 10) / (1000 - 10)) * 100;
                return (
                  <div
                    key={index}
                    className="absolute text-xs text-muted-foreground flex flex-col items-center"
                    style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                  >
                    <div className="w-px h-2 bg-border mb-1"></div>
                    <span className="text-[10px]">{badge.emoji}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex justify-between text-sm text-muted-foreground mt-4">
            <span>10 очков</span>
            <span>1000 очков</span>
          </div>
          
          {/* Badge categories legend */}
          <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-muted/30 rounded-lg">
            {GOAL_BADGE_CATEGORIES.map((badge) => (
              <div 
                key={badge.name} 
                className={`flex items-center gap-2 text-xs p-2 rounded ${
                  selectedGoal >= badge.minPoints && selectedGoal <= badge.maxPoints 
                    ? 'bg-primary/10 border border-primary/30' 
                    : ''
                }`}
              >
                <span className="text-lg">{badge.emoji}</span>
                <div>
                  <div className="font-medium">{badge.name}</div>
                  <div className="text-muted-foreground">{badge.minPoints}-{badge.maxPoints}</div>
                </div>
              </div>
            ))}
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
