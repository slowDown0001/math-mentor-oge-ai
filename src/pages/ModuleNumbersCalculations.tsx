import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, BookOpen, Target, Crown, Zap, Star, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TopicContent {
  id: string;
  title: string;
  videos: number;
  articles: number;
  exercises: number;
}

interface QuizContent {
  id: string;
  title: string;
  description: string;
}

const ModuleNumbersCalculations = () => {
  const navigate = useNavigate();
  const topics: TopicContent[] = [
    {
      id: "natural-integers",
      title: "Натуральные и целые числа",
      videos: 2,
      articles: 1,
      exercises: 2
    },
    {
      id: "fractions-percentages",
      title: "Дроби и проценты",
      videos: 2,
      articles: 1,
      exercises: 3
    },
    {
      id: "rational-numbers",
      title: "Рациональные числа и арифметические действия",
      videos: 4,
      articles: 1,
      exercises: 3
    },
    {
      id: "real-numbers",
      title: "Действительные числа",
      videos: 1,
      articles: 1,
      exercises: 2
    },
    {
      id: "approximations",
      title: "Приближённые вычисления",
      videos: 1,
      articles: 1,
      exercises: 2
    }
  ];

  const quizzes: QuizContent[] = [
    {
      id: "quiz-1",
      title: "Тест 1",
      description: "Повысьте уровень навыков и получите до 400 баллов мастерства"
    },
    {
      id: "quiz-2", 
      title: "Тест 2",
      description: "Повысьте уровень навыков и получите до 400 баллов мастерства"
    }
  ];

  const renderTopicItem = (topic: TopicContent, index: number) => (
    <motion.div
      key={topic.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6 mb-4 border border-blue-200/50 dark:border-blue-800/50"
    >
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">{topic.title}</h3>
        
        {/* Videos */}
        <div className="space-y-3">
          {Array.from({ length: topic.videos }, (_, i) => (
            <div key={`video-${i}`} className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-blue-200/30 dark:border-blue-800/30">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Play className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Видео {i + 1}</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Не начато</span>
            </div>
          ))}
          
          {/* Article */}
          <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-purple-200/30 dark:border-purple-800/30">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Статья</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Не начато</span>
          </div>

          {/* Exercises */}
          {Array.from({ length: topic.exercises }, (_, i) => (
            <div key={`exercise-${i}`} className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-green-200/30 dark:border-green-800/30">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                  <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{topic.title}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Ответьте правильно на 3 из 4 вопросов для повышения уровня!</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600">
                  Практика
                </Button>
                <span className="text-sm text-gray-500 dark:text-gray-400">Не начато</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderQuiz = (quiz: QuizContent, index: number) => (
    <motion.div
      key={quiz.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (topics.length + index) * 0.05 }}
      className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg p-6 mb-6 border border-amber-200/50 dark:border-amber-800/50"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">{quiz.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{quiz.description}</p>
          <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
            Начать тест
          </Button>
        </div>
        <div className="ml-8">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-200 to-amber-200 dark:from-orange-800 dark:to-amber-800 rounded-full flex items-center justify-center shadow-lg">
            <div className="w-16 h-20 bg-gradient-to-br from-orange-300 to-amber-300 dark:from-orange-700 dark:to-amber-700 rounded-lg shadow-inner"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Create ordered content: topics with quizzes inserted at correct positions
  const orderedContent = [];
  
  // Add first topic
  orderedContent.push({ type: 'topic', content: topics[0], index: 0 });
  
  // Add second topic
  orderedContent.push({ type: 'topic', content: topics[1], index: 1 });
  
  // Add first quiz after "Дроби и проценты"
  orderedContent.push({ type: 'quiz', content: quizzes[0], index: 0 });
  
  // Add third topic
  orderedContent.push({ type: 'topic', content: topics[2], index: 2 });
  
  // Add fourth topic
  orderedContent.push({ type: 'topic', content: topics[3], index: 3 });
  
  // Add second quiz after "Действительные числа"
  orderedContent.push({ type: 'quiz', content: quizzes[1], index: 1 });
  
  // Add fifth topic
  orderedContent.push({ type: 'topic', content: topics[4], index: 4 });
  
  // Add final module test
  orderedContent.push({ type: 'quiz', content: { id: 'module-test', title: 'Итоговый тест модуля', description: 'Проверьте свои знания по всему модулю "Числа и вычисления"' }, index: 2 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-8"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/learning-platform')}
            className="mr-4 hover:bg-white/20 dark:hover:bg-gray-800/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к карте
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Модуль 1: Числа и вычисления
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              5 тем • 10 видео • 5 статей • 12 упражнений
            </p>
          </div>
        </motion.div>

        {/* Module Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 mb-8 border border-white/20 dark:border-gray-700/20 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">1,200 возможных баллов мастерства</span>
            <Info className="h-4 w-4 text-gray-500" />
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Навыки: Арифметика, Базовые операции, Числовые системы, Вычисления, Округление
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-purple-700" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Освоено</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Владею</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Знаком</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-orange-400 rounded"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Попытался</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-300 rounded bg-white"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Не начато</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Тест</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Итоговый тест</span>
            </div>
          </div>

          {/* Progress Grid */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Topic 1: Натуральные и целые числа (2 exercises) */}
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded"></div>
            </div>
            <div className="w-8 h-8 border-2 border-gray-300 rounded bg-white"></div>
            
            {/* Topic 2: Дроби и проценты (3 exercises) */}
            <div className="w-8 h-8 border-2 border-gray-300 rounded bg-white"></div>
            <div className="w-8 h-8 border-2 border-gray-300 rounded bg-white"></div>
            <div className="w-8 h-8 border-2 border-gray-300 rounded bg-white"></div>
            
            {/* Quiz 1 */}
            <Zap className="h-6 w-6 text-blue-600 mx-1" />
            
            {/* Topic 3: Рациональные числа и арифметические действия (3 exercises) */}
            <div className="w-8 h-8 border-2 border-gray-300 rounded bg-white"></div>
            <div className="w-8 h-8 border-2 border-gray-300 rounded bg-white"></div>
            <div className="w-8 h-8 border-2 border-gray-300 rounded bg-white"></div>
            
            {/* Topic 4: Действительные числа (2 exercises) */}
            <div className="w-8 h-8 border-2 border-gray-300 rounded bg-white"></div>
            <div className="w-8 h-8 border-2 border-gray-300 rounded bg-white"></div>
            
            {/* Quiz 2 */}
            <Zap className="h-6 w-6 text-blue-600 mx-1" />
            
            {/* Topic 5: Приближённые вычисления (2 exercises) */}
            <div className="w-8 h-8 border-2 border-gray-300 rounded bg-white"></div>
            <div className="w-8 h-8 border-2 border-gray-300 rounded bg-white"></div>
            
            {/* Final module test */}
            <Star className="h-6 w-6 text-yellow-600 mx-1" />
          </div>
        </motion.div>

        {/* Content List */}
        <div className="max-w-4xl mx-auto">
          {orderedContent.map((item, globalIndex) => (
            item.type === 'topic' 
              ? renderTopicItem(item.content as TopicContent, globalIndex)
              : renderQuiz(item.content as QuizContent, item.index)
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModuleNumbersCalculations;