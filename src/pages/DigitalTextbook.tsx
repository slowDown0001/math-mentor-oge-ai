import { useState, useEffect } from "react";
import { Book, Search, Star, ChevronRight, ChevronDown, FileText, Highlighter, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import MathRenderer from "@/components/MathRenderer";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import { useChatContext } from "@/contexts/ChatContext";
import { sendChatMessage } from "@/services/chatService";
import { supabase } from "@/integrations/supabase/client";
import mathSkillsData from "../../documentation/math_skills_full.json";
import topicSkillMapping from "../../documentation/topic_skill_mapping_with_names.json";

// Main topics mapping
const mainTopics = {
  "1": "Числа и вычисления",
  "2": "Алгебраические выражения", 
  "3": "Уравнения и неравенства",
  "4": "Числовые последовательности",
  "5": "Функции",
  "6": "Координаты на прямой и плоскости",
  "7": "Геометрия",
  "8": "Вероятность и статистика"
};

// Extract skills and mappings from imported data
const skills: MathSkill[] = mathSkillsData;
const mappings: TopicMapping[] = topicSkillMapping;

interface MathSkill {
  skill: string;
  id: number;
}

interface TopicMapping {
  topic: string;
  name: string;
  skills: number[];
}

interface Article {
  skill: number;
  art: string;
}

const DigitalTextbook = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<MathSkill | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set(["1"]));
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [isSelecterActive, setIsSelecterActive] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { messages, isTyping, isDatabaseMode, setMessages, setIsTyping, addMessage } = useChatContext();

  // Fetch articles from Supabase articles2 table
  useEffect(() => {
    const fetchArticles = async () => {
      const { data, error } = await supabase
        .from('articles2')
        .select('skill, art');
      
      if (error) {
        console.error('Error fetching articles:', error);
      } else {
        setArticles(data || []);
      }
    };

    fetchArticles();
  }, []);

  // Get article content for a skill
  const getArticleForSkill = (skillId: number): string | null => {
    const article = articles.find(a => a.skill === skillId);
    return article ? article.art : null;
  };

  // Get main topic number from topic string (e.g., "1.1" -> "1")
  const getMainTopicNumber = (topicStr: string): string => {
    if (topicStr === "Special") return "Special";
    return topicStr.split(".")[0];
  };

  // Get subtopics for a main topic
  const getSubtopicsForMainTopic = (mainTopicNum: string) => {
    return mappings.filter(mapping => 
      getMainTopicNumber(mapping.topic) === mainTopicNum
    );
  };

  // Get skill name by ID
  const getSkillNameById = (skillId: number): string => {
    const skill = skills.find(s => s.id === skillId);
    return skill ? skill.skill : `Навык ${skillId}`;
  };

  // Filter skills based on search term
  const getFilteredSkills = () => {
    if (!searchTerm) return skills;
    
    return skills.filter(skill => 
      skill.skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.id.toString().includes(searchTerm)
    );
  };

  // Count total skills across all topics
  const getTotalSkillsCount = () => {
    return skills.length;
  };

  const toggleTopic = (topic: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topic)) {
      newExpanded.delete(topic);
    } else {
      newExpanded.add(topic);
    }
    setExpandedTopics(newExpanded);
  };

  const handleTopicSelect = (topicNum: string) => {
    setSelectedTopic(topicNum);
    setSelectedSubtopic(null);
    setSelectedSkill(null); // Clear selected skill when changing topic
  };

  const handleSubtopicSelect = (subtopicId: string) => {
    setSelectedSubtopic(subtopicId);
    setSelectedTopic("subtopic");
    setSelectedSkill(null);
  };

  const handleSkillSelect = (skill: MathSkill) => {
    setLoadingArticle(true);
    setSelectedSkill(skill);
    // Small delay to show loading state
    setTimeout(() => setLoadingArticle(false), 300);
  };

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
    
    // Add user message with selected text
    const newUserMessage = {
      id: Date.now(),
      text: `Объясни мне это: "${selectedText}"`,
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

  const filteredSkills = getFilteredSkills();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 font-heading">
              Электронный учебник
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {getTotalSkillsCount()} навыков математики для подготовки к ОГЭ
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Поиск навыков..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
              <div className="fixed left-4 top-24 bottom-4 w-80 z-40 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
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
                    Разделы
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-96">
                    <div className="space-y-2 p-4">
                      <Button
                        variant={selectedTopic === "all" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleTopicSelect("all")}
                      >
                        Все навыки ({getTotalSkillsCount()})
                      </Button>
                      
                      {Object.entries(mainTopics).map(([topicNum, topicName]) => {
                        const subtopics = getSubtopicsForMainTopic(topicNum);
                        const totalSkills = subtopics.reduce((sum, subtopic) => sum + subtopic.skills.length, 0);

                        return (
                          <Collapsible 
                            key={topicNum}
                            open={expandedTopics.has(topicNum)}
                            onOpenChange={() => toggleTopic(topicNum)}
                          >
                            <CollapsibleTrigger asChild>
                              <Button
                                variant={selectedTopic === topicNum ? "default" : "ghost"}
                                className="w-full justify-between text-sm"
                                onClick={() => handleTopicSelect(topicNum)}
                              >
                                <span className="text-left flex-1">
                                  {topicNum}. {topicName} ({totalSkills})
                                </span>
                                {expandedTopics.has(topicNum) ? 
                                  <ChevronDown className="w-4 h-4" /> : 
                                  <ChevronRight className="w-4 h-4" />
                                }
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-1 ml-2 mt-1">
                              {subtopics.map((subtopic) => (
                                <button
                                  key={subtopic.topic}
                                  onClick={() => handleSubtopicSelect(subtopic.topic)}
                                  className={`w-full text-left p-2 text-xs rounded hover:bg-gray-100 transition-colors ${
                                    selectedSubtopic === subtopic.topic ? 'bg-blue-100 text-blue-800' : 'text-gray-700'
                                  }`}
                                >
                                  {subtopic.topic} {subtopic.name} ({subtopic.skills.length})
                                </button>
                              ))}
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}

                      {/* Special Topics */}
                      <Button
                        variant={selectedTopic === "Special" ? "default" : "ghost"}
                        className="w-full justify-start text-sm"
                        onClick={() => handleTopicSelect("Special")}
                      >
                        Дополнительные навыки ({mappings.find(m => m.topic === "Special")?.skills.length || 0})
                      </Button>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {selectedSkill ? (
                /* Selected Skill Page */
                <Card className="min-h-[600px] bg-white">
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <div>
                          <CardTitle className="text-xl">
                            Навык {selectedSkill.id}: {selectedSkill.skill}
                          </CardTitle>
                          <CardDescription>
                            Изучение математического навыка
                          </CardDescription>
                        </div>
                      </div>
                      
                      {/* Selecter Button */}
                      <Button
                        variant={isSelecterActive ? "default" : "outline"}
                        size="sm"
                        onClick={toggleSelecter}
                        className={`flex items-center gap-2 ${
                          isSelecterActive ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''
                        }`}
                      >
                        <Highlighter className="w-4 h-4" />
                        Selecter {isSelecterActive ? 'ON' : 'OFF'}
                      </Button>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSkill(null)}
                      >
                        ← Назад к списку
                      </Button>
                      
                      {isSelecterActive && (
                        <p className="text-sm text-yellow-600 flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded">
                          <Highlighter className="w-3 h-3" />
                          Выделите текст для создания заметок
                        </p>
                      )}
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
                        {(() => {
                          const articleContent = getArticleForSkill(selectedSkill.id);
                          if (articleContent) {
                            return (
                              <>
                                <div 
                                  className={`prose max-w-none ${
                                    isSelecterActive ? 'cursor-text select-text' : ''
                                  }`}
                                  style={{ userSelect: isSelecterActive ? 'text' : 'auto' }}
                                >
                                  <MathRenderer text={articleContent} />
                                </div>
                                <div className="flex justify-center pt-6 border-t">
                                  <Button 
                                    onClick={() => handleGoToExercise(selectedSkill.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                                  >
                                    Перейти к упражнениям!
                                  </Button>
                                </div>
                              </>
                            );
                          } else {
                            return (
                              <div className="text-center py-12">
                                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                  Материал готовится
                                </h3>
                                <p className="text-gray-600 mb-6">
                                  Содержимое для навыка "{selectedSkill.skill}" скоро будет добавлено
                                </p>
                                <Button 
                                  onClick={() => handleGoToExercise(selectedSkill.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                                >
                                  Перейти к упражнениям!
                                </Button>
                              </div>
                            );
                          }
                        })()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                /* Skills List */
                <div className="space-y-6">
                  {/* Show current selection info */}
                  {selectedTopic !== "all" && (
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedTopic === "Special" 
                          ? "Дополнительные навыки" 
                          : selectedTopic === "subtopic" && selectedSubtopic
                          ? (() => {
                              const subtopic = mappings.find(m => m.topic === selectedSubtopic);
                              return subtopic ? `${subtopic.topic} ${subtopic.name}` : "Подтема";
                            })()
                          : `${selectedTopic}. ${mainTopics[selectedTopic as keyof typeof mainTopics]}`
                        }
                      </h2>
                    </div>
                  )}

                  {/* Skills List */}
                  <div className="space-y-4">
                    {selectedTopic === "subtopic" && selectedSubtopic ? (
                      // Show selected subtopic skills
                      <Card>
                        <CardHeader>
                          <CardTitle>
                            {(() => {
                              const subtopic = mappings.find(m => m.topic === selectedSubtopic);
                              return subtopic ? `${subtopic.topic} ${subtopic.name}` : "Подтема";
                            })()}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-2">
                            {(() => {
                              const subtopic = mappings.find(m => m.topic === selectedSubtopic);
                              if (!subtopic) return null;
                              
                              const subtopicSkills = filteredSkills.filter(skill => 
                                subtopic.skills.includes(skill.id)
                              );
                              
                              return subtopicSkills.map((skill) => (
                                <button
                                  key={skill.id}
                                  onClick={() => handleSkillSelect(skill)}
                                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded text-left transition-colors"
                                >
                                  <Badge variant="outline" className="text-xs">
                                    {skill.id}
                                  </Badge>
                                  <span className="text-sm">{skill.skill}</span>
                                </button>
                              ));
                            })()}
                          </div>
                        </CardContent>
                      </Card>
                    ) : selectedTopic === "all" ? (
                      // Show all skills organized by topics
                      Object.entries(mainTopics).map(([topicNum, topicName]) => {
                        const subtopics = getSubtopicsForMainTopic(topicNum);
                        const topicSkills = subtopics.flatMap(subtopic => subtopic.skills);
                        const displaySkills = filteredSkills.filter(skill => topicSkills.includes(skill.id));
                        
                        if (displaySkills.length === 0 && searchTerm) return null;

                        return (
                          <Card key={topicNum} className="mb-6">
                            <CardHeader>
                              <CardTitle className="text-lg">
                                {topicNum}. {topicName}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-2">
                                {subtopics.map((subtopic) => {
                                  const subtopicSkills = filteredSkills.filter(skill => 
                                    subtopic.skills.includes(skill.id)
                                  );
                                  
                                  if (subtopicSkills.length === 0 && searchTerm) return null;

                                  return (
                                    <div key={subtopic.topic} className="mb-4">
                                      <h4 className="font-medium text-sm text-gray-700 mb-2">
                                        {subtopic.topic} {subtopic.name}
                                      </h4>
                                      <div className="grid gap-1 ml-4">
                                        {subtopicSkills.map((skill) => (
                                          <button
                                            key={skill.id}
                                            onClick={() => handleSkillSelect(skill)}
                                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded text-left transition-colors"
                                          >
                                            <Badge variant="outline" className="text-xs">
                                              {skill.id}
                                            </Badge>
                                            <span className="text-sm">{skill.skill}</span>
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    ) : selectedTopic === "Special" ? (
                      // Show special skills
                      <Card>
                        <CardHeader>
                          <CardTitle>Дополнительные навыки</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-2">
                            {mappings
                              .filter(m => m.topic === "Special")
                              .flatMap(subtopic => 
                                filteredSkills.filter(skill => subtopic.skills.includes(skill.id))
                              )
                              .map((skill) => (
                                <button
                                  key={skill.id}
                                  onClick={() => handleSkillSelect(skill)}
                                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded text-left transition-colors"
                                >
                                  <Badge variant="outline" className="text-xs">
                                    {skill.id}
                                  </Badge>
                                  <span className="text-sm">{skill.skill}</span>
                                </button>
                              ))}
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      // Show selected topic skills
                      <Card>
                        <CardHeader>
                          <CardTitle>
                            {selectedTopic}. {mainTopics[selectedTopic as keyof typeof mainTopics]}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {getSubtopicsForMainTopic(selectedTopic).map((subtopic) => {
                              const subtopicSkills = filteredSkills.filter(skill => 
                                subtopic.skills.includes(skill.id)
                              );
                              
                              if (subtopicSkills.length === 0 && searchTerm) return null;

                              return (
                                <div key={subtopic.topic}>
                                  <h4 className="font-medium text-sm text-gray-700 mb-2">
                                    {subtopic.topic} {subtopic.name}
                                  </h4>
                                  <div className="grid gap-1 ml-4">
                                    {subtopicSkills.map((skill) => (
                                      <button
                                        key={skill.id}
                                        onClick={() => handleSkillSelect(skill)}
                                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded text-left transition-colors"
                                      >
                                        <Badge variant="outline" className="text-xs">
                                          {skill.id}
                                        </Badge>
                                        <span className="text-sm">{skill.skill}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {filteredSkills.length === 0 && searchTerm && (
                    <div className="text-center py-12">
                      <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Навыки не найдены
                      </h3>
                      <p className="text-gray-600">
                        Попробуйте изменить поисковый запрос
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalTextbook;
