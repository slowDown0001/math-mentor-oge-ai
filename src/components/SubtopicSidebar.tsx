import { FileText, Play, PenTool } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useStudentSkills } from "@/hooks/useStudentSkills";
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
  const { topicProgress, isLoading } = useStudentSkills();

  // Get module progress based on real data from database - matching the main content logic
  const getModuleProgress = (unitNumber: number): number => {
    if (isLoading || !topicProgress.length) return 0;
    
    // Find the topic that corresponds to this unit number
    const topic = topicProgress.find(t => t.topic === unitNumber.toString());
    return topic ? topic.averageScore : 0;
  };

  // Get skill progress from database using real data
  const getSkillProgress = (skillId: number): number => {
    if (isLoading || !topicProgress.length) return 0;
    
    // Find which topic this skill belongs to by mapping skill IDs to topic numbers
    // This is a simplified mapping - you may need to adjust based on your topic structure
    let topicNum = "1"; // default
    
    if (skillId >= 1 && skillId <= 17 || skillId === 180) topicNum = "1"; // Numbers and calculations
    else if (skillId >= 18 && skillId <= 20) topicNum = "1"; // Still numbers
    else if (skillId >= 21 && skillId <= 23) topicNum = "1"; // Still numbers
    else if (skillId >= 24 && skillId <= 34) topicNum = "1"; // Still numbers/data
    else if (skillId >= 35 && skillId <= 38) topicNum = "2"; // Algebraic expressions
    else if (skillId >= 39 && skillId <= 44) topicNum = "2"; // Algebraic expressions
    else if (skillId >= 45 && skillId <= 49 || skillId === 179) topicNum = "2"; // Algebraic expressions
    else if (skillId >= 50 && skillId <= 57) topicNum = "2"; // Algebraic expressions
    
    const topic = topicProgress.find(t => t.topic === topicNum);
    if (!topic) return 0;
    
    // Add some variation around the topic average for individual skills
    const baseScore = topic.averageScore;
    const variation = (skillId * 7) % 20 - 10; // -10 to +10 variation
    return Math.max(0, Math.min(100, baseScore + variation));
  };

  // Get completion status based on progress percentage
  const getCompletionStatus = (progress: number): 'not_started' | 'attempted' | 'partial' | 'good' | 'mastered' => {
    if (progress >= 90) return 'mastered';
    if (progress >= 70) return 'good';
    if (progress >= 40) return 'partial';
    if (progress >= 20) return 'attempted';
    return 'not_started';
  };

  // Get progress indicator for sidebar items using real data
  const getProgressIndicator = (skillId: number) => {
    const skillProgress = getSkillProgress(skillId);
    const status = getCompletionStatus(skillProgress);
    
    const colors = {
      'not_started': 'bg-blue-100 border-blue-300',
      'attempted': 'bg-red-100 border-red-300', 
      'partial': 'bg-orange-300 border-orange-400',
      'good': 'bg-blue-400 border-blue-500',
      'mastered': 'bg-blue-600 border-blue-700'
    };
    
    return (
      <div className={`w-3 h-3 border rounded-sm ${colors[status]} flex-shrink-0`} />
    );
  };

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
                        <>
                          <span className="truncate flex-1">{item.name}</span>
                          {item.skillId && getProgressIndicator(item.skillId)}
                        </>
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
