import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Flame, Star, Trophy, Target } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const UserInfoStripe = () => {
  const { getDisplayName } = useProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [telegramCode, setTelegramCode] = useState<number | null>(null);
  const [telegramUserId, setTelegramUserId] = useState<number | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  // Mock data - replace with real data later
  const weeklyStreak = 3;
  const level = 5;
  const progress = 76;

  useEffect(() => {
    if (user) {
      loadTelegramCode();
    }
  }, [user]);

  const loadTelegramCode = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('telegram_code, telegram_user_id')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading telegram data:', error);
        return;
      }

      if (profile?.telegram_code) {
        setTelegramCode(profile.telegram_code);
      }
      if (profile?.telegram_user_id) {
        setTelegramUserId(profile.telegram_user_id);
      }
    } catch (error) {
      console.error('Error loading telegram data:', error);
    }
  };

  const generateTelegramCode = async () => {
    if (!user) return;

    setIsGeneratingCode(true);
    // Generate random 6-digit number
    const randomCode = Math.floor(100000 + Math.random() * 900000);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ telegram_code: randomCode })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving telegram code:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось создать Telegram код",
          variant: "destructive",
        });
        return;
      }

      setTelegramCode(randomCode);
      toast({
        title: "Telegram код создан",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error creating telegram code:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать Telegram код",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCode(false);
    }
  };

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
              <button className="hover:text-primary transition-colors">Редактировать профиль</button>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="hover:text-primary transition-colors">Добавить Telegram бот</button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Telegram бот</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Через бот в Telegram ты сможешь загружать фото решения и задач на платформу
                    </p>
                    {telegramCode ? (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Ваш Telegram код:</p>
                            <p className="text-blue-800 font-mono text-lg font-bold">
                              {telegramCode}
                            </p>
                          </div>
                          {telegramUserId ? (
                            <div className="text-green-600 text-sm font-medium">
                              ✓ Telegram код подтвержден
                            </div>
                          ) : null}
                        </div>
                        {!telegramUserId && (
                          <p className="text-sm text-blue-600 mt-2">
                            Введите этот код в телеграм-боте egechat_bot
                          </p>
                        )}
                      </div>
                    ) : (
                      <Button
                        onClick={generateTelegramCode}
                        disabled={isGeneratingCode}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        {isGeneratingCode ? 'Создаю код...' : 'Создать Telegram код'}
                      </Button>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
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