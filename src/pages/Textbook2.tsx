import { useState, useEffect, useMemo, useTransition } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, Play, FileText, PenTool, HelpCircle, Award, Star, Lock, CheckCircle, ArrowLeft, Highlighter, MessageCircle, X, Trophy, PartyPopper, Menu, Copy } from "lucide-react";
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

// Type for view modes in URL params
type ViewMode = "overview" | "subunit" | "articles" | "videos" | "exercises";

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

// Updated course structure to match new JSON format
const courseStructure: CourseStructure = {
  1: {
    title: "Числа и вычисления",
    description: "Основы числовых систем и вычислительных операций",
    color: "bg-gradient-to-r from-blue-500 to-blue-600",
    subunits: [
      { id: "1.1", title: "Натуральные и целые числа", skills: [1,2,3,4,5] },
      { id: "1.2", title: "Дроби и проценты", skills: [6,195,7,8,9,10] },
      { id: "1.3", title: "Рациональные числа и арифметические действия", skills: [11,12,13,14,15,16,17,180] },
      { id: "1.4", title: "Действительные числа", skills: [18,19,20,197] },
      { id: "1.5", title: "Приближённые вычисления", skills: [21,22,23] }
    ]
  },
  2: {
    title: "Алгебраические выражения",
    description: "Работа с буквенными выражениями и их преобразованиями",
    color: "bg-gradient-to-r from-green-500 to-green-600",
    subunits: [
      { id: "2.1", title: "Буквенные выражения", skills: [35,36,37,38] },
      { id: "2.2", title: "Степени", skills: [39,40,41,42,43,44] },
      { id: "2.3", title: "Многочлены", skills: [45,46,47,48,49,179] },
      { id: "2.4", title: "Алгебраические дроби", skills: [50,51,52,53] },
      { id: "2.5", title: "Арифметические корни", skills: [54,55,56,57] }
    ]
  },
  3: {
    title: "Уравнения и неравенства",
    description: "Методы решения уравнений, неравенств и текстовых задач",
    color: "bg-gradient-to-r from-purple-500 to-purple-600",
    subunits: [
      { id: "3.1", title: "Уравнения и системы", skills: [58,59,60,61,62,188,190,191] },
      { id: "3.2", title: "Неравенства и системы", skills: [63,64,65,66,67,68] },
      { id: "3.3", title: "Текстовые задачи", skills: [69,70,71,72,73,74,184,185,75] }
    ]
  },
  4: {
    title: "Числовые последовательности",
    description: "Изучение закономерностей в числовых последовательностях",
    color: "bg-gradient-to-r from-orange-500 to-orange-600",
    subunits: [
      { id: "4.1", title: "Последовательности", skills: [76,77,78,79] },
      { id: "4.2", title: "Арифметическая и геометрическая прогрессии. Формула сложных процентов", skills: [80,81,82,83,84,85,86,87,88] }
    ]
  },
  5: {
    title: "Функции",
    description: "Изучение функций и их свойств",
    color: "bg-gradient-to-r from-red-500 to-red-600",
    subunits: [
      { id: "5.1", title: "Свойства и графики функций", skills: [89,90,91,92,93,94,95,96,97,98,99,186,187,100,101,102] }
    ]
  },
  6: {
    title: "Координаты на прямой и плоскости",
    description: "Работа с координатными системами",
    color: "bg-gradient-to-r from-indigo-500 to-indigo-600",
    subunits: [
      { id: "6.1", title: "Координатная прямая", skills: [103,104,105,106,107,108,109] },
      { id: "6.2", title: "Декартовы координаты", skills: [110,111] }
    ]
  },
  7: {
    title: "Геометрия",
    description: "Изучение геометрических фигур и их свойств",
    color: "bg-gradient-to-r from-teal-500 to-teal-600",
    subunits: [
      { id: "7.1", title: "Геометрические фигуры", skills: [112,113,114,115,116] },
      { id: "7.2", title: "Треугольники", skills: [117,118,119,120,121,122,123,124] },
      { id: "7.3", title: "Многоугольники", skills: [125,126,127,128,129,130,131,132,133,134] },
      { id: "7.4", title: "Окружность и круг", skills: [135,136,137,138] },
      { id: "7.5", title: "Измерения", skills: [139,140,141,142,143,144,145,146,147,148,149,150,151,152,153] },
      { id: "7.6", title: "Векторы", skills: [154,155,156,157,196] },
      { id: "7.7", title: "Дополнительные темы по геометрии", skills: [158,159,160,161] }
    ]
  },
  8: {
    title: "Вероятность и статистика",
    description: "Основы теории вероятностей и статистического анализа",
    color: "bg-gradient-to-r from-pink-500 to-pink-600",
    subunits: [
      { id: "8.1", title: "Описательная статистика", skills: [162,163,164,165] },
      { id: "8.2", title: "Вероятность", skills: [166,167,168] },
      { id: "8.3", title: "Комбинаторика", skills: [169,170,171,172] },
      { id: "8.4", title: "Множества", skills: [173,174] },
      { id: "8.5", title: "Графы", skills: [175,176,177,178] }
    ]
  },
  9: {
    title: "Применение математики к прикладным задачам",
    description: "Применение математических знаний в реальных ситуациях",
    color: "bg-gradient-to-r from-amber-500 to-amber-600",
    subunits: [
      { id: "9.1", title: "Работа с данными и графиками", skills: [24,25,198,199,181,182,183,192,200] },
      { id: "9.2", title: "Прикладная геометрия / Чтение и анализ графических схем", skills: [26,27,28,29,30,31,32,33,34] }
    ]
  }
};

export default function Textbook2() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [selectedSubunit, setSelectedSubunit] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [currentArticle, setCurrentArticle] = useState<any>(null);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  const [readSkills, setReadSkills] = useState<Set<number>>(new Set());
  const [selectedText, setSelectedText] = useState('');
  const [isTextSelection, setIsTextSelection] = useState(false);
  const [showSelectedTextPanel, setShowSelectedTextPanel] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const { getSkillMastery, isLoading } = useMasterySystem();
  const { messages, isTyping, addMessage, setIsTyping, resetChat } = useChatContext();

  // Initialize from URL parameters
  useEffect(() => {
    const unit = searchParams.get('unit');
    const subunit = searchParams.get('subunit');
    const skill = searchParams.get('skill');
    const view = searchParams.get('view') as ViewMode;

    if (unit) setSelectedUnit(parseInt(unit));
    if (subunit) setSelectedSubunit(subunit);
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
        // Fetch from new_articles table 
        const { data, error } = await supabase
          .from('new_articles')
          .select('*')
          .eq('ID', selectedSkill)
          .single();

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

  // Navigation functions
  const handleUnitClick = (unitId: number) => {
    startTransition(() => {
      setSelectedUnit(unitId);
      setSelectedSubunit(null);
      setSelectedSkill(null);
      setCurrentView("subunit");
      setSearchParams({ unit: unitId.toString(), view: "subunit" });
    });
  };

  const handleSubunitClick = (subunitId: string) => {
    startTransition(() => {
      setSelectedSubunit(subunitId);
      setSelectedSkill(null);
      setCurrentView("articles");
      setSearchParams({ 
        unit: selectedUnit?.toString() || "", 
        subunit: subunitId, 
        view: "articles" 
      });
    });
  };

  const handleSkillClick = (skillId: number) => {
    startTransition(() => {
      setSelectedSkill(skillId);
      setCurrentView("articles");
      setSearchParams({ 
        unit: selectedUnit?.toString() || "", 
        subunit: selectedSubunit || "", 
        skill: skillId.toString(), 
        view: "articles" 
      });
    });
  };

  const handleBackToOverview = () => {
    startTransition(() => {
      setSelectedUnit(null);
      setSelectedSubunit(null);
      setSelectedSkill(null);
      setCurrentView("overview");
      setSearchParams({});
    });
  };

  const handleBackToUnit = () => {
    startTransition(() => {
      setSelectedSubunit(null);
      setSelectedSkill(null);
      setCurrentView("subunit");
      setSearchParams({ unit: selectedUnit?.toString() || "", view: "subunit" });
    });
  };

  const handleBackToSubunit = () => {
    startTransition(() => {
      setSelectedSkill(null);
      setCurrentView("articles");
      setSearchParams({ 
        unit: selectedUnit?.toString() || "", 
        subunit: selectedSubunit || "", 
        view: "articles" 
      });
    });
  };

  // Utility functions
  const getSkillName = (skillId: number) => {
    const skill = mathSkills.find(s => s.id === skillId);
    return skill?.skill || `Навык ${skillId}`;
  };

  const getMasteryLevel = (skillId: number) => {
    return getSkillMastery(skillId, '1') || 'not_started';
  };

  const getMasteryIcon = (status: string) => {
    switch (status) {
      case 'mastered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Play className="h-4 w-4 text-yellow-500" />;
      default: return <Lock className="h-4 w-4 text-gray-400" />;
    }
  };

  // Calculate progress for units and subunits
  const getUnitProgress = (unit: Unit) => {
    const allSkills = unit.subunits.flatMap(s => s.skills);
    const masteredSkills = allSkills.filter(skillId => getMasteryLevel(skillId) === 'mastered');
    return allSkills.length > 0 ? (masteredSkills.length / allSkills.length) * 100 : 0;
  };

  const getSubunitProgress = (subunit: Subunit) => {
    const masteredSkills = subunit.skills.filter(skillId => getMasteryLevel(skillId) === 'mastered');
    return subunit.skills.length > 0 ? (masteredSkills.length / subunit.skills.length) * 100 : 0;
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

  const handleSendChatMessage = async (message: string) => {
    setIsTyping(true);
    try {
      const response = await sendChatMessage(message, [], false);
      const aiMessage = {
        id: Date.now() + 1,
        text: response,
        isUser: false,
        timestamp: new Date(),
      };
      addMessage(aiMessage);
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
  const filteredUnits = useMemo(() => {
    if (!searchQuery.trim()) return Object.entries(courseStructure);
    
    return Object.entries(courseStructure).filter(([_, unit]) => {
      const unitMatch = unit.title.toLowerCase().includes(searchQuery.toLowerCase());
      const subunitMatch = unit.subunits.some(subunit => 
        subunit.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const skillMatch = unit.subunits.some(subunit =>
        subunit.skills.some(skillId =>
          getSkillName(skillId).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      return unitMatch || subunitMatch || skillMatch;
    });
  }, [searchQuery]);

  // Render functions
  const renderOverview = () => (
    <div className="space-y-6">
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredUnits.map(([unitId, unit]) => (
          <Card key={unitId} className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
            <CardHeader className={`${unit.color} text-white rounded-t-lg`}>
              <CardTitle className="flex items-center justify-between">
                <span>Модуль {unitId}</span>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {unit.subunits.length} тем
                </Badge>
              </CardTitle>
              <CardDescription className="text-white/90 font-medium">
                {unit.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6" onClick={() => handleUnitClick(parseInt(unitId))}>
              <p className="text-gray-600 mb-4">{unit.description}</p>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Прогресс</span>
                  <span>{Math.round(getUnitProgress(unit))}%</span>
                </div>
                <Progress value={getUnitProgress(unit)} className="h-2" />
              </div>
              <div className="space-y-2">
                {unit.subunits.slice(0, 3).map((subunit) => (
                  <div key={subunit.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{subunit.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {subunit.skills.length} навыков
                    </Badge>
                  </div>
                ))}
                {unit.subunits.length > 3 && (
                  <div className="text-xs text-gray-500 text-center pt-2">
                    +{unit.subunits.length - 3} ещё
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderUnitView = () => {
    if (!selectedUnit) return null;
    const unit = courseStructure[selectedUnit];
    if (!unit) return null;

    return (
      <div className="space-y-6">
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

        <div className={`${unit.color} text-white p-8 rounded-lg mb-8`}>
          <h1 className="text-3xl font-bold mb-2">Модуль {selectedUnit}: {unit.title}</h1>
          <p className="text-white/90 text-lg mb-4">{unit.description}</p>
          <div className="flex items-center gap-6">
            <div>
              <div className="text-2xl font-bold">{Math.round(getUnitProgress(unit))}%</div>
              <div className="text-sm text-white/80">Завершено</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{unit.subunits.length}</div>
              <div className="text-sm text-white/80">Тем</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {unit.subunits.reduce((sum, s) => sum + s.skills.length, 0)}
              </div>
              <div className="text-sm text-white/80">Навыков</div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {unit.subunits.map((subunit) => (
            <Card key={subunit.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{subunit.title}</span>
                  <Badge variant="outline">
                    {subunit.skills.length} навыков
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent onClick={() => handleSubunitClick(subunit.id)}>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Прогресс</span>
                    <span>{Math.round(getSubunitProgress(subunit))}%</span>
                  </div>
                  <Progress value={getSubunitProgress(subunit)} className="h-2" />
                </div>
                <div className="space-y-2">
                  {subunit.skills.slice(0, 4).map((skillId) => (
                    <div key={skillId} className="flex items-center gap-2">
                      {getMasteryIcon(getMasteryLevel(skillId))}
                      <span className="text-sm text-gray-600 truncate">
                        {getSkillName(skillId)}
                      </span>
                    </div>
                  ))}
                  {subunit.skills.length > 4 && (
                    <div className="text-xs text-gray-500 text-center pt-2">
                      +{subunit.skills.length - 4} ещё
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderSubunitView = () => {
    if (!selectedUnit || !selectedSubunit) return null;
    const unit = courseStructure[selectedUnit];
    const subunit = unit?.subunits.find(s => s.id === selectedSubunit);
    if (!unit || !subunit) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={handleBackToUnit} className="text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к модулю
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

        <div className={`${unit.color} text-white p-8 rounded-lg mb-8`}>
          <div className="mb-4">
            <div className="text-sm text-white/80 mb-2">
              Модуль {selectedUnit}: {unit.title}
            </div>
            <h1 className="text-3xl font-bold">{subunit.title}</h1>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <div className="text-2xl font-bold">{Math.round(getSubunitProgress(subunit))}%</div>
              <div className="text-sm text-white/80">Завершено</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{subunit.skills.length}</div>
              <div className="text-sm text-white/80">Навыков</div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {subunit.skills.map((skillId) => {
            const masteryLevel = getMasteryLevel(skillId);
            const isRead = readSkills.has(skillId);
            
            return (
              <Card key={skillId} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6" onClick={() => handleSkillClick(skillId)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getMasteryIcon(masteryLevel)}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Навык {skillId}: {getSkillName(skillId)}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
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
                      <Button variant="outline" size="sm">
                        <BookOpen className="h-4 w-4 mr-1" />
                        Теория
                      </Button>
                      <Button variant="outline" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/mcq-practice-skill-${skillId}`);
                      }}>
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
    );
  };

  const renderArticleView = () => {
    if (!selectedSkill) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={handleBackToSubunit} className="text-blue-600 hover:text-blue-800">
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
                const imgKey = `img${num}`;
                const imgUrl = currentArticle[imgKey];
                return imgUrl ? (
                  <div key={imgKey} className="my-4">
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
                onClick={() => {
                  markSkillAsRead(selectedSkill);
                }}
                disabled={readSkills.has(selectedSkill)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {readSkills.has(selectedSkill) ? "Прочитано" : "Отметить как прочитанное"}
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate(`/mcq-practice-skill-${selectedSkill}`)}
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
              onClick={() => navigate(`/mcq-practice-skill-${selectedSkill}`)}
            >
              <PenTool className="h-4 w-4 mr-2" />
              Перейти к упражнениям
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {currentView === "overview" && renderOverview()}
        {currentView === "subunit" && renderUnitView()}
        {currentView === "articles" && !selectedSkill && renderSubunitView()}
        {currentView === "articles" && selectedSkill && renderArticleView()}
      </div>

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
            <ChatInput onSendMessage={handleSendChatMessage} />
          </div>
        </div>
      )}
    </div>
  );
}
