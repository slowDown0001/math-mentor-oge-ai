
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityTab } from "./ActivityTab";
import { AchievementsTab } from "./AchievementsTab";
import { SettingsTab } from "./SettingsTab";
import { GoalsTab } from "./GoalsTab";
import { StreakSettings } from "../streak/StreakSettings";

interface ProfileTabsProps {
  userData: {
    streakDays: number;
    recentActivity: Array<{
      date: string;
      activity: string;
      type: string;
    }>;
    achievements: Array<{
      id: number;
      name: string;
      description: string;
      date: string;
      completed: boolean;
    }>;
  };
}

export const ProfileTabs = ({ userData }: ProfileTabsProps) => {
  return (
    <Tabs defaultValue="activity" className="w-full">
      <TabsList className="grid grid-cols-5 mb-4">
        <TabsTrigger value="activity">Активность</TabsTrigger>
        <TabsTrigger value="goals">Цели</TabsTrigger>
        <TabsTrigger value="achievements">Достижения</TabsTrigger>
        <TabsTrigger value="streak">Серии</TabsTrigger>
        <TabsTrigger value="settings">Настройки</TabsTrigger>
      </TabsList>
      
      <TabsContent value="activity" className="bg-white rounded-xl shadow-md p-6 border-0">
        <ActivityTab 
          streakDays={userData.streakDays} 
          recentActivity={userData.recentActivity} 
        />
      </TabsContent>
      
      <TabsContent value="goals" className="bg-white rounded-xl shadow-md p-6 border-0">
        <GoalsTab />
      </TabsContent>
      
      <TabsContent value="achievements" className="bg-white rounded-xl shadow-md p-6 border-0">
        <AchievementsTab achievements={userData.achievements} />
      </TabsContent>
      
      <TabsContent value="streak" className="bg-white rounded-xl shadow-md p-6 border-0">
        <StreakSettings />
      </TabsContent>
      
      <TabsContent value="settings" className="bg-white rounded-xl shadow-md p-6 border-0">
        <SettingsTab />
      </TabsContent>
    </Tabs>
  );
};
