
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
    <div className="bg-background">
      <div className="p-3 border-b border-border">
        <DatabaseToggle />
      </div>
      <div className="p-4 flex gap-3">
        <Input 
          value={userInput} 
          onChange={e => setUserInput(e.target.value)} 
          onKeyDown={handleKeyDown} 
          placeholder="Задайте ваш вопрос по математике..." 
          className="flex-1 border-border focus:ring-primary/50 bg-background rounded-xl text-base py-3 px-4" 
          disabled={isTyping}
        />
        <Button 
          onClick={handleSendMessage} 
          size="icon"
          className="bg-primary hover:bg-primary/90 rounded-xl p-3 transition-all duration-200" 
          disabled={!userInput.trim() || isTyping}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
