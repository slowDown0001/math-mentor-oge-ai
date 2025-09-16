import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Sidebar } from '@/components/mydb3/Sidebar';
import { UserInfoStripe } from '@/components/mydb3/UserInfoStripe';
import { CourseTreeCard } from '@/components/mydb3/CourseTreeCard';
import { CourseSelectionModal } from '@/components/mydb3/CourseSelectionModal';
import { useDashboardLogic } from '@/hooks/useDashboardLogic';
import { COURSES, CourseId } from '@/lib/courses.registry';

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

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddCourses = async (courseIds: CourseId[]) => {
    for (const courseId of courseIds) {
      await handleAddCourse({ id: courseId, name: COURSES[courseId].title });
    }
  };

  const handleDeleteCourses = async (courseIds: CourseId[]) => {
    // Call the delete function from useDashboardLogic
    const {
      handleDeleteMode,
      handleCourseSelection
    } = useDashboardLogic();

    // Select the courses for deletion
    for (const courseId of courseIds) {
      handleCourseSelection(courseId, true);
    }

    // Trigger deletion
    await handleDeleteMode();
    
    // Refresh the page data
    window.location.reload();
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
                onClick={() => setIsModalOpen(true)}
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
                    onClick={handleOpenModal}
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
                        onClick={handleOpenModal}
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
        mode="delete"
      />
    </div>
  );
};

export default MyDb3;