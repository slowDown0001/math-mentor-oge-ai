
import { supabase } from '@/integrations/supabase/client';

export const trackStreakActivity = async (
  userId: string,
  activityType: 'article' | 'video' | 'problem' | 'practice_test',
  durationMinutes: number = 0
) => {
  try {
    // Add activity record
    await supabase
      .from('daily_activities')
      .insert({
        user_id: userId,
        activity_type: activityType,
        duration_minutes: durationMinutes,
        activity_date: new Date().toISOString().split('T')[0]
      });

    // Update streak data
    const today = new Date().toISOString().split('T')[0];
    
    // Get current streak info
    const { data: currentStreak } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (currentStreak) {
      const lastActivityDate = currentStreak.last_activity_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = currentStreak.current_streak;

      // Check if this is the first activity today
      if (lastActivityDate !== today) {
        if (lastActivityDate === yesterdayStr) {
          // Continue streak
          newStreak += 1;
        } else if (lastActivityDate && lastActivityDate < yesterdayStr) {
          // Streak broken, reset to 1
          newStreak = 1;
        } else if (!lastActivityDate) {
          // First ever activity
          newStreak = 1;
        }

        // Update streak
        await supabase
          .from('user_streaks')
          .update({
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, currentStreak.longest_streak),
            last_activity_date: today
          })
          .eq('user_id', userId);
      }
    }
  } catch (error) {
    console.error('Error tracking streak activity:', error);
  }
};
