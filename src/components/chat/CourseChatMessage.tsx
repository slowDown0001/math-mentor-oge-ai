import { type Message } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import ChatRenderer2 from "./ChatRenderer2";
import { kaTeXManager } from "@/hooks/useMathJaxInitializer";

interface CourseChatMessageProps {
  message: Message;
}

const CourseChatMessage = ({ message }: CourseChatMessageProps) => {
  const { user } = useAuth();
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (user && message.isUser) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('user_id', user.id)
            .single();
          
          setUserAvatar(profile?.avatar_url || null);
        } catch (error) {
          console.error('Error fetching user avatar:', error);
        }
      }
    };

    fetchUserAvatar();
  }, [user, message.isUser]);

  // Process KaTeX when message mounts and becomes visible
  useEffect(() => {
    if (!messageRef.current) return;

    // Process KaTeX immediately when message mounts
    const processMessage = () => {
      if (messageRef.current) {
        kaTeXManager.renderMath(messageRef.current);
      }
    };

    // Process immediately and after a short delay to ensure DOM is ready
    processMessage();
    const timeoutId = setTimeout(processMessage, 50);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            kaTeXManager.renderMath(entry.target as HTMLElement);
          }
        });
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    observer.observe(messageRef.current);

    return () => {
      clearTimeout(timeoutId);
      if (messageRef.current) {
        observer.unobserve(messageRef.current);
      }
    };
  }, [message.text]);

  const fallbackAvatar = "https://kbaazksvkvnafrwtmkcw.supabase.co/storage/v1/object/public/txtbkimg/kawaiiboy1.jpg";
  const aiAvatar = "https://kbaazksvkvnafrwtmkcw.supabase.co/storage/v1/object/public/txtbkimg/1001egechat_logo.png";
  
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (message.isUser) {
    return (
      <div ref={messageRef} data-message className="flex justify-end items-start gap-3 animate-fade-in slide-in-right mb-4">
        <div className="flex flex-col items-end max-w-[70%]">
          <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white font-medium text-[15px] px-4 py-3 rounded-2xl rounded-tr-md shadow-lg [&_.math-display]:text-center [&_.math-display]:my-3 [&_.math-inline]:text-white [&_.math-display]:text-white">
            <ChatRenderer2 text={message.text} isUserMessage={true} />
          </div>
          <span className="text-[11px] text-muted-foreground/70 mt-1 mr-2">
            {formatTime(message.timestamp)}
          </span>
        </div>
        <div className="flex-shrink-0">
          <img 
            src={userAvatar || fallbackAvatar}
            alt="User avatar"
            className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
            onError={(e) => {
              e.currentTarget.src = fallbackAvatar;
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div ref={messageRef} data-message className="flex justify-start items-start gap-3 animate-fade-in animate-scale-in mb-4">
      <div className="flex-shrink-0">
        <img 
          src={aiAvatar}
          alt="AI avatar"
          className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
        />
      </div>
      <div className="flex flex-col items-start max-w-[70%]">
        <div className="bg-white/60 backdrop-blur-md text-gray-800 text-[15px] px-4 py-3 rounded-2xl rounded-tl-md shadow-lg border border-white/30 [&_.math-display]:text-center [&_.math-display]:my-3 [&_.math-inline]:text-gray-800 [&_.math-display]:text-gray-800">
          <ChatRenderer2 text={message.text} isUserMessage={false} />
        </div>
        <span className="text-[11px] text-muted-foreground/70 mt-1 ml-2">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
};

export default CourseChatMessage;