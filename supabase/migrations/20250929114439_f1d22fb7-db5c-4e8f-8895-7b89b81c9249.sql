-- Enable real-time updates for chat_logs table
ALTER TABLE public.chat_logs REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_logs;