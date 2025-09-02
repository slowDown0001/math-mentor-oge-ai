import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Play, ArrowLeft, LogOut, Trash2 } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Course {
  id: string;
  name: string;
}

const availableCoursesData: Course[] = [
  { id: 'oge-math', name: 'ОГЭ математика' },
  { id: 'ege-basic', name: 'ЕГЭ базовая математика' },
  { id: 'ege-advanced', name: 'ЕГЭ профильная математика' },
];

const courseIdToNumber: Record<string, number> = {
  'oge-math': 1,
  'ege-basic': 2,
  'ege-advanced': 3,
};

const MyDashboard = () => {
  const { getDisplayName } = useProfile();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadUserCourses();
    }
  }, [user]);

  const loadUserCourses = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('courses')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user courses:', error);
        return;
      }

      const userCourseNumbers = profile?.courses || [];
      const userCourses: Course[] = [];
      const available: Course[] = [];

      availableCoursesData.forEach(course => {
        const courseNumber = courseIdToNumber[course.id];
        if (userCourseNumbers.includes(courseNumber)) {
          userCourses.push(course);
        } else {
          available.push(course);
        }
      });

      setMyCourses(userCourses);
      setAvailableCourses(available);
    } catch (error) {
      console.error('Error loading user courses:', error);
      setAvailableCourses(availableCoursesData);
    }
  };

  const updateUserCourses = async (courseNumbers: number[]) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          user_id: user.id, 
          courses: courseNumbers 
        });

      if (error) {
        console.error('Error updating user courses:', error);
      }
    } catch (error) {
      console.error('Error updating user courses:', error);
    }
  };

  const handleAddCourse = async (course: Course) => {
    const courseNumber = courseIdToNumber[course.id];
    
    // Update database
    const currentCourseNumbers = myCourses.map(c => courseIdToNumber[c.id]);
    const newCourseNumbers = [...currentCourseNumbers, courseNumber];
    await updateUserCourses(newCourseNumbers);

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

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleBackToMain = () => {
    navigate('/');
  };

  const handleDeleteMode = async () => {
    if (isDeleteMode) {
      // Execute deletion
      if (selectedCourses.length > 0) {
        const coursesToRemove = myCourses.filter(course => selectedCourses.includes(course.id));
        
        // Update database - remove selected courses
        const remainingCourses = myCourses.filter(course => !selectedCourses.includes(course.id));
        const remainingCourseNumbers = remainingCourses.map(c => courseIdToNumber[c.id]);
        await updateUserCourses(remainingCourseNumbers);
        
        // Reload courses from database to ensure consistency
        await loadUserCourses();
      }
      
      setIsDeleteMode(false);
      setSelectedCourses([]);
    } else {
      setIsDeleteMode(true);
      setSelectedCourses([]);
    }
  };

  const handleCourseSelection = (courseId: string, checked: boolean) => {
    if (checked) {
      setSelectedCourses(prev => [...prev, courseId]);
    } else {
      setSelectedCourses(prev => prev.filter(id => id !== courseId));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/20 p-6">
      {/* Navigation Buttons */}
      <div className="fixed top-6 left-6 right-6 flex justify-between z-10">
        <Button
          onClick={handleBackToMain}
          className="bg-gradient-to-r from-yellow-200 to-yellow-300 hover:from-yellow-300 hover:to-yellow-400 text-black shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        
        <Button
          onClick={handleLogout}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Выйти
        </Button>
      </div>

      <div className="max-w-7xl mx-auto pt-16">
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
            {/* Delete Button - Only show if there are courses */}
            {myCourses.length > 0 && (
              <div className="flex justify-end">
                <Button
                  onClick={handleDeleteMode}
                  size="sm"
                  variant={isDeleteMode && selectedCourses.length > 0 ? "destructive" : "outline"}
                  className={`shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 ${
                    isDeleteMode 
                      ? selectedCourses.length > 0 
                        ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white" 
                        : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                      : "bg-gradient-to-r from-red-200 to-red-300 hover:from-red-300 hover:to-red-400 text-black"
                  }`}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  {isDeleteMode ? (selectedCourses.length > 0 ? `Удалить (${selectedCourses.length})` : 'Отмена') : 'Удалить'}
                </Button>
              </div>
            )}
            
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
                      <div className="flex items-center gap-3">
                        {isDeleteMode && (
                          <Checkbox
                            checked={selectedCourses.includes(course.id)}
                            onCheckedChange={(checked) => handleCourseSelection(course.id, checked as boolean)}
                            className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                          />
                        )}
                        <span className="font-medium text-foreground">
                          {course.name}
                        </span>
                      </div>
                      
                      {!isDeleteMode && (
                        <Button
                          onClick={() => handleStartCourse(course.id)}
                          size="sm"
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Начать
                        </Button>
                      )}
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