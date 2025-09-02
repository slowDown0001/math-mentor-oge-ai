import { useEffect, useRef } from "react";
import { type Message } from "@/contexts/ChatContext";
import CourseChatMessage from "./CourseChatMessage";
import TypingIndicator from "./TypingIndicator";

interface CourseChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
}

const CourseChatMessages = ({ messages, isTyping }: CourseChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive, unless user has scrolled up
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      
      if (isNearBottom) {
        scrollToBottom();
      }
    }
  }, [messages, isTyping]);

  return (
    <div 
      ref={containerRef}
      className="h-full overflow-y-auto p-4 space-y-4 scroll-smooth"
      style={{ fontFamily: 'Inter, Poppins, Montserrat, sans-serif' }}
    >
      {messages.length === 0 ? (
        <div className="text-muted-foreground/60 text-center py-8 text-sm">
          Начните беседу...
        </div>
      ) : (
        messages.map((message) => (
          <CourseChatMessage key={message.id} message={message} />
        ))
      )}
      
      {isTyping && (
        <div className="flex justify-start items-start gap-3 animate-fade-in">
          <div className="flex-shrink-0">
            <img 
              src="https://kbaazksvkvnafrwtmkcw.supabase.co/storage/v1/object/public/txtbkimg/1001egechat_logo.png"
              alt="AI avatar"
              className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
            />
          </div>
          <div className="bg-white/60 backdrop-blur-md px-4 py-3 rounded-2xl rounded-tl-md shadow-lg border border-white/30">
            <TypingIndicator />
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default CourseChatMessages;