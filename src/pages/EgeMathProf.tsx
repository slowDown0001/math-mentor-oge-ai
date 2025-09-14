import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useChatContext } from "@/contexts/ChatContext";
import CourseChatMessages from "@/components/chat/CourseChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import { sendChatMessage } from "@/services/chatService";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useMathJaxInitializer } from "@/hooks/useMathJaxInitializer";
import { loadChatHistory, saveChatLog, type ChatLog } from "@/services/chatLogsService";

const EgeMathProf = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, isTyping, isDatabaseMode, setMessages, setIsTyping, addMessage } = useChatContext();
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Пользователь';
  
  // Chat history state
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyOffset, setHistoryOffset] = useState(0);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  
  // Initialize MathJax
  useMathJaxInitializer();

  // Load initial chat history or show welcome messages
  useEffect(() => {
    const loadInitialHistory = async () => {
      if (!user || isHistoryLoaded) return;

      try {
        const history = await loadChatHistory('3', 3, 0);
        
        if (history.length > 0) {
          // Convert chat logs to messages format
          const historyMessages = history.reverse().flatMap((log: ChatLog, index: number) => [
            {
              id: Date.now() + index * 2,
              text: log.user_message,
              isUser: true,
              timestamp: new Date(log.time_of_user_message)
            },
            {
              id: Date.now() + index * 2 + 1,
              text: log.response,
              isUser: false,
              timestamp: new Date(log.time_of_response)
            }
          ]);
          
          setMessages(historyMessages);
          setHistoryOffset(3);
          setHasMoreHistory(history.length === 3);
        } else {
          // Show welcome messages if no history
          setMessages([
            {
              id: 1,
              text: `Привет, ${userName}! Я твой ИИ-репетитор по ЕГЭ профильной математике. Готов разобрать сложные задачи и концепции!`,
              isUser: false,
              timestamp: new Date()
            },
            {
              id: 2,
              text: "Хочешь решить задачи повышенной сложности или изучить продвинутые темы?",
              isUser: false,
              timestamp: new Date()
            }
          ]);
          setHasMoreHistory(false);
        }
        setIsHistoryLoaded(true);
      } catch (error) {
        console.error('Error loading chat history:', error);
        // Show welcome messages on error
        setMessages([
          {
            id: 1,
            text: `Привет, ${userName}! Я твой ИИ-репетитор по ЕГЭ профильной математике. Готов разобрать сложные задачи и концепции!`,
            isUser: false,
            timestamp: new Date()
          },
          {
            id: 2,
            text: "Хочешь решить задачи повышенной сложности или изучить продвинутые темы?",
            isUser: false,
            timestamp: new Date()
          }
        ]);
        setIsHistoryLoaded(true);
        setHasMoreHistory(false);
      }
    };

    loadInitialHistory();
  }, [user, userName, setMessages, isHistoryLoaded]);

  const loadMoreHistory = async () => {
    if (!user || isLoadingHistory || !hasMoreHistory) return;

    setIsLoadingHistory(true);
    try {
      const history = await loadChatHistory('3', 3, historyOffset);
      
      if (history.length > 0) {
        const historyMessages = history.reverse().flatMap((log: ChatLog, index: number) => [
          {
            id: historyOffset * 1000 + index * 2,
            text: log.user_message,
            isUser: true,
            timestamp: new Date(log.time_of_user_message)
          },
          {
            id: historyOffset * 1000 + index * 2 + 1,
            text: log.response,
            isUser: false,
            timestamp: new Date(log.time_of_response)
          }
        ]);
        
        setMessages([...historyMessages, ...messages]);
        setHistoryOffset(prev => prev + history.length);
        setHasMoreHistory(history.length === 3);
      } else {
        setHasMoreHistory(false);
      }
    } catch (error) {
      console.error('Error loading more history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSendMessage = async (userInput: string) => {
    // Add user message
    const newUserMessage = {
      id: messages.length + 1,
      text: userInput,
      isUser: true,
      timestamp: new Date()
    };
    
    addMessage(newUserMessage);
    setIsTyping(true);

    try {
      // Send message to AI and get response
      const aiResponse = await sendChatMessage(newUserMessage, messages, isDatabaseMode);
      addMessage(aiResponse);
      
      // Save chat interaction to database
      await saveChatLog(userInput, aiResponse.text, '3');
    } catch (error) {
      console.error('Error in chat:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNavigateToProfile = () => {
    navigate("/mydashboard");
  };

  const handlePracticeClick = () => {
    navigate("/egemathprof-practice");
  };

  const handleTextbookClick = () => {
    navigate("/new-textbook");
  };

  const handleProgressClick = () => {
    // TODO: Add progress functionality
    console.log("Progress clicked");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-muted/20 relative overflow-hidden">
      {/* Background glassmorphism panel */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-primary/5 backdrop-blur-sm" />
      
      {/* Top-right profile button */}
      <div className="absolute top-6 right-6 z-10">
        <Button
          onClick={handleNavigateToProfile}
          className="group relative px-6 py-3 bg-gradient-to-r from-yellow-200 to-yellow-300 
                     hover:from-yellow-300 hover:to-yellow-400 
                     text-black font-medium rounded-2xl shadow-lg 
                     transform transition-all duration-300 ease-in-out
                     hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/30
                     active:scale-95 active:transition-all active:duration-150"
        >
          <User className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
          Профиль
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Button>
      </div>

      {/* Left side menu */}
      <div className="absolute left-8 top-1/2 transform -translate-y-1/2 z-10">
        <div className="flex flex-col space-y-6">
          <Button
            onClick={handlePracticeClick}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-400 via-purple-500 to-purple-600 
                       hover:from-blue-300 hover:via-purple-400 hover:to-purple-500
                       text-white font-medium rounded-2xl shadow-lg min-w-[160px]
                       transform transition-all duration-300 ease-in-out
                       hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30
                       active:scale-95 active:transition-all active:duration-150"
          >
            Практика
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>

          <Button
            onClick={handleTextbookClick}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-400 via-purple-500 to-purple-600 
                       hover:from-blue-300 hover:via-purple-400 hover:to-purple-500
                       text-white font-medium rounded-2xl shadow-lg min-w-[160px]
                       transform transition-all duration-300 ease-in-out
                       hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30
                       active:scale-95 active:transition-all active:duration-150"
          >
            Учебник
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>

          <Button
            onClick={handleProgressClick}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-400 via-purple-500 to-purple-600 
                       hover:from-blue-300 hover:via-purple-400 hover:to-purple-500
                       text-white font-medium rounded-2xl shadow-lg min-w-[160px]
                       transform transition-all duration-300 ease-in-out
                       hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30
                       active:scale-95 active:transition-all active:duration-150"
          >
            <div className="flex flex-col items-center">
              <div>Личный кабинет</div>
              <div className="text-sm">ЕГЭ Профильная Математика</div>
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </div>
      </div>

      {/* Top-left title */}
      <div className="absolute top-6 left-6 z-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ЕГЭ Профильная Математика
        </h1>
      </div>

      {/* Chat window */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-2xl px-6 bottom-32">
        <div id="chat-window" className="relative h-full bg-white/40 backdrop-blur-[12px] rounded-2xl shadow-2xl overflow-hidden">
          <CourseChatMessages 
            messages={messages} 
            isTyping={isTyping}
            onLoadMoreHistory={loadMoreHistory}
            isLoadingHistory={isLoadingHistory}
            hasMoreHistory={hasMoreHistory}
          />
        </div>
      </div>

      {/* Bottom center prompt bar */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-2xl px-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 
                          rounded-2xl blur-sm transform scale-105" />
          <div className="relative bg-background/80 backdrop-blur-md border border-primary/20 rounded-2xl 
                           shadow-2xl">
            <ChatInput onSendMessage={handleSendMessage} isTyping={isTyping} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EgeMathProf;