
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import { type Message } from "../ChatSection";
import { kaTeXManager } from "@/hooks/useMathJaxInitializer";

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
}

const ChatMessages = ({ messages, isTyping }: ChatMessagesProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to bottom when new messages come in and re-render MathJax
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        // Use requestAnimationFrame to wait for React's DOM updates
        requestAnimationFrame(() => {
          try {
            // Re-render all KaTeX content when messages change
            kaTeXManager.renderAll();
          } catch (error) {
            // Silently ignore rendering errors during DOM updates
          }
          // Scroll to bottom after a brief delay to ensure rendering is complete
          requestAnimationFrame(() => {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          });
        });
      }
    }
  }, [messages, isTyping]);

  return (
    <ScrollArea className="flex-1 bg-background" ref={scrollAreaRef}>
      <div className="p-6 flex flex-col space-y-6 max-w-3xl mx-auto">
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isTyping && <TypingIndicator />}
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;
