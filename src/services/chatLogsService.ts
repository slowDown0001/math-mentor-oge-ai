import { supabase } from "@/integrations/supabase/client";

export interface ChatLog {
  id: string;
  user_id: string;
  user_message: string;
  time_of_user_message: string;
  response: string;
  time_of_response: string;
  course_id: string;
  created_at: string;
}

export const saveChatLog = async (
  userMessage: string,
  response: string,
  courseId: string
): Promise<void> => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('chat_logs')
    .insert({
      user_id: user.id,
      user_message: userMessage,
      response: response,
      course_id: courseId,
      time_of_user_message: new Date().toISOString(),
      time_of_response: new Date().toISOString()
    });

  if (error) {
    console.error('Error saving chat log:', error);
    throw error;
  }
};

export const loadChatHistory = async (
  courseId: string,
  limit: number = 3,
  offset: number = 0
): Promise<ChatLog[]> => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('chat_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .order('time_of_user_message', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error loading chat history:', error);
    throw error;
  }

  return data || [];
};