-- Create table to store raw OpenRouter outputs from photo analysis
CREATE TABLE public.photo_analysis_outputs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question_id TEXT,
  raw_output TEXT NOT NULL,
  analysis_type TEXT DEFAULT 'photo_solution',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.photo_analysis_outputs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own photo analysis outputs" 
ON public.photo_analysis_outputs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own photo analysis outputs" 
ON public.photo_analysis_outputs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);