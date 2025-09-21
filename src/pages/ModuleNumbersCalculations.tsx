import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopicContent {
  id: string;
  title: string;
  videos: number;
  articles: number;
  exercises: number;
}

interface QuizContent {
  id: string;
  title: string;
  description: string;
}

const ModuleNumbersCalculations = () => {
  const topics: TopicContent[] = [
    {
      id: "natural-integers",
      title: "Натуральные и целые числа",
      videos: 2,
      articles: 1,
      exercises: 2
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
      title: "Quiz 1",
      description: "Level up on the above skills and collect up to 400 Mastery points"
    },
    {
      id: "quiz-2", 
      title: "Quiz 2",
      description: "Level up on the above skills and collect up to 400 Mastery points"
    }
  ];

  const renderTopicItem = (topic: TopicContent, index: number) => (
    <motion.div
      key={topic.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-border py-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-foreground mb-2">{topic.title}</h3>
          
          {/* Videos */}
          {Array.from({ length: topic.videos }, (_, i) => (
            <div key={`video-${i}`} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Play className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Video {i + 1}</span>
              </div>
              <span className="text-sm text-muted-foreground">Not started</span>
            </div>
          ))}
          
          {/* Article */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Article</span>
            </div>
            <span className="text-sm text-muted-foreground">Not started</span>
          </div>

          {/* Exercises */}
          {Array.from({ length: topic.exercises }, (_, i) => (
            <div key={`exercise-${i}`} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-foreground">{topic.title} (intro)</span>
                <span className="text-xs text-muted-foreground">Get 3 of 4 questions to level up!</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">Practice</Button>
                <span className="text-sm text-muted-foreground">Not started</span>
              </div>
            </div>
          ))}
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
      className="border-b border-border py-6 bg-muted/30"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2">{quiz.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{quiz.description}</p>
          <Button variant="outline">Start quiz</Button>
        </div>
        <div className="ml-8">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <div className="w-16 h-20 bg-primary/20 rounded-lg"></div>
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-6"
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
            <h1 className="text-2xl font-bold text-foreground">
              Числа и вычисления
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Модуль 1 • 5 тем • 10 видео • 5 статей • 12 упражнений
            </p>
          </div>
        </motion.div>

        {/* Content List */}
        <div className="max-w-4xl">
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