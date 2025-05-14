
import { Star, CheckCircle } from "lucide-react";

interface Achievement {
  id: number;
  name: string;
  description: string;
  date: string;
  completed: boolean;
}

interface AchievementsTabProps {
  achievements: Achievement[];
}

export const AchievementsTab = ({ achievements }: AchievementsTabProps) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Star className="h-5 w-5 text-primary" />
        Ваши достижения
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map(achievement => (
          <div 
            key={achievement.id} 
            className={`p-4 rounded-lg ${achievement.completed ? 'bg-primary/5 border border-primary/20' : 'bg-gray-100 border border-gray-200'}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${achievement.completed ? 'bg-primary/20 text-primary' : 'bg-gray-200 text-gray-500'}`}>
                {achievement.completed ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Star className="h-4 w-4" />
                )}
              </div>
              <h3 className={`font-medium ${achievement.completed ? 'text-primary' : 'text-gray-500'}`}>
                {achievement.name}
              </h3>
            </div>
            <p className="text-sm text-gray-600">{achievement.description}</p>
            <div className="text-xs mt-2 text-gray-500">
              {achievement.completed ? `Получено: ${achievement.date}` : achievement.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
