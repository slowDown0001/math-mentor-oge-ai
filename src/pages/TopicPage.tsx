// src/pages/TopicPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Play, BookOpen, Target, X } from "lucide-react";
import { Link } from "react-router-dom";


import { Button } from "@/components/ui/button";
import { StreakDisplay } from "@/components/streak/StreakDisplay";
import VideoPlayerWithChat from "@/components/video/VideoPlayerWithChat";
import ArticleRenderer from "@/components/ArticleRenderer";
import OgeExerciseQuiz from "@/components/OgeExerciseQuiz";

import { supabase } from "@/integrations/supabase/client";
import { useModuleProgress } from "@/hooks/useModuleProgress";
import {
  modulesRegistry,
  type TopicContent,
  type ExerciseConfig,
} from "@/lib/modules.registry";

type TopicArticleRow = {
  topic_id: string;
  topic_text: string | null;
};

const TopicPage: React.FC = () => {
  const navigate = useNavigate();
  const { refetch } = useModuleProgress();

  // We route as /module/:moduleSlug/topic/:topicId
  const { moduleSlug = "", topicId = "" } = useParams<{
    moduleSlug: string;
    topicId: string;
  }>();

  const moduleEntry = modulesRegistry[moduleSlug];
  const topicIndex = useMemo(() => {
    if (!moduleEntry) return -1;
    return moduleEntry.topics.findIndex((t) => t.id === topicId);
  }, [moduleEntry, topicId]);

  const topic: TopicContent | null =
    moduleEntry && topicIndex >= 0 ? moduleEntry.topics[topicIndex] : null;

  // derive topicNumber like "4.2" from module.topicMapping
  const topicNumber = useMemo(() => {
    if (!moduleEntry || topicIndex < 0) return "";
    return moduleEntry.topicMapping[topicIndex] || "";
  }, [moduleEntry, topicIndex]);

  // Right-pane: load Обзор (article) from DB by topic_number
  const [loadingArticle, setLoadingArticle] = useState<boolean>(true);
  const [article, setArticle] = useState<TopicArticleRow | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoadingArticle(true);

    (async () => {
      if (!topicNumber) {
        if (!ignore) setLoadingArticle(false);
        return;
      }
      const { data, error } = await supabase
        .from("topic_articles")
        .select("topic_id, topic_text")
        .eq("topic_id", topicNumber)
        .maybeSingle();

      if (!ignore) {
        if (error) console.error("Failed to load topic article:", error);
        setArticle(data ?? null);
        setLoadingArticle(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [topicNumber]);

  // Modals
  const [selectedVideo, setSelectedVideo] = useState<{
    videoId: string;
    title: string;
    description: string;
  } | null>(null);

  const [selectedExercise, setSelectedExercise] = useState<ExerciseConfig | null>(null);

  // Exercises resolved from registry
  const exercises: ExerciseConfig[] = useMemo(() => {
    if (!moduleEntry || !topic) return [];
    const count = topic.exercises || 0;
    const getExerciseData = moduleEntry.getExerciseData;
    const list: ExerciseConfig[] = [];
    for (let i = 0; i < count; i += 1) {
      const cfg = getExerciseData
        ? getExerciseData(topic.id, i)
        : { title: `${topic.title} (упражнение ${i + 1})`, skills: [] };
      list.push(cfg);
    }
    return list;
  }, [moduleEntry, topic]);

  // Guards
  if (!moduleEntry || !topic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate("/learning-platform")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к карте
            </Button>
          </div>
          <div className="max-w-3xl mx-auto bg-white/80 dark:bg-gray-800/80 rounded-lg p-6 border">
            <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              Тема не найдена
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Проверьте адрес страницы: <span className="font-mono">{moduleSlug}/{topicId}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950">
      {/* Modals */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
            <VideoPlayerWithChat
              video={{
                videoId: selectedVideo.videoId,
                title: selectedVideo.title,
                description: selectedVideo.description,
              }}
              onClose={() => setSelectedVideo(null)}
            />
          </div>
        </div>
      )}

      {selectedExercise && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <OgeExerciseQuiz
              title={selectedExercise.title}
              skills={selectedExercise.skills}
              questionCount={selectedExercise.questionCount}
              isModuleTest={false}
              onBack={() => {
                setSelectedExercise(null);
                refetch();
              }}
            />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-6">
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
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {topic.title}
            </h1>
            <Link
              to={`/module/${moduleSlug}`}
              className="text-gray-600 dark:text-gray-400 hover:underline inline-block"
            >
              Тема {topicNumber} • Модуль {moduleEntry.moduleNumber}:{" "}
              {moduleEntry.title.replace(/^Модуль \d+:\s*/, "")}
            </Link>

          </div>
          <StreakDisplay />
        </div>

        {/* Split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Controls */}
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border shadow-sm"
          >
            {/* Читать учебник — highlighted */}
            <div
              className="p-4 mb-4 rounded-xl border-2 border-purple-300/70 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 hover:from-purple-100 hover:to-blue-100 transition cursor-pointer"
              onClick={() => (window.location.href = `/textbook?topic=${topicNumber}`)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                  <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-purple-900 dark:text-purple-100">
                    Читать учебник (тема {topicNumber})
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Конспект и примеры перед практикой
                  </div>
                </div>
              </div>
            </div>

            {/* Videos list */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                Видео
              </h4>
              <div className="space-y-2">
                {Array.from({ length: topic.videos || 0 }, (_, i) => {
                  const vd = topic.videoData?.[i];
                  const label = vd?.title || `Видео ${i + 1}`;
                  return (
                    <div
                      key={`video-${i}`}
                      className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border hover:bg-blue-50/50 dark:hover:bg-blue-900/10 cursor-pointer transition-colors"
                      onClick={() => {
                        if (vd) setSelectedVideo(vd);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                          <Play className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {label}
                        </span>
                      </div>
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        {vd ? "Доступно" : "Скоро"}
                      </span>
                    </div>
                  );
                })}
                {(!topic.videos || topic.videos === 0) && (
                  <div className="text-xs text-gray-500">Видео для темы пока нет</div>
                )}
              </div>
            </div>

            {/* Exercises list */}
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                Практика (MCQ)
              </h4>
              <div className="space-y-2">
                {exercises.map((ex, i) => (
                  <div
                    key={`ex-${i}`}
                    className="p-3 rounded-lg border bg-white/60 dark:bg-gray-800/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                        <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {ex.title}
                          {ex.isAdvanced && (
                            <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                              * Дополнительно
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                          Навыки: {ex.skills.join(", ")}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                        onClick={() => setSelectedExercise(ex)}
                        disabled={!ex.skills.length}
                      >
                        Практика
                      </Button>
                    </div>
                  </div>
                ))}
                {exercises.length === 0 && (
                  <div className="text-xs text-gray-500">Упражнения для темы пока нет</div>
                )}
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Обзор (Article) */}
          <motion.div
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-0 border shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div>
                <div className="text-sm text-gray-500">Обзор темы</div>
                <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {article?.topic_id ? `Тема ${article.topic_id}` : `Тема ${topicNumber}: ${topic.title}`}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[70vh]">
              {loadingArticle ? (
                <div className="text-sm text-gray-500">Загружаем обзор…</div>
              ) : article?.topic_text ? (
                <ArticleRenderer
                  text={article.topic_text}
                  article={{ skill: 0, art: article.topic_text }}
                />
              ) : (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Обзор для этой темы пока не добавлен. Используйте учебник, видео и
                  упражнения слева.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TopicPage;
