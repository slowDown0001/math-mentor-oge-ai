-- Add courses column to profiles table to track user course selections
-- We cannot modify auth.users table as it's managed by Supabase
-- Instead we'll add the courses column to the existing profiles table

ALTER TABLE public.profiles 
ADD COLUMN courses integer[] DEFAULT '{}';

-- Create index for better performance when querying courses
CREATE INDEX idx_profiles_courses ON public.profiles USING GIN(courses);