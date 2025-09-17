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
  const [problemTypesProgress, setProblemTypesProgress] = useState<ProgressData[]>([]);
  const [topicMastery, setTopicMastery] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [problemTypesOpen, setProblemTypesOpen] = useState(true);
  const [topicMasteryOpen, setTopicMasteryOpen] = useState(false);
  const [moduleProgressOpen, setModuleProgressOpen] = useState(false);

  const skillIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 190, 191, 192, 195, 196, 197, 198, 199, 200];
  
  const problemNumberTypes = [1, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
  
  const topicCodes = ['1.1', '1.2','1.3', '1.4','1.5','2.1','2.2','2.3','2.4','2.5','3.1','3.2','3.3','4.1','4.2','5.1', '6.1','6.2','7.1','7.2','7.3','7.4','7.5','7.6','7.7','8.1','8.2','8.3','8.4','8.5','9.1','9.2'];

  const modules = [
    { id: 1, name: 'Числа и вычисления', topicCodes: ['1.1', '1.2', '1.3', '1.4', '1.5'] },
    { id: 2, name: 'Алгебраические выражения', topicCodes: ['2.1', '2.2', '2.3', '2.4', '2.5'] },
    { id: 3, name: 'Уравнения и неравенства', topicCodes: ['3.1', '3.2', '3.3'] },
    { id: 4, name: 'Числовые последовательности', topicCodes: ['4.1', '4.2'] },
    { id: 5, name: 'Функции', topicCodes: ['5.1'] },
    { id: 6, name: 'Координаты на прямой и плоскости', topicCodes: ['6.1', '6.2'] },
    { id: 7, name: 'Геометрия', topicCodes: ['7.1', '7.2', '7.3', '7.4', '7.5', '7.6', '7.7'] },
    { id: 8, name: 'Вероятность и статистика', topicCodes: ['8.1', '8.2', '8.3', '8.4', '8.5'] },
    { id: 9, name: 'Применение математики к прикладным задачам', topicCodes: ['9.1', '9.2'] }
  ];

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

      // Fetch problem types progress
      const problemTypesResponse = await supabase.functions.invoke('compute-problem-number-type-progress-bars', {
        body: {
          user_id: user.id,
          problem_number_types: problemNumberTypes,
          course_id: '1'
        }
      });

      if (problemTypesResponse.error) {
        throw new Error('Ошибка загрузки прогресса типов задач');
      }

      // Fetch topic mastery
      const topicMasteryPromises = topicCodes.map(async (topicCode) => {
        const response = await supabase.functions.invoke('compute-topic-mastery', {
          body: {
            user_id: user.id,
            topic_code: topicCode,
            course_id: '1'
          }
        });
        
        if (response.error) {
          console.error(`Error fetching mastery for topic ${topicCode}:`, response.error);
          return { [topicCode]: 0 };
        }
        
        const mastery = response.data?.data?.topic_mastery || 0;
        return { [topicCode]: mastery };
      });

      const topicMasteryResults = await Promise.all(topicMasteryPromises);

      setProblemTypesProgress(problemTypesResponse.data?.data?.progress_bars || []);
      setTopicMastery(topicMasteryResults);
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

  const calculateModuleProgress = (): ProgressData[] => {
    return modules.map(module => {
      const moduleTopicMastery = topicMastery.filter(item => {
        const topicCode = Object.keys(item)[0];
        return module.topicCodes.includes(topicCode);
      });
      
      if (moduleTopicMastery.length === 0) return { [`${module.id}`]: 0 };
      
      const total = moduleTopicMastery.reduce((sum, item) => {
        const value = Object.values(item)[0];
        return sum + value;
      }, 0);
      
      const average = total / moduleTopicMastery.length;
      return { [`${module.id}`]: average };
    });
  };

  const getModuleName = (moduleId: string): string => {
    const module = modules.find(m => m.id.toString() === moduleId);
    return module ? module.name : `Модуль ${moduleId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Загрузка прогресса...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-destructive">{error}</p>
            <button
              onClick={fetchProgressData}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Попробовать снова
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/db2')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Назад</span>
            </button>
            <h1 className="text-lg font-semibold">Прогресс обучения</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">{calculateOverallProgress(problemTypesProgress)}%</div>
              <div className="text-sm text-muted-foreground">Типы задач</div>
              <Progress value={calculateOverallProgress(problemTypesProgress)} className="h-2" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">{calculateOverallProgress(topicMastery)}%</div>
              <div className="text-sm text-muted-foreground">Темы</div>
              <Progress value={calculateOverallProgress(topicMastery)} className="h-2" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">{calculateOverallProgress(calculateModuleProgress())}%</div>
              <div className="text-sm text-muted-foreground">Модули</div>
              <Progress value={calculateOverallProgress(calculateModuleProgress())} className="h-2" />
            </div>
          </Card>
        </div>

        {/* Problem Types Progress */}
        <Card>
          <Collapsible open={problemTypesOpen} onOpenChange={setProblemTypesOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Прогресс по типам задач</CardTitle>
                  {problemTypesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-3">
                {problemTypesProgress.map((item, index) => {
                  const key = Object.keys(item)[0];
                  const value = item[key];
                  const percentage = Math.round(value * 100);
                  
                  return (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-sm">№{key}</span>
                      <div className="flex items-center gap-3 flex-1 ml-4">
                        <Progress value={percentage} className="h-2 flex-1" />
                        <span className="text-sm font-medium min-w-[3rem] text-right">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Module Progress */}
        <Card>
          <Collapsible open={moduleProgressOpen} onOpenChange={setModuleProgressOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Прогресс по модулям</CardTitle>
                  {moduleProgressOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-3">
                {calculateModuleProgress().map((item, index) => {
                  const key = Object.keys(item)[0];
                  const value = item[key];
                  const percentage = Math.round(value * 100);
                  const moduleName = getModuleName(key);
                  
                  return (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-sm">{key}. {moduleName}</span>
                      <div className="flex items-center gap-3 flex-1 ml-4">
                        <Progress value={percentage} className="h-2 flex-1" />
                        <span className="text-sm font-medium min-w-[3rem] text-right">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Topic Mastery Progress */}
        <Card>
          <Collapsible open={topicMasteryOpen} onOpenChange={setTopicMasteryOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Прогресс по темам</CardTitle>
                  {topicMasteryOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-3">
                {topicMastery.map((item, index) => {
                  const key = Object.keys(item)[0];
                  const value = item[key];
                  const percentage = Math.round(value * 100);
                  
                  return (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-sm">{key}</span>
                      <div className="flex items-center gap-3 flex-1 ml-4">
                        <Progress value={percentage} className="h-2 flex-1" />
                        <span className="text-sm font-medium min-w-[3rem] text-right">{percentage}%</span>
                      </div>
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