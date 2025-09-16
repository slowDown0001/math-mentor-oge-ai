import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Flame, Star, Trophy, Target } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';

export const UserInfoStripe = () => {
  const { getDisplayName } = useProfile();
  const { user } = useAuth();

  // Mock data - replace with real data later
  const weeklyStreak = 3;
  const level = 5;
  const progress = 76;

  return (
    <div className="bg-background border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-xl font-semibold">
            {getDisplayName().charAt(0).toUpperCase()}
          </div>
          
          {/* User Info */}
          <div>
            <h2 className="text-xl font-bold">{getDisplayName()}</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <button className="hover:text-primary transition-colors">Выбрать ник</button>
              <button className="hover:text-primary transition-colors">Добавить био</button>
              <button className="hover:text-primary transition-colors">Редактировать профиль</button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-8">
          {/* Weekly Streak */}
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <div className="text-center">
              <div className="text-2xl font-bold">{weeklyStreak}</div>
              <div className="text-xs text-muted-foreground">недельная серия</div>
            </div>
          </div>

          {/* Level */}
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Уровень {level}</div>
            <div className="w-32">
              <Progress value={progress} className="h-2" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">{progress}%</div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-yellow-600">
              <Star className="w-3 h-3 mr-1" />
            </Badge>
            <Badge variant="secondary" className="text-blue-600">
              <Trophy className="w-3 h-3 mr-1" />
            </Badge>
            <Badge variant="secondary" className="text-green-600">
              <Target className="w-3 h-3 mr-1" />
            </Badge>
            <Badge variant="secondary" className="text-purple-600">
              18
            </Badge>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-2">
            Начинай прокачку и собирай серию!
          </div>
          <Button size="sm">
            Начать
          </Button>
        </div>
      </div>
    </div>
  );
};