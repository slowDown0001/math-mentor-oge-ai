
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isTyping: boolean;
}

const ChatInput = ({ onSendMessage, isTyping }: ChatInputProps) => {
  const [userInput, setUserInput] = useState("");

  const handleSendMessage = () => {
    if (userInput.trim() === "") return;
    onSendMessage(userInput);
    setUserInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200/30 backdrop-blur-sm bg-white/80 flex gap-2">
      <Input 
        value={userInput} 
        onChange={e => setUserInput(e.target.value)} 
        onKeyDown={handleKeyDown} 
        placeholder="Задайте ваш вопрос по математике..." 
        className="flex-1 border-gray-200/70 focus:ring-primary/50 bg-white rounded-lg" 
        disabled={isTyping}
      />
      <Button 
        onClick={handleSendMessage} 
        className="bg-primary hover:bg-primary/90 shadow-md transition-all duration-200 hover:scale-105" 
        disabled={!userInput.trim() || isTyping}
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ChatInput;
