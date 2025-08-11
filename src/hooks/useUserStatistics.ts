import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserStatistics {
  completedLessons: number;
  practiceProblems: number;
  quizzesCompleted: number;
  averageScore: number;
  dailyGoalMinutes: number;
  isLoading: boolean;
  error: string | null;
}

export const useUserStatistics = (): UserStatistics => {
  const [statistics, setStatistics] = useState({
    completedLessons: 0,
    practiceProblems: 0,
    quizzesCompleted: 0,
    averageScore: 0,
    dailyGoalMinutes: 30,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch user statistics
        const { data: statsData, error: statsError } = await supabase
          .from('user_statistics')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (statsError) {
          throw statsError;
        }

        // Fetch daily goal from user_streaks
        const { data: streakData, error: streakError } = await supabase
          .from('user_streaks')
          .select('daily_goal_minutes')
          .eq('user_id', user.id)
          .maybeSingle();

        if (streakError) {
          throw streakError;
        }

        setStatistics({
          completedLessons: statsData?.completed_lessons || 0,
          practiceProblems: statsData?.practice_problems || 0,
          quizzesCompleted: statsData?.quizzes_completed || 0,
          averageScore: Number(statsData?.average_score) || 0,
          dailyGoalMinutes: streakData?.daily_goal_minutes || 30,
        });
      } catch (err) {
        console.error('Error fetching user statistics:', err);
        setError('Ошибка загрузки статистики пользователя');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, [user]);

  return {
    ...statistics,
    isLoading,
    error
  };
};