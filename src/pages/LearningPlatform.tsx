import React, { useState } from "react";
import { motion } from "framer-motion";
import { Flag, Trophy, Medal, Calculator, BookOpen, Target, TrendingUp, LineChart, MapPin, Shapes, PieChart, Zap } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ModuleNode {
  id: string;
  title: string;
  type: 'start' | 'module' | 'checkpoint' | 'final';
  icon: React.ReactNode;
  dueDate: string;
  isUnlocked: boolean;
  position: { x: number; y: number };
}

const LearningPlatform = () => {
  // Calculate dates from today to May 29, 2026
  const startDate = new Date();
  const endDate = new Date('2026-05-29');
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const formatDate = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long'
    });
  };

  const modules: ModuleNode[] = [
    {
      id: 'start',
      title: 'Старт',
      type: 'start',
      icon: <Flag className="h-5 w-5" />,
      dueDate: formatDate(0),
      isUnlocked: true,
      position: { x: 10, y: 20 }
    },
    {
      id: 'module-1',
      title: 'Числа и вычисления',
      type: 'module',
      icon: <Calculator className="h-5 w-5" />,
      dueDate: formatDate(Math.floor(totalDays * 0.1)),
      isUnlocked: true,
      position: { x: 25, y: 15 }
    },
    {
      id: 'module-2',
      title: 'Алгебраические выражения',
      type: 'module',
      icon: <BookOpen className="h-5 w-5" />,
      dueDate: formatDate(Math.floor(totalDays * 0.2)),
      isUnlocked: false,
      position: { x: 45, y: 10 }
    },
    {
      id: 'module-3',
      title: 'Уравнения и неравенства',
      type: 'module',
      icon: <Target className="h-5 w-5" />,
      dueDate: formatDate(Math.floor(totalDays * 0.3)),
      isUnlocked: false,
      position: { x: 65, y: 15 }
    },
    {
      id: 'checkpoint-1',
      title: 'ОГЭ Симуляция',
      type: 'checkpoint',
      icon: <Medal className="h-5 w-5" />,
      dueDate: formatDate(Math.floor(totalDays * 0.35)),
      isUnlocked: false,
      position: { x: 85, y: 20 }
    },
    {
      id: 'module-4',
      title: 'Числовые последовательности',
      type: 'module',
      icon: <TrendingUp className="h-5 w-5" />,
      dueDate: formatDate(Math.floor(totalDays * 0.4)),
      isUnlocked: false,
      position: { x: 90, y: 35 }
    },
    {
      id: 'module-5',
      title: 'Функции',
      type: 'module',
      icon: <LineChart className="h-5 w-5" />,
      dueDate: formatDate(Math.floor(totalDays * 0.5)),
      isUnlocked: false,
      position: { x: 85, y: 50 }
    },
    {
      id: 'module-6',
      title: 'Координаты на прямой и плоскости',
      type: 'module',
      icon: <MapPin className="h-5 w-5" />,
      dueDate: formatDate(Math.floor(totalDays * 0.6)),
      isUnlocked: false,
      position: { x: 70, y: 60 }
    },
    {
      id: 'checkpoint-2',
      title: 'ОГЭ Симуляция',
      type: 'checkpoint',
      icon: <Medal className="h-5 w-5" />,
      dueDate: formatDate(Math.floor(totalDays * 0.65)),
      isUnlocked: false,
      position: { x: 50, y: 65 }
    },
    {
      id: 'module-7',
      title: 'Геометрия',
      type: 'module',
      icon: <Shapes className="h-5 w-5" />,
      dueDate: formatDate(Math.floor(totalDays * 0.7)),
      isUnlocked: false,
      position: { x: 30, y: 70 }
    },
    {
      id: 'module-8',
      title: 'Вероятность и статистика',
      type: 'module',
      icon: <PieChart className="h-5 w-5" />,
      dueDate: formatDate(Math.floor(totalDays * 0.8)),
      isUnlocked: false,
      position: { x: 15, y: 75 }
    },
    {
      id: 'module-9',
      title: 'Применение математики к прикладным задачам',
      type: 'module',
      icon: <Zap className="h-5 w-5" />,
      dueDate: formatDate(Math.floor(totalDays * 0.9)),
      isUnlocked: false,
      position: { x: 25, y: 85 }
    },
    {
      id: 'final',
      title: 'Ты готов к ОГЭ!',
      type: 'final',
      icon: <Trophy className="h-5 w-5" />,
      dueDate: '29 мая 2026',
      isUnlocked: false,
      position: { x: 50, y: 90 }
    }
  ];

  const getNodeColor = (node: ModuleNode, isHovered: boolean) => {
    if (node.type === 'start') return 'from-green-400 to-green-600';
    if (node.type === 'final') return 'from-purple-400 to-purple-600';
    if (node.type === 'checkpoint') return 'from-gray-400 to-gray-600';
    if (node.isUnlocked) return 'from-blue-400 to-blue-600';
    return 'from-gray-300 to-gray-500';
  };

  const PathLine = ({ from, to }: { from: ModuleNode; to: ModuleNode }) => {
    const x1 = from.position.x;
    const y1 = from.position.y;
    const x2 = to.position.x;
    const y2 = to.position.y;
    
    // Create control points for smooth curves
    const controlX1 = x1 + (x2 - x1) * 0.3;
    const controlY1 = y1;
    const controlX2 = x1 + (x2 - x1) * 0.7;
    const controlY2 = y2;
    
    const path = `M ${x1} ${y1} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${x2} ${y2}`;
    
    return (
      <path
        d={path}
        stroke="url(#pathGradient)"
        strokeWidth="4"
        strokeDasharray="8,4"
        fill="none"
        className="opacity-70"
      />
    );
  };

  return (
    <TooltipProvider>
      <div className="h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 relative overflow-hidden flex flex-col">
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
        
        <div className="container mx-auto px-4 py-4 flex flex-col h-full">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Твой путь к успеху в ОГЭ
            </h1>
            <p className="text-base text-gray-600 mb-4">
              Игровая карта обучения • Следуй по пути и достигай целей
            </p>
            <motion.a
              href="/textbook"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BookOpen className="h-5 w-5 mr-2" />
              READ AS A BOOK
            </motion.a>
          </motion.div>

          {/* Course Map */}
          <div className="relative w-full flex-1 mx-auto max-w-5xl">
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Gradient Definition for Path */}
              <defs>
                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
              
              {/* Draw connecting paths */}
              {modules.slice(0, -1).map((module, index) => (
                <PathLine
                  key={`path-${index}`}
                  from={module}
                  to={modules[index + 1]}
                />
              ))}
            </svg>

            {/* Module Nodes */}
            {modules.map((module, index) => (
              <Tooltip key={module.id}>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.2, 
                      y: -5,
                      boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                    }}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style={{
                      left: `${module.position.x}%`,
                      top: `${module.position.y}%`,
                    }}
                  >
                    <div
                      className={`
                        w-14 h-14 rounded-full bg-gradient-to-br ${getNodeColor(module, false)}
                        flex items-center justify-center text-white shadow-lg
                        border-3 border-white
                        ${module.isUnlocked ? 'hover:shadow-xl' : 'opacity-70'}
                        transition-all duration-300
                      `}
                    >
                      {module.icon}
                    </div>
                    
                    {/* Module Title and Date */}
                    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-center min-w-max pointer-events-none">
                      <div className="bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-md border border-gray-200">
                        <p className="text-xs font-semibold text-gray-800 leading-tight">
                          {module.title}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          до {module.dueDate}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-semibold">{module.title}</p>
                    <p className="text-sm text-gray-600">Срок: {module.dueDate}</p>
                    <p className="text-xs text-gray-500">
                      {module.isUnlocked ? 'Доступен сейчас' : 'Скоро откроется'}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Progress Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-center"
          >
            <div className="bg-white rounded-xl p-4 shadow-lg max-w-sm mx-auto">
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Твой прогресс
              </h3>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600 text-sm">Модулей завершено:</span>
                <span className="font-bold text-blue-600">1 / 9</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "22%" }}
                  transition={{ delay: 1, duration: 1 }}
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
                />
              </div>
              <p className="text-xs text-gray-600">
                Продолжай в том же духе! 🎯
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default LearningPlatform;