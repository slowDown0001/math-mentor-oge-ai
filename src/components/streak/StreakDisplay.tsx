
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface StreakData {
  dailyGoalMinutes: number;
  todayProgress: number;
  currentStreak: number;
}

export const StreakDisplay = () => {
  const { user } = useAuth();
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

  return (
    <div className="relative flex items-center">
      {/* Progress Ring */}
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
          {/* Background circle */}
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="3"
          />
          {/* Progress circle */}
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="#22c55e"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - progressPercentage / 100)}`}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        
        {/* Hedgehog Image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src="/lovable-uploads/81d789b3-121e-4fe7-9bb7-362fb54fb728.png" 
            alt="Hedgehog mascot"
            className={`w-8 h-8 object-contain transition-transform duration-300 ${
              progressPercentage >= 100 ? 'animate-bounce' : ''
            }`}
          />
        </div>
      </div>

      {/* Streak Counter */}
      <div className="ml-2 text-xs">
        <div className="font-semibold text-gray-700">{streakData.currentStreak} 🔥</div>
        <div className="text-gray-500">{Math.round(streakData.todayProgress)}м</div>
      </div>

      {/* Celebration Message */}
      {showCelebration && (
        <div className="absolute top-14 left-0 bg-green-500 text-white px-3 py-1 rounded-lg text-sm animate-fade-in z-50">
          🎉 Поздравляем! Вы достигли дневной цели!
        </div>
      )}
    </div>
  );
};
