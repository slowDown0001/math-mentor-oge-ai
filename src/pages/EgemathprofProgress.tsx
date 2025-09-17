import React, { useMemo, useState, useEffect } from "react";
import { LayoutGrid, ListOrdered, ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// ---------- Types ----------
export type ModuleItem = { id: number; title: string; progress: number; mastered: number; total: number };
export type ProblemItem = { key: string; label: string; progress: number };

interface ProgressData {
  [key: string]: number;
}

// ---------- Utils ----------
const clamp01 = (n: number) => Math.min(100, Math.max(0, n));
const hueForProgress = (p: number) => Math.round((clamp01(p) / 100) * 120); // 0=red→120=green
const statusText = (p: number) => (p >= 100 ? "Готово!" : p >= 80 ? "Почти мастер" : p >= 40 ? "В процессе" : "Начни здесь");

function Radial({ value, size = 60 }: { value: number; size?: number }) {
  const angle = clamp01(value) * 3.6;
  const hue = hueForProgress(value);
  const ringColor = `hsl(${hue} 72% 44%)`;
  return (
    <div
      className="relative rounded-full"
      style={{ width: size, height: size, background: `conic-gradient(${ringColor} ${angle}deg, #eceef1 0deg)` }}
      aria-label={`Прогресс ${Math.round(value)}%`}
    >
      <div className="absolute inset-[12%] rounded-full bg-white/90 grid place-items-center text-[11px] font-semibold text-gray-800">
        {Math.round(value)}%
      </div>
    </div>
  );
}

// ---------- Skeletons ----------
function SkeletonBar() {
  return <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200"><div className="h-full w-1/3 animate-pulse rounded-full bg-gray-300" /></div>;
}
function ModuleCardSkeleton({ title }: { title: string }) {
  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white/90 p-4">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 animate-pulse rounded-full bg-gray-200" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold text-gray-400">{title}</h3>
          <div className="mt-2"><SkeletonBar /></div>
          <div className="mt-2 h-4 w-40 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
function ProblemCardSkeleton({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white/90 p-2.5">
      <div className="flex items-center justify-center mb-2">
        <span className="text-[12px] font-medium text-gray-400">№ {label}</span>
      </div>
      <div className="grid place-items-center mb-2">
        <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />
      </div>
      <div className="mb-1"><SkeletonBar /></div>
      <div className="h-2 w-16 animate-pulse rounded bg-gray-200 mx-auto" />
    </div>
  );
}

// Topic names mapping for EGE Prof
const TOPIC_NAMES: { [key: string]: string } = {
  '1.1': 'Натуральные и целые числа',
  '1.2': 'Дроби и проценты',
  '1.3': 'Арифметический корень (n-й)',
  '1.4': 'Степени',
  '1.5': 'Тригонометрические функции (sin, cos, tg) как числа',
  '1.6': 'Логарифм числа',
  '1.7': 'Действительные числа',
  '1.8': 'Преобразование выражений',
  '1.9': 'Комплексные числа',
  '2.1': 'Целые и дробно-рациональные уравнения',
  '2.2': 'Иррациональные уравнения',
  '2.3': 'Тригонометрические уравнения',
  '2.4': 'Показательные и логарифмические уравнения',
  '2.5': 'Целые и дробно-рациональные неравенства',
  '2.6': 'Иррациональные неравенства',
  '2.7': 'Показательные и логарифмические неравенства',
  '2.8': 'Тригонометрические неравенства',
  '2.9': 'Системы и совокупности уравнений и неравенств',
  '2.10': 'Уравнения, неравенства и системы с параметрами',
  '2.11': 'Матрица системы линейных уравнений',
  '2.12': 'Графические методы решения уравнений и неравенств',
  '3.1': 'Функции',
  '3.2': 'Свойства функции',
  '3.3': 'Степенная функция',
  '3.4': 'Тригонометрические функции',
  '3.5': 'Показательная и логарифмическая функции',
  '3.6': 'Непрерывность функций и асимптоты',
  '3.7': 'Последовательности',
  '3.8': 'Арифметическая и геометрическая прогрессии. Формула сложных процентов',
  '4.1': 'Производная функции',
  '4.2': 'Применение производной к исследованию функций',
  '4.3': 'Первообразная. Интеграл',
  '5.1': 'Множества. Диаграммы Эйлера–Венна',
  '5.2': 'Логика',
  '6.1': 'Описательная статистика',
  '6.2': 'Вероятность',
  '6.3': 'Комбинаторика',
  '7.1': 'Фигуры на плоскости',
  '7.2': 'Прямые и плоскости в пространстве',
  '7.3': 'Многогранники',
  '7.4': 'Тела и поверхности вращения',
  '7.5': 'Координаты и векторы',
  '8.1': 'Чтение и анализ графических схем',
  '8.2': 'Прикладные задачи'
};

function LegendItem({ label, mid }: { label: string; mid: number }) {
  const hue = hueForProgress(mid);
  return (
    <span className="inline-flex items-center gap-2 text-[11px] text-gray-600">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `hsl(${hue} 72% 44%)` }} />
      {label}
    </span>
  );
}

// ---------- Topic Progress Modal ----------
function TopicProgressModal({ 
  isOpen, 
  onClose, 
  module, 
  topicProgress,
  moduleDefinitions 
}: {
  isOpen: boolean;
  onClose: () => void;
  module: ModuleItem | null;
  topicProgress: {[key: string]: number};
  moduleDefinitions: Array<{id: number; name: string; topicCodes: string[]}>;
}) {
  if (!isOpen || !module) return null;

  const moduleDefinition = moduleDefinitions.find(m => m.id === module.id);
  const topics = moduleDefinition?.topicCodes || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{module.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        
        <div className="space-y-3">
          {topics.map(topicCode => {
            const progress = Math.round((topicProgress[topicCode] || 0) * 100);
            const hue = hueForProgress(progress);
            const ringColor = `hsl(${hue} 72% 44%)`;
            
            return (
              <div key={topicCode} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">{TOPIC_NAMES[topicCode] || `Тема ${topicCode}`}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%`, backgroundColor: ringColor }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-10 text-right">{progress}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const EgemathprofProgress: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [problemTypesProgress, setProblemTypesProgress] = useState<ProgressData[]>([]);
  const [topicMastery, setTopicMastery] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [mode, setMode] = useState<"module" | "problem">("problem");
  const [topicProgress, setTopicProgress] = useState<{[key: string]: number}>({});

  const skillIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 190, 191, 192, 195, 196, 197, 198, 199, 200];
  
  const problemNumberTypes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  
  const topicCodes = ['1.1', '1.2','1.3', '1.4','1.5','1.6','1.7','1.8','1.9','2.1','2.2','2.3','2.4','2.5','2.6','2.7','2.8','2.9','2.10','2.11','2.12','3.1','3.2','3.3','3.4','3.5','3.6','3.7','3.8','4.1','4.2','4.3','5.1','5.2','6.1','6.2','6.3','7.1','7.2','7.3','7.4','8.1','8.2'];

  const moduleDefinitions = [
    { id: 1, name: 'Числа и вычисления', topicCodes: ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9'] },
    { id: 2, name: 'Уравнения и неравенства', topicCodes: ['2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', '2.9', '2.10', '2.11', '2.12'] },
    { id: 3, name: 'Функции и графики', topicCodes: ['3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8'] },
    { id: 4, name: 'Начала математического анализа', topicCodes: ['4.1', '4.2', '4.3'] },
    { id: 5, name: 'Множества и логика', topicCodes: ['5.1', '5.2'] },
    { id: 6, name: 'Вероятность и статистика', topicCodes: ['6.1', '6.2', '6.3'] },
    { id: 7, name: 'Геометрия', topicCodes: ['7.1', '7.2', '7.3', '7.4'] },
    { id: 8, name: 'Применение математики к прикладным задачам', topicCodes: ['8.1', '8.2'] }
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
          course_id: '3'
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
            course_id: '3'
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

      // Create topic progress object
      const topicProgressObj: {[key: string]: number} = {};
      topicMasteryResults.forEach(result => {
        const key = Object.keys(result)[0];
        const value = Object.values(result)[0];
        topicProgressObj[key] = value;
      });

      // Convert to new format for modules
      const moduleItems: ModuleItem[] = moduleDefinitions.map(module => {
        const moduleTopicMastery = topicMasteryResults.filter(item => {
          const topicCode = Object.keys(item)[0];
          return module.topicCodes.includes(topicCode);
        });
        
        let average = 0;
        if (moduleTopicMastery.length > 0) {
          const total = moduleTopicMastery.reduce((sum, item) => {
            const value = Object.values(item)[0];
            return sum + value;
          }, 0);
          average = total / moduleTopicMastery.length;
        }
        
        const progress = Math.round(average * 100);
        const mastered = moduleTopicMastery.filter(item => Object.values(item)[0] >= 0.8).length;
        
        return {
          id: module.id,
          title: module.name,
          progress,
          mastered,
          total: module.topicCodes.length
        };
      });

      // Convert to new format for problems
      const problemItems: ProblemItem[] = problemNumberTypes.map(num => {
        const problemData = problemTypesResponse.data?.data?.progress_bars?.find((item: any) => {
          const key = Object.keys(item)[0];
          return key === num.toString();
        });
        const progress = problemData ? Math.round((Object.values(problemData)[0] as number) * 100) : 0;
        
        return {
          key: num.toString(),
          label: num.toString(),
          progress
        };
      });

      setProblemTypesProgress(problemTypesResponse.data?.data?.progress_bars || []);
      setTopicMastery(topicMasteryResults);
      setModules(moduleItems);
      setProblems(problemItems);
      setTopicProgress(topicProgressObj);
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

  const calculateModuleProgress = (): ProgressData[] => {
    return moduleDefinitions.map(module => {
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
    const module = moduleDefinitions.find(m => m.id.toString() === moduleId);
    return module ? module.name : `Модуль ${moduleId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></div>
          </div>
          <p className="text-gray-600 font-medium">Загружаем ваш прогресс...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center space-y-4 max-w-md w-full">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchProgressData}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  // ---------- Components ----------
  function ModuleCard({ m, onClick }: { m: ModuleItem; onClick?: () => void }) {
    const ring = `hsl(${hueForProgress(m.progress)} 72% 44%)`;
    return (
      <div 
        className="group relative rounded-2xl border border-gray-200 bg-white/90 p-4 hover:border-gray-300 transition-colors cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-start gap-4">
          <Radial value={m.progress} size={56} />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[15px] font-semibold text-gray-900">{m.title}</h3>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
              <div className="h-full rounded-full" style={{ width: `${m.progress}%`, backgroundColor: ring }} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-gray-600">
              <span>Освоено: <b>{m.mastered}</b>/<b>{m.total}</b></span>
              <span className="opacity-70">{statusText(m.progress)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function ModuleView({ 
    modules, 
    topicProgress, 
    moduleDefinitions 
  }: { 
    modules: ModuleItem[]; 
    topicProgress: {[key: string]: number};
    moduleDefinitions: Array<{id: number; name: string; topicCodes: string[]}>;
  }) {
    const hasRealData = modules.some(m => m.progress > 0 || m.total > 0 || m.mastered > 0);
    const [sortByLow, setSortByLow] = useState(false);
    const [onlyNeedsWork, setOnlyNeedsWork] = useState(false);
    const [selectedModule, setSelectedModule] = useState<ModuleItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const list = useMemo(() => {
      let arr = [...modules];
      if (onlyNeedsWork) arr = arr.filter(m => m.progress < 80);
      arr.sort((a, b) => sortByLow ? a.progress - b.progress : a.id - b.id);
      return arr;
    }, [modules, sortByLow, onlyNeedsWork]);

    const handleModuleClick = (module: ModuleItem) => {
      setSelectedModule(module);
      setIsModalOpen(true);
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setOnlyNeedsWork(v => !v)} className="rounded-xl border px-3 py-1.5 text-[13px] hover:bg-gray-50">
              {onlyNeedsWork ? "Показать все" : "Только < 80%"}
            </button>
            <button onClick={() => setSortByLow(v => !v)} className="rounded-xl border px-3 py-1.5 text-[13px] hover:bg-gray-50">
              {sortByLow ? "Сортировать: снизу вверх" : "Сортировать: сверху вниз"}
            </button>
          </div>
          <div className="flex flex-wrap gap-4 text-gray-600">
            <LegendItem label="< 40%" mid={20} />
            <LegendItem label="40–79%" mid={60} />
            <LegendItem label="80–99%" mid={90} />
            <LegendItem label="100%" mid={100} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {hasRealData
            ? list.map((m) => <ModuleCard key={m.id} m={m} onClick={() => handleModuleClick(m)} />)
            : modules.map((m) => <ModuleCardSkeleton key={m.id} title={m.title} />)}
        </div>

        <TopicProgressModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          module={selectedModule}
          topicProgress={topicProgress}
          moduleDefinitions={moduleDefinitions}
        />
      </div>
    );
  }

  function ProblemView({ problems }: { problems: ProblemItem[] }) {
    const hasRealData = problems.some(p => p.progress > 0);
    const [showOnlyNeedsWork, setShowOnlyNeedsWork] = useState(false);
    const filtered = useMemo(() => (showOnlyNeedsWork ? problems.filter(i => i.progress < 80) : problems), [problems, showOnlyNeedsWork]);

    useEffect(() => {
      const onKey = (e: KeyboardEvent) => { if (e.key.toLowerCase() === "f") setShowOnlyNeedsWork(v => !v); };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, []);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => setShowOnlyNeedsWork(v => !v)} className="rounded-xl border px-3 py-1.5 text-[13px] hover:bg-gray-50" title="Клавиша F — переключить фильтр">
            {showOnlyNeedsWork ? "Показать все" : "Только < 80%"}
          </button>
          <div className="flex flex-wrap gap-4 text-gray-600">
            <LegendItem label="< 40%" mid={20} />
            <LegendItem label="40–79%" mid={60} />
            <LegendItem label="80–99%" mid={90} />
            <LegendItem label="100%" mid={100} />
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8 gap-3">
          {hasRealData
            ? filtered.map((it) => (
                <div key={it.key} className="rounded-xl border border-gray-200 bg-white/90 p-2 hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-[12px] font-medium text-gray-800">№ {it.label}</span>
                  </div>
                  <div className="grid place-items-center mb-2">
                    <Radial value={it.progress} size={40} />
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200 mb-1">
                    <div className="h-full rounded-full" style={{ width: `${it.progress}%`, backgroundColor: `hsl(${hueForProgress(it.progress)} 72% 44%)` }} />
                  </div>
                  <div className="text-center text-[10px] text-gray-500">{statusText(it.progress)}</div>
                </div>
              ))
            : problemNumberTypes.map((num) => <ProblemCardSkeleton key={num} label={num.toString()} />)}
        </div>
      </div>
    );
  }

  // ---------- Sticky Tab Bar ----------
  function TabBar({ mode, setMode }: { mode: "module" | "problem"; setMode: (m: "module" | "problem") => void }) {
    return (
      <div className="sticky top-0 z-30 -mx-4 sm:mx-0 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/95 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between py-3">
            <nav className="relative inline-flex rounded-xl border bg-white shadow-sm">
              <button
                onClick={() => setMode("module")}
                className={`flex items-center gap-2 px-4 py-2 text-[13px] ${mode === "module" ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-50"}`}
                aria-pressed={mode === "module"}
              >
                <LayoutGrid className="h-4 w-4" /> Модули
              </button>
              <button
                onClick={() => setMode("problem")}
                className={`flex items-center gap-2 px-4 py-2 text-[13px] ${mode === "problem" ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-50"}`}
                aria-pressed={mode === "problem"}
              >
                <ListOrdered className="h-4 w-4" /> Задания
              </button>
            </nav>
            <button
              onClick={() => navigate('/egemathprof')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Назад</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TabBar mode={mode} setMode={setMode} />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {mode === "module" && <ModuleView modules={modules} topicProgress={topicProgress} moduleDefinitions={moduleDefinitions} />}
        {mode === "problem" && <ProblemView problems={problems} />}
      </div>
    </div>
  );
};

export default EgemathprofProgress;