
import { Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface ActivityItem {
  date: string;
  activity: string;
  type: string;
}

interface ActivityTabProps {
  streakDays: number;
  recentActivity: ActivityItem[];
}

export const ActivityTab = ({ streakDays, recentActivity }: ActivityTabProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        Недавняя активность
      </h2>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 font-medium text-primary">
            <span>Текущая серия:</span>
            <span className="text-lg">{streakDays} дней</span>
          </div>
          <div className="text-sm text-gray-500">Продолжайте заниматься каждый день!</div>
        </div>
        <Progress value={streakDays > 30 ? 100 : streakDays / 30 * 100} className="h-2 bg-primary/20" />
      </div>
      
      <ScrollArea className="h-80 pr-4">
        <div className="space-y-4">
          {recentActivity.map((item, i) => (
            <div key={i} className="border-l-2 border-primary pl-4 ml-2 relative">
              <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5"></div>
              <div className="text-sm text-gray-500">{item.date}</div>
              <div className="font-medium text-gray-800">{item.activity}</div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <Button variant="outline" className="w-full mt-2">
        Показать всю историю активности
      </Button>
    </div>
  );
};
