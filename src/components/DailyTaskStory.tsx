import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface StoryData {
  upload_id: number;
  task: string;
  seen: number;
  created_at: string;
}

export const DailyTaskStory = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [task, setTask] = useState('');
  const [storyId, setStoryId] = useState<number | null>(null);
  const [seen, setSeen] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      try {
        // Fetch avatar from profiles (using full_name as fallback since tutor_avatar_url doesn't exist)
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('user_id', user.id)
          .single();

        if (profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        } else {
          // Use a default avatar URL if none exists
          setAvatarUrl('https://api.dicebear.com/7.x/avataaars/svg?seed=tutor');
        }

        // Fetch latest story for this user
        const { data: stories } = await supabase
          .from('stories_and_telegram')
          .select('upload_id, task, created_at, seen')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (stories && stories.length > 0) {
          const story = stories[0];
          setTask(story.task || '');
          setStoryId(story.upload_id);
          setSeen(story.seen);
        }
      } catch (error) {
        console.error('Error fetching story data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user]);

  async function handleOpen() {
    setIsOpen(true);

    // Mark story as seen
    if (storyId && seen === 0) {
      try {
        await supabase
          .from('stories_and_telegram')
          .update({ seen: 1 })
          .eq('upload_id', storyId);

        setSeen(1);
      } catch (error) {
        console.error('Error updating story seen status:', error);
      }
    }
  }

  // Don't render if no user or loading
  if (!user || isLoading) return null;

  // Don't render if no avatar URL
  if (!avatarUrl) return null;

  return (
    <>
      {/* Avatar Circle */}
      <div className="flex justify-center mb-4">
        <div
          className={`w-16 h-16 rounded-full overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 ${
            seen === 0 
              ? 'p-1 bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500' 
              : 'border-2 border-muted'
          }`}
          onClick={handleOpen}
        >
          <div className="w-full h-full rounded-full overflow-hidden bg-background">
            <img
              src={avatarUrl}
              alt="AI Tutor Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Story Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-sm h-[600px] bg-gradient-to-br from-background to-muted rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border/20">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img
                  src={avatarUrl}
                  alt="AI Tutor Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-semibold text-foreground">AI Tutor</span>
              
              {/* Close button */}
              <button
                className="ml-auto w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Task Content */}
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="text-lg font-medium text-foreground leading-relaxed">
                  {task || 'У вас пока нет новых заданий. Продолжайте практиковаться!'}
                </div>
              </div>
            </div>

            {/* Progress bar (decorative) */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
              <div className="h-full w-full bg-primary"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};