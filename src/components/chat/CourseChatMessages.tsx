import { useEffect, useRef, useState } from "react";
import { type Message } from "@/contexts/ChatContext";
import CourseChatMessage from "./CourseChatMessage";
import TypingIndicator from "./TypingIndicator";
import { ChevronDown } from "lucide-react";
import { mathJaxManager } from "@/hooks/useMathJaxInitializer";

interface CourseChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
}

const CourseChatMessages = ({ messages, isTyping }: CourseChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      setShowScrollButton(!isNearBottom && messages.length > 0);
    }
  };

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive, unless user has scrolled up
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      
      if (isNearBottom) {
        // Process MathJax for visible messages first, then scroll
        const visibleMessages = containerRef.current.querySelectorAll('[data-message]');
        const promises = Array.from(visibleMessages).map(msg => 
          mathJaxManager.renderMath(msg as HTMLElement)
        );
        
        Promise.all(promises).then(() => {
          setTimeout(() => {
            scrollToBottom();
          }, 50);
        });
      }
    }
  }, [messages, isTyping]);

  return (
    <div className="relative h-full">
      <div 
        ref={containerRef}
        onScroll={handleScroll}
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

      {/* Floating scroll-to-bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 
                     hover:from-blue-400 hover:to-purple-500 text-white rounded-full shadow-lg 
                     transform transition-all duration-300 ease-in-out hover:scale-105 
                     hover:shadow-xl hover:shadow-blue-500/30 animate-fade-in z-10"
          aria-label="Scroll to latest message"
        >
          <ChevronDown className="w-5 h-5 mx-auto" />
        </button>
      )}
    </div>
  );
};

export default CourseChatMessages;