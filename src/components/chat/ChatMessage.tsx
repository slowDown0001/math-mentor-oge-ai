
import { type Message } from "../ChatSection";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
      <div 
        className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
          message.isUser 
            ? "bg-gradient-to-br from-primary to-primary/80 text-white rounded-tr-none" 
            : "bg-white/80 border border-gray-200/50 rounded-tl-none"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
        <div className={`text-xs mt-1 ${message.isUser ? "text-primary-foreground/80" : "text-gray-400"}`}>
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
