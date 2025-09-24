import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Flag, Trophy, Medal, Calculator, BookOpen, Target, TrendingUp, LineChart, MapPin, Shapes, PieChart, Zap, Star, Info, Play, X } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import ChatMessage from "@/components/chat/ChatMessage";
import TypingIndicator from "@/components/chat/TypingIndicator";
import { type Message } from "@/components/ChatSection";
import { sendVideoAwareChatMessage } from "@/services/videoAwareChatService";

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
  exerciseData?: Array<{title: string; questions: number}>;
  quizData?: Array<{title: string; questions: number}>;
  examData?: {title: string; questions: number};
}

const LearningPlatform = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userInput, setUserInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Inline video panel state
  const [showVideoPanel, setShowVideoPanel] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{ title: string; src: string } | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  function openVideo(v: { title: string; src: string }) {
    setSelectedVideo(v);
    setShowVideoPanel(true);
  }

  function closeVideo() {
    setShowVideoPanel(false);
    // ensure playback stops
    setTimeout(() => setSelectedVideo(null), 0);
  }
  
  // Sample videos array for demonstration
  const sampleVideos = [
    {
      title: "Демо видео платформы подготовки к ОГЭ математика",
      src: "https://vk.com/video_ext.php?oid=-232034222&id=456239025&hd=2&autoplay=1",
      thumbnail: "/placeholder-video.jpg"
    },
    {
      title: "Введение в числа и вычисления",
      src: "https://vk.com/video_ext.php?oid=-232034222&id=456239026&hd=2&autoplay=1",
      thumbnail: "/placeholder-video2.jpg"
    }
  ];

  const units: UnitData[] = [
    {
      id: 'unit-1',
      title: 'Числа и вычисления',
      icon: <Calculator className="h-5 w-5" />,
      exercises: 12,
      quizzes: 2,
      hasTest: true,
      isUnlocked: true,
      completedExercises: 3,
      completedQuizzes: 1,
      testCompleted: false,
      exerciseData: [
        {title: "Упражнение 1: Основы натуральных и целых чисел", questions: 4},
        {title: "Упражнение 2: Работа с числами", questions: 4},
        {title: "Упражнение 1: Дроби", questions: 4},
        {title: "Упражнение 2: Проценты", questions: 4},
        {title: "Упражнение 3: Сложные дроби*", questions: 4},
        {title: "Упражнение 1: Рациональные числа", questions: 4},
        {title: "Упражнение 2: Арифметические действия", questions: 4},
        {title: "Упражнение 3: Операции с рациональными числами", questions: 4},
        {title: "Упражнение 1: Действительные числа", questions: 4},
        {title: "Упражнение 2: Операции с действительными числами", questions: 4},
        {title: "Упражнение 1: Приближённые вычисления", questions: 4},
        {title: "Упражнение 2: Округление", questions: 4}
      ],
      quizData: [
        {title: "Тест 1: Натуральные числа и дроби", questions: 6},
        {title: "Тест 2: Рациональные и действительные числа", questions: 6}
      ],
      examData: {title: "Итоговый тест модуля", questions: 10}
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

  const renderProgressSquare = (completed: boolean, index: number, unitId: string, exerciseData?: Array<{title: string; questions: number}>) => (
    <div key={index} className="relative group">
      <div
        className={`
          w-8 h-8 rounded-lg border-2 transition-all duration-200 flex items-center justify-center cursor-pointer
          ${completed 
            ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-500 shadow-lg' 
            : 'bg-white border-gray-300 hover:border-orange-400 hover:shadow-md'
          }
          ${unitId === 'unit-1' ? 'hover:scale-110' : ''}
        `}
        onClick={() => {
          if (unitId === 'unit-1') {
            window.location.href = `/practice-exercise?skill=${120 + index}&topic=numbers-calculations`;
          }
        }}
      >
        {completed && <Target className="h-4 w-4 text-white" />}
      </div>
      {unitId === 'unit-1' && exerciseData && exerciseData[index] && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {exerciseData[index].title} • {exerciseData[index].questions} вопроса
        </div>
      )}
    </div>
  );

  const renderQuizIcon = (completed: boolean, index: number, unitId: string, quizData?: Array<{title: string; questions: number}>) => (
    <div key={`quiz-${index}`} className="relative group">
      <div
        className={`
          w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer
          ${completed 
            ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg' 
            : 'bg-gray-100 hover:bg-blue-50 hover:shadow-md'
          }
          ${unitId === 'unit-1' ? 'hover:scale-110' : ''}
        `}
        onClick={() => {
          if (unitId === 'unit-1') {
            window.location.href = `/practice-exercise?skill=${120 + index}&topic=numbers-calculations`;
          }
        }}
      >
        <Zap
          className={`h-4 w-4 ${
            completed ? 'text-white' : 'text-gray-400'
          }`}
        />
      </div>
      {unitId === 'unit-1' && quizData && quizData[index] && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {quizData[index].title} • {quizData[index].questions} вопросов
        </div>
      )}
    </div>
  );

  const renderTestIcon = (completed: boolean, unitId: string, examData?: {title: string; questions: number}) => (
    <div className="relative group">
      <div
        className={`
          w-10 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer
          ${completed 
            ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg' 
            : 'bg-gray-100 hover:bg-yellow-50 hover:shadow-md'
          }
          ${unitId === 'unit-1' ? 'hover:scale-110' : ''}
        `}
        onClick={() => {
          if (unitId === 'unit-1') {
            window.location.href = '/diagnostic-test?course=ogemath';
          }
        }}
      >
        <Star
          className={`h-5 w-5 ${
            completed ? 'text-white' : 'text-gray-400'
          }`}
        />
      </div>
      {unitId === 'unit-1' && examData && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {examData.title} • {examData.questions} вопросов
        </div>
      )}
    </div>
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
                renderProgressSquare(i < unit.completedExercises, i, unit.id, unit.exerciseData)
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
                renderQuizIcon(i < unit.completedQuizzes, i, unit.id, unit.quizData)
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
                {renderTestIcon(unit.testCompleted, unit.id, unit.examData)}
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
              <div className="flex items-center gap-3">
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

        {/* Inline Video Panel */}
        {showVideoPanel && selectedVideo && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl overflow-hidden border bg-white shadow-xl"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b">
              <h3 className="font-semibold">{selectedVideo.title}</h3>
              <Button
                variant="ghost"
                onClick={closeVideo}
                className="h-8 w-8 p-0 rounded-full"
                aria-label="Закрыть видео"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex h-[75vh]">
              {/* Video */}
              <div className="flex-1 bg-black">
                <iframe
                  key={selectedVideo.src}
                  src={selectedVideo.src}
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  title={selectedVideo.title}
                />
              </div>

              {/* Chat panel */}
              <div className="w-96 bg-background border-l flex flex-col">
                <div className="p-4 border-b bg-muted/50">
                  <h4 className="font-semibold text-foreground">Видео-ассистент</h4>
                  <p className="text-sm text-muted-foreground">Задавайте вопросы о платформе</p>
                </div>

                <ScrollArea className="flex-1" ref={scrollAreaRef}>
                  <div className="p-4 flex flex-col space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center text-muted-foreground text-sm">
                        Привет! Я помогу вам разобраться с платформой. Задавайте любые вопросы!
                      </div>
                    )}
                    {messages.map(message => (
                      <ChatMessage key={message.id} message={message} />
                    ))}
                    {isTyping && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <div className="flex gap-2 items-center bg-muted/50 rounded-xl p-2">
                    <Input
                      value={userInput}
                      onChange={e => setUserInput(e.target.value)}
                      onKeyDown={async (e) => {
                        if (e.key === "Enter" && userInput.trim()) {
                          const newMessage: Message = {
                            id: messages.length + 1,
                            text: userInput,
                            isUser: true,
                            timestamp: new Date()
                          };
                          setMessages(prev => [...prev, newMessage]);
                          setUserInput("");
                          setIsTyping(true);
                          try {
                            const response = await sendVideoAwareChatMessage(
                              newMessage,
                              messages,
                              selectedVideo?.title ?? "Видео",
                              "Learning Platform Video"
                            );
                            setMessages(prev => [...prev, response]);
                          } finally {
                            setIsTyping(false);
                          }
                        }
                      }}
                      placeholder="Задайте вопрос о платформе..."
                      className="flex-1 border-0 bg-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      disabled={isTyping}
                    />
                    <Button
                      onClick={async () => {
                        if (!userInput.trim()) return;
                        const newMessage: Message = {
                          id: messages.length + 1,
                          text: userInput,
                          isUser: true,
                          timestamp: new Date()
                        };
                        setMessages(prev => [...prev, newMessage]);
                        setUserInput("");
                        setIsTyping(true);
                        try {
                          const response = await sendVideoAwareChatMessage(
                            newMessage,
                            messages,
                            selectedVideo?.title ?? "Видео",
                            "Learning Platform Video"
                          );
                          setMessages(prev => [...prev, response]);
                        } finally {
                          setIsTyping(false);
                        }
                      }}
                      size="icon"
                      className="bg-primary hover:bg-primary/90 rounded-full w-8 h-8 p-0"
                      disabled={!userInput.trim() || isTyping}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sample Video Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {sampleVideos.map((video, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg p-4 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => openVideo(video)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openVideo(video);
                }
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Play className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-800">
                  {video.title}
                </h3>
              </div>
              <p className="text-gray-600 text-sm">
                Нажмите для просмотра видео с интерактивным чатом
              </p>
            </motion.div>
          ))}
        </div>

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