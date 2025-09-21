import React, { useState } from "react";
import { motion } from "framer-motion";
import { Flag, Trophy, Medal, Calculator, BookOpen, Target, TrendingUp, LineChart, MapPin, Shapes, PieChart, Zap, Star, Info } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface UnitData {
  id: string;
  title: string;
  icon: React.ReactNode;
  exercises: number;
  quizzes: number;
  hasTest: boolean;
  isUnlocked: boolean;
  completedExercises: number;
  completedQuizzes: number;
  testCompleted: boolean;
}

const LearningPlatform = () => {
  const units: UnitData[] = [
    {
      id: 'unit-1',
      title: 'Числа и вычисления',
      icon: <Calculator className="h-5 w-5" />,
      exercises: 8,
      quizzes: 2,
      hasTest: true,
      isUnlocked: true,
      completedExercises: 3,
      completedQuizzes: 1,
      testCompleted: false
    },
    {
      id: 'unit-2',
      title: 'Алгебраические выражения',
      icon: <BookOpen className="h-5 w-5" />,
      exercises: 6,
      quizzes: 1,
      hasTest: true,
      isUnlocked: true,
      completedExercises: 0,
      completedQuizzes: 0,
      testCompleted: false
    },
    {
      id: 'unit-3',
      title: 'Уравнения и неравенства',
      icon: <Target className="h-5 w-5" />,
      exercises: 9,
      quizzes: 2,
      hasTest: true,
      isUnlocked: true,
      completedExercises: 0,
      completedQuizzes: 0,
      testCompleted: false
    },
    {
      id: 'unit-4',
      title: 'Числовые последовательности',
      icon: <TrendingUp className="h-5 w-5" />,
      exercises: 5,
      quizzes: 1,
      hasTest: true,
      isUnlocked: true,
      completedExercises: 0,
      completedQuizzes: 0,
      testCompleted: false
    },
    {
      id: 'unit-5',
      title: 'Функции',
      icon: <LineChart className="h-5 w-5" />,
      exercises: 7,
      quizzes: 2,
      hasTest: true,
      isUnlocked: true,
      completedExercises: 0,
      completedQuizzes: 0,
      testCompleted: false
    },
    {
      id: 'unit-6',
      title: 'Координаты на прямой и плоскости',
      icon: <MapPin className="h-5 w-5" />,
      exercises: 6,
      quizzes: 1,
      hasTest: true,
      isUnlocked: true,
      completedExercises: 0,
      completedQuizzes: 0,
      testCompleted: false
    },
    {
      id: 'unit-7',
      title: 'Геометрия',
      icon: <Shapes className="h-5 w-5" />,
      exercises: 10,
      quizzes: 3,
      hasTest: true,
      isUnlocked: true,
      completedExercises: 0,
      completedQuizzes: 0,
      testCompleted: false
    },
    {
      id: 'unit-8',
      title: 'Вероятность и статистика',
      icon: <PieChart className="h-5 w-5" />,
      exercises: 5,
      quizzes: 1,
      hasTest: true,
      isUnlocked: false,
      completedExercises: 0,
      completedQuizzes: 0,
      testCompleted: false
    },
    {
      id: 'unit-9',
      title: 'Применение математики к прикладным задачам',
      icon: <Zap className="h-5 w-5" />,
      exercises: 4,
      quizzes: 1,
      hasTest: true,
      isUnlocked: false,
      completedExercises: 0,
      completedQuizzes: 0,
      testCompleted: false
    }
  ];

  const renderProgressSquare = (completed: boolean, index: number) => (
    <div
      key={index}
      className={`w-6 h-6 border-2 rounded ${
        completed 
          ? 'bg-green-500 border-green-500' 
          : 'bg-white border-gray-300'
      }`}
    />
  );

  const renderQuizIcon = (completed: boolean, index: number) => (
    <Zap
      key={`quiz-${index}`}
      className={`h-5 w-5 ${
        completed ? 'text-blue-600' : 'text-gray-400'
      }`}
    />
  );

  const renderTestIcon = (completed: boolean) => (
    <Star
      className={`h-5 w-5 ${
        completed ? 'text-yellow-600' : 'text-gray-400'
      }`}
    />
  );

  const UnitRow = ({ unit, index }: { unit: UnitData; index: number }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`
        p-4 rounded-lg border mb-3 cursor-pointer transition-all duration-200
        ${unit.isUnlocked ? 'bg-white hover:bg-blue-50 border-gray-200' : 'bg-gray-50 border-gray-300'}
        ${unit.id === 'unit-1' && unit.isUnlocked ? 'hover:shadow-md' : ''}
      `}
      onClick={() => {
        if (unit.id === 'unit-1' && unit.isUnlocked) {
          window.location.href = '/module/numbers-calculations';
        }
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`
            p-2 rounded-full
            ${unit.isUnlocked ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}
          `}>
            {unit.icon}
          </div>
          <div>
            <p className={`font-semibold text-sm ${
              unit.isUnlocked ? 'text-gray-800' : 'text-gray-500'
            }`}>
              {unit.title}
            </p>
          </div>
        </div>
        {unit.id === 'unit-1' && (
          <div className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded">
            UP NEXT FOR YOU!
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 flex-wrap">
        {/* Exercises */}
        {Array.from({ length: unit.exercises }, (_, i) => 
          renderProgressSquare(i < unit.completedExercises, i)
        )}
        
        {/* Quizzes */}
        {Array.from({ length: unit.quizzes }, (_, i) => 
          renderQuizIcon(i < unit.completedQuizzes, i)
        )}
        
        {/* Unit Test */}
        {unit.hasTest && renderTestIcon(unit.testCompleted)}
      </div>
    </motion.div>
  );

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 relative overflow-hidden">
        {/* Fun Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-200 rounded-full opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-pink-200 rounded-full opacity-40 animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-200 rounded-full opacity-25 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-12 h-12 bg-green-200 rounded-full opacity-35 animate-bounce"></div>
          <div className="absolute bottom-40 right-10 w-18 h-18 bg-purple-200 rounded-full opacity-30 animate-pulse"></div>
          
          {/* Decorative Math Symbols */}
          <div className="absolute top-20 left-1/3 text-6xl text-blue-200 opacity-20 rotate-12">π</div>
          <div className="absolute top-1/2 right-20 text-5xl text-pink-200 opacity-20 -rotate-12">∑</div>
          <div className="absolute bottom-1/3 left-20 text-4xl text-purple-200 opacity-20 rotate-45">∞</div>
          <div className="absolute top-3/4 right-1/3 text-5xl text-green-200 opacity-20 -rotate-45">√</div>
          <div className="absolute top-10 right-1/4 text-4xl text-orange-200 opacity-15 rotate-30">∆</div>
          <div className="absolute bottom-10 left-1/2 text-6xl text-indigo-200 opacity-18 -rotate-20">∫</div>
          <div className="absolute top-1/3 left-10 text-5xl text-red-200 opacity-16 rotate-60">α</div>
          <div className="absolute bottom-1/2 right-10 text-4xl text-teal-200 opacity-20 -rotate-30">β</div>
          <div className="absolute top-2/3 left-1/4 text-3xl text-yellow-200 opacity-15 rotate-15">γ</div>
          <div className="absolute bottom-20 right-1/4 text-5xl text-purple-300 opacity-17 -rotate-45">θ</div>
          <div className="absolute top-40 left-2/3 text-4xl text-blue-300 opacity-19 rotate-25">λ</div>
          <div className="absolute bottom-1/4 left-1/3 text-6xl text-pink-300 opacity-16 -rotate-15">Ω</div>
          <div className="absolute top-1/4 right-1/2 text-3xl text-green-300 opacity-18 rotate-40">φ</div>
          <div className="absolute bottom-40 left-10 text-4xl text-orange-300 opacity-15 -rotate-25">ψ</div>
          <div className="absolute top-80 right-40 text-5xl text-indigo-300 opacity-17 rotate-35">≈</div>
          <div className="absolute bottom-60 right-1/2 text-4xl text-red-300 opacity-16 -rotate-40">≠</div>
          <div className="absolute top-1/5 left-1/2 text-3xl text-teal-300 opacity-19 rotate-50">≤</div>
          <div className="absolute bottom-1/5 right-1/5 text-4xl text-yellow-300 opacity-14 -rotate-35">≥</div>
          <div className="absolute top-3/5 right-1/6 text-5xl text-purple-200 opacity-16 rotate-20">±</div>
          <div className="absolute bottom-2/3 left-1/5 text-3xl text-blue-200 opacity-18 -rotate-50">÷</div>
          <div className="absolute top-1/6 right-2/3 text-4xl text-pink-200 opacity-15 rotate-65">×</div>
          <div className="absolute bottom-1/6 left-2/3 text-5xl text-green-200 opacity-17 -rotate-20">∝</div>
        </div>
        
        <div className="container mx-auto px-4 py-6 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-800">
                ОГЭ Математика 2025
              </h1>
              <motion.a
                href="/textbook"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Читать как книгу
              </motion.a>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <span className="font-medium">11,300 возможных баллов мастерства</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Общее количество баллов за все задания курса</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-gray-600 bg-white/80 backdrop-blur-sm rounded-lg p-3 border">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-600 rounded"></div>
                <span>Освоено</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-400 rounded"></div>
                <span>Знакомо</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-400 rounded"></div>
                <span>Изучено</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-400 rounded"></div>
                <span>Пробовал</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 bg-white rounded"></div>
                <span>Не начато</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span>Тест</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-600" />
                <span>Экзамен</span>
              </div>
            </div>
          </motion.div>

          {/* Units Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl">
            {units.map((unit, index) => (
              <UnitRow key={unit.id} unit={unit} index={index} />
            ))}
          </div>

          {/* Course Challenge Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-white rounded-lg p-6 shadow-lg max-w-md"
          >
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="h-6 w-6 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-800">
                ИТОГОВЫЙ ВЫЗОВ
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Проверь свои знания навыков этого курса.
            </p>
            <motion.button
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Начать итоговый вызов
            </motion.button>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default LearningPlatform;