// ModulePage.tsx
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
import NotFound from "./NotFound";
// ⬇️ add supabase client
import { supabase } from "@/integrations/supabase/client";

const ModulePage = () => {
  const { moduleSlug } = useParams<{ moduleSlug: string }>();
  const navigate = useNavigate();
  const { refetch } = useModuleProgress();

  const [selectedVideo, setSelectedVideo] = useState<{ videoId: string; title: string; description: string } | null>(null);

  // article modal state
  const [selectedArticle, setSelectedArticle] = useState<{ title: string; content: string } | null>(null);
  const [articleLoading, setArticleLoading] = useState<boolean>(false);

  const [selectedExercise, setSelectedExercise] = useState<{
    title: string;
    skills: number[];
    questionCount?: number;
    isAdvanced?: boolean;
    isModuleTest?: boolean;
    moduleTopics?: string[];
    courseId?: string;
  } | null>(null);

  if (!moduleSlug || !modulesRegistry[moduleSlug]) {
    return <NotFound />;
  }

  const module = modulesRegistry[moduleSlug];

  // ⬇️ helper to open article: tries DB first, then code fallback
  const openArticle = async (topic: TopicContent, topicNumber: string) => {
    setArticleLoading(true);
    try {
      const { data, error } = await supabase
        .from("topic_articles")
        .select("topic_text, topic_id")
        .eq("topic_id", topicNumber)
        .maybeSingle(); // tolerate 0 rows

      if (!error && data?.topic_text) {
        setSelectedArticle({
          title: `Тема ${topicNumber}: ${topic.title}`,
          content: data.topic_text,
        });
      } else if (module.articleContent && module.articleContent[topic.id]) {
        setSelectedArticle(module.articleContent[topic.id]);
      } else {
        setSelectedArticle({
          title: `Тема ${topicNumber}: ${topic.title}`,
          content:
            "Обзор для этой темы пока не добавлен. Откройте «Читать учебник», затем посмотрите видео и переходите к практике.",
        });
      }
    } finally {
      setArticleLoading(false);
    }
  };

  const renderTopicItem = (topic: TopicContent, index: number) => {
    const topicNumber = module.topicMapping[index]; // e.g., "1.2"
    return (
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

              {/* Article */}
              <div
                className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-purple-200/30 dark:border-purple-800/30 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-colors"
                onClick={() => openArticle(topic, topicNumber)}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                    <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Обзор</span>
                </div>
                <span className="text-sm text-purple-600 dark:text-purple-400">
                  {articleLoading ? "Загрузка…" : "Открыть"}
                </span>
              </div>

              {/* Read Textbook */}
              <div
                className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-purple-200/30 dark:border-purple-800/30 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-colors"
                onClick={() => (window.location.href = `/textbook?topic=${topicNumber}`)}
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
  };

  const renderQuiz = (quiz: QuizContent, index: number) => (
    <motion.div
      key={quiz.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (module.topics.length + index) * 0.05 }}
      className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg p-6 mb-6 border border-amber-200/50 dark:border-amber-800/50"
    >
      {/* ...unchanged... */}
      {/* keep your existing quiz code */}
    </motion.div>
  );

  const totalExercises = module.topics.reduce((sum, topic) => sum + topic.exercises, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 relative">
      {/* Video modal – unchanged */}
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

      {/* Article modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl bg-white dark:bg-gray-900 rounded-lg overflow-hidden max-h[90vh]">
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
                  article={{ skill: 0, art: selectedArticle.content }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exercise modal – unchanged */}
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

      {/* ...keep the rest of your header/statistics/content list as-is... */}
    </div>
  );
};

export default ModulePage;
