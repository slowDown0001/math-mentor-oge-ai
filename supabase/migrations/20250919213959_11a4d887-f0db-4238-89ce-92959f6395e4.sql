-- Create stories_and_telegram table
CREATE TABLE public.stories_and_telegram (
  upload_id INTEGER PRIMARY KEY,
  user_id UUID,
  task TEXT,
  telegram_user_id BIGINT,
  problem_submission_id UUID,
  telegram_upload_content TEXT,
  seen NUMERIC DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.stories_and_telegram ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own stories" 
ON public.stories_and_telegram 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stories" 
ON public.stories_and_telegram 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stories" 
ON public.stories_and_telegram 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Insert 5 sample rows with existing user_ids from profiles table
WITH existing_users AS (
  SELECT user_id, ROW_NUMBER() OVER () as rn 
  FROM profiles 
  LIMIT 5
)
INSERT INTO public.stories_and_telegram (upload_id, user_id)
SELECT rn, user_id 
FROM existing_users;