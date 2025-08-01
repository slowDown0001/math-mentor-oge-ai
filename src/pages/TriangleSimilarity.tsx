import { useState, useEffect } from "react";
import { Book, Search, Star, ChevronRight, ChevronDown, FileText, Highlighter, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import MathRenderer from "@/components/MathRenderer";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import { useChatContext } from "@/contexts/ChatContext";
import { sendChatMessage } from "@/services/chatService";
import { supabase } from "@/integrations/supabase/client";

// Skill 121 data
const skill121 = {
  id: 121,
  skill: "Признаки подобия треугольников"
};

interface Article {
  skill: number;
  art: string;
  img1?: string;
  img2?: string;
  img3?: string;
}

const TriangleSimilarity = () => {
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [isSelecterActive, setIsSelecterActive] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { messages, isTyping, isDatabaseMode, setMessages, setIsTyping, addMessage } = useChatContext();

  // Fetch article for skill 121 from Supabase articles2 table
  useEffect(() => {
    const fetchArticle = async () => {
      setLoadingArticle(true);
      try {
        const { data, error } = await supabase
          .from('articles2')
          .select('skill, art, img1, img2, img3')
          .eq('skill', 121)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching article:', error);
          setArticle(null);
        } else if (data) {
          setArticle(data as unknown as Article);
        }
      } catch (error) {
        console.error('Error:', error);
        setArticle(null);
      } finally {
        setLoadingArticle(false);
      }
    };

    fetchArticle();
  }, []);

  const handleGoToExercise = (skillId: number) => {
    navigate(`/mcq-practice?skill=${skillId}`);
  };

  const toggleSelecter = () => {
    setIsSelecterActive(!isSelecterActive);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const text = selection.toString().trim();
      setSelectedText(text);
      
      if (isSelecterActive) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.backgroundColor = 'yellow';
        span.style.padding = '1px 2px';
        
        try {
          range.surroundContents(span);
          selection.removeAllRanges();
        } catch (error) {
          const contents = range.extractContents();
          span.appendChild(contents);
          range.insertNode(span);
          selection.removeAllRanges();
        }
      }
    }
  };

  const handleAskEzhik = async () => {
    if (!selectedText) return;
    
    setIsChatOpen(true);
    
    // Add user message with selected text and instruction for concise response
    const newUserMessage = {
      id: Date.now(),
      text: `Объясни коротко и по делу: "${selectedText}"`,
      isUser: true,
      timestamp: new Date()
    };
    
    addMessage(newUserMessage);
    setIsTyping(true);

    try {
      // Send message to AI and get response
      const aiResponse = await sendChatMessage(newUserMessage, messages, isDatabaseMode);
      addMessage(aiResponse);
    } finally {
      setIsTyping(false);
    }
    
    // Clear selected text
    setSelectedText("");
  };

  const handleSendChatMessage = async (userInput: string) => {
    const newUserMessage = {
      id: Date.now(),
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

  // Add event listener for text selection when selecter is active
  useEffect(() => {
    if (isSelecterActive) {
      document.addEventListener('mouseup', handleTextSelection);
      return () => {
        document.removeEventListener('mouseup', handleTextSelection);
      };
    }
  }, [isSelecterActive]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 font-heading">
              Навык 121: Признаки подобия треугольников
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Изучение признаков подобия треугольников для подготовки к ОГЭ
            </p>
          </div>

          {/* Selected Text and Ask Ёжик Button */}
          {selectedText && (
            <div className="fixed top-24 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-md">
              <div className="flex items-start gap-2 mb-3">
                <MessageCircle className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">Выделенный текст:</p>
                  <p className="text-sm text-gray-600 line-clamp-3">"{selectedText}"</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedText("")}
                  className="p-1 h-auto"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <Button 
                onClick={handleAskEzhik}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Спросить Ёжика
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
            {/* Chat Window */}
            {isChatOpen && (
              <div className="fixed left-4 top-24 bottom-4 w-[calc(25%-2rem)] z-40 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900">Чат с Ёжиком</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsChatOpen(false)}
                    className="p-1 h-auto"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex-1 flex flex-col min-h-0">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map(message => (
                        <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                          <div 
                            className={`max-w-[85%] p-3 rounded-lg text-sm ${
                              message.isUser 
                                ? "bg-blue-600 text-white rounded-tr-none" 
                                : "bg-gray-100 text-gray-900 rounded-tl-none"
                            }`}
                          >
                            <MathRenderer text={message.text} />
                            <div className={`text-xs mt-1 ${message.isUser ? "text-blue-100" : "text-gray-500"}`}>
                              {message.timestamp.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 text-gray-900 rounded-lg rounded-tl-none p-3 text-sm">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  
                  <div className="border-t p-4">
                    <ChatInput onSendMessage={handleSendChatMessage} isTyping={isTyping} />
                  </div>
                </div>
              </div>
            )}

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="w-5 h-5" />
                    Навигация
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => navigate('/textbook')}
                    >
                      ← Вернуться к учебнику
                    </Button>
                    
                    <div className="border-t pt-4">
                      <h3 className="font-medium text-gray-900 mb-2">Инструменты</h3>
                      <div className="space-y-2">
                        <Button
                          variant={isSelecterActive ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={toggleSelecter}
                        >
                          <Highlighter className="w-4 h-4 mr-2" />
                          {isSelecterActive ? "Выключить" : "Включить"} выделение
                        </Button>
                        
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => setIsChatOpen(true)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Открыть чат
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card className="min-h-[600px] bg-white">
                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl text-blue-900 mb-2">
                        {skill121.skill}
                      </CardTitle>
                      <CardDescription className="text-blue-700">
                        Навык #{skill121.id} • Геометрия
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSelecterActive && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Highlighter className="w-3 h-3 mr-1" />
                          Выделение включено
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {loadingArticle ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Загрузка материала...</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {article && article.art ? (
                        <>
                          {/* Article Images */}
                          {(article.img1 || article.img2 || article.img3) && (
                            <div className="mb-6 space-y-4">
                              {article.img1 && (
                                <img 
                                  src={article.img1} 
                                  alt="Иллюстрация к навыку" 
                                  className="w-full max-w-2xl mx-auto rounded-lg shadow-sm"
                                />
                              )}
                              {article.img2 && (
                                <img 
                                  src={article.img2} 
                                  alt="Иллюстрация к навыку" 
                                  className="w-full max-w-2xl mx-auto rounded-lg shadow-sm"
                                />
                              )}
                              {article.img3 && (
                                <img 
                                  src={article.img3} 
                                  alt="Иллюстрация к навыку" 
                                  className="w-full max-w-2xl mx-auto rounded-lg shadow-sm"
                                />
                              )}
                            </div>
                          )}
                          
                          <div 
                            className={`prose max-w-none ${
                              isSelecterActive ? 'cursor-text select-text' : ''
                            }`}
                            style={{ userSelect: isSelecterActive ? 'text' : 'auto' }}
                          >
                            <MathRenderer text={article.art} />
                          </div>
                          <div className="flex justify-center pt-6 border-t">
                            <Button 
                              onClick={() => handleGoToExercise(skill121.id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                            >
                              Перейти к упражнениям!
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12">
                          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Материал готовится
                          </h3>
                          <p className="text-gray-600 mb-6">
                            Содержимое для навыка "Признаки подобия треугольников" скоро будет добавлено
                          </p>
                          <Button 
                            onClick={() => handleGoToExercise(skill121.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                          >
                            Перейти к упражнениям!
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TriangleSimilarity;