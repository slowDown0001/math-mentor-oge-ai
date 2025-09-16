import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { COURSES, CourseId } from '@/lib/courses.registry';

interface CourseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCourses?: (courseIds: CourseId[]) => void;
  onDeleteCourses?: (courseIds: CourseId[]) => void;
  enrolledCourseIds: CourseId[];
  mode?: 'add' | 'delete';
}

export const CourseSelectionModal: React.FC<CourseSelectionModalProps> = ({
  isOpen,
  onClose,
  onAddCourses,
  onDeleteCourses,
  enrolledCourseIds,
  mode = 'add'
}) => {
  const [selectedCourses, setSelectedCourses] = useState<CourseId[]>([]);

  const availableCourses = mode === 'delete' 
    ? Object.values(COURSES).filter(course => enrolledCourseIds.includes(course.id))
    : Object.values(COURSES).filter(course => !enrolledCourseIds.includes(course.id));

  const handleCourseToggle = (courseId: CourseId, checked: boolean) => {
    if (checked) {
      setSelectedCourses(prev => [...prev, courseId]);
    } else {
      setSelectedCourses(prev => prev.filter(id => id !== courseId));
    }
  };

  const handleContinue = () => {
    if (selectedCourses.length > 0) {
      if (mode === 'delete' && onDeleteCourses) {
        onDeleteCourses(selectedCourses);
      } else if (mode === 'add' && onAddCourses) {
        onAddCourses(selectedCourses);
      }
      setSelectedCourses([]);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedCourses([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-white">
                {mode === 'delete' ? 'Удалить курсы' : 'Какие курсы мы можем помочь вам изучить?'}
              </DialogTitle>
              <p className="text-blue-100 mt-1">
                {mode === 'delete' 
                  ? 'Выберите курсы для удаления. Все данные о прогрессе будут потеряны.'
                  : 'Выберите курсы и мы подберем правильные уроки для вас.'
                }
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Математика</h3>
              <span className="text-sm text-muted-foreground">
                Всего ({availableCourses.length})
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={course.id}
                    checked={selectedCourses.includes(course.id)}
                    onCheckedChange={(checked) => 
                      handleCourseToggle(course.id, checked as boolean)
                    }
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={course.id}
                      className="text-sm font-medium cursor-pointer block"
                    >
                      {course.title}
                    </label>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {course.tag}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-muted/30">
          <Button variant="ghost" onClick={handleClose}>
            Назад
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Шаг 1 из 1
            </span>
            <Button
              onClick={handleContinue}
              disabled={selectedCourses.length === 0}
              className="min-w-[200px]"
              variant={mode === 'delete' ? 'destructive' : 'default'}
            >
              {mode === 'delete' 
                ? `Удалить ${selectedCourses.length} курс${selectedCourses.length === 1 ? '' : 'а'}`
                : `Продолжить с ${selectedCourses.length} курс${selectedCourses.length === 1 ? 'ом' : 'ами'}`
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};