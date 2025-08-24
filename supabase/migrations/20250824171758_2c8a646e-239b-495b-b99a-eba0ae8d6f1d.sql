-- Add cusum_s column to student_mastery table
ALTER TABLE public.student_mastery 
ADD COLUMN cusum_s FLOAT;