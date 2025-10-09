export interface BadgeInfo {
  emoji: string;
  name: string;
  minPoints: number;
  maxPoints: number;
}

export const BADGE_CATEGORIES: BadgeInfo[] = [
  { emoji: '🌱', name: 'Нубик', minPoints: 0, maxPoints: 150 },
  { emoji: '⚡', name: 'Матемаг', minPoints: 151, maxPoints: 400 },
  { emoji: '🔥', name: 'Прошарик', minPoints: 401, maxPoints: 700 },
  { emoji: '🌠', name: 'Инфинити', minPoints: 701, maxPoints: Infinity },
];

// For GOAL settings (based on user's chosen goal in daily_goal_minutes)
export const GOAL_BADGE_CATEGORIES: BadgeInfo[] = [
  { emoji: '🌱', name: 'Нубик', minPoints: 10, maxPoints: 150 },
  { emoji: '⚡', name: 'Матемаг', minPoints: 151, maxPoints: 400 },
  { emoji: '🔥', name: 'Прошарик', minPoints: 401, maxPoints: 700 },
  { emoji: '🌠', name: 'Инфинити', minPoints: 701, maxPoints: 1000 },
];

// Get badge based on EARNED energy points
export const getBadgeForPoints = (points: number): BadgeInfo => {
  // Find the appropriate badge based on points
  const badge = BADGE_CATEGORIES.find(
    (b) => points >= b.minPoints && points <= b.maxPoints
  );
  
  // Default to first badge (Нубик) if no match
  return badge || BADGE_CATEGORIES[0];
};

// Get badge based on GOAL setting
export const getBadgeForGoal = (goalPoints: number): BadgeInfo => {
  // Find the appropriate badge based on goal
  const badge = GOAL_BADGE_CATEGORIES.find(
    (b) => goalPoints >= b.minPoints && goalPoints <= b.maxPoints
  );
  
  // If points exceed maximum, return highest badge
  if (goalPoints > 1000) {
    return GOAL_BADGE_CATEGORIES[GOAL_BADGE_CATEGORIES.length - 1];
  }
  
  // Default to first badge if below minimum
  return badge || GOAL_BADGE_CATEGORIES[0];
};

export const getPointsLabel = (count: number): string => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'очков';
  }

  if (lastDigit === 1) {
    return 'очко';
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'очка';
  }

  return 'очков';
};
