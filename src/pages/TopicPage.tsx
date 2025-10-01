// src/pages/TopicPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Play, Target, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ArticleRenderer from "@/components/ArticleRenderer";
import OgeExerciseQuiz from "@/components/OgeExerciseQuiz";
import VideoPlayerWithChat from "@/components/video/VideoPlayerWithChat";
import { modulesRegistry } from "@/lib/modules.registry";
import { supabase } from "@/integrations/supabase/client";

type ArticleRow = {
  topic_number: string;
  title: string;
  content: string; // HTML/markdown you already store
};

const TopicPage: React.FC = () => {
  const { topicNumber } = useParams<{ topicNumber: string }>();
  const navigate = useNavigate();

  const [article, setArticle] = useState<ArticleRow | null>(null);
  const [loadingArticle, setLoadingArticle] = useState(true);

  const [selectedVideo, setSelectedVideo] = useState<{ videoId: string; title: string; description: string } | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<{ title: string; skills: number[]; questionCount?: number } | null>(null);

  // Find the module + topic by topicNumber (e.g., "4.2")
  const moduleEntry = Object.values(modulesRegistry).find(m => m.topicMapping.includes(topicNumber || ""));
  const topicIndex = moduleEntry ? moduleEntry.topicMapping.indexOf(topicNumber || "") : -1;
  const topic = moduleEntry && topicIndex >= 0 ? moduleEntry.topics[topicIndex] : null;

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!topicNumber) return;
      setLoadingArticle(true);
      const { data, error } = await supabase
        .from("topic_articles")
        .select("topic_number,title,content")
        .eq("topic_number", topicNumber)
        .single();

      if (!ignore) {
        if (error) {
          console.error("Failed to load topic article:", error);
          setArticle(null);
        } else {
          setArticle(data as ArticleRow);
        }
        setLoadingArticle(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [topicNumber]);

  if (!moduleEntry || !topic) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate("/learning-platform")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Назад
        </Button>
        <div className="mt-6 text-gray-600">Тема не найдена.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Modals */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
            <VideoPlayerWithChat
              video={selectedVideo}
              onClose={() => setSelectedVideo(null)}
            />
          </div>
        </div>
      )}

      {selectedExercise && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <OgeExerciseQuiz
              title={selectedExercise.title}
              skills={selectedExercise.skills}
              questionCount={selectedExercise.questionCount}
              onBack={() => setSelectedExercise(null)}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Назад
          </Button>
          <div className="text-sm text-gray-500">
            <Link to={`/module/${moduleEntry.slug}`} className="hover:underline">
              {moduleEntry.title}
            </Link>{" "}
            <span className="mx-1">→</span> {topic.title} ({topicNumber})
          </div>
        </div>
      </div>

      {/* Split layout */}
      <div className="container mx-auto px-4 pb-8 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: actions */}
        <motion.aside
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-4 space-y-4"
        >
          {/* Читать учебник — special design on top */}
          <div className="sticky top-4">
            <Button
              onClick={() => (window.location.href = `/textbook?topic=${topicNumber}`)}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg rounded-xl flex items-center justify-center"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Читать учебник ({topicNumber})
            </Button>
          </div>

          {/* Videos */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border p-4">
            <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-3">Видео</h3>
            <div className="space-y-2">
              {Array.from({ length: topic.videos }, (_, i) => (
                <button
                  key={`video-${i}`}
                  className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-blue-50 dark:hover:bg-gray-800 transition"
                  onClick={() => {
                    const vd = topic.videoData?.[i];
                    if (vd) setSelectedVideo(vd);
                  }}
                >
                  <span className="flex items-center gap-2 text-sm">
                    <span className="inline-flex p-2 bg-blue-100 rounded-full">
                      <Play className="w-4 h-4 text-blue-600" />
                    </span>
                    Видео {i + 1}
                  </span>
                  <span className="text-xs text-blue-600">{topic.videoData?.[i] ? "Доступно" : "—"}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Exercises */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border p-4">
            <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-3">Практика</h3>
            <div className="space-y-2">
              {Array.from({ length: topic.exercises }, (_, i) => {
                const ex = moduleEntry.getExerciseData
                  ? moduleEntry.getExerciseData(topic.id, i)
                  : { title: `${topic.title} — упражнение ${i + 1}`, skills: [] };
                return (
                  <button
                    key={`ex-${i}`}
                    className="w-full p-3 rounded-lg border hover:bg-green-50 dark:hover:bg-gray-800 transition text-left"
                    onClick={() => setSelectedExercise(ex)}
                    disabled={ex.skills.length === 0}
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <span className="inline-flex p-2 bg-green-100 rounded-full">
                        <Target className="w-4 h-4 text-green-600" />
                      </span>
                      {ex.title}
                      {ex.isAdvanced && (
                        <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                          * Не в программе ОГЭ
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      Навыки: {ex.skills.join(", ") || "—"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.aside>

        {/* Right: article content (Обзор) */}
        <motion.main
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-8 bg-white dark:bg-gray-900 rounded-xl border p-4 md:p-6 min-h-[60vh]"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              {article?.title || `Обзор: ${topic.title}`}
            </h2>
            {article && (
              <Button variant="ghost" size="sm" onClick={() => setArticle(null)}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {loadingArticle ? (
            <div className="text-sm text-gray-500">Загружаем обзор…</div>
          ) : article ? (
            <ArticleRenderer
              text={article.content}
              article={{ skill: 0, art: article.content }}
            />
          ) : (
            <div className="text-sm text-gray-500">
              Обзор для этой темы пока не добавлен.
            </div>
          )}
        </motion.main>
      </div>
    </div>
  );
};

export default TopicPage;
