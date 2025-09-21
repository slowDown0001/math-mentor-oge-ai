import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '../components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, MessageCircle, X, BookOpen, Lightbulb, ArrowLeft, Play } from 'lucide-react';
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
  const [isSelecting, setIsSelecting] = useState(false);
  const { user } = useAuth();
  const { messages, isTyping, isDatabaseMode, addMessage, setIsTyping } = useChatContext();
  const [searchParams] = useSearchParams();
  const [missingMCQs, setMissingMCQs] = useState<number[]>([]);
  const [showPractice, setShowPractice] = useState(false);

  useEffect(() => {
    const skillParam = searchParams.get('skill');
    if (skillParam) {
      const skillId = parseInt(skillParam);
      setSelectedSkill(skillId);
      handleSkillSelect(skillId);
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
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
    }
  };

  const handleAskEzhik = async () => {
    if (!selectedText) return;
    
    // Open chat and send the selected text for explanation
    setIsChatOpen(true);
    
    // Create a message asking for explanation of the selected text
    const explanationRequest = `Объясни кратко это: "${selectedText}"`;
    await handleSendChatMessage(explanationRequest);
    
    setSelectedText('');
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
            <Card key={moduleName} className="overflow-hidden">
              <CardHeader className="bg-primary/5">
                <CardTitle className="text-xl text-primary">{moduleName}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  {Object.entries(module).map(([topicKey, topic]) => (
                    <div key={topicKey} className="border rounded-lg p-4">
                      <h4 className="font-semibold text-lg mb-3 text-gray-800">
                        {topicKey} {topic.name}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {getFilteredSkills(topic.skills, searchTerm).map((skill) => (
                          <Button
                            key={skill.number}
                            variant="outline"
                            size="sm"
                            className="justify-start text-left h-auto py-2 hover:bg-primary/10"
                            onClick={() => handleSkillSelect(skill.number)}
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

  useEffect(() => {
    if (isSelecting) {
      document.addEventListener('mouseup', handleTextSelection);
      return () => document.removeEventListener('mouseup', handleTextSelection);
    }
  }, [isSelecting]);

  useEffect(() => {
    if (missingMCQs.length > 0) {
      console.log('Missing MCQs for skills:', missingMCQs);
    }
  }, [missingMCQs]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      {selectedText && (
        <div className="fixed top-20 right-4 z-50 bg-white p-4 rounded-lg shadow-lg border max-w-sm">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-sm">Выделенный текст:</h4>
            <Button variant="ghost" size="sm" onClick={() => setSelectedText('')} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mb-3 max-h-20 overflow-y-auto">"{selectedText}"</p>
          <Button onClick={handleAskEzhik} size="sm" className="w-full">
            <MessageCircle className="h-4 w-4 mr-2" />
            Спросить у Ёжика
          </Button>
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
                  <Card className="h-fit sticky top-4">
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
                                        onClick={() => handleTopicSelect(topicKey)}
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
                                          onClick={() => handleSkillSelect(skill.number)}
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
                      <Card>
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
                            <div>
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
                    <Card>
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
  );
};

export default DigitalTextbook;