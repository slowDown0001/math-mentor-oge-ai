import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { PersonalInfoCard } from '@/components/mydb3/PersonalInfoCard';
import { AchievementsCard } from '@/components/mydb3/AchievementsCard';
import { CourseCard } from '@/components/mydb3/CourseCard';
import { useDashboardLogic } from '@/hooks/useDashboardLogic';
import { COURSES, CourseId } from '@/lib/courses.registry';

const MyDb3 = () => {
  const {
    myCourses,
    handleAddCourse,
    handleStartCourse,
  } = useDashboardLogic();

  // Convert user courses to our registry format
  const enrolledCourses = myCourses.map(course => COURSES[course.id as CourseId]).filter(Boolean);

  // Mock progress - in real implementation, this would come from student_mastery calculations
  const getCourseProgress = (courseId: CourseId): number => {
    // This should use the same logic as MyDashboard for calculating progress
    // For now, return a mock value
    return Math.floor(Math.random() * 100);
  };

  const handleAddCoursesClick = () => {
    // TODO: Open the same modal as MyDashboard
    // For now, we'll add a random available course as a demo
    const availableCourseIds = Object.keys(COURSES).filter(
      id => !myCourses.some(course => course.id === id)
    ) as CourseId[];
    
    if (availableCourseIds.length > 0) {
      const courseId = availableCourseIds[0];
      handleAddCourse({ id: courseId, name: COURSES[courseId].title });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Row - Personal Info and Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PersonalInfoCard />
          <AchievementsCard />
        </div>

        {/* Courses Section */}
        <div className="space-y-6">
          {enrolledCourses.length === 0 ? (
            /* No courses - centered add button */
            <Card className="rounded-2xl shadow-sm">
              <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Добавьте курсы для начала обучения
                </h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Выберите курсы для подготовки к экзаменам и начните свой путь к успеху
                </p>
                <Button 
                  onClick={handleAddCoursesClick}
                  className="mt-4"
                  size="lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Добавить курсы
                </Button>
              </div>
            </Card>
          ) : (
            /* Has courses - grid layout with add buttons */
            <div className="space-y-6">
              {/* Top-right add button */}
              <div className="flex justify-end">
                <Button 
                  onClick={handleAddCoursesClick}
                  variant="outline"
                  className="shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить курсы
                </Button>
              </div>

              {/* Courses grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    progress={getCourseProgress(course.id)}
                    onStart={handleStartCourse}
                    onReview={handleStartCourse} // Same navigation for now
                  />
                ))}
              </div>

              {/* Bottom centered add button */}
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={handleAddCoursesClick}
                  variant="outline"
                  size="lg"
                  className="shadow-sm"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Добавить ещё курсы
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyDb3;