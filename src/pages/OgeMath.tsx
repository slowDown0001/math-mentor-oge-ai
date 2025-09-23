import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useChatContext } from "@/contexts/ChatContext";
import CourseChatMessages from "@/components/chat/CourseChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import { sendChatMessage } from "@/services/chatService";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useKaTeXInitializer } from "@/hooks/useMathJaxInitializer";
import { loadChatHistory, saveChatLog, type ChatLog } from "@/services/chatLogsService";
import { StreakDisplay } from "@/components/streak/StreakDisplay";
import { DailyTaskStory } from "@/components/DailyTaskStory";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const OgeMath = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, isTyping, isDatabaseMode, setMessages, setIsTyping, addMessage } = useChatContext();
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Пользователь';
  const { toast } = useToast();
  
  // State for chat history pagination
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyOffset, setHistoryOffset] = useState(0);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  
  // Initialize KaTeX
  useKaTeXInitializer();

  // Load initial chat history and welcome messages
  useEffect(() => {
    const loadInitialHistory = async () => {
      if (user && !isHistoryLoaded) {
        try {
          const history = await loadChatHistory('1', 3, 0);
          if (history.length > 0) {
            // Convert chat logs to messages format and reverse to show chronologically
            const historyMessages = history.reverse().flatMap((log, index) => [
              {
                id: index * 2 + 1,
                text: log.user_message,
                isUser: true,
                timestamp: new Date(log.time_of_user_message)
              },
              {
                id: index * 2 + 2,
                text: log.response,
                isUser: false,
                timestamp: new Date(log.time_of_response)
              }
            ]);
            
            setMessages(historyMessages);
            setHistoryOffset(3);
            setHasMoreHistory(history.length === 3);
          } else {
            // Set welcome messages if no history
            setMessages([
              {
                id: 1,
                text: `Привет, ${userName}! Я твой ИИ-репетитор по ОГЭ математике. Готов помочь тебе подготовиться к экзамену!`,
                isUser: false,
                timestamp: new Date()
              },
              {
                id: 2,
                text: "Хочешь пройти тренировочные задания или разобрать конкретную тему?",
                isUser: false,
                timestamp: new Date()
              }
            ]);
            setHasMoreHistory(false);
          }
          setIsHistoryLoaded(true);
        } catch (error) {
          console.error('Error loading chat history:', error);
          // Fallback to welcome messages
          setMessages([
            {
              id: 1,
              text: `Привет, ${userName}! Я твой ИИ-репетитор по ОГЭ математике. Готов помочь тебе подготовиться к экзамену!`,
              isUser: false,
              timestamp: new Date()
            },
            {
              id: 2,
              text: "Хочешь пройти тренировочные задания или разобрать конкретную тему?",
              isUser: false,
              timestamp: new Date()
            }
          ]);
          setIsHistoryLoaded(true);
          setHasMoreHistory(false);
        }
      }
    };

    loadInitialHistory();
  }, [user, userName, setMessages, isHistoryLoaded]);

  const loadMoreHistory = async () => {
    if (!hasMoreHistory || isLoadingHistory) return;
    
    setIsLoadingHistory(true);
    try {
      const history = await loadChatHistory('1', 3, historyOffset);
      if (history.length > 0) {
        // Convert chat logs to messages format and reverse to show chronologically
        const historyMessages = history.reverse().flatMap((log, index) => [
          {
            id: (historyOffset + index) * 2 + 1,
            text: log.user_message,
            isUser: true,
            timestamp: new Date(log.time_of_user_message)
          },
          {
            id: (historyOffset + index) * 2 + 2,
            text: log.response,
            isUser: false,
            timestamp: new Date(log.time_of_response)
          }
        ]);
        
        // Prepend history messages to current messages
        setMessages([...historyMessages, ...messages]);
        setHistoryOffset(prev => prev + 3);
        setHasMoreHistory(history.length === 3);
      } else {
        setHasMoreHistory(false);
      }
    } catch (error) {
      console.error('Error loading more history:', error);
      setHasMoreHistory(false);
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
      await saveChatLog(userInput, aiResponse.text, '1');
    } catch (error) {
      console.error('Error saving chat log:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNavigateToProfile = () => {
    navigate("/mydashboard");
  };

  const handlePracticeClick = () => {
    navigate("/ogemath-practice");
  };

  const handleTextbookClick = () => {
    navigate("/learning-platform");
  };

  const handleProgressClick = () => {
    navigate("/ogemath-progress2");
  };

  const handleCreateTask = async () => {
    if (!user) {
      toast({
        title: "Ошибка",
        description: "Необходимо войти в систему",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-task', {
        body: { user_id: user.id }
      });

      if (error) throw error;

      toast({
        title: "Задание создано",
        description: "Персональное задание успешно создано!",
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать задание",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Left Sidebar - Fixed */}
      <div className="w-64 h-full bg-sidebar border-r border-border flex-shrink-0">
        {/* Logo area */}
        <div className="p-4">
          <button 
            onClick={() => navigate("/mydb3")}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <img 
              src="https://kbaazksvkvnafrwtmkcw.supabase.co/storage/v1/object/public/txtbkimg/1001egechat_logo.png" 
              alt="EGEChat Logo" 
              className="w-8 h-8"
            />
            <span className="font-bold text-lg text-sidebar-foreground">EGEChat</span>
          </button>
        </div>
        
        {/* Menu items */}
        <div className="p-4 space-y-2">
          <Button
            onClick={handlePracticeClick}
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            Практика
          </Button>
          
          <Button
            onClick={handleTextbookClick}
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            Платформа
          </Button>
          
          <Button
            onClick={handleProgressClick}
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            Прогресс
          </Button>
          
          <Button
            onClick={handleCreateTask}
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            Создать задание
          </Button>
        </div>

        {/* Daily Task Story - 2 inches below Progress button */}
        <div className="px-4 mt-[144px]">
          <DailyTaskStory />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="h-14 border-b border-border bg-background flex items-center justify-between px-4">
          <h1 className="text-xl font-semibold">ОГЭ Математика</h1>
          {user && <StreakDisplay />}
        </div>

        {/* Chat Messages Area - Scrollable */}
        <div className="flex-1 overflow-hidden">
          <CourseChatMessages 
            messages={messages} 
            isTyping={isTyping} 
            onLoadMoreHistory={loadMoreHistory}
            isLoadingHistory={isLoadingHistory}
            hasMoreHistory={hasMoreHistory}
          />
        </div>

        {/* Chat Input Area - Fixed at bottom */}
        <div className="border-t border-border bg-background p-4">
          <div className="max-w-4xl mx-auto">
            <ChatInput onSendMessage={handleSendMessage} isTyping={isTyping} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OgeMath;