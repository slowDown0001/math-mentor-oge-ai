import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Edit } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';

export const PersonalInfoCard = () => {
  const { getDisplayName, getAvatarUrl } = useProfile();
  const { user } = useAuth();

  return (
    <Card className="rounded-2xl shadow-sm h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="w-5 h-5" />
          Личные данные
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-lg font-semibold">
            {getDisplayName().charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{getDisplayName()}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0">
            <Edit className="w-4 h-4 mr-2" />
            Изменить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};