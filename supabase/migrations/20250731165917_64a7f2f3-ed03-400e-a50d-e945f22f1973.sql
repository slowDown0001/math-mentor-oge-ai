-- Update streak for alex@example.ru to 17 days
UPDATE public.user_streaks 
SET current_streak = 17,
    longest_streak = GREATEST(longest_streak, 17),
    updated_at = now()
WHERE user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'alex@example.ru'
);