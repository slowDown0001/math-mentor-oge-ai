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

// Course structure - 8 units matching the main topics
const courseStructure = {
  1: {
    title: "Числа и вычисления",
    description: "Основы работы с числами, дроби, проценты",
    color: "bg-blue-500",
    subunits: [
      { id: "1.1", title: "Натуральные числа", skills: [1, 2, 3, 4] },
      { id: "1.2", title: "Обыкновенные дроби", skills: [5, 6, 7, 8] },
      { id: "1.3", title: "Десятичные дроби", skills: [9, 10, 11] },
      { id: "1.4", title: "Проценты", skills: [12, 13, 14] },
      { id: "1.5", title: "Отношения и пропорции", skills: [15, 16, 17] }
    ]
  },
  2: {
    title: "Алгебраические выражения",
    description: "Работа с переменными и алгебраическими выражениями",
    color: "bg-green-500",
    subunits: [
      { id: "2.1", title: "Буквенные выражения", skills: [18, 19, 20] },
      { id: "2.2", title: "Преобразование выражений", skills: [21, 22, 23] },
      { id: "2.3", title: "Формулы сокращенного умножения", skills: [24, 25, 26] }
    ]
  },
  3: {
    title: "Уравнения и неравенства",
    description: "Решение различных типов уравнений и неравенств",
    color: "bg-purple-500",
    subunits: [
      { id: "3.1", title: "Линейные уравнения", skills: [27, 28, 29] },
      { id: "3.2", title: "Квадратные уравнения", skills: [30, 31, 32] },
      { id: "3.3", title: "Системы уравнений", skills: [33, 34, 35] },
      { id: "3.4", title: "Неравенства", skills: [36, 37, 38] }
    ]
  },
  4: {
    title: "Числовые последовательности",
    description: "Арифметические и геометрические прогрессии",
    color: "bg-orange-500",
    subunits: [
      { id: "4.1", title: "Арифметическая прогрессия", skills: [39, 40, 41] },
      { id: "4.2", title: "Геометрическая прогрессия", skills: [42, 43, 44] }
    ]
  },
  5: {
    title: "Функции",
    description: "Изучение различных функций и их графиков",
    color: "bg-red-500",
    subunits: [
      { id: "5.1", title: "Понятие функции", skills: [45, 46, 47] },
      { id: "5.2", title: "Линейная функция", skills: [48, 49, 50] },
      { id: "5.3", title: "Квадратичная функция", skills: [51, 52, 53] },
      { id: "5.4", title: "Функция обратной пропорциональности", skills: [54, 55] }
    ]
  },
  6: {
    title: "Координаты на прямой и плоскости",
    description: "Работа с координатной плоскостью",
    color: "bg-teal-500",
    subunits: [
      { id: "6.1", title: "Координатная прямая", skills: [56, 57] },
      { id: "6.2", title: "Координатная плоскость", skills: [58, 59, 60] },
      { id: "6.3", title: "Графики функций", skills: [61, 62, 63] }
    ]
  },
  7: {
    title: "Геометрия",
    description: "Планиметрия: фигуры, площади, теоремы",
    color: "bg-indigo-500",
    subunits: [
      { id: "7.1", title: "Основные понятия", skills: [64, 65, 66] },
      { id: "7.2", title: "Треугольники", skills: [67, 68, 69, 70] },
      { id: "7.3", title: "Четырехугольники", skills: [71, 72, 73] },
      { id: "7.4", title: "Окружность", skills: [74, 75, 76] },
      { id: "7.5", title: "Площади фигур", skills: [77, 78, 79] }
    ]
  },
  8: {
    title: "Вероятность и статистика",
    description: "Основы теории вероятности и статистики",
    color: "bg-pink-500",
    subunits: [
      { id: "8.1", title: "Описательная статистика", skills: [80, 81, 82] },
      { id: "8.2", title: "Случайные события", skills: [83, 84, 85] },
      { id: "8.3", title: "Вероятность", skills: [86, 87, 88] }
    ]
  }
};

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
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Учебник 2.0
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Интерактивный курс математики для подготовки к ОГЭ с системой мастерства
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Модуль {selectedUnit}: {unit.title}
        </h1>
        <p className="text-gray-600">{unit.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
    <Sidebar className="w-72 border-r bg-background">
      <SidebarContent className="p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">Учебник 2.0</h2>
          <p className="text-sm text-muted-foreground">Выберите модуль для изучения</p>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-4">
              {Object.entries(courseStructure).map(([unitNum, unit]) => {
                const unitNumber = parseInt(unitNum);
                const progress = calculateUnitProgress(unitNumber);
                const masteryLevel = getMasteryLevel(progress);
                
                return (
                  <SidebarMenuItem key={unitNum}>
                    <SidebarMenuButton 
                      onClick={() => handleUnitSelect(unitNumber)}
                      className={`w-full p-5 rounded-2xl transition-all duration-300 border-2 ${
                        selectedUnit === unitNumber 
                          ? 'bg-primary/10 text-primary border-primary/30 shadow-lg scale-[1.02]' 
                          : 'hover:bg-muted/60 border-border/50 hover:shadow-md hover:scale-[1.01] hover:border-primary/20'
                      }`}
                    >
                      <div className="flex items-start gap-4 w-full">
                        <div className={`w-12 h-12 ${unit.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0 text-left space-y-3">
                          <div>
                            <div className="font-bold text-base mb-1">Модуль {unitNum}</div>
                            <div className="text-sm text-muted-foreground leading-relaxed">{unit.title}</div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <Progress value={progress} className="h-2.5 flex-1" />
                              <span className="text-sm font-semibold min-w-fit">{Math.round(progress)}%</span>
                            </div>
                            <Badge 
                              variant={masteryLevel === 'mastered' ? 'default' : 'secondary'}
                              className="text-xs px-3 py-1"
                            >
                              {masteryLevel === 'mastered' ? 'Освоено' : 
                               masteryLevel === 'proficient' ? 'Хорошо' :
                               masteryLevel === 'familiar' ? 'Знаком' :
                               masteryLevel === 'attempted' ? 'Начато' : 'Новое'}
                            </Badge>
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
            <main className="flex-1 p-6">
              {!selectedUnit && (
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Учебник 2.0
                  </h1>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Интерактивный курс математики для подготовки к ОГЭ с системой мастерства
                  </p>
                  <p className="text-gray-500 mt-4">
                    Выберите модуль в левом меню для начала изучения
                  </p>
                </div>
              )}
              {selectedUnit && !selectedSubunit && currentUnit && renderSubunitOverview(currentUnit)}
              {selectedUnit && selectedSubunit && currentUnit && currentSubunit && 
                renderSubunitContent(currentUnit, currentSubunit)}
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