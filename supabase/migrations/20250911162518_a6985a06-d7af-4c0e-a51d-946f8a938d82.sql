-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN telegram_code bigint,
ADD COLUMN telegram_user_id bigint,
ADD COLUMN telegram_input text,
ADD COLUMN image_proccessing_command text;