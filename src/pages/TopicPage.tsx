// src/pages/TopicPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Play, BookOpen, Target, X } from "lucide-react";

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

  // /module/:moduleSlug/topic/:topicId
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
      <div className="relative z-20 max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/learning-platform")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к карте
          </Button>
        </div>
        <div className="max-w-3xl mx-auto bg-white/95 text-[#1a1f36] backdrop-blur-sm rounded-lg p-6 border border-white/20 shadow-sm">
          <div className="text-lg font-semibold mb-2">Тема не найдена</div>
          <div className="text-sm text-gray-700">
            Проверьте адрес страницы:{" "}
            <span className="font-mono">{moduleSlug}/{topicId}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modals (stay above navbar/background) */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl bg-white rounded-lg overflow-hidden">
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

      {/* Page content lives above the layout background */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/cellard-lp2")}
            className="mr-4 hover:bg-white/20 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к карте
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold font-display bg-gradient-to-r from-yellow-500 to-emerald-500 bg-clip-text text-transparent">
              {topic.title}
            </h1>
            <Link
              to={`/module/${moduleSlug}`}
              className="text-gray-200/90 hover:text-yellow-400 inline-block cursor-pointer transition-colors"
            >
              Тема {topicNumber} • Урок {moduleEntry.moduleNumber}:{" "}
              {moduleEntry.title.replace(/^Модуль \d+:\s*/, "").replace(/Модуль/g, 'Урок')}
            </Link>
          </div>
          <Button
            onClick={() => (window.location.href = `/textbook?topic=${topicNumber}`)}
            className="bg-gradient-to-r from-yellow-500 to-emerald-500 hover:from-yellow-600 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-4 h-auto flex flex-col items-center gap-1"
          >
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              УЧЕБНИК
            </div>
            <p className="text-xs font-normal leading-tight">
              Подробные объяснения с примерами для углубленного изучения
            </p>
          </Button>
        </div>

        {/* Split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_4fr] gap-6">
          {/* LEFT: Controls */}
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/95 text-[#1a1f36] backdrop-blur-sm rounded-lg p-4 border border-white/20 shadow-sm"
          >
            {/* Читать учебник — highlighted */}
            <div
              className="p-4 mb-4 rounded-xl border-2 border-purple-300/70 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition cursor-pointer"
              onClick={() => (window.location.href = `/textbook?topic=${topicNumber}`)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-100">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-purple-900">
                    Читать учебник (тема {topicNumber})
                  </div>
                  <div className="text-xs text-gray-600">
                    Конспект и примеры перед практикой
                  </div>
                </div>
              </div>
            </div>

            {/* Videos list */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Видео
              </h4>
              <div className="space-y-2">
                {Array.from({ length: topic.videos || 0 }, (_, i) => {
                  const vd = topic.videoData?.[i];
                  const label = vd?.title || `Видео ${i + 1}`;
                  return (
                    <div
                      key={`video-${i}`}
                      className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-black/5 hover:bg-white/90 cursor-pointer transition-colors"
                      onClick={() => {
                        if (vd) setSelectedVideo(vd);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Play className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      <span className="text-xs text-blue-600">
                        {vd ? "Доступно" : "Скоро"}
                      </span>
                    </div>
                  );
                })}
                {(!topic.videos || topic.videos === 0) && (
                  <div className="text-xs text-gray-600">Видео для темы пока нет</div>
                )}
              </div>
            </div>

            {/* Exercises list */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Практика (MCQ)
              </h4>
              <div className="space-y-2">
                {exercises.map((ex, i) => (
                  <div
                    key={`ex-${i}`}
                    className="p-3 rounded-lg border bg-white/70"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Target className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {ex.title}
                          {ex.isAdvanced && (
                            <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                              * Дополнительно
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-600">
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
                  <div className="text-xs text-gray-600">Упражнения для темы пока нет</div>
                )}
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Обзор (Article) */}
          <motion.div
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/95 text-[#1a1f36] backdrop-blur-sm rounded-lg p-0 border border-white/20 shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
              <div>
                <div className="text-sm text-gray-600">Обзор темы</div>
                <div className="text-lg font-semibold">
                  {article?.topic_id ? `Тема ${article.topic_id}` : `Тема ${topicNumber}: ${topic.title}`}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[70vh]">
              {loadingArticle ? (
                <div className="text-sm text-gray-700">Загружаем обзор…</div>
              ) : article?.topic_text ? (
                <ArticleRenderer
                  text={article.topic_text}
                  article={{ skill: 0, art: article.topic_text }}
                />
              ) : (
                <div className="text-sm text-gray-700">
                  Обзор для этой темы пока не добавлен. Используйте учебник, видео и
                  упражнения слева.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default TopicPage;
