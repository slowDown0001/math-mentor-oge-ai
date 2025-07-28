
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import { type Message } from "../ChatSection";
import { mathJaxManager } from "@/hooks/useMathJaxInitializer";

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
        // Re-render all MathJax content when messages change
        mathJaxManager.renderAll().then(() => {
          // Delay scroll to bottom to allow MathJax rendering to complete
          setTimeout(() => {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          }, 150);
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
