
import { type Message } from "../ChatSection";
import { useEffect, useState } from "react";
import { getMathProblemById, type MathProblem } from "@/services/mathProblemsService";
import ChatRenderer2 from "./ChatRenderer2";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const [problemImage, setProblemImage] = useState<string | null>(null);
  
  useEffect(() => {
    // If message has a problemId, fetch the problem to get the image
    if (message.problemId && !message.isUser) {
      getMathProblemById(message.problemId).then(problem => {
        if (problem?.problem_image) {
          setProblemImage(problem.problem_image);
        }
      });
    }
  }, [message.problemId]);
  
  return (
    <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"} animate-fade-in mb-6`}>
      <div className={`max-w-[80%] ${message.isUser ? "ml-12" : "mr-12"}`}>
        {/* Show problem image if available */}
        {problemImage && !message.isUser && (
          <div className="mb-3">
            <img 
              src={problemImage} 
              alt="Изображение к задаче" 
              className="max-w-full h-auto rounded-lg border border-gray-200"
              onError={(e) => {
                console.error('Failed to load problem image:', problemImage);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div className={`${message.isUser ? "text-foreground" : "text-foreground"}`}>
          <ChatRenderer2 text={message.text} isUserMessage={message.isUser} />
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
