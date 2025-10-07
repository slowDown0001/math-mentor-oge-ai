import { supabase } from '@/integrations/supabase/client';

export type ActivityType = 'article' | 'video' | 'problem' | 'practice_test' | 'question';

// Energy points awarded for different activities
const ENERGY_POINTS = {
  article: 50,      // Reading an article
  video: 75,        // Watching a video  
  problem: 25,      // Solving a single problem
  practice_test: 100, // Completing a practice test
  question: 15      // Answering a question
};

export const awardEnergyPoints = async (
  userId: string,
  activityType: ActivityType,
  customPoints?: number,
  tableName?: string
): Promise<{ success: boolean; pointsAwarded?: number; error?: string }> => {
  try {
    // Determine points based on table name if provided
    let pointsToAward: number;
    if (tableName) {
      // 1 point for oge_math_skills_questions, 2 points for other tables
      pointsToAward = tableName === 'oge_math_skills_questions' ? 1 : 2;
    } else {
      pointsToAward = customPoints || ENERGY_POINTS[activityType];
    }

    // Get current user statistics
    const { data: currentStats, error: fetchError } = await supabase
      .from('user_statistics')
      .select('energy_points')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which means no stats exist yet
      console.error('Error fetching user statistics:', fetchError);
      return { success: false, error: 'Failed to fetch user statistics' };
    }

    const currentPoints = currentStats?.energy_points || 0;
    const newTotalPoints = currentPoints + pointsToAward;

    if (currentStats) {
      // Update existing statistics
      const { error: updateError } = await supabase
        .from('user_statistics')
        .update({ 
          energy_points: newTotalPoints,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating energy points:', updateError);
        return { success: false, error: 'Failed to update energy points' };
      }
    } else {
      // Create new statistics record
      const { error: insertError } = await supabase
        .from('user_statistics')
        .insert({
          user_id: userId,
          energy_points: pointsToAward,
          completed_lessons: 0,
          practice_problems: 0,
          quizzes_completed: 0,
          average_score: 0
        });

      if (insertError) {
        console.error('Error creating user statistics:', insertError);
        return { success: false, error: 'Failed to create user statistics' };
      }
    }

    return { success: true, pointsAwarded: pointsToAward };
  } catch (error) {
    console.error('Error in awardEnergyPoints:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
};

export const getCurrentEnergyPoints = async (userId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('user_statistics')
      .select('energy_points')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching energy points:', error);
      return 0;
    }

    return data?.energy_points || 0;
  } catch (error) {
    console.error('Error in getCurrentEnergyPoints:', error);
    return 0;
  }
};

export const getEnergyPointsForActivity = (activityType: ActivityType): number => {
  return ENERGY_POINTS[activityType];
};