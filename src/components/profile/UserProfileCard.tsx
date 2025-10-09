
import { User, Edit2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import { ProfileEditForm } from "./ProfileEditForm";
import { useProfile, Profile } from "@/hooks/useProfile";
import { getBadgeForPoints } from "@/utils/streakBadges";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TopicProgress {
  topic: string;
  name: string;
  averageScore: number;
}

interface UserData {
  progress: {
    overall: number;
    algebra: number;
    geometry: number;
    probability: number;
  };
  topicProgress: TopicProgress[];
  completedLessons: number;
  practiceProblems: number;
  quizzesCompleted: number;
  averageScore: number;
  streakDays: number;
}

interface UserProfileCardProps {
  userName: string;
  userEmail: string;
  joinedDate: string;
  userData: UserData;
}

export const UserProfileCard = ({ userName, userEmail, joinedDate, userData }: UserProfileCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { profile, updateProfile, getDisplayName, getAvatarUrl } = useProfile();
  const { user } = useAuth();
  const [dailyGoal, setDailyGoal] = useState(0);

  useEffect(() => {
    const fetchDailyGoal = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('user_streaks')
          .select('daily_goal_minutes')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setDailyGoal(data.daily_goal_minutes);
        }
      } catch (error) {
        console.error('Error fetching daily goal:', error);
      }
    };
    
    fetchDailyGoal();
  }, [user]);

  const handleSaveProfile = (newProfile: Profile) => {
    updateProfile(newProfile);
    setIsEditing(false);
  };

  const displayName = getDisplayName();
  const avatarUrl = getAvatarUrl();
  const currentBadge = getBadgeForPoints(dailyGoal);

  if (isEditing) {
    return (
      <ProfileEditForm
        profile={profile}
        onSave={handleSaveProfile}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <Card className="p-6 bg-white shadow-md rounded-xl border-0">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 overflow-hidden">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="Profile picture" 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="h-12 w-12 text-primary" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800">{userName}</h1>
          {dailyGoal > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
              <span className="text-xl">{currentBadge.emoji}</span>
              <span className="text-xs font-semibold text-primary">{currentBadge.name}</span>
            </div>
          )}
        </div>
        <p className="text-gray-600">{userEmail}</p>
        {profile?.bio && (
          <p className="text-sm text-gray-500 mt-2 max-w-xs">{profile.bio}</p>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
          <span>Присоединился: {joinedDate}</span>
          <span>•</span>
          <span>Активность: Сегодня</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="mt-3"
        >
          <Edit2 className="w-4 h-4 mr-1" />
          Редактировать
        </Button>
      </div>
    </Card>
  );
};
