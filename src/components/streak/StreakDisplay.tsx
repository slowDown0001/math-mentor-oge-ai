
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
    <div className="flex items-center gap-3 group">
      {/* Progress Ring */}
      <div className="relative w-11 h-11">
        <svg className="w-11 h-11 transform -rotate-90" viewBox="0 0 44 44">
          {/* Background circle */}
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke="hsl(var(--muted-foreground) / 0.2)"
            strokeWidth="2"
          />
          {/* Progress circle */}
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke={isCompleted ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.7)"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 18}`}
            strokeDashoffset={`${2 * Math.PI * 18 * (1 - progressPercentage / 100)}`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* User Profile Picture */}
        <div className="absolute inset-0 flex items-center justify-center">
          {getAvatarUrl() ? (
            <img 
              src={getAvatarUrl()!} 
              alt={getDisplayName()}
              className="w-7 h-7 object-cover rounded-full"
            />
          ) : (
            <div className="w-7 h-7 bg-muted rounded-full flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Streak Info */}
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-1">
          <span className="font-medium text-foreground">{streakData.currentStreak}</span>
          <span className="text-base">🔥</span>
        </div>
        <div className="text-muted-foreground">
          {Math.round(streakData.todayProgress)}м
        </div>
      </div>

      {/* Celebration Message */}
      {showCelebration && (
        <div className="absolute top-12 left-0 bg-primary text-primary-foreground px-2 py-1 rounded text-xs animate-fade-in z-50">
          🎉 Цель достигнута!
        </div>
      )}
    </div>
  );
};
