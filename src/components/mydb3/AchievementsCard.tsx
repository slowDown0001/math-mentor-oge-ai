import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flame, CheckCircle, Target } from 'lucide-react';

export const AchievementsCard = () => {
  return (
    <Card className="rounded-2xl shadow-sm h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5" />
          Достижения (по всем курсам)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-2 py-1">
              <CheckCircle className="w-3 h-3 mr-1" />
              0
            </Badge>
            <span className="text-sm text-muted-foreground">Тем изучено</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-2 py-1">
              <Target className="w-3 h-3 mr-1" />
              0
            </Badge>
            <span className="text-sm text-muted-foreground">Навыков освоено</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-2 py-1">
              <Flame className="w-3 h-3 mr-1" />
              0
            </Badge>
            <span className="text-sm text-muted-foreground">Дней подряд</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-2 py-1">
              <Trophy className="w-3 h-3 mr-1" />
              0
            </Badge>
            <span className="text-sm text-muted-foreground">Достижений</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};