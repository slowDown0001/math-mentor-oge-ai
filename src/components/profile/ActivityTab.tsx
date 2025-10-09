import { useState } from "react";
import { Calendar, Target, Trophy, Activity as ActivityIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useActivityStats } from "@/hooks/useActivityStats";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export const ActivityTab = () => {
  const [showAllHistory, setShowAllHistory] = useState(false);
  const { currentStreak, courseStats, loading } = useActivityStats(showAllHistory ? null : 30);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        Недавняя активность
      </h2>
      
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg border border-primary/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 font-medium text-primary">
            <Trophy className="h-5 w-5" />
            <span>Текущая серия:</span>
            <span className="text-lg font-bold">{currentStreak} дней</span>
          </div>
          <div className="text-sm text-gray-600">Продолжайте заниматься каждый день!</div>
        </div>
        <Progress value={currentStreak > 30 ? 100 : currentStreak / 30 * 100} className="h-2" />
      </div>
      
      {loading ? (
        <div className="text-center py-8 text-gray-500">Загрузка...</div>
      ) : courseStats.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Нет активности за {showAllHistory ? 'всё время' : 'последние 30 дней'}
        </div>
      ) : (
        <ScrollArea className="h-96 pr-4">
          <div className="space-y-4">
            {courseStats.map((stats) => (
              <div 
                key={stats.courseId} 
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <ActivityIcon className="h-4 w-4 text-primary" />
                      {stats.courseName}
                    </h3>
                    {stats.lastActivity && (
                      <p className="text-xs text-gray-500 mt-1">
                        Последняя активность: {format(new Date(stats.lastActivity), 'dd MMMM yyyy, HH:mm', { locale: ru })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-xs text-blue-600 font-medium mb-1">Всего попыток</div>
                    <div className="text-2xl font-bold text-blue-700">{stats.totalAttempts}</div>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-xs text-green-600 font-medium mb-1">Правильных</div>
                    <div className="text-2xl font-bold text-green-700">{stats.correctAttempts}</div>
                  </div>
                  
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-xs text-purple-600 font-medium mb-1">Точность</div>
                    <div className="text-2xl font-bold text-purple-700">{stats.accuracy.toFixed(1)}%</div>
                  </div>
                  
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="text-xs text-orange-600 font-medium mb-1">Уникальных задач</div>
                    <div className="text-2xl font-bold text-orange-700">{stats.uniqueQuestions}</div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Прогресс точности</span>
                    <span>{stats.accuracy.toFixed(0)}%</span>
                  </div>
                  <Progress value={stats.accuracy} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
      
      <Button 
        variant="outline" 
        className="w-full mt-2"
        onClick={() => setShowAllHistory(!showAllHistory)}
      >
        {showAllHistory ? 'Показать последние 30 дней' : 'Показать всю историю активности'}
      </Button>
    </div>
  );
};
