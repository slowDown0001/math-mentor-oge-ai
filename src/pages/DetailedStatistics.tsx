
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { useStudentSkills } from "@/hooks/useStudentSkills";
import topicMappingData from '../../documentation/topic_skill_mapping_with_names.json';
import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubtopicProgress {
  topic: string;
  name: string;
  averageScore: number;
}

const DetailedStatistics = () => {
  const [subtopicProgress, setSubtopicProgress] = useState<SubtopicProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDetailedSkillData = async () => {
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
          // If no skill data exists, create default values for all subtopics
          const defaultSubtopicProgress = topicMappingData.map(topic => ({
            topic: topic.topic,
            name: topic.name,
            averageScore: 0
          }));
          setSubtopicProgress(defaultSubtopicProgress);
          setIsLoading(false);
          return;
        }

        // Calculate averages for each subtopic
        const calculatedSubtopicProgress = topicMappingData.map(topic => {
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

        setSubtopicProgress(calculatedSubtopicProgress);
      } catch (err) {
        console.error('Error fetching detailed skill data:', err);
        setError('Ошибка загрузки подробных данных о навыках');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetailedSkillData();
  }, [user]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Ошибка загрузки подробной статистики</h1>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Link to="/statistics">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад к статистике
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Подробная статистика</h1>
            <p className="text-gray-600">Детальный прогресс по всем темам и подтемам</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Прогресс по всем темам
              </CardTitle>
              <CardDescription>
                Ваш текущий уровень подготовки по каждой теме и подтеме
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">Загрузка подробных данных...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {subtopicProgress.map((subtopic) => (
                    <div key={subtopic.topic} className="p-4 border rounded-lg">
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-medium">
                          {subtopic.topic}. {subtopic.name}
                        </span>
                        <span className="text-sm text-gray-500">{subtopic.averageScore}%</span>
                      </div>
                      <Progress value={subtopic.averageScore} className="h-2" />
                      <div className="mt-2 text-xs text-gray-400">
                        {subtopic.averageScore >= 75 ? "Отличный уровень" : 
                         subtopic.averageScore >= 50 ? "Хороший уровень" : 
                         subtopic.averageScore >= 25 ? "Требует внимания" :
                         "Нужна серьезная работа"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DetailedStatistics;
