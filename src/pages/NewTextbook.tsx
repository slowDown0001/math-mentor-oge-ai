import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import NewTextbookNavigation from "@/components/NewTextbookNavigation";
import NewTextbookArticle from "@/components/NewTextbookArticle";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import { useChatContext } from "@/contexts/ChatContext";
import { sendChatMessage } from "@/services/chatService";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Highlighter } from "lucide-react";
import syllabusData from "../../documentation/new_syllabus_hierarchy_topics_skills.json";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import "@/styles/style_for_textbook.css";

interface Unit {
  code: string;
  title: string;
  Topics: Topic[];
}

interface Topic {
  code: string;
  title: string;
  Skills: Skill[];
}

interface Skill {
  id: number;
  title: string;
}

interface Article {
  id: number;
  article_text: string;
  image_recommendations?: string;
  img1?: string;
  img2?: string;
  img3?: string;
  img4?: string;
  img5?: string;
  img6?: string;
  img7?: string;
}

const NewTextbook = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [readArticles, setReadArticles] = useState<Set<number>>(new Set());
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSelecterActive, setIsSelecterActive] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { user } = useAuth();
  const { messages, isTyping, isDatabaseMode, addMessage, setIsTyping } = useChatContext();

  const units: Unit[] = syllabusData.units;

  // Load read articles for the user
  useEffect(() => {
    const loadReadArticles = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('read_articles')
        .select('skill_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading read articles:', error);
      } else if (data) {
        setReadArticles(new Set(data.map(item => item.skill_id)));
      }
    };

    loadReadArticles();
  }, [user]);

  // Handle URL parameters for direct navigation
  useEffect(() => {
    const topicParam = searchParams.get('topic');
    const skillParam = searchParams.get('skill');

    // Priority: skill > topic (if both are present, skill wins)
    if (skillParam) {
      const skillId = parseInt(skillParam);
      const skill = findSkillById(skillId);
      if (skill) {
        handleSkillSelectInternal(skill);
      }
    } else if (topicParam) {
      const topic = findTopicByCode(topicParam);
      if (topic) {
        handleTopicSelectInternal(topic);
      }
    } else {
      // No params = show syllabus
      setSelectedTopic(null);
      setSelectedSkill(null);
      setCurrentArticle(null);
    }
  }, [searchParams]);

  const findSkillById = (skillId: number): Skill | null => {
    for (const unit of units) {
      for (const topic of unit.Topics) {
        const skill = topic.Skills.find(s => s.id === skillId);
        if (skill) return skill;
      }
    }
    return null;
  };

  const findTopicByCode = (topicCode: string): Topic | null => {
    for (const unit of units) {
      const topic = unit.Topics.find(t => t.code === topicCode);
      if (topic) return topic;
    }
    return null;
  };

  // Internal handlers (without URL update) for use by useEffect
  const handleTopicSelectInternal = (topic: Topic) => {
    setSelectedTopic(topic);
    setSelectedSkill(null);
    setCurrentArticle(null);
  };

  const handleSkillSelectInternal = async (skill: Skill) => {
    setLoadingArticle(true);
    setSelectedSkill(skill);
    setSelectedTopic(null);

    try {
      const { data, error } = await supabase
        .from('new_articles')
        .select('*')
        .eq('ID', skill.id)
        .single();

      if (error) {
        console.error('Error fetching article:', error);
        setCurrentArticle(null);
      } else if (data) {
        const mappedArticle: Article = {
          id: data.ID,
          article_text: data.article_text || '',
          image_recommendations: data.image_recommendations,
          img1: data.img1,
          img2: data.img2,
          img3: data.img3,
          img4: data.img4,
          img5: data.img5,
          img6: data.img6,
          img7: data.img7
        };
        setCurrentArticle(mappedArticle);
      }
    } catch (err) {
      console.error('Error:', err);
      setCurrentArticle(null);
    } finally {
      setLoadingArticle(false);
    }
  };

  // Public handlers (with URL update) for use by UI components
  const handleTopicSelect = (topic: Topic) => {
    setSearchParams({ topic: topic.code });
  };

  const handleBackToSyllabus = () => {
    setSearchParams({});
  };

  const handleSkillSelect = async (skill: Skill) => {
    setSearchParams({ skill: skill.id.toString() });
  };

  const handleMarkAsRead = async (skillId: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('read_articles')
        .upsert({
          user_id: user.id,
          skill_id: skillId,
          date_read: new Date().toISOString()
        });

      if (error) {
        console.error('Error marking article as read:', error);
      } else {
        setReadArticles(prev => new Set([...prev, skillId]));
        // TODO: Add confetti animation and streak points
      }
    } catch (err) {
      console.error('Error:', err);
    }
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
    
    const newUserMessage = {
      id: Date.now(),
      text: `Объясни мне это: "${selectedText}"`,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 font-heading">
              Новый Учебник
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Современный интерактивный учебник математики для подготовки к ОГЭ
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск навыков..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
          </div>

          {/* Selector Tool */}
          <div className="flex justify-center mb-6">
            <Button
              onClick={toggleSelecter}
              variant={isSelecterActive ? "default" : "outline"}
              className={`relative transition-all duration-500 transform ${
                isSelecterActive 
                  ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white shadow-2xl scale-110 border-0 animate-pulse" 
                  : "hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 hover:border-yellow-400 hover:text-yellow-700 hover:shadow-lg hover:scale-105"
              } ${isSelecterActive ? "ring-4 ring-yellow-300/50" : ""}`}
              size="lg"
            >
              <Highlighter className={`w-5 h-5 mr-2 transition-transform duration-300 ${isSelecterActive ? "animate-bounce" : ""}`} />
              <span className="font-semibold">
                {isSelecterActive ? "🎯 Режим выделения активен" : "✨ Включить выделение"}
              </span>
              {isSelecterActive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              )}
            </Button>
          </div>

          {/* Selected Text and Ask Ёжик Button */}
          {selectedText && (
            <div className="fixed top-24 right-4 z-50 animate-fade-in">
              <div className="bg-white/95 backdrop-blur-md border border-gray-200/60 rounded-2xl shadow-2xl p-5 max-w-md transform transition-all duration-300 hover:scale-105">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 mb-2">✨ Выделенный текст:</p>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-100">
                      <p className="text-sm text-gray-700 leading-relaxed">"{selectedText}"</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedText("")}
                    className="p-1 h-auto hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Button 
                  onClick={handleAskEzhik}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl py-2.5"
                  size="sm"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  🦔 Спросить Ёжика
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
            {/* Chat Window */}
            {isChatOpen && (
              <div className="fixed left-4 top-24 bottom-4 w-96 z-40 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200/50 flex flex-col"
                style={{ maxHeight: 'calc(100vh - 120px)' }}
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
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
                    <ChatMessages messages={messages} isTyping={isTyping} />
                  </ScrollArea>
                  
                  <div className="border-t border-gray-200/50 p-4">
                    <ChatInput onSendMessage={handleSendChatMessage} isTyping={isTyping} />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Panel */}
            <div className="lg:col-span-1">
              <NewTextbookNavigation
                units={units}
                selectedSkill={selectedSkill}
                selectedTopic={selectedTopic}
                readArticles={readArticles}
                searchTerm={searchTerm}
                onSkillSelect={handleSkillSelect}
                onTopicSelect={handleTopicSelect}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <NewTextbookArticle
                units={units}
                skill={selectedSkill}
                topic={selectedTopic}
                article={currentArticle}
                loading={loadingArticle}
                isRead={selectedSkill ? readArticles.has(selectedSkill.id) : false}
                searchTerm={searchTerm}
                onMarkAsRead={handleMarkAsRead}
                onSkillSelect={handleSkillSelect}
                onTopicSelect={handleTopicSelect}
                onBackToSyllabus={handleBackToSyllabus}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTextbook;