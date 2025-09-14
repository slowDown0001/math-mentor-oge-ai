-- Create chat_logs table for storing chat history
CREATE TABLE public.chat_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  user_message text NOT NULL,
  time_of_user_message timestamp with time zone NOT NULL DEFAULT now(),
  response text NOT NULL,
  time_of_response timestamp with time zone NOT NULL DEFAULT now(),
  course_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own chat logs" 
ON public.chat_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat logs" 
ON public.chat_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance on user queries
CREATE INDEX idx_chat_logs_user_course ON public.chat_logs(user_id, course_id, time_of_user_message DESC);