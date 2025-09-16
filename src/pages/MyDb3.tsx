import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Sidebar } from '@/components/mydb3/Sidebar';
import { UserInfoStripe } from '@/components/mydb3/UserInfoStripe';
import { CourseTreeCard } from '@/components/mydb3/CourseTreeCard';
import { CourseSelectionModal } from '@/components/mydb3/CourseSelectionModal';
import { useDashboardLogic } from '@/hooks/useDashboardLogic';
import { COURSES, CourseId, courseIdToNumber } from '@/lib/courses.registry';
import { supabase } from '@/integrations/supabase/client';

const MyDb3 = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    myCourses,
    handleAddCourse,
    handleStartCourse,
  } = useDashboardLogic();

  // Convert user courses to our registry format
  const enrolledCourses = myCourses.map(course => COURSES[course.id as CourseId]).filter(Boolean);
  const enrolledCourseIds = enrolledCourses.map(course => course.id);

  const [modalMode, setModalMode] = useState<'add' | 'delete'>('add');

  const handleOpenAddModal = () => {
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = () => {
    setModalMode('delete');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddCourses = async (courseIds: CourseId[]) => {
    for (const courseId of courseIds) {
      const course = { id: courseId, name: COURSES[courseId].title };
      const courseNumber = courseIdToNumber[courseId];
      
      // Get current courses from profiles
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('courses')
        .eq('user_id', user.id)
        .single();

      const currentCourseNumbers = profile?.courses || [];
      const newCourseNumbers = [...currentCourseNumbers, courseNumber];
      
      // Update database
      await supabase
        .from('profiles')
        .update({ courses: newCourseNumbers })
        .eq('user_id', user.id);

      // Initialize priors for the course
      try {
        await supabase.functions.invoke('initialize-priors', {
          body: { 
            user_id: user.id,
            course_id: courseNumber.toString()
          }
        });
      } catch (error) {
        console.error('Error initializing priors:', error);
      }
    }
    
    // Refresh the page to show updated courses
    window.location.reload();
  };

  const handleDeleteCourses = async (courseIds: CourseId[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Call the database function for each course using numeric course IDs
      for (const courseId of courseIds) {
        const numericCourseId = courseIdToNumber[courseId].toString();
        const { error } = await supabase.rpc('delete_course_data', {
          p_user_id: user.id,
          p_course_id: numericCourseId
        });
        
        if (error) {
          console.error('Error deleting course data:', error);
        }
      }
      
      // Refresh the page data
      window.location.reload();
    } catch (error) {
      console.error('Error in handleDeleteCourses:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* User Info Stripe */}
          <UserInfoStripe />
          
          {/* My Courses Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Мои курсы</h1>
              <Button 
                onClick={handleOpenDeleteModal}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Редактировать курсы
              </Button>
            </div>

            {enrolledCourses.length === 0 ? (
              /* No courses - show empty state with large plus button */
              <div className="text-center py-16">
                <div className="mb-8">
                    <Button
                      onClick={handleOpenAddModal}
                      variant="outline"
                      size="lg"
                      className="w-32 h-32 rounded-full border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                    >
                      <Plus className="w-12 h-12 text-muted-foreground" />
                    </Button>
                </div>
                <p className="text-muted-foreground text-lg">Добавить другой курс</p>
              </div>
            ) : (
              /* Has courses - show course grid with add button */
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {enrolledCourses.map((course) => (
                    <CourseTreeCard
                      key={course.id}
                      course={course}
                      onStart={handleStartCourse}
                    />
                  ))}
                  
                  {/* Add course card */}
                  <div className="flex items-center justify-center min-h-[300px] border-2 border-dashed border-muted-foreground/20 rounded-lg">
                  <div className="text-center">
                    <Button
                      onClick={handleOpenAddModal}
                      variant="outline"
                      size="lg"
                      className="w-20 h-20 rounded-full border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 mb-4"
                    >
                      <Plus className="w-8 h-8 text-muted-foreground" />
                    </Button>
                    <p className="text-muted-foreground">Добавить другой курс</p>
                  </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course Selection Modal */}
      <CourseSelectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddCourses={handleAddCourses}
        onDeleteCourses={handleDeleteCourses}
        enrolledCourseIds={enrolledCourseIds}
        mode={modalMode}
      />
    </div>
  );
};

export default MyDb3;