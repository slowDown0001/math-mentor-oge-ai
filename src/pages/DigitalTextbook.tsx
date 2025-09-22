import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '../components/Header';
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
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
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
        setIsEditingQuestion(false);
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

  const handleTextSelection = (e?: Event) => {
    setTimeout(() => {
      // Don't clear selection if clicking inside the popup
      if (e && e.target) {
        const target = e.target as Element;
        const popup = target.closest('.selection-popup');
        if (popup) return;
      }
      
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
    setIsEditingQuestion(false);
  };

  const handleAskEzhik = async () => {
    if (!selectedText) return;
    
    // Open chat and send the selected text for explanation
    setIsChatOpen(true);
    
    // Use custom question if provided, otherwise use default
    const finalQuestion = customQuestion || `Объясни кратко это: "${selectedText}"`;
    await handleSendChatMessage(finalQuestion);
    
    closeSelectionPopup();
  };

  const handleCustomAsk = async () => {
    if (!selectedText || !customQuestion.trim()) return;
    
    setIsChatOpen(true);
    await handleSendChatMessage(customQuestion);
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
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBackToSyllabus}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад к программе
          </Button>
        </div>

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
      const mouseUpHandler = (e: MouseEvent) => handleTextSelection(e);
      const touchEndHandler = (e: TouchEvent) => handleTextSelection(e);
      
      document.addEventListener('mouseup', mouseUpHandler);
      document.addEventListener('touchend', touchEndHandler);
      return () => {
        document.removeEventListener('mouseup', mouseUpHandler);
        document.removeEventListener('touchend', touchEndHandler);
      };
    }
  }, [isSelecting]);

  // Optional: make Ctrl/Cmd+C copy TeX correctly on this page
  useEffect(() => {
    const onCopy = (e: ClipboardEvent) => {
      if (isSelecting) {
        const content = getSelectedTextWithMath();
        if (content) {
          e.clipboardData?.setData('text/plain', content);
          e.preventDefault();
        }
      }
    };
    document.addEventListener('copy', onCopy as any);
    return () => document.removeEventListener('copy', onCopy as any);
  }, [isSelecting]);

  useEffect(() => {
    if (missingMCQs.length > 0) {
      console.log('Missing MCQs for skills:', missingMCQs);
    }
  }, [missingMCQs]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 relative overflow-hidden">
      {/* Fun Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-200 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-pink-200 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-200 rounded-full opacity-25 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-12 h-12 bg-green-200 rounded-full opacity-35 animate-bounce"></div>
        <div className="absolute bottom-40 right-10 w-18 h-18 bg-purple-200 rounded-full opacity-30 animate-pulse"></div>
        
        {/* Decorative Math Symbols */}
        <div className="absolute top-20 left-1/3 text-6xl text-blue-200 opacity-20 rotate-12">π</div>
        <div className="absolute top-1/2 right-20 text-5xl text-pink-200 opacity-20 -rotate-12">∑</div>
        <div className="absolute bottom-1/3 left-20 text-4xl text-purple-200 opacity-20 rotate-45">∞</div>
        <div className="absolute top-3/4 right-1/3 text-5xl text-green-200 opacity-20 -rotate-45">√</div>
        <div className="absolute top-10 right-1/4 text-4xl text-orange-200 opacity-15 rotate-30">∆</div>
        <div className="absolute bottom-10 left-1/2 text-6xl text-indigo-200 opacity-18 -rotate-20">∫</div>
        <div className="absolute top-1/3 left-10 text-5xl text-red-200 opacity-16 rotate-60">α</div>
        <div className="absolute bottom-1/2 right-10 text-4xl text-teal-200 opacity-20 -rotate-30">β</div>
        <div className="absolute top-2/3 left-1/4 text-3xl text-yellow-200 opacity-15 rotate-15">γ</div>
        <div className="absolute bottom-20 right-1/4 text-5xl text-purple-300 opacity-17 -rotate-45">θ</div>
        <div className="absolute top-40 left-2/3 text-4xl text-blue-300 opacity-19 rotate-25">λ</div>
        <div className="absolute bottom-1/4 left-1/3 text-6xl text-pink-300 opacity-16 -rotate-15">Ω</div>
        <div className="absolute top-1/4 right-1/2 text-3xl text-green-300 opacity-18 rotate-40">φ</div>
        <div className="absolute bottom-40 left-10 text-4xl text-orange-300 opacity-15 -rotate-25">ψ</div>
        <div className="absolute top-80 right-40 text-5xl text-indigo-300 opacity-17 rotate-35">≈</div>
        <div className="absolute bottom-60 right-1/2 text-4xl text-red-300 opacity-16 -rotate-40">≠</div>
        <div className="absolute top-1/5 left-1/2 text-3xl text-teal-300 opacity-19 rotate-50">≤</div>
        <div className="absolute bottom-1/5 right-1/5 text-4xl text-yellow-300 opacity-14 -rotate-35">≥</div>
        <div className="absolute top-3/5 right-1/6 text-5xl text-purple-200 opacity-16 rotate-20">±</div>
        <div className="absolute bottom-2/3 left-1/5 text-3xl text-blue-200 opacity-18 -rotate-50">÷</div>
        <div className="absolute top-1/6 right-2/3 text-4xl text-pink-200 opacity-15 rotate-65">×</div>
        <div className="absolute bottom-1/6 left-2/3 text-5xl text-green-200 opacity-17 -rotate-20">∝</div>
      </div>
      
      <div className="relative z-10">
      <Header />
      
      {selectedText && (
        <div className="fixed top-20 right-4 z-50 animate-scale-in">
          <div 
            className="selection-popup bg-gradient-to-br from-white via-blue-50 to-purple-50 backdrop-blur-sm border border-blue-200/60 rounded-2xl shadow-2xl max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-3 border-b border-blue-200/40">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                  <h4 className="font-medium text-sm text-gray-700">Выделенный текст</h4>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={closeSelectionPopup} 
                  className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div className="bg-white/60 p-3 rounded-lg border border-blue-100">
                <p className="text-sm text-gray-700 max-h-16 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200">
                  "{selectedText}"
                </p>
              </div>

              {/* Question Input */}
              <div className="space-y-2">
                {!isEditingQuestion ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 rounded-lg border border-blue-200/60">
                      <span className="text-sm text-gray-600">
                        {customQuestion || "Объясни кратко это:"}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setIsEditingQuestion(true);
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      className="h-8 w-8 p-0 hover:bg-blue-100"
                      type="button"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Textarea
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      placeholder="Объясни кратко это:"
                      className="min-h-[60px] text-sm resize-none border-blue-200/60 focus:border-blue-400 focus:ring-blue-200"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setIsEditingQuestion(false)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      >
                        Готово
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCustomQuestion('');
                          setIsEditingQuestion(false);
                        }}
                        className="border-gray-300 hover:bg-gray-50"
                      >
                        Сброс
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Ask Button */}
              <Button 
                onClick={handleAskEzhik} 
                size="sm" 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover-scale"
              >
                <Send className="h-4 w-4 mr-2" />
                Спросить у Ёжика
              </Button>
            </div>
          </div>
        </div>
      )}

      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] flex flex-col">
          <SheetHeader>
            <SheetTitle>Ёжик помогает</SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 flex flex-col mt-4 min-h-0">
            {/* Chat Messages Area - Scrollable */}
            <div className="flex-1 overflow-hidden min-h-0">
              <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                <CourseChatMessages 
                  messages={messages} 
                  isTyping={isTyping} 
                  onLoadMoreHistory={() => {}}
                  isLoadingHistory={false}
                  hasMoreHistory={false}
                />
              </div>
            </div>

            {/* Chat Input Area - Fixed at bottom */}
            <div className="border-t border-border bg-background p-4">
              <ChatInput onSendMessage={handleSendChatMessage} isTyping={isTyping} />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Floating Chat Arrow Button */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40">
        <Button
          onClick={() => setIsChatOpen(true)}
          size="sm"
          className="w-12 h-12 p-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
          title="Открыть чат с Ёжиком"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Цифровой учебник ОГЭ по математике</h1>
          <p className="text-xl text-gray-600 mb-6">Изучайте программу ОГЭ поэтапно с подробными объяснениями и практическими заданиями</p>

          <div className="flex gap-4 items-center mb-6">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Поиск по навыкам..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              variant={isSelecting ? "default" : "outline"}
              onClick={toggleSelecter}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              {isSelecting ? "Выключить выделение" : "Включить выделение"}
            </Button>
          </div>

          <div className="mb-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                  <Card className="h-fit sticky top-4 bg-white/90 backdrop-blur-sm border-white/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Программа ОГЭ</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[calc(100vh-300px)]">
                        <div className="space-y-2">
                          {Object.entries(newSyllabusData as SyllabusStructure).map(([moduleName, module]) => (
                            <Collapsible key={moduleName} open={expandedModules.has(moduleName)}>
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className={`w-full justify-between h-auto p-3 ${
                                    selectedModule === moduleName ? 'bg-primary/10' : ''
                                  }`}
                                  onClick={() => handleModuleSelect(moduleName)}
                                >
                                  <span className="text-left font-medium">{moduleName}</span>
                                  {expandedModules.has(moduleName) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="pl-4 space-y-1 mt-2">
                                {Object.entries(module).map(([topicKey, topic]) => (
                                  <Collapsible key={topicKey} open={expandedTopics.has(topicKey)}>
                                    <CollapsibleTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`w-full justify-between text-sm ${
                                          selectedTopic === topicKey ? 'bg-primary/10' : ''
                                        }`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleTopicSelect(topicKey);
                                        }}
                                      >
                                        <span className="text-left truncate">{topicKey} {topic.name}</span>
                                        {expandedTopics.has(topicKey) ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                      </Button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="pl-4 space-y-1 mt-1">
                                      {getFilteredSkills(topic.skills, searchTerm).map((skill) => (
                                        <Button
                                          key={skill.number}
                                          variant="ghost"
                                          size="sm"
                                          className={`w-full text-left justify-start text-xs h-auto py-2 ${
                                            selectedSkill === skill.number ? 'bg-primary/20 text-primary' : ''
                                          }`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSkillSelect(skill.number);
                                            // Update URL with skill parameter
                                            setSearchParams({ skill: skill.number.toString() });
                                          }}
                                        >
                                          <BookOpen className="h-3 w-3 mr-2 flex-shrink-0" />
                                          <span className="truncate">{skill.number}. {skill.name}</span>
                                        </Button>
                                      ))}
                                    </CollapsibleContent>
                                  </Collapsible>
                                ))}
                              </CollapsibleContent>
                            </Collapsible>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-3">
                  {showPractice && selectedSkill ? (
                    <SkillPracticeQuiz
                      skill={{
                        id: selectedSkill,
                        title: getAllSkillsFromStructure().find(s => s.number === selectedSkill)?.name || ''
                      }}
                      onBackToArticle={handleBackToArticle}
                    />
                  ) : selectedSkill && currentArticle ? (
                    <div className="space-y-6">
                      <Card className="bg-white/90 backdrop-blur-sm border-white/50">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-5 w-5" />
                              {selectedSkill}. {getAllSkillsFromStructure().find(s => s.number === selectedSkill)?.name}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={handleBackToTopic}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                К теме
                              </Button>
                              <Button variant="outline" size="sm" onClick={handleBackToSyllabus}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                К программе
                              </Button>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {loading ? (
                            <div className="space-y-4">
                              <div className="h-4 bg-muted rounded animate-pulse"></div>
                              <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                              <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
                            </div>
                          ) : (
                             <div className={`${!isSelecting ? 'highlighter-cursor' : 'selection-mode'}`}>
                              <ArticleRenderer 
                                text={currentArticle.article_text || ''} 
                                article={{
                                  skill: selectedSkill || 0,
                                  art: currentArticle.article_text || '',
                                  ...currentArticle
                                }} 
                              />
                              
                              <div className="mt-6 pt-6 border-t">
                                <Button onClick={handleStartPractice} className="w-full" size="lg">
                                  <Play className="h-5 w-5 mr-2" />
                                  Тренировать навык
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ) : selectedSkill && !currentArticle && !loading ? (
                    <Card className="bg-white/90 backdrop-blur-sm border-white/50">
                      <CardContent className="flex flex-col items-center justify-center py-16">
                        <Lightbulb className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Материал в разработке</h3>
                        <p className="text-muted-foreground text-center">
                          Материал для этого навыка пока готовится. Скоро здесь появится подробное объяснение!
                        </p>
                        <div className="mt-4 flex gap-2">
                          <Button variant="outline" size="sm" onClick={handleBackToTopic}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            К теме
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleBackToSyllabus}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            К программе
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : selectedTopic ? (
                    renderTopicView()
                  ) : (
                    renderFullSyllabus()
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default DigitalTextbook;