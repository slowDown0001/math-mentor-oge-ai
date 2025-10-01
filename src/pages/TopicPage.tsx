// src/pages/TopicPage.tsx
import React, { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Play, BookOpen, Target, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { modulesRegistry, type TopicContent } from "@/lib/modules.registry";
import OgeExerciseQuiz from "@/components/OgeExerciseQuiz";
import VideoPlayerWithChat from "@/components/video/VideoPlayerWithChat";
import ArticleRenderer from "@/components/ArticleRenderer";
import NotFound from "./NotFound";
import { useModuleProgress } from "@/hooks/useModuleProgress";

const TopicPage: React.FC = () => {
  const { moduleSlug, topicId } = useParams<{ moduleSlug: string; topicId: string }>();
  const navigate = useNavigate();
  const { refetch } = useModuleProgress();

  const [selectedVideo, setSelectedVideo] = useState<{ videoId: string; title: string; description: string } | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<{ title: string; content: string } | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<{
    title: string;
    skills: number[];
    questionCount?: number;
    isAdvanced?: boolean;
  } | null>(null);

  const module = moduleSlug ? modulesRegistry[moduleSlug] : undefined;
  const topicIndex = useMemo(
    () => (module ? module.topics.findIndex(t => t.id === topicId) : -1),
    [module, topicId]
  );
  const topic: TopicContent | undefined = module && topicIndex >= 0 ? module.topics[topicIndex] : undefined;
  const topicNumber = module && topicIndex >= 0 ? module.topicMapping?.[topicIndex] : undefined;

  if (!module || !topic) return <NotFound />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950">
      {/* Modals */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
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
          <div className="w-full max-w-5xl bg-white dark:bg-gray-900 rounded-lg overflow-hidden max-h-[90vh]">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-xl font-bold">{selectedArticle.title}</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedArticle(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-4rem)] p-6">
              <ArticleRenderer
                text={selectedArticle.content}
                article={{ skill: 1, art: selectedArticle.content }}
              />
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
            />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header / Breadcrumbs */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/module/${module.slug}`)}
            className="mr-4 hover:bg-white/20 dark:hover:bg-gray-800/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к модулю
          </Button>
          <div className="flex-1">
            <div className="text-sm text-gray-500">
              <Link to="/learning-platform" className="hover:underline">Карта курса</Link>
              <span className="mx-2">/</span>
              <Link to={`/module/${module.slug}`} className="hover:underline">{module.title}</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-800 dark:text-gray-200">{topicNumber}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{topic.title}</h1>
          </div>
        </motion.div>

        {/* Learn column */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-6 border border-white/20 dark:border-gray-700/20 shadow">
            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">Учить</h2>

            {/* Videos */}
            <div className="space-y-3 mb-4">
              {Array.from({ length: topic.videos }, (_, i) => (
                <div
                  key={`video-${i}`}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border hover:bg-blue-50/50 dark:hover:bg-blue-900/10 cursor-pointer transition-colors"
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
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    {topic.videoData?.[i] ? "Доступно" : "Не начато"}
                  </span>
                </div>
              ))}
            </div>

            {/* Article */}
            <div
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border hover:bg-purple-50/50 dark:hover:bg-purple-900/10 cursor-pointer transition-colors"
              onClick={() => {
                if (module.articleContent && module.articleContent[topic.id]) {
                  setSelectedArticle(module.articleContent[topic.id]);
                }
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Обзор</span>
              </div>
              <span className="text-xs text-purple-600 dark:text-purple-400">
                {module.articleContent?.[topic.id] ? "Доступно" : "Не начато"}
              </span>
            </div>

            {/* Read textbook shortcut */}
            {topicNumber && (
              <Link
                to={`/textbook?topic=${topicNumber}`}
                className="mt-3 inline-flex items-center text-sm text-purple-700 hover:underline"
              >
                Читать учебник
              </Link>
            )}
          </div>

          {/* Practice column */}
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-6 border border-white/20 dark:border-gray-700/20 shadow">
            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">Практика</h2>

            <div className="space-y-3">
              {Array.from({ length: topic.exercises }, (_, i) => {
                const exerciseData = module.getExerciseData
                  ? module.getExerciseData(topic.id, i)
                  : { title: `${topic.title} — упражнение ${i + 1}`, skills: [] };

                return (
                  <div key={`exercise-${i}`} className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                        <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {exerciseData.title}
                          {exerciseData.isAdvanced && (
                            <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                              * Не в программе ОГЭ
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="ml-10">
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
        </motion.div>
      </div>
    </div>
  );
};

export default TopicPage;
