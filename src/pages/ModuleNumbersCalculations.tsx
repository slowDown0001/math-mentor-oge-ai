import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, BookOpen, Target, Trophy, CheckCircle, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface TopicContent {
  id: string;
  title: string;
  videos: number;
  articles: number;
  exercises: number;
  isCompleted: boolean;
  isUnlocked: boolean;
}

const ModuleNumbersCalculations = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const topics: TopicContent[] = [
    {
      id: "natural-integers",
      title: "Натуральные и целые числа",
      videos: 2,
      articles: 1,
      exercises: 2,
      isCompleted: false,
      isUnlocked: true
    },
    {
      id: "fractions-percentages",
      title: "Дроби и проценты",
      videos: 2,
      articles: 1,
      exercises: 3,
      isCompleted: false,
      isUnlocked: true
    },
    {
      id: "rational-numbers",
      title: "Рациональные числа и арифметические действия",
      videos: 4,
      articles: 1,
      exercises: 3,
      isCompleted: false,
      isUnlocked: false
    },
    {
      id: "real-numbers",
      title: "Действительные числа",
      videos: 1,
      articles: 1,
      exercises: 2,
      isCompleted: false,
      isUnlocked: false
    },
    {
      id: "approximations",
      title: "Приближённые вычисления",
      videos: 1,
      articles: 1,
      exercises: 2,
      isCompleted: false,
      isUnlocked: false
    }
  ];

  const moduleProgress = 15; // Example progress

  const renderTopicCard = (topic: TopicContent, index: number) => (
    <motion.div
      key={topic.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`
        relative overflow-hidden transition-all duration-300 hover:shadow-lg
        ${topic.isUnlocked ? 'cursor-pointer hover:scale-105' : 'opacity-60'}
        ${topic.isCompleted ? 'bg-green-50 border-green-200' : ''}
      `}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">
              {topic.title}
            </CardTitle>
            {topic.isCompleted && (
              <CheckCircle className="h-6 w-6 text-green-600" />
            )}
            {!topic.isUnlocked && (
              <Lock className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Learn Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Изучить</h4>
              <div className="space-y-2">
                {Array.from({ length: topic.videos }, (_, i) => (
                  <div key={`video-${i}`} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Play className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Видео {i + 1}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {topic.isUnlocked ? "Доступно" : "Заблокировано"}
                    </Badge>
                  </div>
                ))}
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Статья</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {topic.isUnlocked ? "Доступно" : "Заблокировано"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Practice Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Практика</h4>
              <div className="space-y-2">
                {Array.from({ length: topic.exercises }, (_, i) => (
                  <div key={`exercise-${i}`} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Упражнение {i + 1}</span>
                      <span className="text-xs text-gray-500">Выполни 3 из 4 заданий</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Не начато
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {topic.isUnlocked && (
              <Button 
                className="w-full mt-4"
                onClick={() => setSelectedTopic(topic.id)}
              >
                Начать изучение
              </Button>
            )}
          </div>
        </CardContent>

        {/* Quiz indicators */}
        {(topic.id === "natural-integers" || topic.id === "fractions-percentages") && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-yellow-100 text-yellow-800 text-xs">
              + Тест после темы
            </Badge>
          </div>
        )}
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
            onClick={() => window.history.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к карте
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Числа и вычисления
            </h1>
            <p className="text-gray-600 mt-1">
              Модуль 1 • 5 тем • 10 видео • 5 статей • 12 упражнений
            </p>
          </div>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Прогресс модуля</h3>
                <span className="text-2xl font-bold text-blue-600">{moduleProgress}%</span>
              </div>
              <Progress value={moduleProgress} className="h-3" />
              <p className="text-sm text-gray-600 mt-2">
                Продолжай в том же духе! Завершено 1 из 5 тем.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {topics.map((topic, index) => renderTopicCard(topic, index))}
        </div>

        {/* Module Test */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gradient-to-r from-purple-100 to-blue-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-200 rounded-full">
                    <Trophy className="h-6 w-6 text-purple-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Итоговый тест модуля
                    </h3>
                    <p className="text-gray-600">
                      Проверь свои знания по всему модулю
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  disabled
                  className="opacity-50"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Заблокировано
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Завершите все темы модуля, чтобы открыть итоговый тест
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ModuleNumbersCalculations;