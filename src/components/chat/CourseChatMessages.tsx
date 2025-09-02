import { useEffect, useRef, useState } from "react";
import { type Message } from "@/contexts/ChatContext";
import CourseChatMessage from "./CourseChatMessage";
import TypingIndicator from "./TypingIndicator";
import { ChevronDown } from "lucide-react";
import { kaTeXManager } from "@/hooks/useMathJaxInitializer";

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

  const scrollToShowUserMessageAndResponse = () => {
    if (containerRef.current && messages.length > 0) {
      const container = containerRef.current;
      const lastMessage = messages[messages.length - 1];
      
      // If the last message is from user, scroll to show it plus space for AI response
      if (lastMessage.isUser) {
        // Scroll to show the user's message and leave space for AI response start
        const targetScrollTop = container.scrollHeight - container.clientHeight + 100;
        container.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: "smooth"
        });
      } else {
        // If AI message, scroll to show both user question and AI response start
        scrollToBottom();
      }
    }
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      setShowScrollButton(!isNearBottom && messages.length > 0);
    }
  };

  useEffect(() => {
    if (containerRef.current && messages.length > 0) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      const lastMessage = messages[messages.length - 1];
      
      // Process KaTeX for visible messages first
      const visibleMessages = containerRef.current.querySelectorAll('[data-message]');
      visibleMessages.forEach(msg => {
        kaTeXManager.renderMath(msg as HTMLElement);
      });
      
      // Force scroll when user sends a message, or auto-scroll if near bottom
      const shouldAutoScroll = isNearBottom || lastMessage.isUser;
      
      if (shouldAutoScroll) {
        setTimeout(() => {
          // If user just sent a message, scroll to show it plus space for AI response
          if (lastMessage.isUser) {
            scrollToShowUserMessageAndResponse();
          } else {
            // If AI is responding or finished, show the conversation naturally
            scrollToBottom();
          }
        }, 50);
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