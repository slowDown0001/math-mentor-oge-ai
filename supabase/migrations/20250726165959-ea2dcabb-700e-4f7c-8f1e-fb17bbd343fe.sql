-- Add energy_points column to user_statistics table
ALTER TABLE public.user_statistics 
ADD COLUMN energy_points INTEGER NOT NULL DEFAULT 0;