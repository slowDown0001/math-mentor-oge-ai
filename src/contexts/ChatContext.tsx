
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  problemId?: string;
}

interface ChatContextType {
  messages: Message[];
  isTyping: boolean;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setIsTyping: (isTyping: boolean) => void;
  resetChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const resetChat = () => {
    setMessages([]);
    setIsTyping(false);
  };

  return (
    <ChatContext.Provider value={{
      messages,
      isTyping,
      addMessage,
      setMessages,
      setIsTyping,
      resetChat
    }}>
      {children}
    </ChatContext.Provider>
  );
};
