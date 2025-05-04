import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}
const ChatSection = () => {
  const [messages, setMessages] = useState<Message[]>([{
    id: 1,
    text: "Hi! I'm your AI Math Tutor. Let's check your level first!",
    isUser: false,
    timestamp: new Date()
  }, {
    id: 2,
    text: "Would you like to take a placement test or try some practice problems?",
    isUser: false,
    timestamp: new Date()
  }]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const handleSendMessage = () => {
    if (userInput.trim() === "") return;

    // Add user message
    const newUserMessage = {
      id: messages.length + 1,
      text: userInput,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput("");
    setIsTyping(true);

    // Simulate AI response based on user input
    setTimeout(() => {
      let aiResponse = "";
      if (userInput.toLowerCase().includes("test")) {
        aiResponse = "Great! I'll prepare a placement test for you. This will help me understand your current level and create a personalized study plan.";
      } else if (userInput.toLowerCase().includes("practice") || userInput.toLowerCase().includes("problem")) {
        aiResponse = "Perfect! Let's try this algebra problem: Solve for x: 3x - 7 = 8. Take your time and let me know your answer.";
      } else if (userInput.toLowerCase().includes("hello") || userInput.toLowerCase().includes("hi")) {
        aiResponse = "Hello! I'm here to help you prepare for your OGE Math exam. What would you like to work on today?";
      } else {
        aiResponse = "I'd be happy to help with that. Would you like to focus on Algebra, Geometry, or Statistics today?";
      }
      const newAiMessage = {
        id: messages.length + 2,
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newAiMessage]);
      setIsTyping(false);
    }, 1500);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };
  return <section id="ai-tutor" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your AI Math Tutor</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ask questions, get explanations, and practice problems with immediate feedback.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white shadow-lg rounded-xl overflow-hidden border-0">
            <div className="bg-primary p-4">
              <h3 className="text-white font-medium">E}I{UK AI</h3>
            </div>
            
            <div className="h-96 p-4 overflow-y-auto flex flex-col space-y-4 bg-gray-50">
              {messages.map(message => <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${message.isUser ? "bg-primary text-white rounded-tr-none" : "bg-white shadow-sm border rounded-tl-none"}`}>
                    <p>{message.text}</p>
                    <div className={`text-xs mt-1 ${message.isUser ? "text-primary-foreground/80" : "text-gray-400"}`}>
                      {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                    </div>
                  </div>
                </div>)}
              
              {isTyping && <div className="flex justify-start">
                  <div className="bg-white shadow-sm border p-3 rounded-lg rounded-tl-none max-w-[80%]">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-100"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-200"></div>
                    </div>
                  </div>
                </div>}
            </div>
            
            <div className="p-4 border-t flex gap-2">
              <Input value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask your math question..." className="flex-1" />
              <Button onClick={handleSendMessage} className="bg-primary hover:bg-primary/90" disabled={!userInput.trim()}>
                Send
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>;
};
export default ChatSection;