import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Flame, Star, Trophy, Target, LogOut } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';

export const UserInfoStripe = () => {
  const { getDisplayName } = useProfile();
  const { signOut } = useAuth();

  // Mock data - replace with real data later
  const weeklyStreak = 3;
  const level = 5;
  const progress = 76;

  return null;
};