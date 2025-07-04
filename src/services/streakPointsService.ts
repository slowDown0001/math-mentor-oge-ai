import { supabase } from '@/integrations/supabase/client';

export interface StreakReward {
  minutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const calculateStreakReward = (difficulty?: string | number): StreakReward => {
  // Convert different difficulty formats to consistent format
  let normalizedDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
  let minutes = 2; // default

  if (typeof difficulty === 'string') {
    const diffLower = difficulty.toLowerCase();
    if (diffLower.includes('easy') || diffLower.includes('легк')) {
      normalizedDifficulty = 'easy';
      minutes = 1;
    } else if (diffLower.includes('hard') || diffLower.includes('сложн') || diffLower.includes('трудн')) {
      normalizedDifficulty = 'hard';
      minutes = 5;
    } else {
      normalizedDifficulty = 'medium';
      minutes = 2;
    }
  } else if (typeof difficulty === 'number') {
    if (difficulty <= 1) {
      normalizedDifficulty = 'easy';
      minutes = 1;
    } else if (difficulty >= 3) {
      normalizedDifficulty = 'hard';
      minutes = 5;
    } else {
      normalizedDifficulty = 'medium';
      minutes = 2;
    }
  }

  return { minutes, difficulty: normalizedDifficulty };
};

export const awardStreakPoints = async (userId: string, reward: StreakReward) => {
  try {
    // Get current streak data
    const { data: currentStreak, error: fetchError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    const today = new Date().toISOString().split('T')[0];
    const currentDate = new Date();
    
    if (!currentStreak) {
      // Create new streak record
      const { error: insertError } = await supabase
        .from('user_streaks')
        .insert({
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today,
          daily_goal_minutes: 30
        });
      
      if (insertError) throw insertError;
    } else {
      // Update existing streak
      const lastActivityDate = currentStreak.last_activity_date ? new Date(currentStreak.last_activity_date) : null;
      const isToday = lastActivityDate && lastActivityDate.toISOString().split('T')[0] === today;
      
      let newCurrentStreak = currentStreak.current_streak;
      if (!isToday) {
        const yesterday = new Date(currentDate);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = lastActivityDate && lastActivityDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0];
        
        if (isYesterday) {
          newCurrentStreak += 1;
        } else if (lastActivityDate) {
          newCurrentStreak = 1; // Reset streak if gap > 1 day
        }
      }

      const { error: updateError } = await supabase
        .from('user_streaks')
        .update({
          current_streak: newCurrentStreak,
          longest_streak: Math.max(currentStreak.longest_streak, newCurrentStreak),
          last_activity_date: today,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (updateError) throw updateError;
    }

    // Add daily activity record
    const { error: activityError } = await supabase
      .from('daily_activities')
      .insert({
        user_id: userId,
        activity_type: 'question_attempt',
        duration_minutes: reward.minutes,
        activity_date: today
      });

    if (activityError) throw activityError;

    return { success: true, reward };
  } catch (error) {
    console.error('Error awarding streak points:', error);
    return { success: false, error };
  }
};

export const getCurrentStreakData = async (userId: string) => {
  try {
    const { data: streakData, error: streakError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (streakError && streakError.code !== 'PGRST116') {
      throw streakError;
    }

    // Get today's total activity minutes
    const today = new Date().toISOString().split('T')[0];
    const { data: activityData, error: activityError } = await supabase
      .from('daily_activities')
      .select('duration_minutes')
      .eq('user_id', userId)
      .eq('activity_date', today);

    if (activityError) {
      throw activityError;
    }

    const todayMinutes = activityData?.reduce((sum, activity) => sum + (activity.duration_minutes || 0), 0) || 0;
    const goalMinutes = streakData?.daily_goal_minutes || 30;

    return {
      currentStreak: streakData?.current_streak || 0,
      longestStreak: streakData?.longest_streak || 0,
      todayMinutes,
      goalMinutes,
      lastActivityDate: streakData?.last_activity_date
    };
  } catch (error) {
    console.error('Error fetching streak data:', error);
    return null;
  }
};