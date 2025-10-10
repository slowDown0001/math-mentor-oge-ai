// src/pages/TopicPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Play, BookOpen, Target, X, Crown, Clock, CheckCircle2, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StreakDisplay } from "@/components/streak/StreakDisplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  // State for exercise
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
      {/* Modal for exercises only */}

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
      <div className="relative z-20 max-w-7xl mx-auto px-4 py-4 pb-12">
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
        </div>

        {/* Lesson Description */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-white/20 shadow-sm p-4 mb-4">
          {/* Textbook Link - Full Width */}
          <div className="bg-gradient-to-br from-yellow-50 to-emerald-50 border border-yellow-300/50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-[#1a1f36] mb-1">Углубленное изучение в учебнике</h3>
                <p className="text-sm text-gray-700">
                  Для более глубокого погружения в тему прочитайте нашу статью в учебнике. Там вы найдете подробные теоретические материалы, определения всех ключевых понятий, разобранные примеры решения задач и упражнения для самостоятельной практики.
                </p>
              </div>
              <Button
                onClick={() => (window.location.href = `/textbook?topic=${topicNumber}`)}
                className="bg-gradient-to-r from-yellow-500 to-emerald-500 hover:from-yellow-600 hover:to-emerald-600 text-white font-semibold h-10 flex-shrink-0 px-6"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Открыть учебник
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Skills */}
            <div>
              <h3 className="font-semibold text-[#1a1f36] text-sm mb-2">Навыки:</h3>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Натуральные числа</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Целые числа</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Модуль числа</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Делимость</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">НОД и НОК</span>
              </div>
            </div>

            {/* Learning Goals */}
            <div>
              <h3 className="font-semibold text-[#1a1f36] text-sm mb-2">Цели обучения:</h3>
              <ul className="space-y-1 text-xs text-gray-700">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Понимать разницу между натуральными и целыми числами</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Выполнять операции с целыми числами</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Применять признаки делимости и находить НОД/НОК</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* Single block with tabs */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 text-[#1a1f36] backdrop-blur-sm rounded-lg border border-white/20 shadow-sm"
        >
          <Tabs defaultValue="overview">
            <TabsList className="w-full justify-between rounded-none border-b-0 bg-transparent p-0 h-auto gap-2 px-4 pt-4">
              <TabsTrigger 
                value="overview"
                className="flex-1 rounded-t-lg rounded-b-none border border-b-0 border-gray-200 data-[state=active]:bg-white data-[state=active]:border-gray-300 data-[state=active]:shadow-sm data-[state=inactive]:bg-gray-50/50 data-[state=inactive]:text-gray-600 px-6 py-3 font-medium"
              >
                Обзор
              </TabsTrigger>
              <TabsTrigger 
                value="videos"
                className="flex-1 rounded-t-lg rounded-b-none border border-b-0 border-gray-200 data-[state=active]:bg-white data-[state=active]:border-gray-300 data-[state=active]:shadow-sm data-[state=inactive]:bg-gray-50/50 data-[state=inactive]:text-gray-600 px-6 py-3 font-medium"
              >
                Видео ({topic.videoData?.length || topic.videos || 0})
              </TabsTrigger>
              <TabsTrigger 
                value="practice"
                className="flex-1 rounded-t-lg rounded-b-none border border-b-0 border-gray-200 data-[state=active]:bg-white data-[state=active]:border-gray-300 data-[state=active]:shadow-sm data-[state=inactive]:bg-gray-50/50 data-[state=inactive]:text-gray-600 px-6 py-3 font-medium"
              >
                Упражнения ({exercises.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="m-0 p-6">
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
            </TabsContent>

            <TabsContent value="videos" className="m-0 p-6 space-y-8">
              {(!topic.videoData || topic.videoData.length === 0) ? (
                <div className="text-sm text-gray-600">Видео для темы пока нет</div>
              ) : (
                topic.videoData.map((video, index) => (
                  <div key={video.videoId} className="space-y-4 pb-8 border-b border-gray-200 last:border-0 last:pb-0">
                    {/* Video Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-[#1a1f36] mb-2 flex items-center gap-2">
                          <Play className="h-5 w-5 text-blue-600" />
                          {video.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">{video.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            15:23
                          </span>
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">Новое</span>
                        </div>
                      </div>
                    </div>

                    {/* Video Player and Transcript Grid */}
                    <div className="grid lg:grid-cols-2 gap-6">
                      {/* Video Player */}
                      <div className="bg-gray-100 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                        <iframe
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${video.videoId}`}
                          title={video.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>

                      {/* Transcript */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h4 className="font-semibold text-[#1a1f36] mb-3">Транскрипт:</h4>
                        <div className="text-sm text-gray-700 space-y-3 max-h-[400px] overflow-y-auto">
                          <p>В этом видео мы изучаем основы натуральных и целых чисел.</p>
                          <p>Натуральные числа - это числа, которые используются для счёта предметов. Множество натуральных чисел обозначается как N и включает в себя числа 1, 2, 3, 4 и так далее.</p>
                          <p>Целые числа включают в себя натуральные числа, ноль и отрицательные числа. Множество целых чисел обозначается как Z.</p>
                          <p>Мы рассмотрим основные свойства этих чисел и научимся выполнять с ними различные операции.</p>
                        </div>
                      </div>
                    </div>

                    {/* Video Topics */}
                    <div>
                      <h4 className="font-semibold text-[#1a1f36] mb-3">Темы видео:</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">Определения</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">Множества чисел</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">Сравнение чисел</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="practice" className="m-0 p-6 space-y-4">
              {exercises.map((ex, i) => {
                const itemId = `${moduleSlug}-${topicId}-ex${i}`;
                const status = getProgressStatus(itemId, 'exercise');
                const exerciseWithId = { ...ex, itemId };

                const getStatusBadge = () => {
                  switch (status) {
                    case 'mastered':
                      return { text: 'Освоено', color: 'bg-purple-100 text-purple-700' };
                    case 'proficient':
                      return { text: 'В процессе', color: 'bg-orange-100 text-orange-700' };
                    case 'familiar':
                      return { text: 'Начато', color: 'bg-blue-100 text-blue-700' };
                    case 'attempted':
                      return { text: 'Начато', color: 'bg-blue-100 text-blue-700' };
                    default:
                      return { text: 'Не начато', color: 'bg-gray-100 text-gray-700' };
                  }
                };

                const statusBadge = getStatusBadge();
                const difficultyLabel = ex.isAdvanced ? 'Сложный' : 'Легкий';

                return (
                  <div
                    key={`ex-${i}`}
                    className="relative p-6 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="p-3 bg-purple-100 rounded-lg flex-shrink-0">
                        <Zap className="h-6 w-6 text-purple-600" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold text-[#1a1f36] mb-2">
                          {ex.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Базовые упражнения на закрепление материала темы
                        </p>

                        {/* Metadata badges */}
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>15 минут</span>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md font-medium">
                            {difficultyLabel}
                          </span>
                          <span className={`px-3 py-1 rounded-md font-medium ${statusBadge.color}`}>
                            {statusBadge.text}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Button
                          onClick={() => !ex.skills.length ? null : setSelectedExercise(exerciseWithId)}
                          disabled={!ex.skills.length}
                          className="bg-[#1a1f36] text-white hover:bg-[#2d3748] px-6"
                        >
                          Начать упражнение
                        </Button>
                        <Button
                          variant="outline"
                          className="text-gray-700 border-gray-300 hover:bg-gray-50"
                        >
                          Отметить
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {exercises.length === 0 && (
                <div className="text-sm text-gray-600">Упражнения для темы пока нет</div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </>
  );
};

export default TopicPage;
