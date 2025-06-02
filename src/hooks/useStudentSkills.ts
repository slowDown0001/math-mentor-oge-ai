
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import topicMappingData from '../../documentation/topic_skill_mapping_with_names.json';

interface TopicProgress {
  topic: string;
  name: string;
  averageScore: number;
}

interface SkillData {
  topicProgress: TopicProgress[];
  generalPreparedness: number;
  isLoading: boolean;
  error: string | null;
}

export const useStudentSkills = (): SkillData => {
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([]);
  const [generalPreparedness, setGeneralPreparedness] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSkillData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch user's skill data from Supabase
        const { data: skillData, error: fetchError } = await supabase
          .from('student_skills')
          .select('*')
          .eq('uid', user.id)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (!skillData) {
          // If no skill data exists, create default values
          const defaultTopicProgress = [
            { topic: "1", name: "Числа и вычисления", averageScore: 0 },
            { topic: "2", name: "Алгебраические выражения", averageScore: 0 },
            { topic: "3", name: "Уравнения и неравенства", averageScore: 0 },
            { topic: "4", name: "Числовые последовательности", averageScore: 0 },
            { topic: "5", name: "Функции", averageScore: 0 },
            { topic: "6", name: "Координаты на прямой и плоскости", averageScore: 0 },
            { topic: "7", name: "Геометрия", averageScore: 0 },
            { topic: "8", name: "Вероятность и статистика", averageScore: 0 }
          ];
          setTopicProgress(defaultTopicProgress);
          setGeneralPreparedness(0);
          setIsLoading(false);
          return;
        }

        // Define the main topic groups
        const mainTopics = [
          { id: "1", name: "Числа и вычисления", subtopics: ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7"] },
          { id: "2", name: "Алгебраические выражения", subtopics: ["2.1", "2.2", "2.3", "2.4", "2.5"] },
          { id: "3", name: "Уравнения и неравенства", subtopics: ["3.1", "3.2", "3.3"] },
          { id: "4", name: "Числовые последовательности", subtopics: ["4.1", "4.2"] },
          { id: "5", name: "Функции", subtopics: ["5.1"] },
          { id: "6", name: "Координаты на прямой и плоскости", subtopics: ["6.1", "6.2"] },
          { id: "7", name: "Геометрия", subtopics: ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7"] },
          { id: "8", name: "Вероятность и статистика", subtopics: ["8.1", "8.2", "8.3", "8.4", "8.5"] }
        ];

        // Calculate averages for each main topic
        const calculatedTopicProgress = mainTopics.map(mainTopic => {
          const allSkillScores: number[] = [];

          // Get all skills for the subtopics of this main topic
          mainTopic.subtopics.forEach(subtopicId => {
            const subtopic = topicMappingData.find(topic => topic.topic === subtopicId);
            if (subtopic) {
              subtopic.skills.forEach(skillNum => {
                const skillKey = `skill_${skillNum}` as keyof typeof skillData;
                const skillValue = skillData[skillKey] as number || 0;
                allSkillScores.push(skillValue);
              });
            }
          });

          const averageScore = allSkillScores.length > 0 
            ? Math.round(allSkillScores.reduce((sum, score) => sum + score, 0) / allSkillScores.length)
            : 0;

          return {
            topic: mainTopic.id,
            name: mainTopic.name,
            averageScore
          };
        });

        // Calculate general preparedness (average of all 181 skills)
        const allSkillScores: number[] = [];
        for (let i = 1; i <= 181; i++) {
          const skillKey = `skill_${i}` as keyof typeof skillData;
          const skillValue = skillData[skillKey] as number;
          if (skillValue !== undefined && skillValue !== null) {
            allSkillScores.push(skillValue);
          }
        }

        const generalPrep = allSkillScores.length > 0 
          ? Math.round(allSkillScores.reduce((sum, score) => sum + score, 0) / allSkillScores.length)
          : 0;

        setTopicProgress(calculatedTopicProgress);
        setGeneralPreparedness(generalPrep);
      } catch (err) {
        console.error('Error fetching skill data:', err);
        setError('Ошибка загрузки данных о навыках');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkillData();
  }, [user]);

  return {
    topicProgress,
    generalPreparedness,
    isLoading,
    error
  };
};
