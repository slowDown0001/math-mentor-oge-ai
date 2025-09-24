import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, BookOpen, Target, Crown, Zap, Star, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { StreakDisplay } from "@/components/streak/StreakDisplay";

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

const ModuleEquationsInequalities = () => {
  const navigate = useNavigate();
  const topics: TopicContent[] = [
    {
      id: "equations-systems",
      title: "Уравнения и системы",
      videos: 3,
      articles: 1,
      exercises: 3
    },
    {
      id: "inequalities-systems",
      title: "Неравенства и системы",
      videos: 3,
      articles: 1,
      exercises: 3
    },
    {
      id: "word-problems",
      title: "Текстовые задачи",
      videos: 3,
      articles: 1,
      exercises: 3
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

  // Topic mapping for textbook links
  const topicMapping = ['3.1', '3.2', '3.3'];

  const renderTopicItem = (topic: TopicContent, index: number) => (
    <motion.div
      key={topic.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6 mb-4 border border-blue-200/50 dark:border-blue-800/50"
    >
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">{topic.title}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Learn (Videos and Articles) */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">Learn</h4>
          <div className="space-y-3">
            {/* Videos */}
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
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Обзор</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Не начато</span>
            </div>

            {/* Read Textbook */}
            <div 
              className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-purple-200/30 dark:border-purple-800/30 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-colors"
              onClick={() => window.location.href = `/textbook?topic=${topicMapping[index]}`}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Читать учебник</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Доступно</span>
            </div>
          </div>
        </div>

        {/* Right Column - Practice (Exercises) */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">Practice</h4>
          <div className="space-y-3">
            {/* Exercises */}
            {Array.from({ length: topic.exercises }, (_, i) => (
              <div key={`exercise-${i}`} className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-green-200/30 dark:border-green-800/30">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                    <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{topic.title} (упражнение {i + 1})</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Не начато</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 ml-11">Ответьте правильно на 3 из 4 вопросов для повышения уровня!</p>
                <div className="ml-11">
                  <Button variant="outline" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600">
                    Практика
                  </Button>
                </div>
              </div>
            ))}
          </div>
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
  
  // Add first quiz
  orderedContent.push({ type: 'quiz', content: quizzes[0], index: 0 });
  
  // Add second topic
  orderedContent.push({ type: 'topic', content: topics[1], index: 1 });
  
  // Add second quiz
  orderedContent.push({ type: 'quiz', content: quizzes[1], index: 1 });
  
  // Add third topic
  orderedContent.push({ type: 'topic', content: topics[2], index: 2 });
  
  // Add final module test
  orderedContent.push({ type: 'quiz', content: { id: 'module-test', title: 'Итоговый тест модуля', description: 'Проверьте свои знания по всему модулю "Уравнения и неравенства"' }, index: 2 });

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
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Модуль 3: Уравнения и неравенства
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              3 темы • 9 видео • 3 статьи • 9 упражнений
            </p>
          </div>
          <StreakDisplay />
        </motion.div>

        {/* Module Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 mb-8 border border-white/20 dark:border-gray-700/20 shadow-lg max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">1,350 возможных баллов мастерства</span>
            <Info className="h-4 w-4 text-gray-500" />
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Навыки: Уравнения, Неравенства, Системы, Текстовые задачи
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
            {/* Topic 1: Уравнения и системы (3 exercises) */}
            <div className="w-8 h-8 border-2 border-gray-300 rounded bg-white"></div>
            <div className="w-8 h-8 border-2 border-gray-300 rounded bg-white"></div>
            <div className="w-8 h-8 border-2 border-gray-300 rounded bg-white"></div>
            
            {/* Quiz 1 */}
            <Zap className="h-6 w-6 text-blue-600 mx-1" />
            
            {/* Topic 2: Неравенства и системы (3 exercises) */}
            <div className="w-8 h-8 border-2 border-gray-300 rounded bg-white"></div>
            <div className="w-8 h-8 border-2 border-gray-300 rounded bg-white"></div>
            <div className="w-8 h-8 border-2 border-gray-300 rounded bg-white"></div>
            
            {/* Quiz 2 */}
            <Zap className="h-6 w-6 text-blue-600 mx-1" />
            
            {/* Topic 3: Текстовые задачи (3 exercises) */}
            <div className="w-8 h-8 border-2 border-gray-300 rounded bg-white"></div>
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

export default ModuleEquationsInequalities;