
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
          const defaultTopicProgress = topicMappingData.map(topic => ({
            topic: topic.topic,
            name: topic.name,
            averageScore: 0
          }));
          setTopicProgress(defaultTopicProgress);
          setGeneralPreparedness(0);
          setIsLoading(false);
          return;
        }

        // Calculate topic-level averages
        const calculatedTopicProgress = topicMappingData.map(topic => {
          const skillScores = topic.skills.map(skillNum => {
            const skillKey = `skill_${skillNum}` as keyof typeof skillData;
            return skillData[skillKey] as number || 0;
          });

          const averageScore = skillScores.length > 0 
            ? Math.round(skillScores.reduce((sum, score) => sum + score, 0) / skillScores.length)
            : 0;

          return {
            topic: topic.topic,
            name: topic.name,
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
