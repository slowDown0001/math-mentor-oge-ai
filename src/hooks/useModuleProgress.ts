import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface ProgressItem {
  activity: string;
  activity_type: string;
  solved_count: string;
  total_questions: string;
  item_id: string | null;
}

export const useModuleProgress = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<ProgressItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProgress = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('textbook_progress')
        .select('activity, activity_type, solved_count, total_questions, item_id')
        .eq('user_id', user.id)
        .in('activity_type', ['exercise', 'test', 'exam']);

      if (error) {
        console.error('Error fetching progress:', error);
        return;
      }

      setProgressData(data as unknown as ProgressItem[] || []);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [user?.id]);

  const getProgressStatus = (itemId: string, activityType: 'exercise' | 'test' | 'exam') => {
    const item = progressData.find(p => p.item_id === itemId && p.activity_type === activityType);
    
    console.log('getProgressStatus called with:', { itemId, activityType });
    console.log('Found item:', item);
    console.log('All progress data:', progressData);
    
    if (!item) return 'not_started';

    const solved = parseInt(item.solved_count);
    const total = parseInt(item.total_questions);
    
    console.log('Parsed values:', { solved, total });

    if (activityType === 'exercise') {
      if (solved === 4) return 'mastered'; // Освоено
      if (solved === 3) return 'proficient'; // Владею
      if (solved === 2) return 'familiar'; // Знаком
      if (solved === 1) return 'attempted'; // Попытался
    } else if (activityType === 'test') {
      if (solved >= 5) return 'completed'; // 5/6 or 6/6
    } else if (activityType === 'exam') {
      if (solved >= 9) return 'completed'; // 9/10 or 10/10
    }

    return 'not_started';
  };

  return {
    progressData,
    isLoading,
    getProgressStatus,
    refetch: fetchProgress
  };
};