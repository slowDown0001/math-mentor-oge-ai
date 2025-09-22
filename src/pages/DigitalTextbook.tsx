import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, MessageCircle, X, BookOpen, Lightbulb, ArrowLeft, Play, Edit3, Send, ChevronLeft } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import newSyllabusData from '../data/newSyllabusStructure.json';
import ArticleRenderer from '../components/ArticleRenderer';
import SkillPracticeQuiz from '../components/SkillPracticeQuiz';
import { useChatContext } from '@/contexts/ChatContext';
import { sendChatMessage } from '@/services/chatService';
import CourseChatMessages from '@/components/chat/CourseChatMessages';
import ChatInput from '@/components/chat/ChatInput';
import { useAuth } from '@/contexts/AuthContext';
import { saveChatLog } from '@/services/chatLogsService';
import { getSelectedTextWithMath } from '@/utils/getSelectedTextWithMath';
import { useMathJaxSelection } from '../hooks/useMathJaxSelection';
import { StreakDisplay } from '@/components/streak/StreakDisplay';

interface Skill {
  number: number;
  name: string;
  importance: number;
}

interface Topic {
  name: string;
  skills: Skill[];
}

interface Module {
  [topicKey: string]: Topic;
}

interface SyllabusStructure {
  [moduleName: string]: Module;
}

interface Article {
  ID: number;
  article_text: string;
  img1?: string;
  img2?: string;
  img3?: string;
  img4?: string;
  img5?: string;
  img6?: string;
  img7?: string;
  [key: string]: any;
}

interface MCQQuestion {
  question_id: string;
  problem_text: string;
  option1?: string;
  option2?: string;
  option3?: string;
  option4?: string;
  answer: string;
  skills: number;
}

const getArticleForSkill = async (skillId: number): Promise<Article | null> => {
  try {
    const { data, error } = await supabase
      .from('articles_oge_full')
      .select('*')
      .eq('ID', skillId)
      .single();

    if (error) {
      console.error('Error fetching article:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

const getMCQForSkill = async (skillId: number): Promise<MCQQuestion[]> => {
  try {
    const { data, error } = await supabase
      .from('oge_math_skills_questions')
      .select('*')
      .eq('skills', skillId);

    if (error) {
      console.error('Error fetching MCQ:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

const getAllSkillsFromStructure = (): Skill[] => {
  const allSkills: Skill[] = [];
  const syllabusData = newSyllabusData as SyllabusStructure;
  
  Object.values(syllabusData).forEach(module => {
    Object.values(module).forEach(topic => {
      allSkills.push(...topic.skills);
    });
  });
  
  return allSkills;
};

const getFilteredSkills = (skills: Skill[], searchTerm: string): Skill[] => {
  if (!searchTerm) return skills;
  
  return skills.filter(skill => 
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

const DigitalTextbook = () => {
  // Initialize MathJax selection highlighting
  useMathJaxSelection();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<number | null>(null);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [currentMCQs, setCurrentMCQs] = useState<MCQQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMCQ, setLoadingMCQ] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const { user } = useAuth();
  const { messages, isTyping, isDatabaseMode, addMessage, setIsTyping } = useChatContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [missingMCQs, setMissingMCQs] = useState<number[]>([]);
  const [showPractice, setShowPractice] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedText) {
        setSelectedText('');
        setCustomQuestion('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedText]);

  useEffect(() => {
    const skillParam = searchParams.get('skill');
    const topicParam = searchParams.get('topic');
    
    if (skillParam) {
      const skillId = parseInt(skillParam);
      setSelectedSkill(skillId);
      handleSkillSelect(skillId);
    } else if (topicParam) {
      setSelectedTopic(topicParam);
      handleTopicSelect(topicParam);
    }
  }, [searchParams]);

  const toggleModule = (moduleName: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleName)) {
      newExpanded.delete(moduleName);
    } else {
      newExpanded.add(moduleName);
    }
    setExpandedModules(newExpanded);
  };

  const toggleTopic = (topicKey: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicKey)) {
      newExpanded.delete(topicKey);
    } else {
      newExpanded.add(topicKey);
    }
    setExpandedTopics(newExpanded);
  };

  const handleModuleSelect = (moduleName: string) => {
    setSelectedModule(moduleName);
    setSelectedTopic(null);
    setSelectedSkill(null);
    setCurrentArticle(null);
    setCurrentMCQs([]);
    
    if (!expandedModules.has(moduleName)) {
      toggleModule(moduleName);
    }
  };

  const handleTopicSelect = (topicKey: string) => {
    setSelectedTopic(topicKey);
    setSelectedSkill(null);
    setCurrentArticle(null);
    setCurrentMCQs([]);
    
    // Update URL with topic parameter
    setSearchParams({ topic: topicKey });
    
    if (!expandedTopics.has(topicKey)) {
      toggleTopic(topicKey);
    }
  };

  const handleSkillSelect = async (skillId: number) => {
    setSelectedSkill(skillId);
    setLoading(true);
    setLoadingMCQ(true);
    
    try {
      const [article, mcqs] = await Promise.all([
        getArticleForSkill(skillId),
        getMCQForSkill(skillId)
      ]);
      
      setCurrentArticle(article);
      setCurrentMCQs(mcqs);
      
      if (mcqs.length === 0) {
        setMissingMCQs(prev => {
          if (!prev.includes(skillId)) {
            return [...prev, skillId];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
      setLoadingMCQ(false);
    }
  };

  const toggleSelecter = () => {
    setIsSelecting(!isSelecting);
  };

  const handleTextSelection = () => {
    setTimeout(() => {
      const selected = getSelectedTextWithMath();
      if (!selected) {
        setSelectedText('');
        return;
      }
      setSelectedText(selected);
    }, 0);
  };

  const closeSelectionPopup = () => {
    setSelectedText('');
    setCustomQuestion('');
  };

  const handleAskEzhik = async () => {
    if (!selectedText) return;
    
    // Open chat and send the selected text for explanation
    setIsChatOpen(true);
    
    // Use custom question if provided, otherwise use default, but always include selected text
    const userMessage = customQuestion.trim() || "Объясни кратко это:";
    const finalQuestion = `${userMessage} "${selectedText}"`;
    await handleSendChatMessage(finalQuestion);
    
    closeSelectionPopup();
  };

  const handleSendChatMessage = async (userInput: string) => {
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

  const handleBackToSyllabus = () => {
    setSelectedModule(null);
    setSelectedTopic(null);
    setSelectedSkill(null);
    setCurrentArticle(null);
    setCurrentMCQs([]);
    setShowPractice(false);
    // Clear URL parameters
    setSearchParams({});
  };

  const handleBackToTopic = () => {
    setSelectedSkill(null);
    setCurrentArticle(null);
    setCurrentMCQs([]);
    setShowPractice(false);
  };

  const handleStartPractice = () => {
    setShowPractice(true);
  };

  const handleBackToArticle = () => {
    setShowPractice(false);
  };

  const renderFullSyllabus = () => {
    const syllabusData = newSyllabusData as SyllabusStructure;
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Программа ОГЭ по математике</h2>
          <p className="text-lg text-gray-600">Выберите любой навык для изучения</p>
        </div>
        
        <div className="grid gap-6">
          {Object.entries(syllabusData).map(([moduleName, module]) => (
            <Card key={moduleName} className="overflow-hidden bg-white/90 backdrop-blur-sm border-white/50 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="bg-gradient-to-br from-blue-100 to-purple-100">
                <CardTitle className="text-xl text-blue-700">{moduleName}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  {Object.entries(module).map(([topicKey, topic]) => (
                    <div 
                      key={topicKey} 
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleTopicSelect(topicKey)}
                    >
                      <h4 className="font-semibold text-lg mb-3 text-gray-800 hover:text-primary">
                        {topicKey} {topic.name}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {getFilteredSkills(topic.skills, searchTerm).map((skill) => (
                          <Button
                            key={skill.number}
                            variant="outline"
                            size="sm"
                            className="justify-start text-left h-auto py-2 hover:bg-primary/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSkillSelect(skill.number);
                              // Update URL with skill parameter
                              setSearchParams({ skill: skill.number.toString() });
                            }}
                          >
                            <BookOpen className="h-3 w-3 mr-2 flex-shrink-0" />
                            <span className="text-xs">{skill.number}. {skill.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderTopicView = () => {
    if (!selectedTopic) return null;

    const syllabusData = newSyllabusData as SyllabusStructure;
    let currentTopic = null;
    let currentTopicData = null;

    // Find the selected topic in the data structure
    for (const [moduleName, module] of Object.entries(syllabusData)) {
      for (const [topicKey, topicData] of Object.entries(module)) {
        if (topicKey === selectedTopic) {
          currentTopic = topicKey;
          currentTopicData = topicData;
          break;
        }
      }
      if (currentTopic) break;
    }

    if (!currentTopicData) return null;

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {currentTopic} {currentTopicData.name}
          </h2>
          <p className="text-lg text-gray-600">
            Все навыки по теме - выберите для изучения
          </p>
        </div>

        <div className="grid gap-4">
          {getFilteredSkills(currentTopicData.skills, searchTerm).map((skill) => (
            <Card 
              key={skill.number}
              className="transition-all duration-200 hover:shadow-lg cursor-pointer hover:bg-primary/5"
              onClick={() => {
                handleSkillSelect(skill.number);
                // Update URL with skill parameter
                setSearchParams({ skill: skill.number.toString() });
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-full">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {skill.number}. {skill.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Важность: {skill.importance}/4
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Изучить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Topic Summary */}
        <div className="mt-8 bg-white/90 backdrop-blur-sm rounded-lg p-6 border-white/50 border">
          <h3 className="text-lg font-semibold mb-4">Сводка по теме</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{currentTopicData.skills.length}</div>
              <div className="text-sm text-gray-600">Всего навыков</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {currentTopicData.skills.filter(s => s.importance <= 2).length}
              </div>
              <div className="text-sm text-gray-600">Базовых навыков</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {currentTopicData.skills.filter(s => s.importance >= 3).length}
              </div>
              <div className="text-sm text-gray-600">Продвинутых навыков</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (isSelecting) {
      document.addEventListener('mouseup', handleTextSelection);
      document.addEventListener('touchend', handleTextSelection);
    } else {
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('touchend', handleTextSelection);
    }

    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('touchend', handleTextSelection);
    };
  }, [isSelecting]);

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
        
        {/* Navigation buttons */}
        <div className="p-4 space-y-2">
          <Button
            onClick={toggleSelecter}
            variant={isSelecting ? "default" : "ghost"}
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Edit3 className="mr-2 h-4 w-4" />
            Включить выделение
          </Button>
          
          <Button
            onClick={handleBackToSyllabus}
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            К программе
          </Button>
          
          {selectedTopic && (
            <Button
              onClick={handleBackToTopic}
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              К теме
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="h-14 border-b border-border bg-background flex items-center justify-between px-4">
          <h1 className="text-xl font-semibold">Учебник</h1>
          {user && (
            <div className="flex items-center gap-4">
              <StreakDisplay />
              <button 
                onClick={() => navigate("/mydashboard")}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/placeholder.svg" 
                  alt="User Avatar" 
                  className="w-8 h-8 rounded-full bg-primary/10"
                />
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {/* Breadcrumb Navigation */}
            {(selectedModule || selectedTopic || selectedSkill) && (
              <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
                <button 
                  onClick={handleBackToSyllabus}
                  className="hover:text-primary transition-colors"
                >
                  Программа
                </button>
                {selectedModule && (
                  <>
                    <ChevronRight className="h-4 w-4" />
                    <span>{selectedModule}</span>
                  </>
                )}
                {selectedTopic && (
                  <>
                    <ChevronRight className="h-4 w-4" />
                    <button 
                      onClick={handleBackToTopic}
                      className="hover:text-primary transition-colors"
                    >
                      {selectedTopic}
                    </button>
                  </>
                )}
                {selectedSkill && (
                  <>
                    <ChevronRight className="h-4 w-4" />
                    <span>Навык {selectedSkill}</span>
                  </>
                )}
              </div>
            )}

            {/* Main Content */}
            {!selectedSkill && !selectedTopic && renderFullSyllabus()}
            {selectedTopic && !selectedSkill && renderTopicView()}
            {selectedSkill && (
              <div className="space-y-6">
                {!showPractice ? (
                  <>
                    {currentArticle && (
                      <Card className="w-full bg-white/90 backdrop-blur-sm border-white/50">
                        <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100">
                          <CardTitle className="text-xl text-blue-700">
                            Навык {selectedSkill}: {getAllSkillsFromStructure().find(s => s.number === selectedSkill)?.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent 
                          className="p-6"
                          onClick={isSelecting ? handleTextSelection : undefined}
                          style={{ cursor: isSelecting ? 'text' : 'default' }}
                        >
                          <ArticleRenderer 
                            text={currentArticle.article_text}
                            article={{
                              ...currentArticle,
                              skill: currentArticle.ID,
                              art: currentArticle.article_text
                            }}
                          />
                          
                          {/* Practice Button */}
                          <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">Готовы к практике?</h3>
                                <p className="text-sm text-gray-600">
                                  Закрепите знания с помощью интерактивных заданий
                                </p>
                              </div>
                              <Button 
                                onClick={handleStartPractice}
                                className="flex items-center gap-2"
                                disabled={loadingMCQ}
                              >
                                <Play className="h-4 w-4" />
                                {loadingMCQ ? 'Загрузка...' : 'Начать практику'}
                              </Button>
                            </div>
                            {missingMCQs.includes(selectedSkill) && (
                              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                  <Lightbulb className="h-4 w-4 inline mr-2" />
                                  Для этого навыка пока нет готовых заданий. Вы можете задать вопросы через чат!
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    {loading && (
                      <Card className="w-full bg-white/90 backdrop-blur-sm border-white/50">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <span className="ml-3 text-gray-600">Загружаем материал...</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <SkillPracticeQuiz 
                    skill={{
                      id: selectedSkill,
                      title: getAllSkillsFromStructure().find(s => s.number === selectedSkill)?.name || ''
                    }}
                    onBackToArticle={handleBackToArticle}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Text Selection Popup */}
      {selectedText && (
        <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="selection-popup bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full border-white/50 border backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Выделенный текст</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={closeSelectionPopup}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-32 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {selectedText}
              </p>
            </div>
            
            <Textarea
              placeholder="Дополнительный вопрос (необязательно)"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              className="mb-4 resize-none"
              rows={3}
            />
            
            <div className="flex gap-3">
              <Button 
                onClick={handleAskEzhik}
                className="flex-1 flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Спросить у Ёжика
              </Button>
              <Button 
                variant="outline" 
                onClick={closeSelectionPopup}
                className="px-4"
              >
                Отмена
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Sheet */}
      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetContent className="w-full sm:max-w-lg h-full p-0 bg-white/95 backdrop-blur-md border-white/50">
          <SheetHeader className="px-6 py-4 border-b border-white/50">
            <SheetTitle className="text-left">Чат с Ёжиком</SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col h-[calc(100vh-80px)]">
            <div className="flex-1 overflow-hidden">
              <CourseChatMessages messages={messages} isTyping={isTyping} />
            </div>
            <div className="border-t border-white/50 p-4 bg-white/50">
              <ChatInput onSendMessage={handleSendChatMessage} isTyping={isTyping} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DigitalTextbook;