
import { useState, useEffect } from "react";
import { Book, Search, Star, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Header from "@/components/Header";
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

interface MathSkill {
  skill: string;
  id: number;
}

interface TopicMapping {
  topic: string;
  name: string;
  skills: number[];
}

const DigitalTextbook = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set(["1"]));

  const skills = mathSkillsData as MathSkill[];
  const mappings = topicSkillMapping as TopicMapping[];

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
  };

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
              180 навыков математики для подготовки к ОГЭ
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

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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
                        onClick={() => setSelectedTopic("all")}
                      >
                        Все навыки (180)
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
                                <div key={subtopic.topic} className="p-2 text-xs text-gray-600">
                                  <div className="font-medium mb-1">
                                    {subtopic.topic} {subtopic.name} ({subtopic.skills.length})
                                  </div>
                                </div>
                              ))}
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}

                      {/* Special Topics */}
                      <Button
                        variant={selectedTopic === "Special" ? "default" : "ghost"}
                        className="w-full justify-start text-sm"
                        onClick={() => setSelectedTopic("Special")}
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
              <div className="space-y-6">
                {/* Show current selection info */}
                {selectedTopic !== "all" && (
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedTopic === "Special" 
                        ? "Дополнительные навыки" 
                        : `${selectedTopic}. ${mainTopics[selectedTopic as keyof typeof mainTopics]}`
                      }
                    </h2>
                  </div>
                )}

                {/* Skills List */}
                <div className="space-y-4">
                  {selectedTopic === "all" ? (
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
                                        <div key={skill.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                                          <Badge variant="outline" className="text-xs">
                                            {skill.id}
                                          </Badge>
                                          <span className="text-sm">{skill.skill}</span>
                                        </div>
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
                              <div key={skill.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                                <Badge variant="outline" className="text-xs">
                                  {skill.id}
                                </Badge>
                                <span className="text-sm">{skill.skill}</span>
                              </div>
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
                                    <div key={skill.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                                      <Badge variant="outline" className="text-xs">
                                        {skill.id}
                                      </Badge>
                                      <span className="text-sm">{skill.skill}</span>
                                    </div>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalTextbook;
