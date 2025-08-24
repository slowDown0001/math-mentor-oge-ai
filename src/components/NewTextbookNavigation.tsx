import { useState } from "react";
import { Book, ChevronRight, ChevronDown, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

interface Skill {
  id: number;
  title: string;
}

interface Topic {
  code: string;
  title: string;
  Skills: Skill[];
}

interface Unit {
  code: string;
  title: string;
  Topics: Topic[];
}

interface NewTextbookNavigationProps {
  units: Unit[];
  selectedSkill: Skill | null;
  selectedTopic: Topic | null;
  readArticles: Set<number>;
  searchTerm: string;
  onSkillSelect: (skill: Skill) => void;
  onTopicSelect: (topic: Topic) => void;
}

const NewTextbookNavigation = ({ 
  units, 
  selectedSkill, 
  selectedTopic,
  readArticles, 
  searchTerm,
  onSkillSelect,
  onTopicSelect
}: NewTextbookNavigationProps) => {
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set(["U1"]));
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  const toggleUnit = (unitCode: string) => {
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(unitCode)) {
      newExpanded.delete(unitCode);
    } else {
      newExpanded.add(unitCode);
    }
    setExpandedUnits(newExpanded);
  };

  const toggleTopic = (topicCode: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicCode)) {
      newExpanded.delete(topicCode);
    } else {
      newExpanded.add(topicCode);
    }
    setExpandedTopics(newExpanded);
  };

  const getUnitProgress = (unit: Unit) => {
    const totalSkills = unit.Topics.reduce((sum, topic) => sum + topic.Skills.length, 0);
    const readSkills = unit.Topics.reduce((sum, topic) => 
      sum + topic.Skills.filter(skill => readArticles.has(skill.id)).length, 0
    );
    return { read: readSkills, total: totalSkills };
  };

  const getTopicProgress = (topic: Topic) => {
    const readSkills = topic.Skills.filter(skill => readArticles.has(skill.id)).length;
    return { read: readSkills, total: topic.Skills.length };
  };

  const filterSkills = (skills: Skill[]) => {
    if (!searchTerm) return skills;
    return skills.filter(skill => 
      skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.id.toString().includes(searchTerm)
    );
  };

  return (
    <Card className="sticky top-24 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Book className="w-5 h-5" />
          Программа курса
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[70vh]">
          <div className="space-y-2 p-4">
            {units.map((unit) => {
              const unitProgress = getUnitProgress(unit);
              const progressPercent = unitProgress.total > 0 
                ? (unitProgress.read / unitProgress.total) * 100 
                : 0;

              return (
                <Collapsible 
                  key={unit.code}
                  open={expandedUnits.has(unit.code)}
                  onOpenChange={() => toggleUnit(unit.code)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between text-sm p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 transition-all duration-300 rounded-lg group"
                    >
                      <div className="flex items-center gap-2 flex-1 text-left">
                        <span className="font-semibold">{unit.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {unitProgress.read}/{unitProgress.total}
                        </Badge>
                      </div>
                      {expandedUnits.has(unit.code) ? 
                        <ChevronDown className="w-4 h-4 group-hover:text-blue-600 transition-colors" /> : 
                        <ChevronRight className="w-4 h-4 group-hover:text-blue-600 transition-colors" />
                      }
                    </Button>
                  </CollapsibleTrigger>
                  
                  {/* Progress bar */}
                  <div className="mx-3 mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <CollapsibleContent className="space-y-1 ml-2 mt-1">
                    {unit.Topics.map((topic) => {
                      const topicProgress = getTopicProgress(topic);
                      const topicProgressPercent = topicProgress.total > 0 
                        ? (topicProgress.read / topicProgress.total) * 100 
                        : 0;

                      return (
                        <Collapsible 
                          key={topic.code}
                          open={expandedTopics.has(topic.code)}
                          onOpenChange={() => toggleTopic(topic.code)}
                        >
                          <CollapsibleTrigger asChild>
                            <button
                              onClick={() => onTopicSelect(topic)}
                              className={`w-full text-left p-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-between group ${
                                selectedTopic?.code === topic.code ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'hover:bg-blue-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-gray-700 group-hover:text-blue-700">
                                  {topic.code} {topic.title}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {topicProgress.read}/{topicProgress.total}
                                </Badge>
                              </div>
                              {expandedTopics.has(topic.code) ? 
                                <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-blue-600" /> : 
                                <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-blue-600" />
                              }
                            </button>
                          </CollapsibleTrigger>
                          
                          {/* Topic progress bar */}
                          <div className="mx-2 mb-1">
                            <div className="w-full bg-gray-100 rounded-full h-1">
                              <div 
                                className="bg-gradient-to-r from-green-400 to-blue-400 h-1 rounded-full transition-all duration-500"
                                style={{ width: `${topicProgressPercent}%` }}
                              />
                            </div>
                          </div>

                          <CollapsibleContent className="space-y-1 ml-4 mt-1">
                            {filterSkills(topic.Skills).map((skill) => {
                              const isRead = readArticles.has(skill.id);
                              const isSelected = selectedSkill?.id === skill.id;

                              return (
                                <button
                                  key={skill.id}
                                  onClick={() => onSkillSelect(skill)}
                                  className={`w-full text-left p-2 text-xs rounded-lg transition-all duration-200 flex items-center gap-2 ${
                                    isSelected 
                                      ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200' 
                                      : isRead
                                        ? 'text-gray-500 hover:bg-green-50'
                                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                                  }`}
                                >
                                  {isRead && (
                                    <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                                  )}
                                  <span className={isRead ? 'line-through' : ''}>
                                    {skill.title}
                                  </span>
                                </button>
                              );
                            })}
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default NewTextbookNavigation;