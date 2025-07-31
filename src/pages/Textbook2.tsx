import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Play, FileText, PenTool, HelpCircle, Award, Star, Lock, CheckCircle, ArrowLeft, Highlighter, MessageCircle, X, Trophy, PartyPopper, Menu } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import { useMasterySystem } from "@/hooks/useMasterySystem";
import MathRenderer from "@/components/MathRenderer";
import { supabase } from "@/integrations/supabase/client";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import { useChatContext } from "@/contexts/ChatContext";
import { sendChatMessage } from "@/services/chatService";
import { SubtopicSidebar } from "@/components/SubtopicSidebar";
import UnitProgressSummary from "@/components/UnitProgressSummary";

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

// Math skills data from documentation/math_skills_full.json
const mathSkills = [
  { "skill": "Натуральные и целые числа", "id": 1 },
  { "skill": "Научная форма числа", "id": 2 },
  { "skill": "Делимость чисел", "id": 3 },
  { "skill": "Признаки делимости на 2, 3, 5, 9, 10", "id": 4 },
  { "skill": "Нахождение НОД и НОК", "id": 5 },
  { "skill": "Обыкновенные и десятичные дроби", "id": 6 },
  { "skill": "Нахождение доли от числа", "id": 7 },
  { "skill": "Вычисление процентов", "id": 8 },
  { "skill": "Повышение/понижение на процент", "id": 9 },
  { "skill": "Бесконечные периодические дроби", "id": 10 },
  { "skill": "Определение рациональных чисел", "id": 11 },
  { "skill": "Расположение на координатной прямой", "id": 12 },
  { "skill": "Сравнение и упорядочивание рациональных чисел", "id": 13 },
  { "skill": "Преобразование дробей", "id": 14 },
  { "skill": "Арифметические действия с  обыкновенными дробями", "id": 15 },
  { "skill": "Арифметические действия с десятичными дробями", "id": 16 },
  { "skill": "Раскрытие скобок, распределительное свойство", "id": 17 },
  { "skill": "Классификация действительныех чисел", "id": 18 },
  { "skill": "Приближённое значение корня числа", "id": 19 },
  { "skill": "Арифметические действия с рациональными числами", "id": 20 },
  { "skill": "Понятие точности и погрешности", "id": 21 },
  { "skill": "Округление чисел", "id": 22 },
  { "skill": "Приближённые вычисления", "id": 23 },
  { "skill": "Чтение и анализ графических схем: Графики", "id": 24 },
  { "skill": "Чтение и анализ графических схем: Диаграммы ", "id": 25 },
  { "skill": "Чтение и анализ графических схем: План помещения", "id": 26 },
  { "skill": "Чтение и анализ графических схем: Схема маршрута / карта", "id": 27 },
  { "skill": "Чтение и анализ графических схем: Таблицы и расписания", "id": 28 },
  { "skill": "Чтение и анализ графических схем: Тарифные планы", "id": 29 },
  { "skill": "Чтение и анализ графических схем: Линейка, шкала, измерения", "id": 30 },
  { "skill": "Чтение и анализ графических схем: Графики движения", "id": 31 },
  { "skill": "Прикладная геометрия: Путешествия", "id": 32 },
  { "skill": "Прикладная геометрия: Квартиры и садовые участки ", "id": 33 },
  { "skill": "Прикладная геометрия: Шины, теплицы, бумага, печки ", "id": 34 },
  { "skill": "Выражения с переменными", "id": 35 },
  { "skill": "Подстановка значений", "id": 36 },
  { "skill": "Упрощение выражений", "id": 37 },
  { "skill": "Раскрытие скобок", "id": 38 },
  { "skill": "Определение степени с целым показателем", "id": 39 },
  { "skill": "Определение степени с рациональным показателем (Корни)", "id": 40 },
  { "skill": "Умножение и деление степеней при одном основании", "id": 41 },
  { "skill": "Возведение степени в степень", "id": 42 },
  { "skill": "Степень произведения и частного ", "id": 43 },
  { "skill": "Отрицательные степени", "id": 44 },
  { "skill": "Определение одночлена и многочлена", "id": 45 },
  { "skill": "Приведение подобных членов многочленов", "id": 46 },
  { "skill": "Сложение и вычитание многочленов", "id": 47 },
  { "skill": "Умножение многочленов", "id": 48 },
  { "skill": "Разложение многочленов на множители (факторизация)", "id": 49 },
  { "skill": "Определение и сокращение алгебраических дробей", "id": 50 },
  { "skill": "Основное свойство алгебраической дроби", "id": 51 },
  { "skill": "Арифметические действия с алгебраическими дробями", "id": 52 },
  { "skill": "Преобразование выражений с алгебраическими дробями", "id": 53 },
  { "skill": "Определение корней", "id": 54 },
  { "skill": "Свойства корней", "id": 55 },
  { "skill": "Арифметика с корнями", "id": 56 },
  { "skill": "Рационализация знаменателя", "id": 57 },
  { "skill": "Решение линейных уравнений", "id": 58 },
  { "skill": "Решение уравнений с дробями и скобками", "id": 59 },
  { "skill": "Решение квадратных уравнений", "id": 60 },
  { "skill": "Решение систем линейных уравнений", "id": 61 },
  { "skill": "Рациональные уравнения", "id": 62 },
  { "skill": "Решение линейных неравенств", "id": 63 },
  { "skill": "Графическое представление решений", "id": 64 },
  { "skill": "Решение систем неравенств", "id": 65 },
  { "skill": "Квадратные неравенства ", "id": 66 },
  { "skill": "Рациональные неравенства", "id": 67 },
  { "skill": "Метод интервалов", "id": 68 },
  { "skill": "Перевод текставой задачи в уравнение", "id": 69 },
  { "skill": "Текстовые задачи: Задачи на проценты, сплавы и смеси ", "id": 70 },
  { "skill": "Текстовые задачи: Движение по прямой", "id": 71 },
  { "skill": "Текстовые задачи: Задачи на движение по воде ", "id": 72 },
  { "skill": "Текстовые задачи: Задачи на совместную работу ", "id": 73 },
  { "skill": "Текстовые задачи: Задачи про бизнес", "id": 74 },
  { "skill": "Разные текстовые задачи", "id": 75 },
  { "skill": "Запись последовательностей", "id": 76 },
  { "skill": "Способы задания последовательностей", "id": 77 },
  { "skill": "Правило n-го члена последовательностей", "id": 78 },
  { "skill": "Определение следующего члена последовательностей", "id": 79 },
  { "skill": "Арифметическая прогрессия", "id": 80 },
  { "skill": "Сумма первых n членов  АП", "id": 81 },
  { "skill": "Определение разности и первого члена  АП", "id": 82 },
  { "skill": "Текстовые задачи на АП", "id": 83 },
  { "skill": "Геометрическая прогрессия", "id": 84 },
  { "skill": "Сумма первых n членов  ГП", "id": 85 },
  { "skill": "Определение разности и первого члена  ГП", "id": 86 },
  { "skill": "Текстовые задачи на ГП", "id": 87 },
  { "skill": "Сложные проценты", "id": 88 },
  { "skill": "Определение функции", "id": 89 },
  { "skill": "Область определения и множество значений", "id": 90 },
  { "skill": "Нули функции", "id": 91 },
  { "skill": "Построение графиков функции", "id": 92 },
  { "skill": "Линейные функции", "id": 93 },
  { "skill": "Квадратичные функции (Параболы)", "id": 94 },
  { "skill": "Гиперболы ", "id": 95 },
  { "skill": "Промежутки знакопостоянства функции", "id": 96 },
  { "skill": "Промежутки монотонности функции", "id": 97 },
  { "skill": "Чтение графиков функции", "id": 98 },
  { "skill": "Максимумы и минимумы функции", "id": 99 },
  { "skill": "Наибольшее и наименьшее значение функции на промежутке", "id": 100 },
  { "skill": "Кусочно-непрерывные функции", "id": 101 },
  { "skill": "Растяжения и сдвиги", "id": 102 },
  { "skill": "Расположение чисел на прямой (Отметка точек)", "id": 103 },
  { "skill": "Расстояние между точками на координатной прямой", "id": 104 },
  { "skill": "Модули", "id": 105 },
  { "skill": "Интервалы", "id": 106 },
  { "skill": "Неравенства", "id": 107 },
  { "skill": "Сравнение и упорядочивание чисел на координатной прямой", "id": 108 },
  { "skill": "Выбор верного или неверного утверждения о числах на координатной прямой", "id": 109 },
  { "skill": "Построение точек по координатам на плоскости", "id": 110 },
  { "skill": "Расстояние между точками на плоскости", "id": 111 },
  { "skill": "Точки, прямые, отрезки, лучи", "id": 112 },
  { "skill": "Углы и их виды", "id": 113 },
  { "skill": "Измерение углов", "id": 114 },
  { "skill": "Параллельные и перпендикулярные прямые", "id": 115 },
  { "skill": "Серединный перпендикуляр", "id": 116 },
  { "skill": "Виды треугольников", "id": 117 },
  { "skill": "Элементы треугольника (сторона, угол, высота, медиана, биссектриса)", "id": 118 },
  { "skill": "Свойства углов треугольника", "id": 119 },
  { "skill": "Признаки равенства треугольников", "id": 120 },
  { "skill": "Признаки подобия треугольников", "id": 121 },
  { "skill": "Неравенство треугольника", "id": 122 },
  { "skill": "Прямоугольный треугольник: Теорема Пифагора", "id": 123 },
  { "skill": "Прямоугольный треугольник:  Тригонометрия", "id": 124 },
  { "skill": "Виды многоугольников", "id": 125 },
  { "skill": "Элементы многоугольников", "id": 126 },
  { "skill": "Углы многоугольников", "id": 127 },
  { "skill": "Правильные многоугольники", "id": 128 },
  { "skill": "Деление многоугольников на треугольники", "id": 129 },
  { "skill": "Прямоугольник", "id": 130 },
  { "skill": "Ромб", "id": 131 },
  { "skill": "Квадрат", "id": 132 },
  { "skill": "Параллелограмм", "id": 133 },
  { "skill": "Трапеция", "id": 134 },
  { "skill": "Элементы окружности и круга (Касательная, хорда, секущая, радиус)", "id": 135 },
  { "skill": "Центральные и вписанные углы", "id": 136 },
  { "skill": "Вписанные  фигуры", "id": 137 },
  { "skill": "Описанные фигуры", "id": 138 },
  { "skill": "Длина отрезка, длина ломаной", "id": 139 },
  { "skill": "Периметр многоугольника", "id": 140 },
  { "skill": "Расстояние от точки до прямой", "id": 141 },
  { "skill": "Длина окружности", "id": 142 },
  { "skill": "Градусная мера угла", "id": 143 },
  { "skill": "Ссоответствие между величиной угла и длиной дуги окружности", "id": 144 },
  { "skill": "Площадь и её свойства", "id": 145 },
  { "skill": "Площадь прямоугольника", "id": 146 },
  { "skill": "Площадь параллелограмма", "id": 147 },
  { "skill": "Площадь трапеции", "id": 148 },
  { "skill": "Площадь треугольника", "id": 149 },
  { "skill": "Площадь круга и его частей ", "id": 150 },
  { "skill": "Пропорциональное деление площади", "id": 151 },
  { "skill": "Формулы объёма прямоугольного параллелепипеда, куба, шара", "id": 152 },
  { "skill": "Фигуры на квадратной решётке", "id": 153 },
  { "skill": "Направление и длина вектора", "id": 154 },
  { "skill": "Координаты вектора", "id": 155 },
  { "skill": "Сложение и вычитание векторов", "id": 156 },
  { "skill": "Умножение вектора на число", "id": 157 },
  { "skill": "Анализ геометрических высказываний", "id": 158 },
  { "skill": "Работа с чертежами", "id": 159 },
  { "skill": "Задачи на доказательство", "id": 160 },
  { "skill": "Геометрические задачи повышенной сложности", "id": 161 },
  { "skill": "Сбор данных", "id": 162 },
  { "skill": "Таблицы и диаграммы в статистике", "id": 163 },
  { "skill": "Среднее арифметическое", "id": 164 },
  { "skill": "Мода и медиана", "id": 165 },
  { "skill": "Определение событий", "id": 166 },
  { "skill": "Нахождение вероятности простых событий", "id": 167 },
  { "skill": "Применение формул вероятности", "id": 168 },
  { "skill": "Перестановки", "id": 169 },
  { "skill": "Размещения", "id": 170 },
  { "skill": "Сочетания", "id": 171 },
  { "skill": "Подсчёт с использованием формул комбинаторики", "id": 172 },
  { "skill": "Операции с множествами", "id": 173 },
  { "skill": "Диаграммы Эйлера–Венна", "id": 174 },
  { "skill": "Вершины и рёбра", "id": 175 },
  { "skill": "Связность графа", "id": 176 },
  { "skill": "Поиск путей", "id": 177 },
  { "skill": "Решение прикладных задач с графами", "id": 178 },
  { "skill": "Разложение многочленов на множители (факторизация) квадратичный случай", "id": 179 },
  { "skill": "Порядок выполнения действий", "id": 180 }
];

// Create skill ID to skill name mapping
const createSkillNameMapping = (): { [skillId: number]: string } => {
  const skillNames: { [skillId: number]: string } = {};
  mathSkills.forEach(skill => {
    skillNames[skill.id] = skill.skill;
  });
  return skillNames;
};

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
const skillNames = createSkillNameMapping();

const Textbook2 = () => {
  const navigate = useNavigate();
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<{skillId: number, skillName: string} | null>(null);
  const [articleContent, setArticleContent] = useState<string>("");
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [isSelecterActive, setIsSelecterActive] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [currentSubunit, setCurrentSubunit] = useState<Subunit | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showAnimation, setShowAnimation] = useState(false);
  const { getUserMastery, calculateUnitProgress, getMasteryLevel } = useMasterySystem();
  const { messages, isTyping, isDatabaseMode, setMessages, setIsTyping, addMessage } = useChatContext();

  const handleUnitSelect = (unitNumber: number) => {
    setSelectedUnit(unitNumber);
  };

  const handleBackToUnits = () => {
    setSelectedUnit(null);
  };

  // Function to fetch article content
  const fetchArticleContent = async (skillId: number) => {
    setLoadingArticle(true);
    try {
      const { data, error } = await supabase
        .from('articles2')
        .select('art, img1, img2, img3')
        .eq('skill', skillId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching article:', error);
        setArticleContent("");
      } else {
        // Combine images and article content using type assertion
        const articleData = data as any;
        let content = "";
        if (articleData?.img1) content += `<img src="${articleData.img1}" alt="Иллюстрация к навыку" style="max-width: 100%; margin-bottom: 16px; border-radius: 8px;" />\n\n`;
        if (articleData?.img2) content += `<img src="${articleData.img2}" alt="Иллюстрация к навыку" style="max-width: 100%; margin-bottom: 16px; border-radius: 8px;" />\n\n`;
        if (articleData?.img3) content += `<img src="${articleData.img3}" alt="Иллюстрация к навыку" style="max-width: 100%; margin-bottom: 16px; border-radius: 8px;" />\n\n`;
        content += articleData?.art || "";
        setArticleContent(content);
      }
    } catch (error) {
      console.error('Error:', error);
      setArticleContent("");
    } finally {
      setLoadingArticle(false);
    }
  };

  // Helper function to find subtopic by skill ID
  const findSubtopicBySkillId = (skillId: number): Subunit | null => {
    for (const unitKey in courseStructure) {
      const unitNumber = parseInt(unitKey);
      const unit = courseStructure[unitNumber];
      for (const subunit of unit.subunits) {
        if (subunit.skills.includes(skillId)) {
          return subunit;
        }
      }
    }
    return null;
  };

  // Helper function to find subtopic by skill name
  const findSubtopicBySkillName = (skillName: string): Subunit | null => {
    const skillEntry = mathSkills.find(skill => skill.skill === skillName);
    if (skillEntry) {
      return findSubtopicBySkillId(skillEntry.id);
    }
    return null;
  };

  // Handle article click
  const handleArticleClick = (skillId: number, skillName: string, subunit?: Subunit) => {
    setSelectedArticle({ skillId, skillName });
    // Always determine the correct subtopic based on the skill ID
    const correctSubunit = findSubtopicBySkillId(skillId);
    if (correctSubunit) {
      setCurrentSubunit(correctSubunit);
    } else if (subunit) {
      setCurrentSubunit(subunit);
    }
    fetchArticleContent(skillId);
  };

  // Handle back to textbook
  const handleBackToTextbook = () => {
    setSelectedArticle(null);
    setArticleContent("");
    setSelectedText("");
    setIsChatOpen(false);
    setIsSelecterActive(false);
  };

  // Handle video click
  const handleVideoClick = (skillName: string, subunit?: Subunit) => {
    setSelectedVideo(skillName);
    // Always determine the correct subtopic based on the skill name
    const correctSubunit = findSubtopicBySkillName(skillName);
    if (correctSubunit) {
      setCurrentSubunit(correctSubunit);
    } else if (subunit) {
      setCurrentSubunit(subunit);
    }
    
    // Set the video URL based on the skill
    if (skillName === "Натуральные и целые числа" || skillName === "Подстановка значений") {
      setVideoUrl("https://www.youtube.com/embed/xFsJeBJsB6c");
    } else {
      setVideoUrl(""); // No video URL for "coming soon" videos
    }
  };

  // Handle exercise click
  const handleExerciseClick = async (skillIds: number[], subunit?: Subunit) => {
    const skillName = skillIds.map(id => skillNames[id]).join(", ");
    
    // Clear any other modals first
    setSelectedVideo(null);
    setSelectedArticle(null);
    
    setSelectedExercise(skillName);
    // Always determine the correct subtopic based on the first skill ID
    const correctSubunit = findSubtopicBySkillId(skillIds[0]);
    if (correctSubunit) {
      setCurrentSubunit(correctSubunit);
    } else if (subunit) {
      setCurrentSubunit(subunit);
    }
    
    // Fetch questions from mcq_with_options table for these skills
    try {
      const { data, error } = await supabase
        .from('mcq_with_options')
        .select('*')
        .in('skills', skillIds)
        .limit(10);
      
      if (error) {
        console.error('Error fetching questions:', error);
        return;
      }
      
      if (data && data.length > 0) {
        setQuestions(data);
        setCurrentQuestionIndex(0);
        setCurrentQuestion(data[0]);
        setSelectedAnswer(null);
        setShowResult(false);
        setShowSolution(false);
        setScore({ correct: 0, total: 0 });
      } else {
        // No questions found
        setQuestions([]);
        setCurrentQuestion(null);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  // Handle quiz click (12 random questions from subunit)
  const handleQuizClick = async (unitNumber: number, subunit: any) => {
    console.log("Quiz clicked:", unitNumber, subunit);
    const skillName = `Викторина: ${subunit.name}`;
    
    // Clear any other modals first
    setSelectedVideo(null);
    setSelectedArticle(null);
    
    setSelectedExercise(skillName);
    setCurrentSubunit(subunit);
    
    // Get all skill IDs from the subunit
    const subunitSkills = subunit.skills || [];
    
    // Fetch random questions from mcq_with_options table for these skills
    try {
      const { data, error } = await supabase
        .from('mcq_with_options')
        .select('*')
        .in('skills', subunitSkills)
        .limit(50); // Get more to randomize from
      
      if (error) {
        console.error('Error fetching quiz questions:', error);
        return;
      }
      
      if (data && data.length > 0) {
        // Randomly select 12 questions
        const shuffled = data.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, Math.min(12, data.length));
        
        setQuestions(selectedQuestions);
        setCurrentQuestionIndex(0);
        setCurrentQuestion(selectedQuestions[0]);
        setSelectedAnswer(null);
        setShowResult(false);
        setShowSolution(false);
        setScore({ correct: 0, total: 0 });
      } else {
        // No questions found
        setQuestions([]);
        setCurrentQuestion(null);
      }
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
    }
  };

  // Handle unit test click (16 random questions from entire unit)
  const handleUnitTestClick = async (unitNumber: number, unit: any) => {
    console.log("Unit test clicked:", unitNumber, unit);
    const skillName = `Тест по юниту ${unitNumber}`;
    
    // Clear any other modals first
    setSelectedVideo(null);
    setSelectedArticle(null);
    
    setSelectedExercise(skillName);
    // Set the first subunit as current for context
    if (unit.subunits && unit.subunits.length > 0) {
      setCurrentSubunit(unit.subunits[0]);
    }
    
    // Get all skill IDs from all subunits in the unit
    const unitSkills = unit.subunits.flatMap((subunit: any) => subunit.skills || []);
    
    // Fetch random questions from mcq_with_options table for these skills
    try {
      const { data, error } = await supabase
        .from('mcq_with_options')
        .select('*')
        .in('skills', unitSkills)
        .limit(80); // Get more to randomize from
      
      if (error) {
        console.error('Error fetching unit test questions:', error);
        return;
      }
      
      if (data && data.length > 0) {
        // Randomly select 16 questions
        const shuffled = data.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, Math.min(16, data.length));
        
        setQuestions(selectedQuestions);
        setCurrentQuestionIndex(0);
        setCurrentQuestion(selectedQuestions[0]);
        setSelectedAnswer(null);
        setShowResult(false);
        setShowSolution(false);
        setScore({ correct: 0, total: 0 });
      } else {
        // No questions found
        setQuestions([]);
        setCurrentQuestion(null);
      }
    } catch (error) {
      console.error('Error fetching unit test questions:', error);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  // Submit answer
  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;
    
    const isCorrect = selectedAnswer === currentQuestion.answer;
    setShowResult(true);
    
    if (isCorrect) {
      setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 2000);
    } else {
      setScore(prev => ({ correct: prev.correct, total: prev.total + 1 }));
    }
  };

  // Next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(questions[nextIndex]);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowSolution(false);
    }
  };

  // Show solution
  const handleShowSolution = () => {
    setShowSolution(true);
  };

  // Selector tool functions
  const toggleSelecter = () => {
    setIsSelecterActive(!isSelecterActive);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const text = selection.toString().trim();
      setSelectedText(text);
      
      if (isSelecterActive) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.backgroundColor = 'yellow';
        span.style.padding = '1px 2px';
        
        try {
          range.surroundContents(span);
          selection.removeAllRanges();
        } catch (error) {
          const contents = range.extractContents();
          span.appendChild(contents);
          range.insertNode(span);
          selection.removeAllRanges();
        }
      }
    }
  };

  const handleAskEzhik = async () => {
    if (!selectedText) return;
    
    setIsChatOpen(true);
    
    // Add user message with selected text
    const newUserMessage = {
      id: Date.now(),
      text: `Объясни мне это: "${selectedText}"`,
      isUser: true,
      timestamp: new Date()
    };
    
    addMessage(newUserMessage);
    setIsTyping(true);

    try {
      // Send message to AI and get response
      const aiResponse = await sendChatMessage(newUserMessage, messages, isDatabaseMode);
      addMessage(aiResponse);
    } finally {
      setIsTyping(false);
    }
    
    // Clear selected text
    setSelectedText("");
  };

  const handleSendChatMessage = async (userInput: string) => {
    const newUserMessage = {
      id: Date.now(),
      text: userInput,
      isUser: true,
      timestamp: new Date()
    };
    
    addMessage(newUserMessage);
    setIsTyping(true);

    try {
      const aiResponse = await sendChatMessage(newUserMessage, messages, isDatabaseMode);
      addMessage(aiResponse);
    } finally {
      setIsTyping(false);
    }
  };

  // Add event listener for text selection when selecter is active
  useEffect(() => {
    if (isSelecterActive) {
      document.addEventListener('mouseup', handleTextSelection);
      return () => {
        document.removeEventListener('mouseup', handleTextSelection);
      };
    }
  }, [isSelecterActive]);

  const renderUnitOverview = () => (
            <UnitProgressSummary 
              courseStructure={courseStructure} 
              onUnitSelect={handleUnitSelect}
              onExerciseClick={handleExerciseClick}
              onQuizClick={handleQuizClick}
              onUnitTestClick={handleUnitTestClick}
              mathSkills={mathSkills}
            />
  );

  const renderUnitContent = (unit: any) => (
    <div className="space-y-12">
      <div className="mb-8">
        <Button variant="outline" onClick={handleBackToUnits} className="mb-4">
          ← Все модули
        </Button>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Модуль {selectedUnit}: {unit.title}
        </h1>
        <p className="text-xl text-gray-600">{unit.description}</p>
      </div>

      {unit.subunits.map((subunit: any, index: number) => (
        <div key={subunit.id}>
          {/* Subunit Block */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {subunit.id} {subunit.title}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side: Videos and Articles */}
              <div className="space-y-6">
                {/* Videos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <Play className="w-5 h-5" />
                      Видео
                    </CardTitle>
                  </CardHeader>
                    <CardContent className="space-y-3">
                      {subunit.skills.map((skillId: number) => (
                        <div 
                          key={skillId} 
                          className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleVideoClick(skillNames[skillId] || `Видео ${skillId}`, subunit)}
                        >
                          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                            <Play className="w-3 h-3 text-red-600" />
                          </div>
                          <span className="text-sm">{skillNames[skillId] || `Видео ${skillId}`}</span>
                          <Badge variant="outline" className="ml-auto">
                            {skillNames[skillId] === "Натуральные и целые числа" ? "5 мин" : "Скоро"}
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
                        <div 
                          key={skillId} 
                          className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleArticleClick(skillId, skillNames[skillId] || `Теория ${skillId}`, subunit)}
                        >
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <FileText className="w-3 h-3 text-blue-600" />
                          </div>
                          <span className="text-sm">{skillNames[skillId] || `Теория ${skillId}`}</span>
                          <Badge variant="outline" className="ml-auto">
                            10 мин
                          </Badge>
                        </div>
                      ))}
                   </CardContent>
                </Card>
              </div>

              {/* Right Side: Practice Exercises */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <PenTool className="w-5 h-5" />
                    Упражнения
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {subunit.skills.map((skillId: number) => (
                    <div 
                      key={skillId}
                      className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleExerciseClick([skillId], subunit)}
                    >
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <PenTool className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-sm">{skillNames[skillId] || `Упражнение ${skillId}`}</span>
                      <Badge variant="outline" className="ml-auto">
                        Тест
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quiz Block after each subunit */}
          <div className="mb-8">
            <Card className="border-2 border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-yellow-600" />
                  Викторина {index + 1}
                </CardTitle>
                <CardDescription>
                  Проверь себя по теме "{subunit.title}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                  Начать викторину {index + 1}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ))}

      {/* Final Unit Test */}
      <Card className="border-2 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-red-600" />
            Итоговый тест модуля
          </CardTitle>
          <CardDescription>
            12-15 вопросов для проверки знаний всего модуля
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full bg-red-600 hover:bg-red-700">
            Начать итоговый тест
          </Button>
        </CardContent>
      </Card>
    </div>
  );


  const ModuleSidebar = () => (
    <Sidebar className="w-72 border-r bg-background/95 backdrop-blur-sm fixed left-0 top-20 h-[calc(100vh-5rem)] z-10">
      <SidebarContent className="p-6">
        <div className="mb-6">
          <Button 
            onClick={() => navigate('/textbook')}
            variant="outline"
            className="w-full mb-6 hover:bg-primary/10 hover:text-primary border-primary/30"
          >
            📖 Читать как учебник
          </Button>
          <h2 className="text-xl font-bold text-foreground mb-3">Модули курса</h2>
          <p className="text-base text-muted-foreground">Все 8 модулей всегда доступны</p>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-6">
              {Object.entries(courseStructure).map(([unitNum, unit]) => {
                const unitNumber = parseInt(unitNum);
                let progress = calculateUnitProgress(unitNumber);
                // For demo purposes, show sample progress values
                if (progress === 0) {
                  const sampleProgress = [80, 76, 72, 80, 90, 83, 73, 70];
                  progress = sampleProgress[unitNumber - 1] || 0;
                }
                console.log(`Main content - Unit ${unitNumber} progress:`, progress);
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

  // Exercise view
  if (selectedExercise) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <div className="fixed top-24 left-4 z-50 bg-white/90 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg">
                <SidebarTrigger className="hover:bg-accent hover:text-accent-foreground p-2 rounded-md transition-colors" />
              </div>
              <SubtopicSidebar
                currentSubunit={currentSubunit}
                onVideoClick={(skillName) => {
                  setSelectedExercise(null);
                  handleVideoClick(skillName, currentSubunit);
                }}
                onArticleClick={(skillId, skillName) => {
                  setSelectedExercise(null);
                  handleArticleClick(skillId, skillName, currentSubunit);
                }}
                onExerciseClick={(skillIds) => {
                  // Already on exercise view, but allow switching to different exercises
                  handleExerciseClick(skillIds, currentSubunit);
                }}
                currentView="exercise"
                currentContent={selectedExercise}
              />
              <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedExercise(null)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к учебнику
            </Button>

            {/* Success Animation */}
            {showAnimation && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="text-center animate-pulse">
                  <PartyPopper className="h-24 w-24 text-yellow-500 mx-auto mb-4 animate-bounce" />
                  <div className="text-4xl font-bold text-white animate-fade-in">Правильно!</div>
                  <Trophy className="h-12 w-12 text-yellow-500 mx-auto mt-4 animate-bounce" />
                </div>
              </div>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{selectedExercise}</CardTitle>
                {questions.length > 0 && (
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Вопрос {currentQuestionIndex + 1} из {questions.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Правильно: {score.correct} из {score.total}
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {questions.length === 0 ? (
                  <div className="text-center py-12">
                    <PenTool className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Упражнения скоро появятся</h3>
                    <p className="text-muted-foreground">
                      Мы работаем над созданием упражнений по этой теме
                    </p>
                  </div>
                ) : currentQuestion ? (
                  <div className="space-y-6">
                    {/* Question */}
                    <div className="prose max-w-none">
                      <MathRenderer text={currentQuestion.problem_text || ""} />
                    </div>

                    {/* Image if available */}
                    {currentQuestion.problem_image && (
                      <div className="text-center">
                        <img 
                          src={currentQuestion.problem_image} 
                          alt="Условие задачи" 
                          className="max-w-full h-auto mx-auto rounded-lg"
                        />
                      </div>
                    )}

                    {/* Answer Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'А', value: currentQuestion.option1 },
                        { key: 'Б', value: currentQuestion.option2 },
                        { key: 'В', value: currentQuestion.option3 },
                        { key: 'Г', value: currentQuestion.option4 }
                      ].filter(option => option.value).map((option) => (
                        <Card 
                          key={option.key}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedAnswer === option.key 
                              ? showResult 
                                ? option.key === currentQuestion.answer
                                  ? 'bg-green-100 border-green-500' 
                                  : 'bg-red-100 border-red-500'
                                : 'bg-blue-100 border-blue-500'
                              : 'hover:bg-gray-50'
                          } ${showResult && option.key === currentQuestion.answer ? 'bg-green-100 border-green-500' : ''}`}
                          onClick={() => handleAnswerSelect(option.key)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                selectedAnswer === option.key 
                                  ? showResult 
                                    ? option.key === currentQuestion.answer
                                      ? 'bg-green-500 text-white' 
                                      : 'bg-red-500 text-white'
                                    : 'bg-blue-500 text-white'
                                  : 'bg-gray-200 text-gray-700'
                              } ${showResult && option.key === currentQuestion.answer ? 'bg-green-500 text-white' : ''}`}>
                                {option.key}
                              </div>
                              <div className="flex-1">
                                <MathRenderer text={option.value || ""} />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-center">
                      {!showResult ? (
                        <Button 
                          onClick={handleSubmitAnswer}
                          disabled={!selectedAnswer}
                          className="px-8"
                        >
                          Ответить
                        </Button>
                      ) : (
                        <div className="flex gap-4">
                          <Button 
                            variant="outline"
                            onClick={handleShowSolution}
                          >
                            Посмотреть решение
                          </Button>
                          {currentQuestionIndex < questions.length - 1 && (
                            <Button onClick={handleNextQuestion}>
                              Следующий вопрос
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Result */}
                    {showResult && (
                      <div className={`text-center p-4 rounded-lg ${
                        selectedAnswer === currentQuestion.answer 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <div className="text-lg font-semibold">
                          {selectedAnswer === currentQuestion.answer ? '✅ Правильно!' : '❌ Неправильно'}
                        </div>
                        <div className="text-sm mt-1">
                          Правильный ответ: {currentQuestion.answer}
                        </div>
                      </div>
                    )}

                    {/* Solution */}
                    {showSolution && currentQuestion.solution_text && (
                      <Card className="bg-blue-50 border-blue-200">
                        <CardHeader>
                          <CardTitle className="text-lg">Решение</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="prose max-w-none">
                            <MathRenderer text={currentQuestion.solution_text} />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Final Results */}
                    {currentQuestionIndex === questions.length - 1 && showResult && (
                      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        <CardContent className="p-6 text-center">
                          <Trophy className="h-12 w-12 mx-auto mb-4" />
                          <h3 className="text-2xl font-bold mb-2">Упражнение завершено!</h3>
                          <p className="text-lg">
                            Ваш результат: {score.correct} из {score.total} ({Math.round((score.correct / score.total) * 100)}%)
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
                </div>
              </main>
            </div>
          </SidebarProvider>
        </div>
      </div>
    );
  }

  // Video view
  if (selectedVideo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <div className="fixed top-24 left-4 z-50 bg-white/90 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg">
                <SidebarTrigger className="hover:bg-accent hover:text-accent-foreground p-2 rounded-md transition-colors" />
              </div>
              <SubtopicSidebar
                currentSubunit={currentSubunit}
                onVideoClick={(skillName) => {
                  // Allow switching to different videos
                  handleVideoClick(skillName, currentSubunit);
                }}
                onArticleClick={(skillId, skillName) => {
                  setSelectedVideo(null);
                  handleArticleClick(skillId, skillName, currentSubunit);
                }}
                onExerciseClick={(skillIds) => {
                  setSelectedVideo(null);
                  handleExerciseClick(skillIds, currentSubunit);
                }}
                currentView="video"
                currentContent={selectedVideo}
              />
              <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-4 py-8">
                  <Button 
                    onClick={() => setSelectedVideo(null)} 
                    variant="outline" 
                    className="mb-6"
                  >
                    ← Назад к учебнику
                  </Button>
                  
                  <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                      <CardTitle className="text-2xl">{selectedVideo}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {videoUrl ? (
                        <div className="aspect-video w-full">
                          <iframe
                            src={videoUrl}
                            title={selectedVideo}
                            className="w-full h-full rounded-lg"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-xl font-semibold mb-2">Видео скоро появится</h3>
                          <p className="text-muted-foreground">
                            Мы работаем над созданием видеоматериала по этой теме
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </main>
            </div>
          </SidebarProvider>
        </div>
      </div>
    );
  }

  // Article view
  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <div className="fixed top-24 left-4 z-50 bg-white/90 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg">
                <SidebarTrigger className="hover:bg-accent hover:text-accent-foreground p-2 rounded-md transition-colors" />
              </div>
              <SubtopicSidebar
                currentSubunit={currentSubunit}
                onVideoClick={(skillName) => {
                  setSelectedArticle(null);
                  handleVideoClick(skillName, currentSubunit);
                }}
                onArticleClick={(skillId, skillName) => {
                  // Allow switching to different articles
                  handleArticleClick(skillId, skillName, currentSubunit);
                }}
                onExerciseClick={(skillIds) => {
                  setSelectedArticle(null);
                  handleExerciseClick(skillIds, currentSubunit);
                }}
                currentView="article"
                currentContent={selectedArticle?.skillName}
              />
              <main className="flex-1 overflow-y-auto">
                {/* Selected Text and Ask Ёжик Button */}
                {selectedText && (
                  <div className="fixed top-24 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-md">
                    <div className="flex items-start gap-2 mb-3">
                      <MessageCircle className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">Выделенный текст:</p>
                        <p className="text-sm text-gray-600 line-clamp-3">"{selectedText}"</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedText("")}
                        className="p-1 h-auto"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <Button 
                      onClick={handleAskEzhik}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Спросить Ёжика
                    </Button>
                  </div>
                )}

                {/* Chat Window */}
                {isChatOpen && (
                  <div className="fixed left-4 top-24 bottom-4 w-80 z-40 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-blue-600" />
                        <h3 className="font-medium text-gray-900">Чат с Ёжиком</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsChatOpen(false)}
                        className="p-1 h-auto"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex-1 flex flex-col min-h-0">
                      <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                          {messages.map(message => (
                            <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                              <div 
                                className={`max-w-[85%] p-3 rounded-lg text-sm ${
                                  message.isUser 
                                    ? "bg-blue-600 text-white rounded-tr-none" 
                                    : "bg-gray-100 text-gray-900 rounded-tl-none"
                                }`}
                              >
                                <MathRenderer text={message.text} />
                                <div className={`text-xs mt-1 ${message.isUser ? "text-blue-100" : "text-gray-500"}`}>
                                  {message.timestamp.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                            </div>
                          ))}
                          {isTyping && (
                            <div className="flex justify-start">
                              <div className="bg-gray-100 text-gray-900 rounded-lg rounded-tl-none p-3 text-sm">
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                      
                      <div className="border-t p-4">
                        <ChatInput onSendMessage={handleSendChatMessage} isTyping={isTyping} />
                      </div>
                    </div>
                  </div>
                )}

                <div className="container mx-auto px-4 py-8">
                  <div className="flex items-center gap-4 mb-6">
                    <Button 
                      onClick={handleBackToTextbook}
                      variant="outline"
                    >
                      ← Назад к учебнику
                    </Button>
                    
                    <Button
                      onClick={toggleSelecter}
                      variant={isSelecterActive ? "default" : "outline"}
                      className="flex items-center gap-2"
                    >
                      <Highlighter className="w-4 h-4" />
                      {isSelecterActive ? "Отключить селектор" : "Включить селектор"}
                    </Button>
                  </div>
                  
                  <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                      <CardTitle className="text-2xl">
                        {selectedArticle.skillName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingArticle ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          <p className="mt-2 text-muted-foreground">Загружаем статью...</p>
                        </div>
                      ) : articleContent ? (
                        <div className={isSelecterActive ? "cursor-text" : ""}>
                          <MathRenderer 
                            text={articleContent} 
                            className="prose prose-lg max-w-none"
                          />
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-xl font-semibold mb-2">Статья скоро появится</h3>
                          <p className="text-muted-foreground">
                            Мы работаем над созданием материала по этой теме
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </main>
            </div>
          </SidebarProvider>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20">
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <ModuleSidebar />
        <main className="flex-1 overflow-y-auto pl-12 pr-12 py-8">
          <ScrollArea className="h-full">
            {!selectedUnit ? (
              renderUnitOverview()
            ) : (
              renderUnitContent(courseStructure[selectedUnit])
            )}
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