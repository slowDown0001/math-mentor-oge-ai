import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Plus, Play, ArrowLeft, LogOut, Trash2, ChevronDown } from 'lucide-react';
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

const courseContent: Record<string, string> = {
  'oge-math': 'Банк задач **3500 ФИПИ**, **2000** задач для закрытия гэпов, **7000** аналогичных ФИПИ задач.',
  'ege-basic': 'Банк задач **9000 ФИПИ**, **2000** задач для закрытия гэпов, **10000** аналогичных ФИПИ задач.',
  'ege-advanced': 'Банк задач **900 ФИПИ**, **2000** задач для закрытия гэпов, **3000** аналогичных ФИПИ задач.',
};

const MyDashboard = () => {
  const { getDisplayName } = useProfile();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [expandedDropdowns, setExpandedDropdowns] = useState<Set<string>>(new Set());
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [showEgeBasicGoal, setShowEgeBasicGoal] = useState(false);
  const [showEgeAdvancedGoal, setShowEgeAdvancedGoal] = useState(false);
  const [goalText, setGoalText] = useState('');
  const [egeBasicGoalText, setEgeBasicGoalText] = useState('');
  const [egeAdvancedGoalText, setEgeAdvancedGoalText] = useState('');

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
        .update({ courses: courseNumbers })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating user courses:', error);
      }
    } catch (error) {
      console.error('Error updating user courses:', error);
    }
  };

  const handleAddCourse = async (course: Course) => {
    // First add the course with existing logic
    await addCourseInternal(course);
    
    // Then show goal input for specific courses
    if (course.id === 'oge-math') {
      setShowGoalInput(true);
    } else if (course.id === 'ege-basic') {
      setShowEgeBasicGoal(true);
    } else if (course.id === 'ege-advanced') {
      setShowEgeAdvancedGoal(true);
    }
  };

  const addCourseInternal = async (course: Course) => {
    const courseNumber = courseIdToNumber[course.id];
    
    // Update database
    const currentCourseNumbers = myCourses.map(c => courseIdToNumber[c.id]);
    const newCourseNumbers = [...currentCourseNumbers, courseNumber];
    await updateUserCourses(newCourseNumbers);

    // Initialize priors for the course
    try {
      const { error } = await supabase.functions.invoke('initialize-priors', {
        body: { 
          user_id: user?.id,
          course_id: courseNumber.toString()
        }
      });

      if (error) {
        console.error('Error initializing priors:', error);
      } else {
        console.log('Priors initialized successfully for course:', course.name);
      }
    } catch (error) {
      console.error('Error calling initialize-priors function:', error);
    }

    // Remove from available courses
    setAvailableCourses(prev => prev.filter(c => c.id !== course.id));
    
    // Add to my courses with delay for animation
    setTimeout(() => {
      setMyCourses(prev => [...prev, course]);
    }, 300);
  };

  const handleSaveGoal = async () => {
    if (!user || !goalText.trim()) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ course_1_goal: goalText.trim() })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving goal:', error);
        return;
      }

      // Reset state
      setShowGoalInput(false);
      setGoalText('');
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleSaveEgeBasicGoal = async () => {
    if (!user || !egeBasicGoalText.trim()) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ course_2_goal: egeBasicGoalText.trim() })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving ЕГЭ базовая goal:', error);
        return;
      }

      // Reset state
      setShowEgeBasicGoal(false);
      setEgeBasicGoalText('');
    } catch (error) {
      console.error('Error saving ЕГЭ базовая goal:', error);
    }
  };

  const handleSaveEgeAdvancedGoal = async () => {
    if (!user || !egeAdvancedGoalText.trim()) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ course_3_goal: egeAdvancedGoalText.trim() })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving ЕГЭ профильная goal:', error);
        return;
      }

      // Reset state
      setShowEgeAdvancedGoal(false);
      setEgeAdvancedGoalText('');
    } catch (error) {
      console.error('Error saving ЕГЭ профильная goal:', error);
    }
  };

  const handleStartCourse = (courseId: string) => {
    console.log('Starting course:', courseId);
    
    // Navigate to the appropriate course page
    switch (courseId) {
      case 'oge-math':
        navigate('/ogemath');
        break;
      case 'ege-basic':
        navigate('/egemathbasic');
        break;
      case 'ege-advanced':
        navigate('/egemathprof');
        break;
      default:
        console.warn('Unknown course ID:', courseId);
    }
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
        
        // Delete mastery data for each removed course
        for (const course of coursesToRemove) {
          const courseNumber = courseIdToNumber[course.id];
          try {
            const { error } = await supabase.functions.invoke('delete-mastery-data', {
              body: { 
                user_id: user?.id,
                course_id: courseNumber.toString()
              }
            });

            if (error) {
              console.error('Error deleting mastery data for course:', course.name, error);
            } else {
              console.log('Mastery data deleted successfully for course:', course.name);
            }
          } catch (error) {
            console.error('Error calling delete-mastery-data function:', error);
          }
        }
        
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

  const toggleDropdown = (courseId: string) => {
    setExpandedDropdowns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const renderMarkdownText = (text: string) => {
    // Simple markdown rendering for bold text
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
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
          На Главную
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
                
                {/* Goal Input Sections */}
                <AnimatePresence>
                  {showGoalInput && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200"
                    >
                      <h3 className="text-lg font-semibold text-green-800 mb-3">
                        Напишите свою цель для экзамена ОГЭ математика
                      </h3>
                      <div className="space-y-3">
                        <Input
                          placeholder="Например: Сдать ОГЭ на 5 баллов..."
                          value={goalText}
                          onChange={(e) => setGoalText(e.target.value)}
                          className="bg-white border-green-300 focus:border-green-500"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSaveGoal}
                            disabled={!goalText.trim()}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Сохранить
                          </Button>
                          <Button
                            onClick={() => {
                              setShowGoalInput(false);
                              setGoalText('');
                            }}
                            variant="outline"
                            className="border-green-300 text-green-700 hover:bg-green-50"
                          >
                            Отмена
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {showEgeBasicGoal && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200"
                    >
                      <h3 className="text-lg font-semibold text-green-800 mb-3">
                        Напишите свою цель для экзамена ЕГЭ базовая математика
                      </h3>
                      <div className="space-y-3">
                        <Input
                          placeholder="Например: Сдать ЕГЭ базовую на 5 баллов..."
                          value={egeBasicGoalText}
                          onChange={(e) => setEgeBasicGoalText(e.target.value)}
                          className="bg-white border-green-300 focus:border-green-500"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSaveEgeBasicGoal}
                            disabled={!egeBasicGoalText.trim()}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Сохранить
                          </Button>
                          <Button
                            onClick={() => {
                              setShowEgeBasicGoal(false);
                              setEgeBasicGoalText('');
                            }}
                            variant="outline"
                            className="border-green-300 text-green-700 hover:bg-green-50"
                          >
                            Отмена
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {showEgeAdvancedGoal && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200"
                    >
                      <h3 className="text-lg font-semibold text-green-800 mb-3">
                        Напишите свою цель для экзамена ЕГЭ профильная математика
                      </h3>
                      <div className="space-y-3">
                        <Input
                          placeholder="Например: Сдать ЕГЭ профильную на 80+ баллов..."
                          value={egeAdvancedGoalText}
                          onChange={(e) => setEgeAdvancedGoalText(e.target.value)}
                          className="bg-white border-green-300 focus:border-green-500"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSaveEgeAdvancedGoal}
                            disabled={!egeAdvancedGoalText.trim()}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Сохранить
                          </Button>
                          <Button
                            onClick={() => {
                              setShowEgeAdvancedGoal(false);
                              setEgeAdvancedGoalText('');
                            }}
                            variant="outline"
                            className="border-green-300 text-green-700 hover:bg-green-50"
                          >
                            Отмена
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                      className="rounded-xl bg-secondary/50 border border-border/30 hover:bg-secondary/70 transition-all duration-200 overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-4">
                        <div 
                          className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-all duration-200 flex-1"
                          onClick={() => toggleDropdown(course.id)}
                        >
                          <span className="font-medium text-foreground">
                            {course.name}
                          </span>
                          <motion.div
                            animate={{ rotate: expandedDropdowns.has(course.id) ? 180 : 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          </motion.div>
                        </div>
                        <Button
                          onClick={() => handleAddCourse(course)}
                          size="sm"
                          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Добавить
                        </Button>
                      </div>
                      
                      <AnimatePresence>
                        {expandedDropdowns.has(course.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-2 backdrop-blur-xl bg-card/20 border-t border-border/20">
                              <div 
                                className="text-sm text-muted-foreground leading-relaxed"
                                dangerouslySetInnerHTML={{ 
                                  __html: renderMarkdownText(courseContent[course.id] || '') 
                                }}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
                      className="rounded-xl bg-accent/30 border border-border/30 hover:bg-accent/40 transition-all duration-200 overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3 flex-1">
                          {isDeleteMode && (
                            <Checkbox
                              checked={selectedCourses.includes(course.id)}
                              onCheckedChange={(checked) => handleCourseSelection(course.id, checked as boolean)}
                              className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                            />
                          )}
                          <div 
                            className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-all duration-200 flex-1"
                            onClick={() => toggleDropdown(`my-${course.id}`)}
                          >
                            <span className="font-medium text-foreground">
                              {course.name}
                            </span>
                            <motion.div
                              animate={{ rotate: expandedDropdowns.has(`my-${course.id}`) ? 180 : 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            </motion.div>
                          </div>
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
                      </div>
                      
                      <AnimatePresence>
                        {expandedDropdowns.has(`my-${course.id}`) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-2 backdrop-blur-xl bg-card/20 border-t border-border/20">
                              <div 
                                className="text-sm text-muted-foreground leading-relaxed"
                                dangerouslySetInnerHTML={{ 
                                  __html: renderMarkdownText(courseContent[course.id] || '') 
                                }}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
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