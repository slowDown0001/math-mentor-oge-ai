-- Add comprehensive tracking columns to homework_progress table
ALTER TABLE public.homework_progress 
ADD COLUMN session_id uuid DEFAULT gen_random_uuid(),
ADD COLUMN homework_date date DEFAULT CURRENT_DATE,
ADD COLUMN started_at timestamp with time zone DEFAULT now(),
ADD COLUMN completed_at timestamp with time zone,
ADD COLUMN question_id text,
ADD COLUMN question_type text CHECK (question_type IN ('mcq', 'fipi')),
ADD COLUMN user_answer text,
ADD COLUMN correct_answer text,
ADD COLUMN is_correct boolean,
ADD COLUMN showed_solution boolean DEFAULT false,
ADD COLUMN response_time_seconds integer,
ADD COLUMN attempt_number integer DEFAULT 1,
ADD COLUMN difficulty_level integer,
ADD COLUMN skill_ids integer[],
ADD COLUMN problem_number integer,
ADD COLUMN confidence_level integer CHECK (confidence_level BETWEEN 1 AND 5),
ADD COLUMN total_questions integer,
ADD COLUMN questions_completed integer,
ADD COLUMN questions_correct integer,
ADD COLUMN accuracy_percentage decimal(5,2),
ADD COLUMN completion_status text DEFAULT 'in_progress' CHECK (completion_status IN ('in_progress', 'completed', 'abandoned'));

-- Enable RLS on homework_progress table
ALTER TABLE public.homework_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for homework_progress
CREATE POLICY "Users can insert their own homework progress" 
ON public.homework_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own homework progress" 
ON public.homework_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own homework progress" 
ON public.homework_progress 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create index for better performance on user queries
CREATE INDEX idx_homework_progress_user_session ON public.homework_progress(user_id, session_id);
CREATE INDEX idx_homework_progress_user_date ON public.homework_progress(user_id, homework_date);