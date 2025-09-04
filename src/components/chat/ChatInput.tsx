
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import DatabaseToggle from "./DatabaseToggle";

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
    <div className="bg-transparent">
      <div className="p-3 border-b border-border/30">
        <DatabaseToggle />
      </div>
      <div className="p-4">
        <div className="flex gap-3 items-center bg-gray-100/90 backdrop-blur-sm rounded-2xl p-3 shadow-inner">
          <Input 
            value={userInput} 
            onChange={e => setUserInput(e.target.value)} 
            onKeyDown={handleKeyDown} 
            placeholder="Напишите вопрос..." 
            className="flex-1 border-0 bg-transparent focus:ring-0 text-base placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0" 
            disabled={isTyping}
          />
          <Button 
            onClick={handleSendMessage} 
            size="icon"
            className="bg-purple-600 hover:bg-purple-700 rounded-full w-10 h-10 p-0 transition-all duration-200 shadow-md" 
            disabled={!userInput.trim() || isTyping}
          >
            <Send className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
