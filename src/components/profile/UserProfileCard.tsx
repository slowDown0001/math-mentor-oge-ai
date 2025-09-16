
import { User, Edit2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { useState } from "react";
import { ProfileEditForm } from "./ProfileEditForm";
import { useProfile, Profile } from "@/hooks/useProfile";

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

  const handleSaveProfile = (newProfile: Profile) => {
    updateProfile(newProfile);
    setIsEditing(false);
  };

  const displayName = getDisplayName();
  const avatarUrl = getAvatarUrl();

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
        <h1 className="text-2xl font-bold text-gray-800">{userName}</h1>
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
      
      <div className="space-y-5">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary">{userData.completedLessons}</div>
            <div className="text-sm text-gray-600">Пройдено уроков</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary">{userData.practiceProblems}</div>
            <div className="text-sm text-gray-600">Решено задач</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary">{userData.quizzesCompleted}</div>
            <div className="text-sm text-gray-600">Пройдено тестов</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary">{userData.averageScore}%</div>
            <div className="text-sm text-gray-600">Средний балл</div>
          </div>
        </div>
        
        <div className="pt-4 flex justify-center">
          <Button className="flex items-center gap-2" asChild>
            <Link to="/dashboard">
              <BarChart3 className="h-4 w-4" />
              Перейти к учебе
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};
