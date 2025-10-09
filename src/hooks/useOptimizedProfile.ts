import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface OptimizedProfileData {
  // Profile data
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    telegram_code: number | null;
    telegram_user_id: number | null;
    courses: number[];
  } | null;
  
  // Streak data
  streak: {
    current_streak: number;
    daily_goal_minutes: number;
  } | null;
  
  // Statistics
  statistics: {
    completed_lessons: number;
    practice_problems: number;
    quizzes_completed: number;
    average_score: number;
    energy_points: number;
  } | null;
  
  // Last activity
  lastActivity: {
    created_at: string;
  } | null;
  
  // Daily activity
  dailyActivity: {
    total_minutes: number;
  } | null;
  
  isLoading: boolean;
  error: string | null;
}

export const useOptimizedProfile = () => {
  const [data, setData] = useState<OptimizedProfileData>({
    profile: null,
    streak: null,
    statistics: null,
    lastActivity: null,
    dailyActivity: null,
    isLoading: true,
    error: null,
  });
  
  const { user } = useAuth();

  useEffect(() => {
    const fetchAllData = async () => {
      if (!user) {
        setData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));

        // Fetch ALL data in PARALLEL with a single query per table
        const [profileRes, streakRes, statsRes, activityRes, dailyActivityRes] = await Promise.all([
          // Single profiles query with all needed fields
          supabase
            .from('profiles')
            .select('id, full_name, avatar_url, bio, telegram_code, telegram_user_id, courses')
            .eq('user_id', user.id)
            .maybeSingle(),
          
          // Single user_streaks query with all needed fields
          supabase
            .from('user_streaks')
            .select('current_streak, daily_goal_minutes')
            .eq('user_id', user.id)
            .maybeSingle(),
          
          // Single user_statistics query
          supabase
            .from('user_statistics')
            .select('completed_lessons, practice_problems, quizzes_completed, average_score, energy_points')
            .eq('user_id', user.id)
            .maybeSingle(),
          
          // Last activity
          supabase
            .from('student_activity')
            .select('created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          
          // Today's total activity minutes
          supabase
            .from('daily_activities')
            .select('duration_minutes')
            .eq('user_id', user.id)
            .eq('activity_date', new Date().toISOString().split('T')[0])
        ]);

        // Check for errors
        if (profileRes.error) throw profileRes.error;
        if (streakRes.error) throw streakRes.error;
        if (statsRes.error) throw statsRes.error;
        
        // Calculate total daily minutes
        const totalDailyMinutes = dailyActivityRes.data?.reduce(
          (sum, activity) => sum + (activity.duration_minutes || 0), 
          0
        ) || 0;

        setData({
          profile: profileRes.data,
          streak: streakRes.data,
          statistics: statsRes.data,
          lastActivity: activityRes.data,
          dailyActivity: { total_minutes: totalDailyMinutes },
          isLoading: false,
          error: null,
        });
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: 'Ошибка загрузки данных профиля',
        }));
      }
    };

    fetchAllData();
  }, [user]);

  // Helper functions
  const getDisplayName = () => {
    if (data.profile?.full_name) return data.profile.full_name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'Пользователь';
  };

  const getAvatarUrl = () => {
    return data.profile?.avatar_url || null;
  };

  const getLastActivityText = () => {
    if (!data.lastActivity) return 'Нет данных';
    
    const activityDate = new Date(data.lastActivity.created_at);
    const today = new Date();
    const diffInDays = Math.floor((today.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Сегодня';
    if (diffInDays === 1) return 'Вчера';
    return activityDate.toLocaleDateString('ru-RU');
  };

  return {
    ...data,
    getDisplayName,
    getAvatarUrl,
    getLastActivityText,
  };
};