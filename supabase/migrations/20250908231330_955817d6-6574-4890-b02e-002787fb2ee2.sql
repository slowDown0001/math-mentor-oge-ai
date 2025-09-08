-- Add goal columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN course_1_goal TEXT,
ADD COLUMN course_2_goal TEXT,
ADD COLUMN course_3_goal TEXT;