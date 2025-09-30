import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, BookOpen, Target, Crown, Zap, Star, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import VideoPlayerWithChat from "@/components/video/VideoPlayerWithChat";
import ArticleRenderer from "@/components/ArticleRenderer";
import OgeExerciseQuiz from "@/components/OgeExerciseQuiz";
import { StreakDisplay } from "@/components/streak/StreakDisplay";
import { useModuleProgress } from "@/hooks/useModuleProgress";
import { ProgressButton } from "@/components/ProgressButton";

interface TopicContent {
  id: string;
  title: string;
  videos: number;
  articles: number;
  exercises: number;
  videoData?: Array<{
    videoId: string;
    title: string;
    description: string;
  }>;
}

interface QuizContent {
  id: string;
  title: string;
  description: string;
}

const ModuleNumbersCalculations = () => {
  const navigate = useNavigate();
  const { getProgressStatus, refetch } = useModuleProgress();
  const [selectedVideo, setSelectedVideo] = useState<{videoId: string; title: string; description: string} | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<{title: string; content: string} | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<{
    title: string; 
    skills: number[]; 
    questionCount?: number; 
    isAdvanced?: boolean;
    isModuleTest?: boolean;
    moduleTopics?: string[];
    courseId?: string;
  } | null>(null);
  
  const topics: TopicContent[] = [
    {
      id: "natural-integers",
      title: "Натуральные и целые числа",
      videos: 2,
      articles: 1,
      exercises: 2,
      videoData: [
        {
          videoId: "WxXZaP8Y8pI",
          title: "Натуральные и целые числа - Видео 1",
          description: "Изучение основ натуральных и целых чисел"
        },
        {
          videoId: "fjdeo6anRY4",
          title: "Натуральные и целые числа - Видео 2", 
          description: "Продолжение изучения натуральных и целых чисел"
        }
      ]
    },
    {
      id: "fractions-percentages",
      title: "Дроби и проценты",
      videos: 2,
      articles: 1,
      exercises: 3
    },
    {
      id: "rational-numbers",
      title: "Рациональные числа и арифметические действия",
      videos: 4,
      articles: 1,
      exercises: 3
    },
    {
      id: "real-numbers",
      title: "Действительные числа",
      videos: 1,
      articles: 1,
      exercises: 2
    },
    {
      id: "approximations",
      title: "Приближённые вычисления",
      videos: 1,
      articles: 1,
      exercises: 2
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
  const topicMapping = ['1.1', '1.2', '1.3', '1.4', '1.5'];

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
              onClick={() => {
                if (topic.id === "natural-integers") {
                  setSelectedArticle({
                    title: "Натуральные и целые числа — конспект",
                    content: `<h1>Натуральные и целые числа — конспект</h1>

<div class="intro">
  <p>Краткий конспект по ключевым определениям и формулам: натуральные и целые числа, научная форма, делимость, признаки делимости, НОД и НОК.</p>
</div>

<div class="section-badge badge-theory">Теория</div>
<div class="theory">

  <p><b>Определения</b></p>
  <div class="definition-card">
    Натуральные числа: множество \\( \\mathbb{N} = \\{1,2,3,\\dots\\} \\).<br>
    Целые числа: множество \\( \\mathbb{Z} = \\{\\dots,-2,-1,0,1,2,\\dots\\} \\).<br>
    Модуль числа: \\( |a| = \\begin{cases} a, & a \\ge 0 \\\\ -a, & a < 0 \\end{cases} \\).<br>
    Порядок: для \\( a,b \\in \\mathbb{Z} \\) верно одно из: \\( a<b \\), \\( a=b \\), \\( a>b \\).
  </div>

  <p><b>Мини-глоссарий</b></p>
  <ul class="mini-glossary">
    <li><b>Чётность:</b> \\(a\\) чётное, если \\(2\\mid a\\); нечётное — иначе.</li>
    <li><b>Делимость:</b> \\(b\\mid a \\iff \\exists k\\in\\mathbb{Z}: a=b\\cdot k\\).</li>
    <li><b>Кратное:</b> число вида \\(a=b\\cdot k\\).</li>
  </ul>

  <p><b>Ключевые свойства операций в \\( \\mathbb{Z} \\)</b></p>
  <ul>
    <li>Замкнутость: \\( a\\pm b,\\, a\\cdot b \\in \\mathbb{Z} \\).</li>
    <li>Коммутативность и ассоциативность для \\( + \\) и \\( \\cdot \\); дистрибутивность: \\( a(b+c)=ab+ac \\).</li>
    <li>Правила знаков: \\( (+)\\cdot(+)=+,\\; (+)\\cdot(-)=-,\\; (-)\\cdot(-)=+ \\).</li>
  </ul>

  <div class="section-badge badge-theory">Научная форма числа</div>
  <div class="definition-card">
    Число в научной форме: \\( a\\times 10^{b} \\), где \\( 1\\le a<10 \\) и \\( b\\in\\mathbb{Z} \\).<br>
    Сложение/вычитание через приведение показателей; умножение и деление:<br>
    \\[
      (a_1\\cdot 10^{b_1})(a_2\\cdot 10^{b_2})=(a_1a_2)\\cdot 10^{\\,b_1+b_2},
      \\qquad
      \\frac{a_1\\cdot 10^{b_1}}{a_2\\cdot 10^{b_2}}=\\Big(\\frac{a_1}{a_2}\\Big)\\cdot 10^{\\,b_1-b_2}.
    \\]
  </div>

  <div class="section-badge badge-theory">Делимость</div>
  <div class="definition-card">
    Основное определение: \\( b\\mid a \\iff \\exists k\\in\\mathbb{Z}: a=bk \\).<br>
    Базовые свойства:<br>
    \\(\\;\\)• Транзитивность: \\( b\\mid a \\) и \\( a\\mid c \\Rightarrow b\\mid c \\).<br>
    \\(\\;\\)• Линейная комбинация: если \\( d\\mid a \\) и \\( d\\mid b \\), то \\( d\\mid (ax+by) \\) для любых \\( x,y\\in\\mathbb{Z} \\).<br>
    \\(\\;\\)• Если \\( b\\mid a \\), то \\( b\\mid ac \\) для любого \\( c\\in\\mathbb{Z} \\).
  </div>

  <p><b>Признаки делимости</b></p>
  <ul>
    <li>На \\(2\\): последняя цифра чётная \\((0,2,4,6,8)\\).</li>
    <li>На \\(3\\): сумма цифр кратна \\(3\\).</li>
    <li>На \\(5\\): последняя цифра \\(0\\) или \\(5\\).</li>
    <li>На \\(9\\): сумма цифр кратна \\(9\\).</li>
    <li>На \\(10\\): последняя цифра \\(0\\).</li>
  </ul>

  <div class="section-badge badge-theory">НОД и НОК</div>
  <div class="definition-card">
    НОД \\( (a,b) \\) — наибольшее \\( d\\in\\mathbb{Z}_{\\ge 0} \\), такое что \\( d\\mid a \\) и \\( d\\mid b \\).<br>
    НОК \\( [a,b] \\) — наименьшее положительное число, кратное и \\( a \\), и \\( b \\).<br>
    Связь: \\[
      \\gcd(a,b)\\cdot \\operatorname{lcm}(a,b)=|a\\cdot b|.
    \\]
    Разложение по простым: если \\( a=\\prod p_i^{\\alpha_i},\\; b=\\prod p_i^{\\beta_i} \\), то
    \\[
      \\gcd(a,b)=\\prod p_i^{\\min(\\alpha_i,\\beta_i)},\\qquad
      \\operatorname{lcm}(a,b)=\\prod p_i^{\\max(\\alpha_i,\\beta_i)}.
    \\]
    Евклидов алгоритм: \\( \\gcd(a,b)=\\gcd(b,\\,a\\bmod b) \\) до нулевого остатка.
  </div>

</div>

<div class="section-badge badge-conclusion">Заключение</div>
<div class="conclusion">
  <p>
    Целые числа образуют основу для изучения арифметики и алгебры. Понимание структуры множества \\(\\mathbb{Z}\\), 
    принципов делимости и методов нахождения НОД/НОК критически важно для решения задач во всех разделах математики.
  </p>
  <p>
    Практическое применение этих знаний включает решение диофантовых уравнений, работу с дробями, анализ 
    периодичности функций и многие другие задачи математики и её приложений.
  </p>
</div>`
                  });
                }
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Обзор</span>
              </div>
              <span className="text-sm text-purple-600 dark:text-purple-400">
                {topic.id === "natural-integers" ? "Доступно" : "Не начато"}
              </span>
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
            {Array.from({ length: topic.exercises }, (_, i) => {
              const getExerciseData = (topicId: string, exerciseIndex: number) => {
                if (topicId === "natural-integers") {
                  return exerciseIndex === 0 
                    ? { title: "Основы натуральных и целых чисел", skills: [1, 2, 3] }
                    : { title: "Работа с числами", skills: [4, 5] };
                }
                
                if (topicId === "fractions-percentages") {
                  if (exerciseIndex === 0) return { title: "Дроби", skills: [6, 195] };
                  if (exerciseIndex === 1) return { title: "Проценты", skills: [7, 8, 9] };
                  if (exerciseIndex === 2) return { title: "Сложные дроби", skills: [10], isAdvanced: true };
                }
                
                if (topicId === "rational-numbers") {
                  if (exerciseIndex === 0) return { title: "Рациональные числа", skills: [11, 12, 13] };
                  if (exerciseIndex === 1) return { title: "Арифметические действия", skills: [14, 15, 16] };
                  if (exerciseIndex === 2) return { title: "Операции с рациональными числами", skills: [17, 180] };
                }
                
                if (topicId === "real-numbers") {
                  if (exerciseIndex === 0) return { title: "Действительные числа", skills: [18, 19] };
                  if (exerciseIndex === 1) return { title: "Операции с действительными числами", skills: [20, 197] };
                }
                
                if (topicId === "approximations") {
                  if (exerciseIndex === 0) return { title: "Приближённые вычисления", skills: [21, 22] };
                  if (exerciseIndex === 1) return { title: "Округление", skills: [23] };
                }
                
                return { title: `${topic.title} (упражнение ${i + 1})`, skills: [] };
              };

              const exerciseData = getExerciseData(topic.id, i);
              
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
      transition={{ delay: (topics.length + index) * 0.05 }}
      className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg p-6 mb-6 border border-amber-200/50 dark:border-amber-800/50"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">{quiz.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{quiz.description}</p>
          <Button 
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
            onClick={() => {
              if (quiz.id === "quiz-1") {
                setSelectedExercise({ title: "Тест 1: Дроби и проценты", skills: [1, 2, 3, 4, 5, 6, 7, 8, 9, 195], questionCount: 6 });
              } else if (quiz.id === "quiz-2") {
                setSelectedExercise({ title: "Тест 2: Рациональные и действительные числа", skills: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 180, 197], questionCount: 6 });
              } else if (quiz.id === "module-test") {
                setSelectedExercise({ 
                  title: "Итоговый тест модуля", 
                  skills: [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 180, 195, 197], 
                  questionCount: 10,
                  isModuleTest: true,
                  moduleTopics: ["1.1", "1.2", "1.3", "1.4", "1.5"],
                  courseId: "1"
                });
              }
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

  // Create ordered content: topics with quizzes inserted at correct positions
  const orderedContent = [];
  
  // Add first topic
  orderedContent.push({ type: 'topic', content: topics[0], index: 0 });
  
  // Add second topic
  orderedContent.push({ type: 'topic', content: topics[1], index: 1 });
  
  // Add first quiz after "Дроби и проценты"
  orderedContent.push({ type: 'quiz', content: quizzes[0], index: 0 });
  
  // Add third topic
  orderedContent.push({ type: 'topic', content: topics[2], index: 2 });
  
  // Add fourth topic
  orderedContent.push({ type: 'topic', content: topics[3], index: 3 });
  
  // Add second quiz after "Действительные числа"
  orderedContent.push({ type: 'quiz', content: quizzes[1], index: 1 });
  
  // Add fifth topic
  orderedContent.push({ type: 'topic', content: topics[4], index: 4 });
  
  // Add final module test
  orderedContent.push({ type: 'quiz', content: { id: 'module-test', title: 'Итоговый тест модуля', description: 'Проверьте свои знания по всему модулю "Числа и вычисления"' }, index: 2 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 relative overflow-hidden">
      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayerWithChat 
          video={selectedVideo} 
          onClose={() => setSelectedVideo(null)} 
        />
      )}

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedArticle.title}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedArticle(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
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
      )}

      {/* Exercise Quiz Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <OgeExerciseQuiz
              title={selectedExercise.title}
              skills={selectedExercise.skills}
              questionCount={selectedExercise.questionCount}
              isModuleTest={selectedExercise.isModuleTest}
              moduleTopics={selectedExercise.moduleTopics}
              courseId={selectedExercise.courseId}
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
              Модуль 1: Числа и вычисления
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              5 тем • 10 видео • 5 статей • 12 упражнений
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
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">1,200 возможных баллов мастерства</span>
            <Info className="h-4 w-4 text-gray-500" />
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Навыки: Арифметика, Базовые операции, Числовые системы, Вычисления, Округление
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
              <div className="w-4 h-4 bg-gradient-to-t from-orange-500 from-33% to-gray-200 to-33% rounded"></div>
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
            {/* Topic 1: Натуральные и целые числа (2 exercises) */}
            <ProgressButton
              type="exercise"
              status={getProgressStatus("exercise-1-2-3", "exercise")}
              title="Основы натуральных и целых чисел"
              questionCount={4}
              onClick={() => setSelectedExercise({ title: "Основы натуральных и целых чисел", skills: [1, 2, 3] })}
            />
            <ProgressButton
              type="exercise"
              status={getProgressStatus("exercise-4-5", "exercise")}
              title="Работа с числами"
              questionCount={4}
              onClick={() => setSelectedExercise({ title: "Работа с числами", skills: [4, 5] })}
            />
            
            {/* Topic 2: Дроби и проценты (3 exercises) */}
            <ProgressButton
              type="exercise"
              status={getProgressStatus("exercise-6-195", "exercise")}
              title="Дроби"
              questionCount={4}
              onClick={() => setSelectedExercise({ title: "Дроби", skills: [6, 195] })}
            />
            <ProgressButton
              type="exercise"
              status={getProgressStatus("exercise-7-8-9", "exercise")}
              title="Проценты"
              questionCount={4}
              onClick={() => setSelectedExercise({ title: "Проценты", skills: [7, 8, 9] })}
            />
            <ProgressButton
              type="exercise"
              status={getProgressStatus("exercise-10", "exercise")}
              title="Сложные дроби"
              questionCount={4}
              onClick={() => setSelectedExercise({ title: "Сложные дроби", skills: [10], isAdvanced: true })}
              isAdvanced={true}
            />
            
            {/* Quiz 1 */}
            <ProgressButton
              type="test"
              status={getProgressStatus("test-1", "test")}
              title="Тест 1: Дроби и проценты"
              questionCount={6}
              onClick={() => setSelectedExercise({ title: "Тест 1: Дроби и проценты", skills: [1, 2, 3, 4, 5, 6, 7, 8, 9, 195], questionCount: 6 })}
            />
            
            {/* Topic 3: Рациональные числа и арифметические действия (3 exercises) */}
            <ProgressButton
              type="exercise"
              status={getProgressStatus("exercise-11-12-13", "exercise")}
              title="Рациональные числа"
              questionCount={4}
              onClick={() => setSelectedExercise({ title: "Рациональные числа", skills: [11, 12, 13] })}
            />
            <ProgressButton
              type="exercise"
              status={getProgressStatus("exercise-14-15-16", "exercise")}
              title="Арифметические действия"
              questionCount={4}
              onClick={() => setSelectedExercise({ title: "Арифметические действия", skills: [14, 15, 16] })}
            />
            <ProgressButton
              type="exercise"
              status={getProgressStatus("exercise-17-180", "exercise")}
              title="Операции с рациональными числами"
              questionCount={4}
              onClick={() => setSelectedExercise({ title: "Операции с рациональными числами", skills: [17, 180] })}
            />
            
            {/* Topic 4: Действительные числа (2 exercises) */}
            <ProgressButton
              type="exercise"
              status={getProgressStatus("exercise-18-19", "exercise")}
              title="Действительные числа"
              questionCount={4}
              onClick={() => setSelectedExercise({ title: "Действительные числа", skills: [18, 19] })}
            />
            <ProgressButton
              type="exercise"
              status={getProgressStatus("exercise-20-197", "exercise")}
              title="Операции с действительными числами"
              questionCount={4}
              onClick={() => setSelectedExercise({ title: "Операции с действительными числами", skills: [20, 197] })}
            />
            
            {/* Quiz 2 */}
            <ProgressButton
              type="test"
              status={getProgressStatus("test-2", "test")}
              title="Тест 2: Рациональные и действительные числа"
              questionCount={6}
              onClick={() => setSelectedExercise({ title: "Тест 2: Рациональные и действительные числа", skills: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 180, 197], questionCount: 6 })}
            />
            
            {/* Topic 5: Приближённые вычисления (2 exercises) */}
            <ProgressButton
              type="exercise"
              status={getProgressStatus("exercise-21-22", "exercise")}
              title="Приближённые вычисления"
              questionCount={4}
              onClick={() => setSelectedExercise({ title: "Приближённые вычисления", skills: [21, 22] })}
            />
            <ProgressButton
              type="exercise"
              status={getProgressStatus("exercise-23", "exercise")}
              title="Округление"
              questionCount={4}
              onClick={() => setSelectedExercise({ title: "Округление", skills: [23] })}
            />
            
            {/* Final module test */}
            <ProgressButton
              type="exam"
              status={getProgressStatus("exam-module", "exam")}
              title="Итоговый тест модуля"
              questionCount={10}
              onClick={() => setSelectedExercise({ 
                title: "Итоговый тест модуля", 
                skills: [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 180, 195, 197], 
                questionCount: 10,
                isModuleTest: true,
                moduleTopics: ["1.1", "1.2", "1.3", "1.4", "1.5"],
                courseId: "1"
              })}
            />
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

export default ModuleNumbersCalculations;