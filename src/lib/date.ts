export function daysUntilNextMay24(today = new Date()): number {
  const currentYear = today.getFullYear();
  let targetDate = new Date(currentYear, 4, 24); // May is month 4 (0-indexed)
  
  // If May 24 has already passed this year, use next year
  if (today > targetDate) {
    targetDate = new Date(currentYear + 1, 4, 24);
  }
  
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}