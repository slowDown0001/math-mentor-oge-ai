
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { User } from 'lucide-react';

interface StreakData {
  dailyGoalMinutes: number;
  todayProgress: number;
  currentStreak: number;
}

export const StreakDisplay = () => {
  const { user } = useAuth();
  const { getAvatarUrl, getDisplayName } = useProfile();
  const [streakData, setStreakData] = useState<StreakData>({
    dailyGoalMinutes: 30,
    todayProgress: 0,
    currentStreak: 0
  });
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStreakData();
    }
  }, [user]);

  const fetchStreakData = async () => {
    if (!user) return;

    try {
      // Get user streak preferences
      const { data: streakInfo } = await supabase
        .from('user_streaks')
        .select('daily_goal_minutes, current_streak')
        .eq('user_id', user.id)
        .single();

      // Get today's activities
      const today = new Date().toISOString().split('T')[0];
      const { data: todayActivities } = await supabase
        .from('daily_activities')
        .select('duration_minutes')
        .eq('user_id', user.id)
        .eq('activity_date', today);

      const todayProgress = todayActivities?.reduce((sum, activity) => sum + (activity.duration_minutes || 0), 0) || 0;
      const goalMinutes = streakInfo?.daily_goal_minutes || 30;
      
      setStreakData({
        dailyGoalMinutes: goalMinutes,
        todayProgress,
        currentStreak: streakInfo?.current_streak || 0
      });

      // Show celebration if goal is reached
      if (todayProgress >= goalMinutes && todayProgress > 0) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    } catch (error) {
      console.error('Error fetching streak data:', error);
    }
  };

  const progressPercentage = Math.min((streakData.todayProgress / streakData.dailyGoalMinutes) * 100, 100);
  const isCompleted = progressPercentage >= 100;

  return (
    <div className="relative flex items-center gap-3 p-2 rounded-lg bg-card border border-border hover:shadow-sm transition-all duration-200">
      {/* Progress Ring */}
      <div className="relative w-14 h-14">
        <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 56 56">
          {/* Background circle */}
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="4"
          />
          {/* Progress circle */}
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke={isCompleted ? "hsl(var(--primary))" : "hsl(var(--chart-1))"}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 24}`}
            strokeDashoffset={`${2 * Math.PI * 24 * (1 - progressPercentage / 100)}`}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        
        {/* User Profile Picture */}
        <div className="absolute inset-0 flex items-center justify-center">
          {getAvatarUrl() ? (
            <img 
              src={getAvatarUrl()!} 
              alt={getDisplayName()}
              className={`w-10 h-10 object-cover rounded-full border-2 border-background transition-all duration-300 ${
                isCompleted ? 'animate-pulse border-primary' : ''
              }`}
            />
          ) : (
            <div className={`w-10 h-10 bg-muted rounded-full flex items-center justify-center border-2 border-background transition-all duration-300 ${
              isCompleted ? 'animate-pulse border-primary' : ''
            }`}>
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Streak Info */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">{streakData.currentStreak}</span>
          <span className="text-lg">🔥</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {Math.round(streakData.todayProgress)}м из {streakData.dailyGoalMinutes}м
        </div>
        {isCompleted && (
          <div className="text-xs font-medium text-primary">
            ✓ Цель достигнута!
          </div>
        )}
      </div>

      {/* Celebration Message */}
      {showCelebration && (
        <div className="absolute top-16 left-0 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm animate-fade-in z-50 shadow-lg">
          🎉 Отличная работа! Дневная цель выполнена!
        </div>
      )}
    </div>
  );
};
