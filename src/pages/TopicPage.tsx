// src/pages/TopicPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Play, BookOpen, Target, X, Crown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StreakDisplay } from "@/components/streak/StreakDisplay";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const { refetch, getProgressStatus } = useModuleProgress();
  const [refreshKey, setRefreshKey] = useState(0);

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

  const [selectedExercise, setSelectedExercise] = useState<ExerciseConfig & { itemId?: string } | null>(null);

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
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <OgeExerciseQuiz
              key={refreshKey}
              title={selectedExercise.title}
              skills={selectedExercise.skills}
              questionCount={selectedExercise.questionCount}
              isModuleTest={false}
              itemId={selectedExercise.itemId}
              onBack={() => {
                setSelectedExercise(null);
                refetch();
                setRefreshKey(prev => prev + 1);
              }}
            />
          </div>
        </div>
      )}

      {/* Page content lives above the layout background */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center mb-4">
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
            className="bg-gradient-to-r from-yellow-500 to-emerald-500 hover:from-yellow-600 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            УЧЕБНИК
          </Button>
        </div>

        {/* Single block with tabs */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 text-[#1a1f36] backdrop-blur-sm rounded-lg border border-white/20 shadow-sm overflow-hidden lg:h-[calc(100vh-12rem)] flex flex-col"
        >
          <Tabs defaultValue="overview" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="overview"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Обзор
              </TabsTrigger>
              <TabsTrigger 
                value="videos"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Видео
              </TabsTrigger>
              <TabsTrigger 
                value="practice"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Практика
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6">
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
                      упражнения.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="videos" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-3">
                  {Array.from({ length: topic.videos || 0 }, (_, i) => {
                    const vd = topic.videoData?.[i];
                    const label = vd?.title || `Видео ${i + 1}`;
                    return (
                      <div
                        key={`video-${i}`}
                        className="flex items-center justify-between p-4 bg-white/70 rounded-lg border border-black/5 hover:bg-white hover:shadow-md cursor-pointer transition-all"
                        onClick={() => {
                          if (vd) setSelectedVideo(vd);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Play className="h-5 w-5 text-blue-600" />
                          </div>
                          <span className="text-base font-medium">{label}</span>
                        </div>
                        <span className="text-sm text-blue-600 font-medium">
                          {vd ? "Доступно" : "Скоро"}
                        </span>
                      </div>
                    );
                  })}
                  {(!topic.videos || topic.videos === 0) && (
                    <div className="text-sm text-gray-600">Видео для темы пока нет</div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="practice" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-3">
                  {exercises.map((ex, i) => {
                    const itemId = `${moduleSlug}-${topicId}-ex${i}`;
                    const status = getProgressStatus(itemId, 'exercise');
                    const exerciseWithId = { ...ex, itemId };

                    const renderProgressCell = () => {
                      switch (status) {
                        case 'mastered':
                          return (
                            <div className="relative w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                              <Crown className="h-3 w-3 text-white" />
                            </div>
                          );
                        case 'proficient':
                          return <div className="w-6 h-6 bg-gradient-to-t from-orange-500 from-33% to-gray-200 to-33% rounded" />;
                        case 'familiar':
                          return <div className="w-6 h-6 rounded border border-orange-500 bg-[linear-gradient(to_top,theme(colors.orange.500)_20%,white_20%)]" />;
                        case 'attempted':
                          return <div className="w-6 h-6 border-2 border-orange-400 rounded bg-white" />;
                        default:
                          return <div className="w-6 h-6 border-2 border-gray-300 rounded bg-white" />;
                      }
                    };

                    return (
                      <div
                        key={`ex-${i}`}
                        onClick={() => !ex.skills.length ? null : setSelectedExercise(exerciseWithId)}
                        className={`relative p-4 rounded-lg border bg-white/70 transition-all ${
                          ex.skills.length ? 'hover:bg-white hover:shadow-md cursor-pointer' : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            <Target className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-base font-medium">
                              {ex.title}
                              {ex.isAdvanced && (
                                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                                  * Дополнительно
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {renderProgressCell()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {exercises.length === 0 && (
                    <div className="text-sm text-gray-600">Упражнения для темы пока нет</div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </>
  );
};

export default TopicPage;
