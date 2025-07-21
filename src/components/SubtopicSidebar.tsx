import { FileText, Play, PenTool } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useMasterySystem } from "@/hooks/useMasterySystem";
import topicMappingData from "../../documentation/topic_skill_mapping_with_names.json";

// Skill names mapping
const skillNames: { [key: number]: string } = {
  1: "Натуральные и целые числа", 2: "Запись и сравнение целых чисел", 3: "Арифметические действия с целыми числами", 4: "Делимость чисел", 5: "Признаки делимости",
  6: "Обыкновенные дроби", 7: "Арифметические действия с обыкновенными дробями", 8: "Десятичные дроби", 9: "Арифметические действия с десятичными дробями", 10: "Проценты",
  11: "Положительные и отрицательные числа", 12: "Модуль числа", 13: "Сравнение рациональных чисел", 14: "Арифметические действия с рациональными числами", 15: "Свойства действий с рациональными числами", 16: "Числовые выражения", 17: "Порядок действий", 180: "Координатная прямая",
  18: "Квадратный корень", 19: "Иррациональные числа", 20: "Действительные числа",
  21: "Округление чисел", 22: "Прикидка результата", 23: "Оценка результата",
  24: "Представление данных в виде таблиц", 25: "Представление данных в виде диаграмм", 26: "Представление данных в виде графиков", 27: "Среднее арифметическое", 28: "Размах", 29: "Мода", 30: "Медиана", 31: "Анализ данных",
  32: "Единицы измерения длины", 33: "Единицы измерения площади", 34: "Единицы измерения объёма",
  35: "Буквенные выражения", 36: "Подстановка значений", 37: "Тождественно равные выражения", 38: "Допустимые значения переменных",
  39: "Степень с натуральным показателем", 40: "Свойства степеней", 41: "Степень с целым показателем", 42: "Стандартный вид числа", 43: "Преобразование выражений со степенями", 44: "Сравнение степеней",
  45: "Одночлены", 46: "Многочлены", 47: "Сложение и вычитание многочленов", 48: "Умножение одночлена на многочлен", 49: "Умножение многочлена на многочлен", 179: "Формулы сокращённого умножения",
  50: "Алгебраические дроби", 51: "Сокращение алгебраических дробей", 52: "Сложение и вычитание алгебраических дробей", 53: "Умножение и деление алгебраических дробей",
  54: "Квадратные корни", 55: "Арифметический квадратный корень", 56: "Свойства квадратных корней", 57: "Преобразование выражений с квадратными корнями"
};

// Video titles for skills
const videoTitles: { [key: number]: string } = {
  35: "Буквенные выражения",
  36: "Подстановка значений",
  37: "Тождественно равные выражения", 
  38: "Допустимые значения переменных"
};

interface SubtopicSidebarProps {
  currentSubunit: {
    id: string;
    title: string;
    skills: number[];
  } | null;
  onVideoClick: (skillName: string) => void;
  onArticleClick: (skillId: number, skillName: string) => void;
  onExerciseClick: (skillIds: number[]) => void;
  currentView: string;
  currentContent?: string; // Current video/article/exercise name
  currentUnitNumber?: number; // Add this prop to match main page progress
}

export function SubtopicSidebar({ 
  currentSubunit, 
  onVideoClick, 
  onArticleClick, 
  onExerciseClick,
  currentView,
  currentContent,
  currentUnitNumber = 1
}: SubtopicSidebarProps) {
  const { state } = useSidebar();
  const { calculateUnitProgress } = useMasterySystem();

  // Get module progress using the same logic as the main content
  const getModuleProgress = (unitNumber: number): number => {
    const progress = calculateUnitProgress(unitNumber);
    // For demo purposes, add some sample progress when no real data exists
    if (progress === 0) {
      // Return sample progress values for demonstration
      const sampleProgress = [0, 25, 45, 15, 0, 60, 30, 85];
      return sampleProgress[unitNumber - 1] || 0;
    }
    return progress;
  };

  // For now, we'll just show that module progress
  // Individual skill progress indicators are disabled until implemented

  if (!currentSubunit) return null;

  const isCollapsed = state === "collapsed";
  const moduleProgress = getModuleProgress(currentUnitNumber);

  const getContentItems = () => {
    if (!currentSubunit) return [];
    
    const items: Array<{type: 'video' | 'article' | 'exercise', name: string, skillId?: number, skills?: number[]}> = [];
    
    // Add ALL videos for each skill (whether they exist or not)
    currentSubunit.skills.forEach(skillId => {
      const skillName = skillNames[skillId] || `Навык ${skillId}`;
      items.push({
        type: 'video',
        name: `Видео: ${skillName}`,
        skillId
      });
    });
    
    // Add ALL articles for each skill
    currentSubunit.skills.forEach(skillId => {
      const skillName = skillNames[skillId] || `Навык ${skillId}`;
      items.push({
        type: 'article', 
        name: `Статья: ${skillName}`,
        skillId
      });
    });
    
    // Add ALL exercises for each skill individually
    currentSubunit.skills.forEach(skillId => {
      const skillName = skillNames[skillId] || `Навык ${skillId}`;
      items.push({
        type: 'exercise',
        name: `Упражнения: ${skillName}`,
        skills: [skillId]
      });
    });
    
    // Also add one combined exercise for all skills
    items.push({
      type: 'exercise',
      name: `Упражнения: ${currentSubunit.title} (все навыки)`,
      skills: currentSubunit.skills
    });
    
    return items;
  };

  const contentItems = getContentItems();

  const getIcon = (type: 'video' | 'article' | 'exercise') => {
    switch(type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'article': return <FileText className="h-4 w-4" />;
      case 'exercise': return <PenTool className="h-4 w-4" />;
    }
  };

  const isActive = (item: any) => {
    return currentContent === item.name;
  };

  return (
    <Sidebar 
      className={isCollapsed ? "w-14" : "w-60"} 
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "text-xs" : ""}>
            {isCollapsed ? "Содержание" : (
              <div className="flex flex-col gap-1">
                <span>{currentSubunit.title}</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${moduleProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 min-w-[30px]">
                    {moduleProgress}%
                  </span>
                </div>
              </div>
            )}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {contentItems.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    onClick={() => {
                      if (item.type === 'video') {
                        onVideoClick(item.name);
                      } else if (item.type === 'article' && item.skillId) {
                        onArticleClick(item.skillId, item.name);
                      } else if (item.type === 'exercise' && item.skills) {
                        onExerciseClick(item.skills);
                      }
                    }}
                    className={isActive(item) ? "bg-primary text-primary-foreground font-medium shadow-sm" : "hover:bg-muted/50"}
                  >
                    <div className="flex items-center gap-2 w-full">
                      {getIcon(item.type)}
                       {!isCollapsed && (
                        <span className="truncate flex-1">{item.name}</span>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
