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
    <Tooltip key={index}>
      <TooltipTrigger>
        <div
          className={`
            w-8 h-8 rounded-lg border-2 transition-all duration-200 flex items-center justify-center
            ${completed 
              ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-500 shadow-lg' 
              : 'bg-white border-gray-300 hover:border-blue-400 hover:shadow-md'
            }
          `}
        >
          {completed && <Target className="h-4 w-4 text-white" />}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{completed ? 'Упражнение завершено' : 'Упражнение не начато'}</p>
      </TooltipContent>
    </Tooltip>
  );

  const renderQuizIcon = (completed: boolean, index: number) => (
    <Tooltip key={`quiz-${index}`}>
      <TooltipTrigger>
        <div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
            ${completed 
              ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg' 
              : 'bg-gray-100 hover:bg-blue-50 hover:shadow-md'
            }
          `}
        >
          <Zap
            className={`h-4 w-4 ${
              completed ? 'text-white' : 'text-gray-400'
            }`}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{completed ? 'Тест завершен' : 'Тест не начат'}</p>
      </TooltipContent>
    </Tooltip>
  );

  const renderTestIcon = (completed: boolean) => (
    <Tooltip>
      <TooltipTrigger>
        <div
          className={`
            w-10 h-8 rounded-lg flex items-center justify-center transition-all duration-200
            ${completed 
              ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg' 
              : 'bg-gray-100 hover:bg-yellow-50 hover:shadow-md'
            }
          `}
        >
          <Star
            className={`h-5 w-5 ${
              completed ? 'text-white' : 'text-gray-400'
            }`}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{completed ? 'Итоговый экзамен завершен' : 'Итоговый экзамен не начат'}</p>
      </TooltipContent>
    </Tooltip>
  );

  const UnitRow = ({ unit, index }: { unit: UnitData; index: number }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`
        p-6 rounded-xl border-2 mb-4 cursor-pointer transition-all duration-300 relative overflow-hidden
        ${unit.isUnlocked 
          ? 'bg-white/90 backdrop-blur-sm hover:bg-white border-white/50 hover:border-blue-300 hover:shadow-xl transform hover:-translate-y-1' 
          : 'bg-gray-50/80 backdrop-blur-sm border-gray-200'
        }
      `}
      onClick={() => {
        if (unit.isUnlocked) {
          const moduleRoutes = {
            'unit-1': '/module/numbers-calculations',
            'unit-2': '/module/algebraic-expressions',
            'unit-3': '/module/equations-inequalities',
            'unit-4': '/module/sequences',
            'unit-5': '/module/functions',
            'unit-6': '/module/coordinates',
            'unit-7': '/module/geometry',
            'unit-8': '/module/probability-statistics',
            'unit-9': '/module/applied-math'
          };
          const route = moduleRoutes[unit.id as keyof typeof moduleRoutes];
          if (route) {
            window.location.href = route;
          }
        }
      }}
    >
      {/* Gradient overlay for unlocked units */}
      {unit.isUnlocked && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 to-purple-50/20 pointer-events-none" />
      )}
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`
              p-3 rounded-xl shadow-md
              ${unit.isUnlocked 
                ? 'bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600' 
                : 'bg-gray-200 text-gray-500'
              }
            `}>
              {unit.icon}
            </div>
            <div>
              <h3 className={`font-bold text-lg ${
                unit.isUnlocked ? 'text-gray-800' : 'text-gray-500'
              }`}>
                {unit.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {unit.exercises} упражнений • {unit.quizzes} тестов
              </p>
            </div>
          </div>
          {unit.id === 'unit-1' && (
            <div className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
              СЛЕДУЮЩИЙ!
            </div>
          )}
        </div>
        
        {/* Progress Section */}
        <div className="space-y-3">
          {/* Exercises Row */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 min-w-[100px]">
              <Target className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Упражнения</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {Array.from({ length: unit.exercises }, (_, i) => 
                renderProgressSquare(i < unit.completedExercises, i)
              )}
            </div>
            <span className="text-xs text-gray-500 ml-auto">
              {unit.completedExercises}/{unit.exercises}
            </span>
          </div>
          
          {/* Quizzes Row */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 min-w-[100px]">
              <Zap className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Тесты</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {Array.from({ length: unit.quizzes }, (_, i) => 
                renderQuizIcon(i < unit.completedQuizzes, i)
              )}
            </div>
            <span className="text-xs text-gray-500 ml-auto">
              {unit.completedQuizzes}/{unit.quizzes}
            </span>
          </div>
          
          {/* Unit Test Row */}
          {unit.hasTest && (
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 min-w-[100px]">
                <Star className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">Экзамен</span>
              </div>
              <div className="flex items-center gap-2">
                {renderTestIcon(unit.testCompleted)}
              </div>
              <span className="text-xs text-gray-500 ml-auto">
                {unit.testCompleted ? 'Завершен' : 'Не начат'}
              </span>
            </div>
          )}
        </div>
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