-- Create user statistics table for tracking profile metrics
CREATE TABLE public.user_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  completed_lessons INTEGER NOT NULL DEFAULT 0,
  practice_problems INTEGER NOT NULL DEFAULT 0,
  quizzes_completed INTEGER NOT NULL DEFAULT 0,
  average_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own statistics" 
ON public.user_statistics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own statistics" 
ON public.user_statistics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own statistics" 
ON public.user_statistics 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_user_statistics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_statistics_updated_at
BEFORE UPDATE ON public.user_statistics
FOR EACH ROW
EXECUTE FUNCTION public.update_user_statistics_updated_at();

-- Add RLS policy to student_skills table if not exists
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own skills" 
ON public.student_skills 
FOR SELECT 
USING (auth.uid() = uid);

CREATE POLICY "Users can create their own skills" 
ON public.student_skills 
FOR INSERT 
WITH CHECK (auth.uid() = uid);

CREATE POLICY "Users can update their own skills" 
ON public.student_skills 
FOR UPDATE 
USING (auth.uid() = uid);