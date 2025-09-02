import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Play } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';

interface Course {
  id: string;
  name: string;
}

const availableCoursesData: Course[] = [
  { id: 'oge-math', name: 'ОГЭ математика' },
  { id: 'ege-basic', name: 'ЕГЭ базовая математика' },
  { id: 'ege-advanced', name: 'ЕГЭ профильная математика' },
];

const MyDashboard = () => {
  const { getDisplayName } = useProfile();
  const { user } = useAuth();
  const [availableCourses, setAvailableCourses] = useState<Course[]>(availableCoursesData);
  const [myCourses, setMyCourses] = useState<Course[]>([]);

  const handleAddCourse = (course: Course) => {
    // Remove from available courses
    setAvailableCourses(prev => prev.filter(c => c.id !== course.id));
    
    // Add to my courses with delay for animation
    setTimeout(() => {
      setMyCourses(prev => [...prev, course]);
    }, 300);
  };

  const handleStartCourse = (courseId: string) => {
    console.log('Starting course:', courseId);
    // Navigation logic will be added later
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/20 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8 text-center">
          Дашборд
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: User Data */}
          <div className="space-y-4">
            <Card className="backdrop-blur-xl bg-card/40 border-border/20 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-foreground">
                  Мои данные
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Имя
                  </label>
                  <p className="text-foreground font-medium">
                    {getDisplayName()}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p className="text-foreground font-medium">
                    {user?.email || 'Не указан'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Column: Available Courses */}
          <div className="space-y-4">
            <Card className="backdrop-blur-xl bg-card/40 border-border/20 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-foreground">
                  Доступные курсы
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {availableCourses.map((course) => (
                    <motion.div
                      key={course.id}
                      layout
                      initial={{ opacity: 1, scale: 1 }}
                      exit={{ 
                        opacity: 0, 
                        scale: 0.8, 
                        filter: "blur(6px)",
                        transition: { duration: 0.4, ease: "easeInOut" }
                      }}
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border/30 hover:bg-secondary/70 transition-all duration-200"
                    >
                      <span className="font-medium text-foreground">
                        {course.name}
                      </span>
                      <Button
                        onClick={() => handleAddCourse(course)}
                        size="sm"
                        className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Добавить
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {availableCourses.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Все курсы добавлены
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: My Courses */}
          <div className="space-y-4">
            <Card className="backdrop-blur-xl bg-card/40 border-border/20 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-foreground">
                  Мои курсы
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {myCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      layout
                      initial={{ 
                        opacity: 0, 
                        y: 20, 
                        scale: 0.9 
                      }}
                      animate={{ 
                        opacity: 1, 
                        y: 0, 
                        scale: 1,
                        transition: { 
                          duration: 0.5, 
                          ease: "easeOut",
                          delay: index * 0.1
                        }
                      }}
                      className="flex items-center justify-between p-4 rounded-xl bg-accent/30 border border-border/30 hover:bg-accent/40 transition-all duration-200"
                    >
                      <span className="font-medium text-foreground">
                        {course.name}
                      </span>
                      <Button
                        onClick={() => handleStartCourse(course.id)}
                        size="sm"
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Начать
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {myCourses.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Нет добавленных курсов
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyDashboard;