import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Flame, Award, Star, Trophy, Target } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { motion } from "framer-motion";

interface StudentBarProps {
  overallProgress: number;
  streakWeeks: number;
  level: number;
}

const StudentBar = ({ overallProgress, streakWeeks = 3, level = 5 }: StudentBarProps) => {
  const { getDisplayName } = useProfile();
  const displayName = getDisplayName();

  const badges = [
    { icon: Star, color: "text-yellow-500", title: "Первые шаги" },
    { icon: Trophy, color: "text-blue-500", title: "Решатель" },
    { icon: Target, color: "text-green-500", title: "Меткий стрелок" },
    { icon: Award, color: "text-purple-500", title: "Знаток" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-gradient-to-r from-primary/5 via-background to-secondary/5 border-2">
        <div className="flex items-center justify-between">
          {/* Left side - Avatar and profile */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-2xl">
              🦔
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
              <div className="flex gap-3 text-sm">
                <Button variant="link" className="h-auto p-0 text-muted-foreground">
                  Выбрать ник
                </Button>
                <Button variant="link" className="h-auto p-0 text-muted-foreground">
                  Добавить био
                </Button>
                <Button variant="link" className="h-auto p-0 text-muted-foreground">
                  Редактировать профиль
                </Button>
              </div>
            </div>
          </div>

          {/* Right side - Stats and achievements */}
          <div className="flex items-center gap-6">
            {/* Streak */}
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">{streakWeeks}</div>
                <div className="text-xs text-muted-foreground">недельная серия</div>
              </div>
            </div>

            {/* Level */}
            <div className="min-w-32">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Уровень {level}</span>
                <span className="text-foreground font-medium">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>

            {/* Badges */}
            <div className="flex gap-2">
              {badges.map((badge, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-8 h-8 rounded-full bg-background border-2 border-border flex items-center justify-center ${badge.color}`}
                  title={badge.title}
                >
                  <badge.icon className="w-4 h-4" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Motivational text */}
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Начинай прокачку и собирай серию!
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

export default StudentBar;