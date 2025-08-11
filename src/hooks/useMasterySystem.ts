import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type UserMastery = Database['public']['Tables']['user_mastery']['Row'];
type UserActivity = Database['public']['Tables']['user_activities']['Row'];

export type { UserMastery, UserActivity };

// Points system like Khan Academy
const POINTS_SYSTEM = {
  video: 10,        // Watching a video
  article: 15,      // Reading an article
  practice: 20,     // Completing a practice exercise
  quiz: 50,         // Completing a quiz
  unit_test: 100    // Completing a unit test
};

const MASTERY_THRESHOLDS = {
  not_started: 0,
  attempted: 20,
  familiar: 40,
  proficient: 70,
  mastered: 90
};

export const useMasterySystem = () => {
  const { user } = useAuth();
  const [userMastery, setUserMastery] = useState<UserMastery[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's mastery data
  useEffect(() => {
    if (user) {
      fetchUserMastery();
      fetchUserActivities();
    }
  }, [user]);

  const fetchUserMastery = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_mastery')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching user mastery:', error);
    } else {
      setUserMastery(data || []);
    }
    setLoading(false);
  };

  const fetchUserActivities = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching user activities:', error);
    } else {
      setUserActivities(data || []);
    }
  };

  // Award points for completing an activity
  const awardPoints = async (
    activityType: UserActivity['activity_type'],
    unitNumber: number,
    subunitNumber: number | null,
    activityId: string,
    timeSpentMinutes: number = 0
  ) => {
    if (!user) return;

    const pointsEarned = POINTS_SYSTEM[activityType];

    // Record the activity
    const { error: activityError } = await supabase
      .from('user_activities')
      .insert({
        user_id: user.id,
        activity_type: activityType,
        unit_number: unitNumber,
        subunit_number: subunitNumber,
        activity_id: activityId,
        points_earned: pointsEarned,
        time_spent_minutes: timeSpentMinutes
      });

    if (activityError) {
      console.error('Error recording activity:', activityError);
      return;
    }

    // Update or create mastery record
    await updateMasteryProgress(unitNumber, subunitNumber, pointsEarned);
    
    // Refresh data
    fetchUserMastery();
    fetchUserActivities();

    return pointsEarned;
  };

  const updateMasteryProgress = async (
    unitNumber: number,
    subunitNumber: number | null,
    pointsToAdd: number
  ) => {
    if (!user) return;

    // Check if mastery record exists
    const { data: existingMastery } = await supabase
      .from('user_mastery')
      .select('*')
      .eq('user_id', user.id)
      .eq('unit_number', unitNumber)
      .eq('subunit_number', subunitNumber)
      .single();

    if (existingMastery) {
      // Update existing record
      const newPoints = existingMastery.mastery_points + pointsToAdd;
      const newLevel = calculateMasteryLevel(newPoints, existingMastery.total_possible_points);

      await supabase
        .from('user_mastery')
        .update({
          mastery_points: newPoints,
          mastery_level: newLevel
        })
        .eq('id', existingMastery.id);
    } else {
      // Create new record
      const totalPossiblePoints = calculateTotalPossiblePoints(unitNumber, subunitNumber);
      const newLevel = calculateMasteryLevel(pointsToAdd, totalPossiblePoints);

      await supabase
        .from('user_mastery')
        .insert({
          user_id: user.id,
          unit_number: unitNumber,
          subunit_number: subunitNumber,
          mastery_points: pointsToAdd,
          total_possible_points: totalPossiblePoints,
          mastery_level: newLevel
        });
    }
  };

  const calculateTotalPossiblePoints = (unitNumber: number, subunitNumber: number | null): number => {
    // This would be calculated based on the unit structure
    // For now, using a simple formula
    if (subunitNumber) {
      // Subunit: videos + articles + practices (assuming 3-5 skills per subunit)
      return (4 * POINTS_SYSTEM.video) + (4 * POINTS_SYSTEM.article) + (3 * POINTS_SYSTEM.practice);
    } else {
      // Unit: all subunit points + quizzes + unit test
      return 500 + (2 * POINTS_SYSTEM.quiz) + POINTS_SYSTEM.unit_test; // Approximate
    }
  };

  const calculateMasteryLevel = (points: number, totalPoints: number): UserMastery['mastery_level'] => {
    const percentage = (points / totalPoints) * 100;
    
    if (percentage >= MASTERY_THRESHOLDS.mastered) return 'mastered';
    if (percentage >= MASTERY_THRESHOLDS.proficient) return 'proficient';
    if (percentage >= MASTERY_THRESHOLDS.familiar) return 'familiar';
    if (percentage >= MASTERY_THRESHOLDS.attempted) return 'attempted';
    return 'not_started';
  };

  // Get mastery progress for a unit or subunit
  const getUserMastery = (unitNumber: number, subunitNumber?: number): UserMastery | null => {
    return userMastery.find(m => 
      m.unit_number === unitNumber && 
      (subunitNumber ? m.subunit_number === subunitNumber : m.subunit_number === null)
    ) || null;
  };

  // Calculate progress percentage
  const calculateUnitProgress = (unitNumber: number, subunitId?: string): number => {
    const subunitNumber = subunitId ? parseFloat(subunitId.split('.')[1]) : undefined;
    const mastery = getUserMastery(unitNumber, subunitNumber);
    
    if (!mastery) return 0;
    return Math.min((mastery.mastery_points / mastery.total_possible_points) * 100, 100);
  };

  // Get mastery level from progress percentage
  const getMasteryLevel = (progressPercentage: number): UserMastery['mastery_level'] => {
    if (progressPercentage >= MASTERY_THRESHOLDS.mastered) return 'mastered';
    if (progressPercentage >= MASTERY_THRESHOLDS.proficient) return 'proficient';
    if (progressPercentage >= MASTERY_THRESHOLDS.familiar) return 'familiar';
    if (progressPercentage >= MASTERY_THRESHOLDS.attempted) return 'attempted';
    return 'not_started';
  };

  // Get total points earned by user
  const getTotalPoints = (): number => {
    return userActivities.reduce((total, activity) => total + activity.points_earned, 0);
  };

  // Get recent activities
  const getRecentActivities = (limit: number = 10): UserActivity[] => {
    return userActivities.slice(0, limit);
  };

  return {
    userMastery,
    userActivities,
    loading,
    awardPoints,
    getUserMastery,
    calculateUnitProgress,
    getMasteryLevel,
    getTotalPoints,
    getRecentActivities,
    POINTS_SYSTEM
  };
};