-- Add course_id column to student_mastery table
ALTER TABLE public.student_mastery 
ADD COLUMN course_id TEXT;