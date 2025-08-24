-- Add default value 0.0 to cusum_s column in student_mastery table
ALTER TABLE public.student_mastery 
ALTER COLUMN cusum_s SET DEFAULT 0.0;