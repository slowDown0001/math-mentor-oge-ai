import React from "react";
import { Crown, Zap, Star } from "lucide-react";
import { useModuleProgress } from "@/hooks/useModuleProgress";

interface ModuleProgressBarProps {
  moduleSlug: string;
  orderedContent: Array<{ 
    type: 'topic' | 'quiz'; 
    topicIndex?: number; 
    quizIndex?: number; 
    isFinalTest?: boolean 
  }>;
  topics: Array<{ id: string; exercises: number }>;
  quizzes: Array<{ id: string }>;
  getExerciseData?: (topicId: string, exerciseIndex: number) => { title: string; skills: number[] };
}

export const ModuleProgressBar: React.FC<ModuleProgressBarProps> = ({
  moduleSlug,
  orderedContent,
  topics,
  quizzes,
  getExerciseData
}) => {
  const { getProgressStatus } = useModuleProgress();

  // Build array of all items with their types and IDs
  const progressItems: Array<{
    type: 'exercise' | 'test' | 'exam';
    itemId: string;
    status: string;
  }> = [];

  orderedContent.forEach((content) => {
    if (content.type === 'topic' && content.topicIndex !== undefined) {
      const topic = topics[content.topicIndex];
      // Add all exercises for this topic
      for (let i = 0; i < topic.exercises; i++) {
        const exerciseData = getExerciseData?.(topic.id, i);
        const itemId = `${moduleSlug}-${topic.id}-ex${i}`;
        const status = getProgressStatus(itemId, 'exercise');
        progressItems.push({
          type: 'exercise',
          itemId,
          status
        });
      }
    } else if (content.type === 'quiz') {
      if (content.isFinalTest) {
        const itemId = `${moduleSlug}-module-exam`;
        const status = getProgressStatus(itemId, 'exam');
        progressItems.push({
          type: 'exam',
          itemId,
          status
        });
      } else if (content.quizIndex !== undefined) {
        const quiz = quizzes[content.quizIndex];
        const itemId = `${moduleSlug}-${quiz.id}`;
        const status = getProgressStatus(itemId, 'test');
        progressItems.push({
          type: 'test',
          itemId,
          status
        });
      }
    }
  });

  const renderExerciseBox = (status: string) => {
    switch (status) {
      case 'mastered':
        return (
          <div className="relative w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
            <Crown className="h-4 w-4 text-white" />
          </div>
        );
      case 'proficient':
        return (
          <div className="w-8 h-8 bg-gradient-to-t from-orange-500 from-75% to-gray-200 to-75% rounded border-2 border-orange-500" />
        );
      case 'familiar':
        return (
          <div className="w-8 h-8 bg-gradient-to-t from-orange-500 from-50% to-gray-200 to-50% rounded border-2 border-orange-500" />
        );
      case 'attempted':
        return (
          <div className="w-8 h-8 border-2 border-orange-400 rounded bg-white" />
        );
      default:
        return (
          <div className="w-8 h-8 border-2 border-gray-300 rounded bg-white" />
        );
    }
  };

  const renderTestIcon = (status: string) => {
    if (status === 'completed') {
      return <Zap className="h-6 w-6 text-green-600 fill-green-600 mx-1" />;
    } else if (status === 'attempted') {
      return <Zap className="h-6 w-6 text-blue-400 mx-1" />;
    }
    return <Zap className="h-6 w-6 text-gray-400 mx-1" />;
  };

  const renderExamIcon = (status: string) => {
    if (status === 'completed') {
      return <Star className="h-6 w-6 text-yellow-500 fill-yellow-500 mx-1" />;
    } else if (status === 'attempted') {
      return <Star className="h-6 w-6 text-yellow-300 mx-1" />;
    }
    return <Star className="h-6 w-6 text-gray-400 mx-1" />;
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {progressItems.map((item, index) => {
        if (item.type === 'exercise') {
          return <div key={index}>{renderExerciseBox(item.status)}</div>;
        } else if (item.type === 'test') {
          return <div key={index}>{renderTestIcon(item.status)}</div>;
        } else if (item.type === 'exam') {
          return <div key={index}>{renderExamIcon(item.status)}</div>;
        }
        return null;
      })}
    </div>
  );
};
