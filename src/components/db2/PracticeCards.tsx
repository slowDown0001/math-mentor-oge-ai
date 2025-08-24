import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Database, ArrowRight, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { createPracticeSession } from "@/services/progressApi";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const PracticeCards = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStartMCQPractice = async () => {
    if (!user) {
      toast.error("Необходимо войти в систему");
      return;
    }

    try {
      // Create practice session for completed topics
      await createPracticeSession(user.id, ['1.1', '1.2']);
      
      // Navigate to MCQ practice with specific topics
      navigate('/mcq-practice?topics=1.1,1.2');
    } catch (error) {
      toast.error("Ошибка при создании сессии");
      console.error('Error starting MCQ practice:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* MCQ Practice Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 hover:border-blue-300 transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Brain className="w-5 h-5" />
              MCQ: Проверка знаний
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Сегодня потренируем <strong>1.1</strong> и <strong>1.2</strong> — это темы, которые ты уже прошёл(ла).
            </p>
            
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                1.1 Натуральные числа
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                1.2 Дроби
              </Badge>
            </div>
            
            <Button 
              onClick={handleStartMCQPractice}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              Начать тренировку
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <p className="text-xs text-muted-foreground italic">
              Алгоритм выбирает задачи по пройденным темам, чтобы найти слабые места.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* FIPI Bank Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:border-green-300 transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Database className="w-5 h-5" />
              Практика ФИПИ
              <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                Новое
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Задачи из банка ФИПИ по актуальным темам. Фильтры по разделам.
            </p>
            
            <div className="text-xs text-green-600 bg-green-100 p-2 rounded">
              💡 Банк содержит официальные задания из экзаменационных материалов
            </div>
            
            <Button 
              asChild
              variant="outline" 
              className="w-full border-green-500 text-green-700 hover:bg-green-50"
            >
              <Link to="/fipi-bank">
                Открыть банк ФИПИ
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PracticeCards;