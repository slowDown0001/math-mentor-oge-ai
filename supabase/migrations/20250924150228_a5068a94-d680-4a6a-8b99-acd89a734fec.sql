-- Create textbook_progress table for logging student activities
CREATE TABLE IF NOT EXISTS public.textbook_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  activity TEXT NOT NULL,
  work_done TEXT NOT NULL,
  solved_count INTEGER,
  total_questions INTEGER,
  skills_involved TEXT,
  module_id TEXT,
  item_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.textbook_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own textbook progress" 
ON public.textbook_progress 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own textbook progress" 
ON public.textbook_progress 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_textbook_progress_user_id ON public.textbook_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_textbook_progress_activity_type ON public.textbook_progress(activity_type);
CREATE INDEX IF NOT EXISTS idx_textbook_progress_created_at ON public.textbook_progress(created_at);