import React, { useMemo, useState, useEffect } from "react";
import { LayoutGrid, ListOrdered, ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * OGE Progress — Minimal, Spacious Preview with Real Data
 */

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

function LegendItem({ label, mid }: { label: string; mid: number }) {
  const hue = hueForProgress(mid);
  return (
    <span className="inline-flex items-center gap-2 text-[11px] text-gray-600">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `hsl(${hue} 72% 44%)` }} />
      {label}
    </span>
  );
}

// ---------- Placeholders ----------
const PLACEHOLDER_MODULES: ModuleItem[] = [
  { id: 1, title: "Числа и вычисления", progress: 0, mastered: 0, total: 0 },
  { id: 2, title: "Алгебраические выражения", progress: 0, mastered: 0, total: 0 },
  { id: 3, title: "Уравнения и неравенства", progress: 0, mastered: 0, total: 0 },
  { id: 4, title: "Числовые последовательности", progress: 0, mastered: 0, total: 0 },
  { id: 5, title: "Функции", progress: 0, mastered: 0, total: 0 },
  { id: 6, title: "Координаты на прямой и плоскости", progress: 0, mastered: 0, total: 0 },
  { id: 7, title: "Геометрия", progress: 0, mastered: 0, total: 0 },
  { id: 8, title: "Вероятность и статистика", progress: 0, mastered: 0, total: 0 },
  { id: 9, title: "Применение к прикладным задачам", progress: 0, mastered: 0, total: 0 },
];

const PLACEHOLDER_PROBLEMS: ProblemItem[] = (() => {
  const arr: ProblemItem[] = [];
  arr.push({ key: "1-5", label: "1–5", progress: 0 });
  for (let n = 6; n <= 26; n++) arr.push({ key: String(n), label: String(n), progress: 0 });
  return arr;
})();

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
    <div className="rounded-2xl border border-gray-200 bg-white/90 p-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-gray-400">№ {label}</span>
      </div>
      <div className="mt-3 grid place-items-center">
        <div className="h-14 w-14 animate-pulse rounded-full bg-gray-200" />
      </div>
      <div className="mt-3"><SkeletonBar /></div>
      <div className="mt-2 h-3 w-20 animate-pulse rounded bg-gray-200 mx-auto" />
    </div>
  );
}

// ---------- Components ----------
function ModuleCard({ m }: { m: ModuleItem }) {
  const ring = `hsl(${hueForProgress(m.progress)} 72% 44%)`;
  return (
    <div className="group relative rounded-2xl border border-gray-200 bg-white/90 p-4 hover:border-gray-300 transition-colors">
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

function ModuleView({ modules }: { modules: ModuleItem[] }) {
  const hasRealData = modules.some(m => m.progress > 0 || m.total > 0 || m.mastered > 0);
  const [sortByLow, setSortByLow] = useState(true);
  const [onlyNeedsWork, setOnlyNeedsWork] = useState(false);

  const list = useMemo(() => {
    let arr = [...modules];
    if (onlyNeedsWork) arr = arr.filter(m => m.progress < 80);
    arr.sort((a, b) => (sortByLow ? a.progress - b.progress : b.progress - a.progress));
    return arr;
  }, [modules, sortByLow, onlyNeedsWork]);

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
          ? list.map((m) => <ModuleCard key={m.id} m={m} />)
          : PLACEHOLDER_MODULES.map((m) => <ModuleCardSkeleton key={m.id} title={m.title} />)}
      </div>
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6">
        {hasRealData
          ? filtered.map((it) => (
              <div key={it.key} className="rounded-2xl border border-gray-200 bg-white/90 p-3 hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-gray-800">№ {it.label}</span>
                </div>
                <div className="mt-3 grid place-items-center">
                  <Radial value={it.progress} />
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full rounded-full" style={{ width: `${it.progress}%`, backgroundColor: `hsl(${hueForProgress(it.progress)} 72% 44%)` }} />
                </div>
                <div className="mt-2 text-center text-[11px] text-gray-500">{statusText(it.progress)}</div>
              </div>
            ))
          : PLACEHOLDER_PROBLEMS.map((it) => <ProblemCardSkeleton key={it.key} label={it.label} />)}
      </div>
    </div>
  );
}

// ---------- Sticky Tab Bar ----------
function TabBar({ mode, setMode }: { mode: "module" | "problem"; setMode: (m: "module" | "problem") => void }) {
  return (
    <div className="sticky top-0 z-30 -mx-4 sm:mx-0 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/95 border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center gap-2 py-3">
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
        </div>
      </div>
    </div>
  );
}

// ---------- Data Fetching Hook ----------
function useOgemathProgressData() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [problems, setProblems] = useState<ProblemItem[]>([]);

  const moduleDefinitions = [
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

  const topicCodes = ['1.1', '1.2','1.3', '1.4','1.5','2.1','2.2','2.3','2.4','2.5','3.1','3.2','3.3','4.1','4.2','5.1', '6.1','6.2','7.1','7.2','7.3','7.4','7.5','7.6','7.7','8.1','8.2','8.3','8.4','8.5','9.1','9.2'];
  const problemNumberTypes = [1, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];

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
      
      // Transform problem types data
      const problemsData: ProblemItem[] = (problemTypesResponse.data?.data?.progress_bars || []).map((item: ProgressData) => {
        const key = Object.keys(item)[0];
        const value = item[key];
        return {
          key,
          label: key,
          progress: Math.round(value * 100)
        };
      });

      // Transform modules data
      const modulesData: ModuleItem[] = moduleDefinitions.map(moduleDef => {
        const moduleTopicMastery = topicMasteryResults.filter(item => {
          const topicCode = Object.keys(item)[0];
          return moduleDef.topicCodes.includes(topicCode);
        });
        
        let progress = 0;
        if (moduleTopicMastery.length > 0) {
          const total = moduleTopicMastery.reduce((sum, item) => {
            const value = Object.values(item)[0];
            return sum + value;
          }, 0);
          progress = Math.round((total / moduleTopicMastery.length) * 100);
        }

        const mastered = moduleTopicMastery.filter(item => Object.values(item)[0] >= 0.8).length;
        const total = moduleTopicMastery.length;

        return {
          id: moduleDef.id,
          title: moduleDef.name,
          progress,
          mastered,
          total
        };
      });

      setProblems(problemsData);
      setModules(modulesData);
    } catch (err) {
      console.error('Error fetching progress data:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProgressData();
    }
  }, [user]);

  return { modules, problems, loading, error, refetch: fetchProgressData };
}

// ---------- Page Shell ----------
export default function OgemathProgress2() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"module" | "problem">("module");
  const { modules, problems, loading, error } = useOgemathProgressData();

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
        <div className="w-full max-w-md text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <button
            onClick={() => navigate('/ogemath-progress')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Вернуться к старой версии
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/ogemath-progress')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Назад</span>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">ОГЭ — Прогресс (v2)</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <header className="pt-8 pb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">ОГЭ — Прогресс</h1>
          <p className="mt-2 text-sm text-gray-600">Минималистичный обзор прогресса по модулям и по номерам заданий.</p>
        </header>

        <TabBar mode={mode} setMode={setMode} />

        <main className="py-8 space-y-10">
          {mode === "module" ? (
            <ModuleView modules={modules} />
          ) : (
            <ProblemView problems={problems} />
          )}
        </main>

        <footer className="pb-16 pt-4 text-[12px] text-gray-500">
          Новый дизайн страницы прогресса. Данные взяты из реального API.
        </footer>
      </div>
    </div>
  );
}