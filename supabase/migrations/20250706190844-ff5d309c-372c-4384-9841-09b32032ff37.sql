-- Create mastery system tables for Учебник2

-- Table to track user mastery progress per unit/subunit
CREATE TABLE public.user_mastery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  unit_number INTEGER NOT NULL,
  subunit_number INTEGER,
  mastery_points INTEGER NOT NULL DEFAULT 0,
  total_possible_points INTEGER NOT NULL DEFAULT 0,
  mastery_level TEXT NOT NULL DEFAULT 'not_started' CHECK (mastery_level IN ('not_started', 'attempted', 'familiar', 'proficient', 'mastered')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table to track individual activity completions
CREATE TABLE public.user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('video', 'article', 'practice', 'quiz', 'unit_test')),
  unit_number INTEGER NOT NULL,
  subunit_number INTEGER,
  activity_id TEXT NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  time_spent_minutes INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.user_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for user_mastery
CREATE POLICY "Users can view their own mastery progress" 
ON public.user_mastery 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mastery progress" 
ON public.user_mastery 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mastery progress" 
ON public.user_mastery 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for user_activities
CREATE POLICY "Users can view their own activities" 
ON public.user_activities 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" 
ON public.user_activities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_mastery_user_unit ON public.user_mastery(user_id, unit_number, subunit_number);
CREATE INDEX idx_user_activities_user_unit ON public.user_activities(user_id, unit_number, subunit_number);

-- Create function to update mastery timestamps
CREATE OR REPLACE FUNCTION public.update_mastery_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_mastery_updated_at
  BEFORE UPDATE ON public.user_mastery
  FOR EACH ROW
  EXECUTE FUNCTION public.update_mastery_updated_at();