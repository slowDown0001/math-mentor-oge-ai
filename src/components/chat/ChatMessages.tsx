
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import { type Message } from "../ChatSection";

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
}

const ChatMessages = ({ messages, isTyping }: ChatMessagesProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to bottom when new messages come in
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        // Delay scroll to bottom slightly to allow MathJax rendering to complete
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }, 100);
      }
    }
  }, [messages, isTyping]);

  return (
    <ScrollArea className="h-96 bg-gray-50/80" ref={scrollAreaRef}>
      <div className="p-4 flex flex-col space-y-4">
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isTyping && <TypingIndicator />}
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;
