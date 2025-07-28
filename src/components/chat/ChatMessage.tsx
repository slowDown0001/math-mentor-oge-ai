
import { type Message } from "../ChatSection";
import { useEffect, useState } from "react";
import { getMathProblemById, type MathProblem } from "@/services/mathProblemsService";
import MathRenderer from "@/components/MathRenderer";

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
    <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
      <div 
        className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
          message.isUser 
            ? "bg-gradient-to-br from-primary to-primary/80 text-white rounded-tr-none" 
            : "bg-white/80 border border-gray-200/50 rounded-tl-none"
        }`}
      >
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
        
        <MathRenderer text={message.text} isUserMessage={message.isUser} />
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
