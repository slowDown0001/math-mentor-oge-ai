-- Add exam_id column to profiles table for tracking exam sessions
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS exam_id UUID;