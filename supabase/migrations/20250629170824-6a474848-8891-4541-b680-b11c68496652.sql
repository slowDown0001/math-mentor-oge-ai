
-- Create a table to store user streak preferences and daily activity
CREATE TABLE public.user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  daily_goal_minutes integer NOT NULL DEFAULT 30,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_activity_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Create a table to track daily activities
CREATE TABLE public.daily_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type text NOT NULL, -- 'article', 'video', 'problem', 'practice_test'
  duration_minutes integer DEFAULT 0,
  activity_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_streaks
CREATE POLICY "Users can view their own streak data" 
  ON public.user_streaks 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streak data" 
  ON public.user_streaks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streak data" 
  ON public.user_streaks 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS policies for daily_activities
CREATE POLICY "Users can view their own activities" 
  ON public.daily_activities 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" 
  ON public.daily_activities 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically create streak record when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_streak()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_streaks (user_id, daily_goal_minutes)
  VALUES (NEW.id, 30);
  RETURN NEW;
END;
$$;

-- Trigger to create streak record for new users
CREATE TRIGGER on_auth_user_created_streak
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_streak();
