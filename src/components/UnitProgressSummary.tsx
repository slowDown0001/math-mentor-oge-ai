import { useMasterySystem } from "@/hooks/useMasterySystem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Zap, Star } from "lucide-react";

interface UnitProgressSummaryProps {
  courseStructure: any;
  onUnitSelect?: (unitNumber: number) => void;
  onExerciseClick?: (skillIds: number[], subunit?: any) => void;
  mathSkills: Array<{ skill: string; id: number }>;
}

const UnitProgressSummary = ({ courseStructure, onUnitSelect, onExerciseClick, mathSkills }: UnitProgressSummaryProps) => {
  const { calculateUnitProgress, getUserMastery } = useMasterySystem();

  // Create skill name mapping
  const getSkillName = (skillId: number): string => {
    const skill = mathSkills.find(s => s.id === skillId);
    return skill ? skill.skill : `Exercise ${skillId}`;
  };

  // Calculate overall course mastery
  const calculateOverallMastery = (): number => {
    let totalProgress = 0;
    const unitCount = Object.keys(courseStructure).length;
    
    Object.keys(courseStructure).forEach(unitNum => {
      const unitNumber = parseInt(unitNum);
      const progress = calculateUnitProgress(unitNumber);
      totalProgress += progress;
    });
    
    return unitCount > 0 ? totalProgress / unitCount : 0;
  };

  // Get completion status based on progress percentage
  const getCompletionStatus = (progress: number): 'not_started' | 'attempted' | 'partial' | 'good' | 'mastered' => {
    if (progress >= 90) return 'mastered';
    if (progress >= 70) return 'good';
    if (progress >= 40) return 'partial';
    if (progress >= 20) return 'attempted';
    return 'not_started';
  };

  // Get box styling based on completion status
  const getBoxStyling = (status: string) => {
    const baseClasses = "w-6 h-6 border-2 rounded-sm relative flex items-center justify-center transition-colors";
    
    switch (status) {
      case 'not_started':
        return `${baseClasses} bg-blue-100 border-blue-300`;
      case 'attempted':
        return `${baseClasses} bg-red-100 border-red-300`;
      case 'partial':
        return `${baseClasses} bg-orange-300 border-orange-400`;
      case 'good':
        return `${baseClasses} bg-blue-400 border-blue-500`;
      case 'mastered':
        return `${baseClasses} bg-blue-600 border-blue-700`;
      default:
        return `${baseClasses} bg-gray-100 border-gray-300`;
    }
  };

  const renderProgressBox = (
    status: string, 
    isQuiz: boolean = false, 
    isUnitTest: boolean = false,
    exerciseName?: string,
    onClick?: () => void
  ) => {
    const statusText = status === 'not_started' ? 'Not started' : 
                      status === 'attempted' ? 'Attempted' : 
                      status === 'partial' ? 'Familiar' : 
                      status === 'good' ? 'Proficient' : 'Mastered';
    
    const box = (
      <div 
        className={`${getBoxStyling(status)} cursor-pointer hover:shadow-md transition-all`}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        {isQuiz && <Zap className="w-3 h-3 text-yellow-500" />}
        {isUnitTest && <Star className="w-3 h-3 text-yellow-500" />}
      </div>
    );

    if (exerciseName) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {box}
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="p-2">
              <div className="font-semibold text-sm mb-1">
                Exercise: {exerciseName}
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                {statusText}
              </div>
              <img 
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=200&h=120&fit=crop" 
                alt="Exercise preview" 
                className="w-40 h-24 object-cover rounded"
              />
              <div className="text-xs mt-1 text-muted-foreground">
                Click to start exercise
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }

    return box;
  };

  const overallMastery = calculateOverallMastery();

  return (
    <TooltipProvider>
      <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Pre-algebra
        </h1>
        <div className="text-xl text-gray-600 mb-4">
          Course mastery: <span className="font-semibold">{Math.round(overallMastery)}%</span>
        </div>
      </div>

      {/* Legend */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              {renderProgressBox('mastered')}
              <span>Mastered</span>
            </div>
            <div className="flex items-center gap-2">
              {renderProgressBox('good')}
              <span>Proficient</span>
            </div>
            <div className="flex items-center gap-2">
              {renderProgressBox('partial')}
              <span>Familiar</span>
            </div>
            <div className="flex items-center gap-2">
              {renderProgressBox('attempted')}
              <span>Attempted</span>
            </div>
            <div className="flex items-center gap-2">
              {renderProgressBox('not_started')}
              <span>Not started</span>
            </div>
            <div className="flex items-center gap-2">
              {renderProgressBox('mastered', true)}
              <span>Quiz</span>
            </div>
            <div className="flex items-center gap-2">
              {renderProgressBox('mastered', false, true)}
              <span>Unit test</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unit Progress Strips */}
      <div className="space-y-3">
        {Object.entries(courseStructure).map(([unitNum, unit]: [string, any]) => {
          const unitNumber = parseInt(unitNum);
          const unitProgress = calculateUnitProgress(unitNumber);
          
          return (
            <div 
              key={unitNum} 
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onUnitSelect?.(unitNumber)}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-16">
                  <span className="text-sm font-medium text-gray-700">Unit {unitNum}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 overflow-x-auto pb-2">
                    {/* Render exercises for each subunit */}
                    {unit.subunits.map((subunit: any, subIndex: number) => {
                      const subunitProgress = calculateUnitProgress(unitNumber, subunit.id);
                      const status = getCompletionStatus(subunitProgress);
                      
                      return (
                        <div key={subunit.id} className="flex items-center gap-1 flex-shrink-0">
                           {/* Regular exercises - show actual skills */}
                           {subunit.skills.map((skillId: number, skillIndex: number) => {
                             const skillProgress = subunitProgress; // Simplified - in real app would be per skill
                             const skillStatus = getCompletionStatus(skillProgress);
                             const skillName = getSkillName(skillId);
                             
                             return (
                               <div key={skillId} className="flex-shrink-0">
                                 {renderProgressBox(
                                   skillStatus, 
                                   false, 
                                   false,
                                   skillName,
                                   () => onExerciseClick?.([skillId], subunit)
                                 )}
                               </div>
                             );
                           })}
                          
                           {/* Quiz after some exercises */}
                           {subIndex % 2 === 1 && (
                             <div className="flex-shrink-0 ml-1">
                               {renderProgressBox(status, true, false, `${subunit.name} Quiz`)}
                             </div>
                           )}
                        </div>
                      );
                    })}
                    
                     {/* Unit test at the end */}
                     <div className="flex-shrink-0 ml-2">
                       {renderProgressBox(getCompletionStatus(unitProgress), false, true, `Unit ${unitNum} Test`)}
                     </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0 text-right min-w-[60px]">
                  <div className="text-sm font-medium text-gray-700">
                    {Math.round(unitProgress)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {unit.subunits.length} topics
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Challenge Section */}
      <Card className="mt-8 border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Star className="w-5 h-5" />
            COURSE CHALLENGE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 mb-4">
            Test your knowledge of the skills in this course.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
            Start Course challenge
          </button>
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
};

export default UnitProgressSummary;