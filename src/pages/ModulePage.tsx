// src/pages/ModulePage.tsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Play, BookOpen, Target, Crown, Zap, Star, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StreakDisplay } from "@/components/streak/StreakDisplay";
import VideoPlayerWithChat from "@/components/video/VideoPlayerWithChat";
import ArticleRenderer from "@/components/ArticleRenderer";
import OgeExerciseQuiz from "@/components/OgeExerciseQuiz";
import { useModuleProgress } from "@/hooks/useModuleProgress";
import { modulesRegistry, type TopicContent, type QuizContent } from "@/lib/modules.registry";
import { supabase } from "@/integrations/supabase/client";
import NotFound from "./NotFound";

const ModulePage = () => {
  const { moduleSlug } = useParams<{ moduleSlug: string }>();
  const navigate = useNavigate();
  const { refetch } = useModuleProgress();

  const [selectedVideo, setSelectedVideo] = useState<{ videoId: string; title: string; description: string } | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<{ title: string; content: string } | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<{
    title: string;
    skills: number[];
    questionCount?: number;
    isAdvanced?: boolean;
    /** FINAL/Module test flag expected by OgeExerciseQuiz */
    isModuleTest?: boolean;
    /** Topics list for the booster function (only needed for final) */
    moduleTopics?: string[];
    /** Course identifier (string) */
    courseId?: string;
  } | null>(null);

  if (!moduleSlug || !modulesRegistry[moduleSlug]) {
    return <NotFound />;
  }

  const module = modulesRegistry[moduleSlug];

  // DB loader for "Обзор"
  const loadOverviewByTopicNumber = async (topicNumber: string) => {
    const { data, error } = await supabase
      .from("topic_articles")
      .select("topic_text")
      .eq("topic_id", topicNumber)
      .maybeSingle();
    if (error) {
      console.error("Failed to load topic overview:", error);
      return null;
    }
    return data ? { title: `Тема ${topicNumber}`, content: data.topic_text } : null;
  };

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
        {/* Left Column - Learn */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">Learn</h4>
          <div className="space-y-3">
            {/* Videos */}
            {Array.from({ length: topic.videos }, (_, i) => (
              <div
                key={`video-${i}`}
                className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-blue-200/30 dark:border-blue-800/30 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                onClick={() => {
                  if (topic.videoData && topic.videoData[i]) {
                    setSelectedVideo(topic.videoData[i]);
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <Play className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Видео {i + 1}</span>
                </div>
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  {topic.videoData && topic.videoData[i] ? "Доступно" : "Не начато"}
                </span>
              </div>
            ))}

            {/* Article (Обзор) */}
            <div
              className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-purple-200/30 dark:border-purple-800/30 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-colors"
              onClick={async () => {
                const topicNumber = module.topicMapping[index];

                // 1) Try DB (topic_articles)
                const dbArt = await loadOverviewByTopicNumber(topicNumber);
                if (dbArt?.content) {
                  setSelectedArticle({
                    title: dbArt.title ?? `Тема ${topicNumber}: ${topic.title}`,
                    content: dbArt.content,
                  });
                  return;
                }

                // 2) Fallback to hardcoded content (module.articleContent)
                if (module.articleContent && module.articleContent[topic.id]) {
                  setSelectedArticle(module.articleContent[topic.id]);
                  return;
                }

                // 3) Last resort: placeholder
                setSelectedArticle({
                  title: `Тема ${topicNumber}: ${topic.title}`,
                  content:
                    `<p>Обзор для этой темы пока не добавлен. Откройте «Читать учебник», затем посмотрите видео и переходите к практике.</p>`,
                });
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Обзор</span>
              </div>
              {/* Label kept simple; we don't prefetch availability from DB to avoid extra queries */}
              <span className="text-sm text-purple-600 dark:text-purple-400">
                Откроется
              </span>
            </div>

            {/* Read Textbook */}
            <div
              className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-purple-200/30 dark:border-purple-800/30 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-colors"
              onClick={() => (window.location.href = `/textbook?topic=${module.topicMapping[index]}`)}
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

        {/* Right Column - Practice */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">Practice</h4>
          <div className="space-y-3">
            {Array.from({ length: topic.exercises }, (_, i) => {
              const exerciseData = module.getExerciseData
                ? module.getExerciseData(topic.id, i)
                : { title: `${topic.title} (упражнение ${i + 1})`, skills: [] };

              return (
                <div key={`exercise-${i}`} className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-green-200/30 dark:border-green-800/30">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                      <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {exerciseData.title}
                        {exerciseData.isAdvanced && (
                          <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                            * Не в программе ОГЭ
                          </span>
                        )}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Не начато</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 ml-11">
                    Ответьте правильно на 3 из 4 вопросов для повышения уровня!
                  </p>
                  <div className="ml-11">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                      onClick={() => setSelectedExercise(exerciseData)}
                      disabled={exerciseData.skills.length === 0}
                    >
                      Практика
                    </Button>
                  </div>
                </div>
              );
            })}
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
      transition={{ delay: (module.topics.length + index) * 0.05 }}
      className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg p-6 mb-6 border border-amber-200/50 dark:border-amber-800/50"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">{quiz.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{quiz.description}</p>
          <Button
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
            onClick={() => {
              if (!module.getQuizData) return;
              const quizData = module.getQuizData(quiz.id);
              if (!quizData) return;

              const isFinal = quiz.id === "module-exam";
              setSelectedExercise({
                ...quizData,
                isModuleTest: isFinal,
                moduleTopics: isFinal ? module.topicMapping : undefined,
                courseId: isFinal ? "1" : undefined,
              });
            }}
          >
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

  const totalExercises = module.topics.reduce((sum, topic) => sum + topic.exercises, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 relative">
      {/* Modals */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
            <VideoPlayerWithChat
              video={{
                videoId: selectedVideo.videoId,
                title: selectedVideo.title,
                description: selectedVideo.description
              }}
              onClose={() => setSelectedVideo(null)}
            />
          </div>
        </div>
      )}

      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl bg-white dark:bg-gray-900 rounded-lg overflow-hidden max-h-[90vh]">
            <div className="bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="text-xl font-bold">{selectedArticle.title}</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedArticle(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-4rem)] p-6">
                <ArticleRenderer
                  text={selectedArticle.content}
                  article={{
                    skill: 1,
                    art: selectedArticle.content
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedExercise && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <OgeExerciseQuiz
              title={selectedExercise.title}
              skills={selectedExercise.skills}
              onBack={() => {
                setSelectedExercise(null);
                refetch();
              }}
              questionCount={selectedExercise.questionCount}
              isModuleTest={selectedExercise.isModuleTest}
              moduleTopics={selectedExercise.moduleTopics}
              courseId={selectedExercise.courseId}
            />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/learning-platform")}
            className="mr-4 hover:bg-white/20 dark:hover:bg-gray-800/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к карте
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {module.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{module.subtitle}</p>
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
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {module.masteryPoints} возможных баллов мастерства
            </span>
            <Info className="h-4 w-4 text-gray-500" />
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">{module.skillsDescription}</div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-purple-700" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Освоено</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-t from-orange-500 from-33% to-gray-200 to-33% rounded"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Владею</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-t from-orange-500 from-20% to-gray-200 to-20% rounded"></div>
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
            {Array.from({ length: totalExercises }, (_, i) => (
              <div key={i} className="w-8 h-8 border-2 border-gray-300 rounded bg-white"></div>
            ))}
            {module.quizzes.map((_, i) => (
              <Zap key={`quiz-${i}`} className="h-6 w-6 text-blue-600 mx-1" />
            ))}
            <Star className="h-6 w-6 text-yellow-600 mx-1" />
          </div>
        </motion.div>

        {/* Content List */}
        <div className="max-w-4xl mx-auto">
          {module.orderedContent.map((item, globalIndex) => {
            if (item.type === "topic" && item.topicIndex !== undefined) {
              return renderTopicItem(module.topics[item.topicIndex], globalIndex);
            }
            if (item.type === "quiz") {
              if (item.isFinalTest) {
                return renderQuiz(
                  {
                    id: "module-exam",
                    title: "Итоговый тест модуля",
                    description: `Проверьте свои знания по всему модулю "${module.title.split(": ")[1]}"`
                  },
                  globalIndex
                );
              }
              if (item.quizIndex !== undefined) {
                return renderQuiz(module.quizzes[item.quizIndex], item.quizIndex);
              }
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
};

export default ModulePage;
