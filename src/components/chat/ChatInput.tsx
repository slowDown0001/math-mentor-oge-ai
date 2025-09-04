
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Database } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { useChatContext } from "@/contexts/ChatContext";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isTyping: boolean;
}

const ChatInput = ({ onSendMessage, isTyping }: ChatInputProps) => {
  const [userInput, setUserInput] = useState("");
  const { isDatabaseMode, setIsDatabaseMode } = useChatContext();

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
      <div className="p-4">
        <div className="flex gap-2 items-center bg-gray-100/90 backdrop-blur-sm rounded-2xl p-2 shadow-inner">
          <Toggle
            pressed={isDatabaseMode}
            onPressedChange={setIsDatabaseMode}
            variant="outline"
            size="sm"
            className={`shrink-0 h-8 w-8 p-0 rounded-lg border transition-all ${
              isDatabaseMode 
                ? 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200' 
                : 'border-gray-300 hover:bg-gray-200/50 text-gray-600'
            }`}
            title="База"
          >
            <Database className="h-4 w-4" />
          </Toggle>
          <Input 
            value={userInput} 
            onChange={e => setUserInput(e.target.value)} 
            onKeyDown={handleKeyDown} 
            placeholder={isDatabaseMode ? "Напиши 'дай задачу' и я дам тебе пример из нашей базы..." : "Напишите вопрос..."} 
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
