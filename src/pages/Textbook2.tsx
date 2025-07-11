import { useState, useEffect } from "react";
import { BookOpen, Play, FileText, PenTool, HelpCircle, Award, Star, Lock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import { useMasterySystem } from "@/hooks/useMasterySystem";

// Topic mapping data embedded directly
const topicMapping = [
  { "topic": "1.1", "name": "Натуральные и целые числа", "skills": [1,2,3,4,5] },
  { "topic": "1.2", "name": "Дроби и проценты", "skills": [6,7,8,9,10] },
  { "topic": "1.3", "name": "Рациональные числа и арифметические действия", "skills": [11,12,13,14,15,16,17,180] },
  { "topic": "1.4", "name": "Действительные числа", "skills": [18,19,20] },
  { "topic": "1.5", "name": "Приближённые вычисления", "skills": [21,22,23] },
  { "topic": "1.6", "name": "Работа с данными и графиками", "skills": [24,25,26,27,28,29,30,31] },
  { "topic": "1.7", "name": "Прикладная геометрия: площади и расстояния в жизни", "skills": [32,33,34] },
  { "topic": "2.1", "name": "Буквенные выражения", "skills": [35,36,37,38] },
  { "topic": "2.2", "name": "Степени", "skills": [39,40,41,42,43,44] },
  { "topic": "2.3", "name": "Многочлены", "skills": [45,46,47,48,49,179] },
  { "topic": "2.4", "name": "Алгебраические дроби", "skills": [50,51,52,53] },
  { "topic": "2.5", "name": "Арифметические корни", "skills": [54,55,56,57] },
  { "topic": "3.1", "name": "Уравнения и системы", "skills": [58,59,60,61,62] },
  { "topic": "3.2", "name": "Неравенства и системы", "skills": [63,64,65,66,67,68] },
  { "topic": "3.3", "name": "Текстовые задачи", "skills": [69,70,71,72,73,74,75] },
  { "topic": "4.1", "name": "Последовательности", "skills": [76,77,78,79] },
  { "topic": "4.2", "name": "Арифметическая и геометрическая прогрессии. Формула сложных процентов", "skills": [80,81,82,83,84,85,86,87,88] },
  { "topic": "5.1", "name": "Свойства и графики функций", "skills": [89,90,91,92,93,94,95,96,97,98,99,100,101,102] },
  { "topic": "6.1", "name": "Координатная прямая", "skills": [103,104,105,106,107,108,109] },
  { "topic": "6.2", "name": "Декартовы координаты", "skills": [110,111] },
  { "topic": "7.1", "name": "Геометрические фигуры", "skills": [112,113,114,115,116] },
  { "topic": "7.2", "name": "Треугольники", "skills": [117,118,119,120,121,122,123,124] },
  { "topic": "7.3", "name": "Многоугольники", "skills": [125,126,127,128,129,130,131,132,133,134] },
  { "topic": "7.4", "name": "Окружность и круг", "skills": [135,136,137,138] },
  { "topic": "7.5", "name": "Измерения", "skills": [139,140,141,142,143,144,145,146,147,148,149,150,151,152,153] },
  { "topic": "7.6", "name": "Векторы", "skills": [154,155,156,157] },
  { "topic": "7.7", "name": "Дополнительные темы по геометрии", "skills": [158,159,160,161] },
  { "topic": "8.1", "name": "Описательная статистика", "skills": [162,163,164,165] },
  { "topic": "8.2", "name": "Вероятность", "skills": [166,167,168] },
  { "topic": "8.3", "name": "Комбинаторика", "skills": [169,170,171,172] },
  { "topic": "8.4", "name": "Множества", "skills": [173,174] },
  { "topic": "8.5", "name": "Графы", "skills": [175,176,177,178] }
];

// TypeScript interfaces
interface Subunit {
  id: string;
  title: string;
  skills: number[];
}

interface Unit {
  title: string;
  description: string;
  color: string;
  subunits: Subunit[];
}

interface CourseStructure {
  [key: number]: Unit;
}

// Create course structure from topic mapping
const createCourseStructure = (): CourseStructure => {
  const structure: CourseStructure = {};
  const unitColors = [
    "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500",
    "bg-red-500", "bg-teal-500", "bg-indigo-500", "bg-pink-500"
  ];
  
  const unitTitles = {
    1: "Числа и вычисления",
    2: "Алгебраические выражения", 
    3: "Уравнения и неравенства",
    4: "Числовые последовательности",
    5: "Функции",
    6: "Координаты на прямой и плоскости",
    7: "Геометрия",
    8: "Элементы комбинаторики, статистики и теории вероятностей"
  };
  
  const unitDescriptions = {
    1: "Натуральные и целые числа, дроби, рациональные и действительные числа",
    2: "Буквенные выражения, степени, многочлены, алгебраические дроби, корни",
    3: "Решение уравнений, неравенств и их систем, текстовые задачи",
    4: "Арифметические и геометрические прогрессии, формула сложных процентов",
    5: "Свойства и графики функций",
    6: "Координатная прямая и декартовы координаты",
    7: "Геометрические фигуры, треугольники, многоугольники, окружности, измерения",
    8: "Статистика, вероятность, комбинаторика, множества, графы"
  };

  // Process topic mapping
  topicMapping.forEach(topic => {
    if (topic.topic === "Special") return; // Skip special topics
    
    const [unitNum, subunitNum] = topic.topic.split('.');
    const unitId = parseInt(unitNum);
    
    if (!structure[unitId]) {
      structure[unitId] = {
        title: unitTitles[unitId as keyof typeof unitTitles] || `Раздел ${unitId}`,
        description: unitDescriptions[unitId as keyof typeof unitDescriptions] || `Описание раздела ${unitId}`,
        color: unitColors[unitId - 1] || "bg-gray-500",
        subunits: []
      };
    }
    
    structure[unitId].subunits.push({
      id: topic.topic,
      title: topic.name,
      skills: topic.skills
    });
  });
  
  return structure;
};

const courseStructure = createCourseStructure();

const Textbook2 = () => {
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [selectedSubunit, setSelectedSubunit] = useState<string | null>(null);
  const { getUserMastery, calculateUnitProgress, getMasteryLevel } = useMasterySystem();

  const handleUnitSelect = (unitNumber: number) => {
    setSelectedUnit(unitNumber);
    setSelectedSubunit(null);
  };

  const handleSubunitSelect = (subunitId: string) => {
    setSelectedSubunit(subunitId);
  };

  const handleBackToUnits = () => {
    setSelectedUnit(null);
    setSelectedSubunit(null);
  };

  const handleBackToSubunits = () => {
    setSelectedSubunit(null);
  };

  const renderUnitOverview = () => (
    <div className="space-y-8">
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Учебник 2.0
        </h1>
        <p className="text-2xl text-gray-600 max-w-4xl leading-relaxed">
          Интерактивный курс математики для подготовки к ОГЭ с системой мастерства
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {Object.entries(courseStructure).map(([unitNum, unit]) => {
          const unitNumber = parseInt(unitNum);
          const progress = calculateUnitProgress(unitNumber);
          const masteryLevel = getMasteryLevel(progress);
          
          return (
            <Card 
              key={unitNum}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => handleUnitSelect(unitNumber)}
            >
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 ${unit.color} rounded-lg flex items-center justify-center mb-3`}>
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold">
                  Модуль {unitNum}
                </CardTitle>
                <CardDescription className="text-sm">
                  {unit.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {unit.description}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Прогресс</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <Badge 
                    variant={masteryLevel === 'mastered' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {masteryLevel === 'mastered' ? 'Освоено' : 
                     masteryLevel === 'proficient' ? 'Хорошо' :
                     masteryLevel === 'familiar' ? 'Знаком' :
                     masteryLevel === 'attempted' ? 'Начато' : 'Не начато'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderSubunitOverview = (unit: any) => (
    <div className="space-y-8">
      <div className="mb-8">
        <Button variant="outline" onClick={handleBackToUnits} className="mb-4">
          ← Все модули
        </Button>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Модуль {selectedUnit}: {unit.title}
        </h1>
        <p className="text-xl text-gray-600">{unit.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {unit.subunits.map((subunit: any) => {
          const progress = calculateUnitProgress(selectedUnit!, subunit.id);
          
          return (
            <Card 
              key={subunit.id}
              className="cursor-pointer hover:shadow-lg transition-all"
              onClick={() => handleSubunitSelect(subunit.id)}
            >
              <CardHeader>
                <CardTitle className="text-lg">
                  {subunit.id} {subunit.title}
                </CardTitle>
                <div className="flex justify-between text-sm">
                  <span>Прогресс</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <ActivityItem 
                    icon={Play} 
                    label="Видео" 
                    count={subunit.skills.length} 
                    color="text-red-600"
                  />
                  <ActivityItem 
                    icon={FileText} 
                    label="Статьи" 
                    count={subunit.skills.length} 
                    color="text-blue-600"
                  />
                  <ActivityItem 
                    icon={PenTool} 
                    label="Упражнения" 
                    count={3} 
                    color="text-green-600"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Unit Quiz and Test */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-yellow-600" />
              Викторина по модулю
            </CardTitle>
            <CardDescription>
              5-7 вопросов для закрепления материала
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
              Начать викторину
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-red-600" />
              Контрольная работа
            </CardTitle>
            <CardDescription>
              12-15 вопросов для проверки знаний
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-red-600 hover:bg-red-700">
              Начать тест
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSubunitContent = (unit: any, subunit: any) => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={handleBackToSubunits}>
          ← {unit.title}
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {subunit.id} {subunit.title}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-4 gap-8">
        {/* Videos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Play className="w-5 h-5" />
              Видео
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {subunit.skills.map((skillId: number, index: number) => (
              <div key={skillId} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <Play className="w-3 h-3 text-red-600" />
                </div>
                <span className="text-sm">Навык {skillId}</span>
                <Badge variant="outline" className="ml-auto">
                  5 мин
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Articles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <FileText className="w-5 h-5" />
              Статьи
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {subunit.skills.map((skillId: number) => (
              <div key={skillId} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-3 h-3 text-blue-600" />
                </div>
                <span className="text-sm">Теория {skillId}</span>
                <Badge variant="outline" className="ml-auto">
                  10 мин
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Practice */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <PenTool className="w-5 h-5" />
              Упражнения
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((exerciseNum) => (
              <div key={exerciseNum} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <PenTool className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-sm">Упражнение {exerciseNum}</span>
                <Badge variant="outline" className="ml-auto">
                  3 задачи
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mastery Progress */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-600">
              <Star className="w-5 h-5" />
              Мастерство
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  0/100
                </div>
                <div className="text-sm text-gray-600">
                  Очки мастерства
                </div>
              </div>
              <Progress value={0} className="h-3" />
              <div className="text-xs text-gray-500 text-center">
                Освойте все материалы для получения мастерства
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const ModuleSidebar = () => (
    <Sidebar className="w-72 border-r bg-background/95 backdrop-blur-sm fixed left-0 top-20 h-[calc(100vh-5rem)] z-10">
      <SidebarContent className="p-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-3">Модули курса</h2>
          <p className="text-base text-muted-foreground">Все 8 модулей всегда доступны</p>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-6">
              {Object.entries(courseStructure).map(([unitNum, unit]) => {
                const unitNumber = parseInt(unitNum);
                const progress = calculateUnitProgress(unitNumber);
                const masteryLevel = getMasteryLevel(progress);
                
                return (
                  <SidebarMenuItem key={unitNum}>
                    <SidebarMenuButton 
                      onClick={() => handleUnitSelect(unitNumber)}
                      className={`w-full p-3 rounded-xl transition-all duration-300 border min-h-[80px] ${
                        selectedUnit === unitNumber 
                          ? 'bg-primary/10 text-primary border-primary/30 shadow-md' 
                          : 'hover:bg-muted/60 border-border/50 hover:shadow-sm hover:border-primary/20'
                      }`}
                    >
                      <div className="flex items-start gap-2 w-full">
                        <div className={`w-8 h-8 ${unit.color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0 text-left space-y-1">
                          <div>
                            <div className="font-semibold text-sm">Модуль {unitNum}</div>
                            <div className="text-xs text-muted-foreground leading-tight line-clamp-2">{unit.title}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Progress value={progress} className="h-1 flex-1" />
                              <span className="text-xs font-medium min-w-fit">{Math.round(progress)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );

  const currentUnit = selectedUnit ? courseStructure[selectedUnit as keyof typeof courseStructure] : null;
  const currentSubunit = selectedSubunit && currentUnit ? 
    currentUnit.subunits.find(sub => sub.id === selectedSubunit) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20">
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <ModuleSidebar />
            <main className="flex-1 overflow-y-auto pl-12 pr-12 py-8">
              <ScrollArea className="h-full">
                {!selectedUnit && renderUnitOverview()}
                {selectedUnit && !selectedSubunit && currentUnit && renderSubunitOverview(currentUnit)}
                {selectedUnit && selectedSubunit && currentUnit && currentSubunit && 
                  renderSubunitContent(currentUnit, currentSubunit)}
              </ScrollArea>
            </main>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
};

// Helper component for activity items
const ActivityItem = ({ icon: Icon, label, count, color }: {
  icon: any;
  label: string;
  count: number;
  color: string;
}) => (
  <div className="flex items-center gap-2 text-sm">
    <Icon className={`w-4 h-4 ${color}`} />
    <span>{label}</span>
    <Badge variant="outline" className="ml-auto text-xs">
      {count}
    </Badge>
  </div>
);

export default Textbook2;