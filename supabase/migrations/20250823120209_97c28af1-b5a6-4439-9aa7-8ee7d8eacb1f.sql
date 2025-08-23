-- Create student_mastery table
CREATE TABLE public.student_mastery (
  user_id UUID NOT NULL REFERENCES auth.users(id),
  entity_type VARCHAR(20) NOT NULL,
  entity_id INTEGER NOT NULL,
  alpha FLOAT NOT NULL,
  beta FLOAT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, entity_type, entity_id)
);

-- Enable Row Level Security
ALTER TABLE public.student_mastery ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own mastery data" 
ON public.student_mastery 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mastery data" 
ON public.student_mastery 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mastery data" 
ON public.student_mastery 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic updated_at updates
CREATE TRIGGER update_student_mastery_updated_at
BEFORE UPDATE ON public.student_mastery
FOR EACH ROW
EXECUTE FUNCTION public.update_mastery_updated_at();