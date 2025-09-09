import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, TrendingUp, Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface ExamProgressProps {
  currentProgress: number;
}

const ExamProgress = ({ currentProgress }: ExamProgressProps) => {
  const navigate = useNavigate();
  const [studyHoursPerWeek, setStudyHoursPerWeek] = useState([10]);
  
  // Calculate days until May 27, 2026
  const examDate = new Date(2026, 4, 27); // May is month 4 (0-indexed)
  const today = new Date();
  const daysUntilExam = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const weeksUntilExam = Math.ceil(daysUntilExam / 7);
  
  // Calculate estimated progress based on study hours
  const baseProgressPerWeek = 0.8; // Base progress per week with minimal study
  const bonusProgressPerHour = 0.15; // Additional progress per hour of study
  const weeklyProgress = baseProgressPerWeek + (studyHoursPerWeek[0] * bonusProgressPerHour);
  const estimatedProgress = Math.min(100, currentProgress + (weeklyProgress * weeksUntilExam));
  
  // Calculate predicted grade (super positive!)
  const getPredictedGrade = (progress: number, hours: number) => {
    let baseGrade = Math.max(3, Math.floor((progress / 100) * 5) + 1);
    const hoursBonus = Math.floor(hours / 5); // Bonus for every 5 hours
    const finalGrade = Math.min(5, baseGrade + hoursBonus);
    
    const gradeMessages = {
      3: "Уверенная тройка! 🎯",
      4: "Отличная четвёрка! ⭐",
      5: "Блестящая пятёрка! 🏆"
    };
    
    return {
      grade: finalGrade,
      message: gradeMessages[finalGrade as keyof typeof gradeMessages] || "Великолепный результат! 🌟"
    };
  };
  
  const predictedResult = getPredictedGrade(estimatedProgress, studyHoursPerWeek[0]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">Подготовка к ОГЭ</h3>
            </div>
            <p className="text-2xl font-bold text-primary">
              {daysUntilExam} дней до экзамена
            </p>
            <p className="text-sm text-muted-foreground">
              27 мая 2026 года
            </p>
          </div>

          {/* Progress Bars */}
          <div className="space-y-4">
            {/* Current Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">Текущий прогресс</span>
                <span className="text-sm font-bold text-primary">{currentProgress}%</span>
              </div>
              <Progress value={currentProgress} className="h-3" />
            </div>

            {/* Estimated Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-foreground">Прогноз на экзамен</span>
                </div>
                <span className="text-sm font-bold text-green-600">{Math.round(estimatedProgress)}%</span>
              </div>
              <Progress 
                value={estimatedProgress} 
                className="h-3"
              />
            </div>
          </div>

          {/* Study Hours Slider */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Часов учёбы в неделю</span>
            </div>
            <div className="px-2">
              <Slider
                value={studyHoursPerWeek}
                onValueChange={setStudyHoursPerWeek}
                max={40}
                min={3}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>3</span>
                <span className="font-bold text-lg text-primary">{studyHoursPerWeek[0]} часов</span>
                <span>40</span>
              </div>
            </div>
          </div>

          {/* Predicted Grade */}
          <motion.div
            key={predictedResult.grade}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Прогнозируемая оценка
              </span>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {predictedResult.grade}
              </div>
              <div className="text-sm font-medium text-green-700 dark:text-green-300">
                {predictedResult.message}
              </div>
            </div>
          </motion.div>

          {/* Motivational message */}
          <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-primary font-medium">
              {studyHoursPerWeek[0] >= 15 
                ? "🚀 Ты на пути к блестящему результату!" 
                : studyHoursPerWeek[0] >= 8
                ? "💪 Отличный темп! Продолжай в том же духе!"
                : "🌱 Каждый час учёбы приближает тебя к успеху!"}
            </p>
          </div>

          {/* Progress Button */}
          <Button
            onClick={() => navigate('/ogemath-progress')}
            className="w-full bg-yellow-100 hover:bg-yellow-200 text-black font-medium py-3 rounded-lg transition-colors"
          >
            Прогресс по темам и типам задач
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default ExamProgress;