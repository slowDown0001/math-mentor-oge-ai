import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowLeft, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ProgressData {
  [key: string]: number;
}

const OgemathProgress: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [skillsProgress, setSkillsProgress] = useState<ProgressData[]>([]);
  const [problemTypesProgress, setProblemTypesProgress] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [problemTypesOpen, setProblemTypesOpen] = useState(true);

  const skillIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 190, 191, 192, 195, 196, 197, 198, 199, 200];
  
  const problemNumberTypes = [1, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchProgressData();
  }, [user, navigate]);

  const fetchProgressData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch skills progress
      const skillsResponse = await supabase.functions.invoke('compute-skills-progress-bars', {
        body: {
          user_id: user.id,
          skill_ids: skillIds
        }
      });

      if (skillsResponse.error) {
        throw new Error('Ошибка загрузки прогресса навыков');
      }

      // Fetch problem types progress
      const problemTypesResponse = await supabase.functions.invoke('compute-problem-number-type-progress-bars', {
        body: {
          user_id: user.id,
          problem_number_types: problemNumberTypes
        }
      });

      if (problemTypesResponse.error) {
        throw new Error('Ошибка загрузки прогресса типов задач');
      }

      setSkillsProgress(skillsResponse.data?.data?.progress_bars || []);
      setProblemTypesProgress(problemTypesResponse.data?.data?.progress_bars || []);
    } catch (err) {
      console.error('Error fetching progress data:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallProgress = (progressData: ProgressData[]): number => {
    if (progressData.length === 0) return 0;
    const total = progressData.reduce((sum, item) => {
      const value = Object.values(item)[0];
      return sum + value;
    }, 0);
    return Math.round((total / progressData.length) * 100);
  };

  const getProgressColor = (value: number): string => {
    if (value >= 0.8) return 'bg-green-500';
    if (value >= 0.6) return 'bg-yellow-500';
    if (value >= 0.4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getProgressStatus = (value: number): string => {
    if (value >= 0.8) return 'Освоен';
    if (value >= 0.6) return 'Хорошо';
    if (value >= 0.4) return 'Изучается';
    return 'Требует внимания';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Загрузка прогресса...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchProgressData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Попробовать снова
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/ogemath')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Назад</span>
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Прогресс обучения</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Общий прогресс навыков</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateOverallProgress(skillsProgress)}%</div>
              <Progress value={calculateOverallProgress(skillsProgress)} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {skillsProgress.length} навыков отслеживается
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Общий прогресс типов задач</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateOverallProgress(problemTypesProgress)}%</div>
              <Progress value={calculateOverallProgress(problemTypesProgress)} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {problemTypesProgress.length} типов задач отслеживается
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Problem Types Progress */}
        <Card className="mb-6">
          <Collapsible open={problemTypesOpen} onOpenChange={setProblemTypesOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Прогресс по типам задач</CardTitle>
                  {problemTypesOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {problemTypesProgress.map((item, index) => {
                  const key = Object.keys(item)[0];
                  const value = item[key];
                  const percentage = Math.round(value * 100);
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Задача номер {key}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{percentage}%</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            value >= 0.8 ? 'bg-green-100 text-green-800' :
                            value >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                            value >= 0.4 ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {getProgressStatus(value)}
                          </span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Skills Progress */}
        <Card>
          <Collapsible open={skillsOpen} onOpenChange={setSkillsOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Прогресс по навыкам</CardTitle>
                  {skillsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {skillsProgress.map((item, index) => {
                  const key = Object.keys(item)[0];
                  const value = item[key];
                  const percentage = Math.round(value * 100);
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Навык номер {key}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{percentage}%</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            value >= 0.8 ? 'bg-green-100 text-green-800' :
                            value >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                            value >= 0.4 ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {getProgressStatus(value)}
                          </span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </div>
  );
};

export default OgemathProgress;