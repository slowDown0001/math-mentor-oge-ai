-- Create table to track read articles for users
CREATE TABLE public.read_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL,
  date_read TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- Enable RLS
ALTER TABLE public.read_articles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own read articles" 
ON public.read_articles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own read articles" 
ON public.read_articles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own read articles" 
ON public.read_articles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_read_articles_user_skill ON public.read_articles (user_id, skill_id);