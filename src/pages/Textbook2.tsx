import { useState, useEffect, useMemo, useTransition } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, Play, FileText, PenTool, HelpCircle, Award, Star, Lock, CheckCircle, ArrowLeft, Highlighter, MessageCircle, X, Trophy, PartyPopper, Menu, Copy, ChevronRight, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import { useMasterySystem } from "@/hooks/useMasterySystem";
import MathRenderer from "@/components/MathRenderer";
import { supabase } from "@/integrations/supabase/client";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import { useChatContext } from "@/contexts/ChatContext";
import { sendChatMessage } from "@/services/chatService";
import { useToast } from "@/hooks/use-toast";

// Updated topic mapping data to match new JSON structure
const topicMapping = [
  { "topic": "1.1", "name": "Натуральные и целые числа", "skills": [1,2,3,4,5] },
  { "topic": "1.2", "name": "Дроби и проценты", "skills": [6,195,7,8,9,10] },
  { "topic": "1.3", "name": "Рациональные числа и арифметические действия", "skills": [11,12,13,14,15,16,17,180] },
  { "topic": "1.4", "name": "Действительные числа", "skills": [18,19,20,197] },
  { "topic": "1.5", "name": "Приближённые вычисления", "skills": [21,22,23] },
  { "topic": "2.1", "name": "Буквенные выражения", "skills": [35,36,37,38] },
  { "topic": "2.2", "name": "Степени", "skills": [39,40,41,42,43,44] },
  { "topic": "2.3", "name": "Многочлены", "skills": [45,46,47,48,49,179] },
  { "topic": "2.4", "name": "Алгебраические дроби", "skills": [50,51,52,53] },
  { "topic": "2.5", "name": "Арифметические корни", "skills": [54,55,56,57] },
  { "topic": "3.1", "name": "Уравнения и системы", "skills": [58,59,60,61,62,188,190,191] },
  { "topic": "3.2", "name": "Неравенства и системы", "skills": [63,64,65,66,67,68] },
  { "topic": "3.3", "name": "Текстовые задачи", "skills": [69,70,71,72,73,74,184,185,75] },
  { "topic": "4.1", "name": "Последовательности", "skills": [76,77,78,79] },
  { "topic": "4.2", "name": "Арифметическая и геометрическая прогрессии. Формула сложных процентов", "skills": [80,81,82,83,84,85,86,87,88] },
  { "topic": "5.1", "name": "Свойства и графики функций", "skills": [89,90,91,92,93,94,95,96,97,98,99,186,187,100,101,102] },
  { "topic": "6.1", "name": "Координатная прямая", "skills": [103,104,105,106,107,108,109] },
  { "topic": "6.2", "name": "Декартовы координаты", "skills": [110,111] },
  { "topic": "7.1", "name": "Геометрические фигуры", "skills": [112,113,114,115,116] },
  { "topic": "7.2", "name": "Треугольники", "skills": [117,118,119,120,121,122,123,124] },
  { "topic": "7.3", "name": "Многоугольники", "skills": [125,126,127,128,129,130,131,132,133,134] },
  { "topic": "7.4", "name": "Окружность и круг", "skills": [135,136,137,138] },
  { "topic": "7.5", "name": "Измерения", "skills": [139,140,141,142,143,144,145,146,147,148,149,150,151,152,153] },
  { "topic": "7.6", "name": "Векторы", "skills": [154,155,156,157,196] },
  { "topic": "7.7", "name": "Дополнительные темы по геометрии", "skills": [158,159,160,161] },
  { "topic": "8.1", "name": "Описательная статистика", "skills": [162,163,164,165] },
  { "topic": "8.2", "name": "Вероятность", "skills": [166,167,168] },
  { "topic": "8.3", "name": "Комбинаторика", "skills": [169,170,171,172] },
  { "topic": "8.4", "name": "Множества", "skills": [173,174] },
  { "topic": "8.5", "name": "Графы", "skills": [175,176,177,178] },
  { "topic": "9.1", "name": "Работа с данными и графиками", "skills": [24,25,198,199,181,182,183,192,200] },
  { "topic": "9.2", "name": "Прикладная геометрия / Чтение и анализ графических схем", "skills": [26,27,28,29,30,31,32,33,34] },
];

// TypeScript interfaces
interface Topic {
  topic: string;
  name: string;
  skills: number[];
}

interface MCQQuestion {
  question_id: string;
  problem_text: string;
  answer: string;
  skills: number;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  problem_image: string | null;
  solution_text: string | null;
}

interface Article {
  ID: number;
  article_text: string;
  image_recommendations?: string;
  img1?: string;
  img2?: string;
  img3?: string;
  img4?: string;
  img5?: string;
  img6?: string;
  img7?: string;
}

// Type for view modes in URL params
type ViewMode = "overview" | "topic" | "skill" | "practice";

// Math skills data updated to match new JSON structure
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
  { "skill": "Арифметические операции с действительными числами", "id": 20 },
  { "skill": "Понятие точности и погрешности", "id": 21 },
  { "skill": "Округление чисел", "id": 22 },
  { "skill": "Приближённые вычисления", "id": 23 },
  { "skill": "Чтение и анализ графических схем: Графики", "id": 24 },
  { "skill": "Чтение и анализ диаграмм: круговые, линейные, столбчатые", "id": 25 },
  { "skill": "Квартиры", "id": 26 },
  { "skill": " Схема маршрута / карта", "id": 27 },
  { "skill": "Страхование ОСАГО", "id": 28 },
  { "skill": "Тарифные планы", "id": 29 },
  { "skill": "Лист бумаги", "id": 30 },
  { "skill": "Печи", "id": 31 },
  { "skill": "Шины", "id": 32 },
  { "skill": "Участки", "id": 33 },
  { "skill": "Теплицы", "id": 34 },
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
  { "skill": "Решение систем линейных неравенств", "id": 65 },
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
  { "skill": "Понятие функции и способы её задания", "id": 89 },
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
  { "skill": "порядок математических операций", "id": 180 },
  { "skill": "Чтение условия и извлечение данных из текста", "id": 181 },
  { "skill": "Стратегии решения задачи с краткой записью", "id": 182 },
  { "skill": "Анализ ошибочных решений", "id": 183 },
  { "skill": "Составление и опровержение утверждений", "id": 184 },
  { "skill": "Работа с необходимыми и достаточными условиями", "id": 185 },
  { "skill": "Симметрия графика функции", "id": 186 },
  { "skill": "Параметрические преобразования графиков", "id": 187 },
  { "skill": "Методы подстановки / перебора / отбора значений", "id": 188 },
  { "skill": "Применение формул с параметрами", "id": 190 },
  { "skill": "Уравнения с модулями", "id": 191 },
  { "skill": "Единицы измерения: Перевод между величинами", "id": 192 },
  { "skill": "смешанные числа", "id": 195 },
  { "skill": "Скалярное произведение векторов", "id": 196 },
  { "skill": "Сравнение и упорядочивание действительныех чисел", "id": 197 },
  { "skill": "Чтение и анализ графических схем: таблицы", "id": 198 },
  { "skill": "Перевод расписания/таблицы времени в расчёт продолжительности", "id": 199 },
  { "skill": "Построение простейших графиков на координатной плоскости по табличным данным", "id": 200 }
];

// Updated module structure to group by main modules
const moduleStructure = {
  1: { title: "Числа и вычисления", topics: topicMapping.filter(t => t.topic.startsWith('1.')) },
  2: { title: "Алгебраические выражения", topics: topicMapping.filter(t => t.topic.startsWith('2.')) },
  3: { title: "Уравнения и неравенства", topics: topicMapping.filter(t => t.topic.startsWith('3.')) },
  4: { title: "Числовые последовательности", topics: topicMapping.filter(t => t.topic.startsWith('4.')) },
  5: { title: "Функции", topics: topicMapping.filter(t => t.topic.startsWith('5.')) },
  6: { title: "Координаты на прямой и плоскости", topics: topicMapping.filter(t => t.topic.startsWith('6.')) },
  7: { title: "Геометрия", topics: topicMapping.filter(t => t.topic.startsWith('7.')) },
  8: { title: "Вероятность и статистика", topics: topicMapping.filter(t => t.topic.startsWith('8.')) },
  9: { title: "Применение математики к прикладным задачам", topics: topicMapping.filter(t => t.topic.startsWith('9.')) }
};

export default function Textbook2() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  const [readSkills, setReadSkills] = useState<Set<number>>(new Set());
  const [selectedText, setSelectedText] = useState('');
  const [isTextSelection, setIsTextSelection] = useState(false);
  const [showSelectedTextPanel, setShowSelectedTextPanel] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  // MCQ Practice state
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  
  const { getUserMastery, loading } = useMasterySystem();
  const { messages, isTyping, addMessage, setIsTyping, resetChat } = useChatContext();

  // Russian option labels
  const optionLabels = ['А', 'Б', 'В', 'Г'];

  // Initialize from URL parameters
  useEffect(() => {
    const topic = searchParams.get('topic');
    const skill = searchParams.get('skill');
    const view = searchParams.get('view') as ViewMode;

    if (topic) {
      const foundTopic = topicMapping.find(t => t.topic === topic);
      if (foundTopic) setSelectedTopic(foundTopic);
    }
    if (skill) setSelectedSkill(parseInt(skill));
    if (view) setCurrentView(view);
  }, [searchParams]);

  // Fetch read skills from Supabase
  useEffect(() => {
    const fetchReadSkills = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('read_articles')
          .select('skill_id')
          .eq('user_id', user.id);

        if (error) throw error;

        const readSkillIds = new Set(data.map(item => item.skill_id));
        setReadSkills(readSkillIds);
      } catch (error) {
        console.error('Error fetching read skills:', error);
      }
    };

    fetchReadSkills();
  }, []);

  // Fetch article when skill is selected
  useEffect(() => {
    const fetchArticle = async () => {
      if (!selectedSkill) {
        setCurrentArticle(null);
        return;
      }

      setIsLoadingArticle(true);
      try {
        const { data, error } = await supabase
          .from('new_articles')
          .select('*')
          .eq('ID', selectedSkill)
          .maybeSingle();

        if (error) {
          console.error('Error fetching article:', error);
          setCurrentArticle(null);
        } else {
          setCurrentArticle(data);
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        setCurrentArticle(null);
      } finally {
        setIsLoadingArticle(false);
      }
    };

    fetchArticle();
  }, [selectedSkill]);

  // Fetch MCQ questions when practice mode is activated
  const fetchQuestions = async (skillId: number) => {
    try {
      const { data, error } = await supabase
        .from('oge_math_skills_questions')
        .select('question_id, problem_text, answer, skills, option1, option2, option3, option4, problem_image, solution_text')
        .eq('skills', skillId)
        .limit(10);

      if (error) {
        console.error('Error fetching questions:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить вопросы",
          variant: "destructive",
        });
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error in fetchQuestions:', error);
      return [];
    }
  };

  // Navigation functions
  const handleTopicClick = (topic: Topic) => {
    startTransition(() => {
      setSelectedTopic(topic);
      setSelectedSkill(null);
      setCurrentView("topic");
      setSearchParams({ topic: topic.topic, view: "topic" });
    });
  };

  const handleSkillClick = (skillId: number) => {
    startTransition(() => {
      setSelectedSkill(skillId);
      setCurrentView("skill");
      setSearchParams({ 
        topic: selectedTopic?.topic || "", 
        skill: skillId.toString(), 
        view: "skill" 
      });
    });
  };

  const handlePracticeClick = async (skillId: number) => {
    const practiceQuestions = await fetchQuestions(skillId);
    if (practiceQuestions.length === 0) {
      toast({
        title: "Вопросы не найдены",
        description: `Для навыка ${skillId} пока нет доступных упражнений`,
        variant: "destructive",
      });
      return;
    }
    
    setQuestions(practiceQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCorrectAnswers(0);
    setShowSolution(false);
    setCurrentView("practice");
    setSearchParams({ 
      topic: selectedTopic?.topic || "", 
      skill: skillId.toString(), 
      view: "practice" 
    });
  };

  const handleBackToOverview = () => {
    startTransition(() => {
      setSelectedTopic(null);
      setSelectedSkill(null);
      setCurrentView("overview");
      setSearchParams({});
    });
  };

  const handleBackToTopic = () => {
    startTransition(() => {
      setSelectedSkill(null);
      setCurrentView("topic");
      setSearchParams({ topic: selectedTopic?.topic || "", view: "topic" });
    });
  };

  // MCQ Practice functions
  const handleAnswerClick = (optionIndex: number) => {
    if (isAnswered) return;
    
    const clickedOption = optionLabels[optionIndex];
    setSelectedAnswer(clickedOption);
    setIsAnswered(true);
    
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = currentQuestion.answer.trim();
    
    const isCorrect = clickedOption === correctAnswer;

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      toast({
        title: "🎉 ПОЗДРАВЛЯЕМ!",
        description: "Правильный ответ!",
      });
    } else {
      toast({
        title: "❌ Неправильно!",
        description: `Правильный ответ: ${correctAnswer}`,
        variant: "destructive",
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowSolution(false);
    } else {
      toast({
        title: "Квиз завершен!",
        description: `Вы правильно ответили на ${correctAnswers} из ${questions.length} вопросов`,
      });
      handleBackToTopic();
    }
  };

  // Utility functions
  const getSkillName = (skillId: number) => {
    const skill = mathSkills.find(s => s.id === skillId);
    return skill?.skill || `Навык ${skillId}`;
  };

  const getMasteryLevel = (skillId: number) => {
    // Since we don't have skill-level mastery, return a default status
    return 'not_started';
  };

  const getMasteryIcon = (status: string) => {
    switch (status) {
      case 'mastered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Play className="h-4 w-4 text-yellow-500" />;
      default: return <Lock className="h-4 w-4 text-gray-400" />;
    }
  };

  // Mark article as read when user reads it
  const markSkillAsRead = async (skillId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('read_articles')
        .upsert({ 
          user_id: user.id, 
          skill_id: skillId 
        }, { 
          onConflict: 'user_id,skill_id' 
        });

      if (error) throw error;

      setReadSkills(prev => new Set([...prev, skillId]));
    } catch (error) {
      console.error('Error marking skill as read:', error);
    }
  };

  // Text selection functionality
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString().trim();
      if (selectedText.length > 10) {
        setSelectedText(selectedText);
        setShowSelectedTextPanel(true);
      }
    }
  };

  useEffect(() => {
    if (isTextSelection) {
      document.addEventListener('mouseup', handleTextSelection);
      return () => document.removeEventListener('mouseup', handleTextSelection);
    }
  }, [isTextSelection]);

  const handleAskEzhik = () => {
    if (!selectedText) return;
    
    resetChat();
    setShowChat(true);
    setShowSelectedTextPanel(false);
    
    const messageText = `Объясни мне этот отрывок из учебника: "${selectedText}"`;
    const message = {
      id: Date.now(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };
    
    addMessage(message);
    handleSendChatMessage(messageText);
  };

  const handleSendChatMessage = async (messageText: string) => {
    setIsTyping(true);
    try {
      const userMessage = {
        id: Date.now(),
        text: messageText,
        isUser: true,
        timestamp: new Date(),
      };
      
      const response = await sendChatMessage(userMessage, [], false);
      addMessage(response);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Извините, произошла ошибка. Попробуйте еще раз.',
        isUser: false,
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  // Filter functions for search
  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topicMapping;
    
    return topicMapping.filter(topic => {
      const topicMatch = topic.name.toLowerCase().includes(searchQuery.toLowerCase());
      const skillMatch = topic.skills.some(skillId =>
        getSkillName(skillId).toLowerCase().includes(searchQuery.toLowerCase())
      );
      return topicMatch || skillMatch;
    });
  }, [searchQuery]);

  // Render functions
  const renderOverview = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Учебник по математике ОГЭ
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Полная программа подготовки к ОГЭ по математике. 9 модулей, 32 темы, 200 навыков.
          </p>
        </div>
        
        <div className="mb-6">
          <input
            type="text"
            placeholder="Поиск по темам и навыкам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid gap-4">
          {Object.entries(moduleStructure).map(([moduleId, module]) => (
            <Card key={moduleId} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-xl font-bold text-blue-900">
                    {moduleId}. {module.title}
                  </span>
                  <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                    {module.topics.length} тем
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {module.topics.map((topic) => (
                    <Card 
                      key={topic.topic} 
                      className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300"
                      onClick={() => handleTopicClick(topic)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 text-sm">
                            {topic.topic}
                          </span>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                        <h3 className="font-semibold text-gray-800 mb-2 text-sm leading-tight">
                          {topic.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {topic.skills.length} навыков
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTopicView = () => {
    if (!selectedTopic) return null;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={handleBackToOverview} className="text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к модулям
            </Button>
            <Button variant="outline" onClick={copyUrlToClipboard} size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Скопировать ссылку
            </Button>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8 rounded-lg mb-8">
            <h1 className="text-3xl font-bold mb-2">{selectedTopic.topic}: {selectedTopic.name}</h1>
            <p className="text-blue-100 text-lg">
              {selectedTopic.skills.length} навыков для изучения
            </p>
          </div>

          <div className="grid gap-4">
            {selectedTopic.skills.map((skillId) => {
              const masteryLevel = getMasteryLevel(skillId);
              const isRead = readSkills.has(skillId);
              
              return (
                <Card key={skillId} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {getMasteryIcon(masteryLevel)}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            Навык {skillId}: {getSkillName(skillId)}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge variant={isRead ? "default" : "secondary"} className="text-xs">
                              {isRead ? "Прочитано" : "Не прочитано"}
                            </Badge>
                            <Badge 
                              variant={masteryLevel === 'mastered' ? 'default' : 'outline'} 
                              className="text-xs"
                            >
                              {masteryLevel === 'mastered' ? 'Освоено' : 
                               masteryLevel === 'in_progress' ? 'В процессе' : 'Не начато'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSkillClick(skillId)}
                        >
                          <BookOpen className="h-4 w-4 mr-1" />
                          Теория
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePracticeClick(skillId)}
                        >
                          <PenTool className="h-4 w-4 mr-1" />
                          Практика
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderSkillView = () => {
    if (!selectedSkill) return null;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={handleBackToTopic} className="text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к теме
            </Button>
            <Button variant="outline" onClick={copyUrlToClipboard} size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Скопировать ссылку
            </Button>
            <Button
              variant={isTextSelection ? "default" : "outline"}
              onClick={() => setIsTextSelection(!isTextSelection)}
              size="sm"
            >
              <Highlighter className="h-4 w-4 mr-2" />
              {isTextSelection ? "Выключить выделение" : "Выделить текст"}
            </Button>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8 rounded-lg mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Навык {selectedSkill}: {getSkillName(selectedSkill)}
            </h1>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-white/20 text-white">
                {readSkills.has(selectedSkill) ? "Прочитано" : "Не прочитано"}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {getMasteryLevel(selectedSkill) === 'mastered' ? 'Освоено' : 
                 getMasteryLevel(selectedSkill) === 'in_progress' ? 'В процессе' : 'Не начато'}
              </Badge>
            </div>
          </div>

          {isLoadingArticle ? (
            <div className="bg-white rounded-lg p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ) : currentArticle ? (
            <div className="bg-white rounded-lg p-8 shadow-sm" style={{ userSelect: isTextSelection ? 'text' : 'none' }}>
              <div className="prose max-w-none">
                <MathRenderer text={currentArticle.article_text || 'Материал находится в разработке.'} />
                
                {/* Display images if available */}
                {[1,2,3,4,5,6,7].map(num => {
                  const imgKey = `img${num}` as keyof typeof currentArticle;
                  const imgUrl = currentArticle[imgKey] as string;
                  return imgUrl ? (
                    <div key={String(imgKey)} className="my-4">
                      <img 
                        src={imgUrl} 
                        alt={`Иллюстрация ${num}`}
                        className="max-w-full h-auto rounded-lg shadow-sm"
                      />
                    </div>
                  ) : null;
                })}
              </div>
              
              <div className="flex gap-4 mt-8 pt-6 border-t">
                <Button 
                  onClick={() => markSkillAsRead(selectedSkill)}
                  disabled={readSkills.has(selectedSkill)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {readSkills.has(selectedSkill) ? "Прочитано" : "Отметить как прочитанное"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handlePracticeClick(selectedSkill)}
                >
                  <PenTool className="h-4 w-4 mr-2" />
                  Перейти к упражнениям
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Материал в разработке</h3>
              <p className="text-gray-600 mb-6">
                Теоретический материал для этого навыка пока находится в разработке.
              </p>
              <Button 
                variant="outline"
                onClick={() => handlePracticeClick(selectedSkill)}
              >
                <PenTool className="h-4 w-4 mr-2" />
                Перейти к упражнениям
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPracticeView = () => {
    if (questions.length === 0 || !selectedSkill) {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={handleBackToTopic} className="text-blue-600 hover:text-blue-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад к теме
              </Button>
            </div>
            <Card>
              <CardContent className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">
                  Упражнения не найдены
                </h3>
                <p className="text-gray-600">
                  Для навыка {selectedSkill} пока нет доступных упражнений
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const answerOptions = [
      currentQuestion.option1,
      currentQuestion.option2,
      currentQuestion.option3,
      currentQuestion.option4
    ].filter(option => option && option.trim().length > 0);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={handleBackToTopic} className="text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к теме
            </Button>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                {currentQuestionIndex + 1}/{questions.length}
              </Badge>
              <span className="text-sm text-gray-600">
                Правильных: {correctAnswers}
              </span>
            </div>
          </div>

          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <span className="font-medium text-blue-900">
              Практика - Навык {selectedSkill}: {getSkillName(selectedSkill)}
            </span>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              {currentQuestion.problem_image && (
                <div className="mb-6 flex justify-center">
                  <img 
                    src={currentQuestion.problem_image} 
                    alt="Изображение к задаче" 
                    className="max-w-sm w-full h-auto object-contain rounded border"
                  />
                </div>
              )}
              
              <div className="mb-6">
                <MathRenderer text={currentQuestion.problem_text} />
              </div>

              {answerOptions.length > 0 ? (
                <div className="grid gap-3 mb-6">
                  {answerOptions.map((option, index) => {
                    const optionLetter = optionLabels[index];
                    const isSelected = selectedAnswer === optionLetter;
                    const isCorrect = currentQuestion.answer.trim() === optionLetter;
                    
                    let buttonStyle = "w-full text-left p-4 h-auto justify-start ";
                    
                    if (isAnswered) {
                      if (isSelected && isCorrect) {
                        buttonStyle += "bg-green-100 border-green-500 text-green-800";
                      } else if (isSelected && !isCorrect) {
                        buttonStyle += "bg-red-100 border-red-500 text-red-800";
                      } else if (!isSelected && isCorrect) {
                        buttonStyle += "bg-green-50 border-green-300 text-green-700";
                      } else {
                        buttonStyle += "bg-gray-50 border-gray-300 text-gray-600";
                      }
                    } else {
                      buttonStyle += "bg-white border-gray-300 hover:bg-gray-50";
                    }

                    return (
                      <Button
                        key={index}
                        onClick={() => handleAnswerClick(index)}
                        disabled={isAnswered}
                        variant="outline"
                        className={buttonStyle}
                      >
                        <span className="font-bold text-blue-600 mr-3">
                          {optionLetter}.
                        </span>
                        <div className="flex-1">
                          <MathRenderer text={option} />
                        </div>
                        {isAnswered && isCorrect && (
                          <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                        )}
                        {isAnswered && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-red-600 ml-2" />
                        )}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-600">
                  Варианты ответов не найдены
                </div>
              )}

              {isAnswered && (
                <div className="flex justify-center gap-3 flex-wrap">
                  {currentQuestion.solution_text && (
                    <Button
                      onClick={() => setShowSolution(!showSolution)}
                      variant="outline"
                      size="sm"
                    >
                      {showSolution ? 'Скрыть решение' : 'Показать решение'}
                    </Button>
                  )}
                  <Button
                    onClick={() => setIsTextSelection(!isTextSelection)}
                    variant={isTextSelection ? "default" : "outline"}
                    size="sm"
                  >
                    <Highlighter className="w-4 h-4 mr-1" />
                    {isTextSelection ? 'Выключить' : 'Включить'} селектор
                  </Button>
                  <Button 
                    onClick={() => setShowChat(true)}
                    variant="outline"
                    size="sm"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Чат с ИИ
                  </Button>
                  <Button onClick={handleNextQuestion} size="sm">
                    {currentQuestionIndex < questions.length - 1 ? 'Далее' : 'Завершить'}
                  </Button>
                </div>
              )}

              {isAnswered && isTextSelection && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-yellow-600 flex items-center justify-center gap-1 px-2 py-1 bg-yellow-50 rounded">
                    <Highlighter className="w-4 h-4" />
                    Выделите текст для вопроса к ИИ
                  </p>
                </div>
              )}

              {showSolution && currentQuestion.solution_text && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-medium mb-2">Решение:</h4>
                  <MathRenderer text={currentQuestion.solution_text} />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {currentView === "overview" && renderOverview()}
      {currentView === "topic" && renderTopicView()}
      {currentView === "skill" && renderSkillView()}
      {currentView === "practice" && renderPracticeView()}

      {/* Selected text panel */}
      {showSelectedTextPanel && selectedText && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-40">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm">Выделенный текст</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSelectedTextPanel(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
            {selectedText}
          </p>
          <Button onClick={handleAskEzhik} size="sm" className="w-full">
            <MessageCircle className="h-4 w-4 mr-2" />
            Спросить у Ёжика
          </Button>
        </div>
      )}

      {/* Chat window */}
      {showChat && (
        <div className="fixed bottom-4 right-4 w-96 h-96 bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col z-50">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Ёжик-помощник</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowChat(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatMessages messages={messages} isTyping={isTyping} />
          </div>
          <div className="border-t">
            <ChatInput onSendMessage={handleSendChatMessage} isTyping={isTyping} />
          </div>
        </div>
      )}
    </div>
  );
}