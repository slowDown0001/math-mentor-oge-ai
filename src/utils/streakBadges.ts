export interface BadgeInfo {
  emoji: string;
  name: string;
  minPoints: number;
  maxPoints: number;
}

export const BADGE_CATEGORIES: BadgeInfo[] = [
  { emoji: '🌱', name: 'Нубик', minPoints: 10, maxPoints: 150 },
  { emoji: '⚡', name: 'Матемаг', minPoints: 151, maxPoints: 400 },
  { emoji: '🔥', name: 'Прошарик', minPoints: 401, maxPoints: 700 },
  { emoji: '🌠', name: 'Инфинити', minPoints: 701, maxPoints: 1000 },
];

export const getBadgeForPoints = (points: number): BadgeInfo => {
  // Find the appropriate badge based on points
  const badge = BADGE_CATEGORIES.find(
    (b) => points >= b.minPoints && points <= b.maxPoints
  );
  
  // If points exceed maximum, return highest badge
  if (points > 1000) {
    return BADGE_CATEGORIES[BADGE_CATEGORIES.length - 1];
  }
  
  // Default to first badge if below minimum
  return badge || BADGE_CATEGORIES[0];
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
