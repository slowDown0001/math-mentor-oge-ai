import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import { sendChatMessage } from "@/services/chatService";
import { useChatContext } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useEffect } from "react";
import { motion } from "framer-motion";

const ChatDock = () => {
  const { messages, isTyping, isDatabaseMode, setMessages, setIsTyping, addMessage } = useChatContext();
  const { user } = useAuth();
  const { getDisplayName } = useProfile();
  const userName = getDisplayName();

  // Initialize with a welcome message if empty
  useEffect(() => {
    if (messages.length === 0 && user) {
      const welcomeMessage = {
        id: 1,
        text: `Привет, ${userName}! Я твой помощник по математике. Задавай любые вопросы! 🤖`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length, user, userName, setMessages]);

  const handleSendMessage = async (userInput: string) => {
    if (userInput.trim() === "") return;

    const newUserMessage = {
      id: messages.length + 1,
      text: userInput,
      isUser: true,
      timestamp: new Date()
    };
    
    addMessage(newUserMessage);
    setIsTyping(true);

    try {
      const aiResponse = await sendChatMessage(newUserMessage, messages, isDatabaseMode);
      addMessage(aiResponse);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            🤖 Чат-помощник
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Chat Messages Area */}
          <div className="flex-1 min-h-0 max-h-[600px]">
            <ChatMessages 
              messages={messages} 
              isTyping={isTyping}
            />
          </div>
          
          {/* Chat Input */}
          <div className="border-t border-border bg-card">
            <div className="p-2">
              <ChatInput 
                onSendMessage={handleSendMessage} 
                isTyping={isTyping}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ChatDock;