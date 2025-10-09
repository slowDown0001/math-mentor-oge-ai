import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CourseStats {
  courseId: string;
  courseName: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  uniqueQuestions: number;
  lastActivity: string | null;
}

export const useActivityStats = (days: number | null = 30) => {
  const { user } = useAuth();
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [courseStats, setCourseStats] = useState<CourseStats[]>([]);
  const [loading, setLoading] = useState(true);

  const courseIdToName: Record<string, string> = {
    '1': 'ОГЭ Математика',
    '2': 'ЕГЭ Математика Базовая',
    '3': 'ЕГЭ Математика Профильная'
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);

      try {
        // Fetch current streak
        const { data: streakData } = await supabase
          .from('user_streaks')
          .select('current_streak')
          .eq('user_id', user.id)
          .maybeSingle();

        setCurrentStreak(streakData?.current_streak || 0);

        // Fetch user's enrolled courses
        const { data: profileData } = await supabase
          .from('profiles')
          .select('courses')
          .eq('user_id', user.id)
          .maybeSingle();

        const userCourses = profileData?.courses || [];

        // Fetch activity statistics for each course
        const stats: CourseStats[] = [];

        for (const courseId of userCourses) {
          const courseIdStr = String(courseId);
          
          // Build query for student_activity
          let query = supabase
            .from('student_activity')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', courseIdStr);

          // Add date filter if days is specified
          if (days !== null) {
            const dateThreshold = new Date();
            dateThreshold.setDate(dateThreshold.getDate() - days);
            query = query.gte('updated_at', dateThreshold.toISOString());
          }

          const { data: activityData } = await query;

          if (activityData && activityData.length > 0) {
            const totalAttempts = activityData.length;
            const correctAttempts = activityData.filter(a => a.is_correct).length;
            const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts * 100) : 0;
            const uniqueQuestions = new Set(activityData.map(a => a.question_id)).size;
            const lastActivity = activityData[0]?.updated_at || null;

            stats.push({
              courseId: courseIdStr,
              courseName: courseIdToName[courseIdStr] || `Курс ${courseIdStr}`,
              totalAttempts,
              correctAttempts,
              accuracy,
              uniqueQuestions,
              lastActivity
            });
          }
        }

        // Sort by last activity
        stats.sort((a, b) => {
          if (!a.lastActivity) return 1;
          if (!b.lastActivity) return -1;
          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
        });

        setCourseStats(stats);
      } catch (error) {
        console.error('Error fetching activity stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, days]);

  return { currentStreak, courseStats, loading };
};
