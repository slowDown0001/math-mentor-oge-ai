import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface TextbookProgressData {
  activity: string;
  activity_type: string;
  solved_count?: number;
  total_questions?: number;
  item_id?: string;
  created_at: string;
  id: number;
  user_id: string;
  work_done: string;
  skills_involved?: string;
  module_id?: string;
}

export interface ProgressSummary {
  exercises: { [key: string]: { solved: number; total: number; status: string } };
  tests: { [key: string]: { solved: number; total: number; status: string } };
  exams: { [key: string]: { solved: number; total: number; status: string } };
}

export const useTextbookProgress = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<TextbookProgressData[]>([]);
  const [progressSummary, setProgressSummary] = useState<ProgressSummary>({
    exercises: {},
    tests: {},
    exams: {}
  });
  const [loading, setLoading] = useState(true);

  const getProgressStatus = (solved: number, total: number, type: 'exercise' | 'test' | 'exam') => {
    if (type === 'exercise') {
      if (solved === 0) return 'not-started';
      if (solved === 1) return 'attempted'; // Попытался
      if (solved === 2) return 'familiar'; // Знаком
      if (solved === 3) return 'proficient'; // Владею
      if (solved >= 4) return 'mastered'; // Освоено
    } else if (type === 'test') {
      if (solved >= 5) return 'completed'; // Light up lightning
      return 'in-progress';
    } else if (type === 'exam') {
      if (solved >= 9) return 'completed'; // Light up star
      return 'in-progress';
    }
    return 'not-started';
  };

  const fetchProgress = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('textbook_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching textbook progress:', error);
        return;
      }

      setProgressData(data as TextbookProgressData[] || []);

      // Process data into summary
      const summary: ProgressSummary = { exercises: {}, tests: {}, exams: {} };
      
      (data as TextbookProgressData[])?.forEach((item) => {
        const key = item.item_id || `${item.activity_type}-${item.activity}`;
        const status = getProgressStatus(item.solved_count || 0, item.total_questions || 4, item.activity_type as any);
        
        if (item.activity_type === 'exercise') {
          summary.exercises[key] = {
            solved: item.solved_count || 0,
            total: item.total_questions || 4,
            status
          };
        } else if (item.activity_type === 'test') {
          summary.tests[key] = {
            solved: item.solved_count || 0,
            total: item.total_questions || 6,
            status
          };
        } else if (item.activity_type === 'exam') {
          summary.exams[key] = {
            solved: item.solved_count || 0,
            total: item.total_questions || 10,
            status
          };
        }
      });

      setProgressSummary(summary);
    } catch (err) {
      console.error('Error in fetchProgress:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [user?.id]);

  return {
    progressData,
    progressSummary,
    loading,
    refetch: fetchProgress
  };
};