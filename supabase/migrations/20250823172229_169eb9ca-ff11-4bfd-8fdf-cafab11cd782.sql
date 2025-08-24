-- Create student_activity table for tracking student attempts
CREATE TABLE public.student_activity (
  attempt_id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  question_id TEXT NOT NULL,
  answer_time_start TIMESTAMP WITH TIME ZONE NOT NULL,
  finished_or_not BOOLEAN NOT NULL,
  is_correct BOOLEAN,
  duration_answer FLOAT,
  scores_fipi INTEGER,
  skills INTEGER[],
  topics INTEGER[],
  problem_number_type INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.student_activity ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own activity" 
ON public.student_activity 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity" 
ON public.student_activity 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity" 
ON public.student_activity 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_student_activity_updated_at
BEFORE UPDATE ON public.student_activity
FOR EACH ROW
EXECUTE FUNCTION public.update_user_statistics_updated_at();

-- Create index for better performance on user queries
CREATE INDEX idx_student_activity_user_id ON public.student_activity(user_id);
CREATE INDEX idx_student_activity_question_id ON public.student_activity(question_id);
CREATE INDEX idx_student_activity_answer_time ON public.student_activity(answer_time_start);