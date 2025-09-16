import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, BookOpen, Award, Target, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { COURSES, CourseId, courseIdToNumber } from '@/lib/courses.registry';

const TOTAL_STEPS = 4;

interface CourseOnboardingWizardProps {
  courseId: CourseId;
  onDone: () => void;
  onError?: () => void;
}

interface CourseFormData {
  schoolGrade?: number;
  basicLevel?: number;
  tookMock?: boolean;
  mockScore?: number;
  goalText?: string;
}

export function CourseOnboardingWizard({ courseId, onDone, onError }: CourseOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<CourseFormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const course = COURSES[courseId];
  const courseNumber = courseIdToNumber[courseId];

  useEffect(() => {
    loadExistingData();
  }, [courseId, user]);

  const loadExistingData = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`schoolmark${courseNumber}, selfestimation${courseNumber}, testmark${courseNumber}, course_${courseNumber}_goal`)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading existing data:', error);
        return;
      }

      if (profile) {
        setData({
          schoolGrade: profile[`schoolmark${courseNumber}`] || undefined,
          basicLevel: profile[`selfestimation${courseNumber}`] || undefined,
          mockScore: profile[`testmark${courseNumber}`] || undefined,
          tookMock: profile[`testmark${courseNumber}`] !== null ? true : undefined,
          goalText: profile[`course_${courseNumber}_goal`] || undefined,
        });
      }
    } catch (error) {
      console.error('Error loading existing data:', error);
    }
  };

  const updateData = (newData: Partial<CourseFormData>) => {
    setData(prev => ({ ...prev, ...newData }));
    setError(null);
  };

  const getEmojiForLevel = (level: number): string => {
    const emojis = ['😞', '😐', '🙂', '😊', '😍'];
    return emojis[level - 1] || '🙂';
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!data.schoolGrade;
      case 2:
        return !!data.basicLevel;
      case 3:
        return data.tookMock !== undefined && (!data.tookMock || (data.mockScore !== undefined && data.mockScore >= 0 && data.mockScore <= 100));
      case 4:
        return true; // Goal is optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!user) throw new Error('User not authenticated');

      const updateObject = {
        [`schoolmark${courseNumber}`]: data.schoolGrade || null,
        [`selfestimation${courseNumber}`]: data.basicLevel || null,
        [`testmark${courseNumber}`]: data.tookMock ? (data.mockScore || null) : null,
        [`course_${courseNumber}_goal`]: data.goalText || null,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateObject)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Данные сохранены",
        description: `Настройки для курса "${course.title}" обновлены`,
      });

      onDone();
      
    } catch (error) {
      console.error('Error saving course data:', error);
      setError('Не удалось сохранить данные. Попробуйте ещё раз.');
      if (onError) onError();
    } finally {
      setIsSubmitting(false);
    }
  };

  const slideVariants = {
    enter: { x: 300, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Award className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Твоя текущая школьная оценка по математике</h3>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {[2, 3, 4, 5].map((grade) => (
                <Button
                  key={grade}
                  variant={data.schoolGrade === grade ? "default" : "outline"}
                  className="h-12 text-lg font-bold"
                  onClick={() => updateData({ schoolGrade: grade })}
                >
                  {grade}
                </Button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Как ты оцениваешь свои базовые математические навыки?</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Слабо</span>
                <span className="text-2xl">{data.basicLevel ? getEmojiForLevel(data.basicLevel) : '🙂'}</span>
                <span>Отлично</span>
              </div>
              <Slider
                value={[data.basicLevel || 3]}
                onValueChange={([value]) => updateData({ basicLevel: value })}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <BookOpen className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Пробный тест</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={data.tookMock === false ? "default" : "outline"}
                className="h-12"
                onClick={() => updateData({ tookMock: false, mockScore: undefined })}
              >
                Пока не проходил(а)
              </Button>
              <Button
                variant={data.tookMock === true ? "default" : "outline"}
                className="h-12"
                onClick={() => updateData({ tookMock: true })}
              >
                Проходил(а)
              </Button>
            </div>

            {data.tookMock && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <Label className="text-base font-medium">Баллы пробного теста</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={data.mockScore || ''}
                  onChange={(e) => updateData({ mockScore: parseInt(e.target.value) || 0 })}
                  placeholder="0-100"
                  className="h-12 text-center text-lg"
                />
                {data.tookMock && (data.mockScore === undefined || data.mockScore < 0 || data.mockScore > 100) && (
                  <p className="text-sm text-destructive">Введите результат от 0 до 100</p>
                )}
              </motion.div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Sparkles className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Желаемый результат</h3>
              <p className="text-muted-foreground">Опишите свою цель (необязательно)</p>
            </div>
            
            <div className="space-y-4">
              <Input
                value={data.goalText || ''}
                onChange={(e) => updateData({ goalText: e.target.value })}
                placeholder="Например: сдать на 4, поступить в вуз, улучшить знания..."
                className="h-12"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-destructive text-sm">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  Повторить
                </Button>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-14 text-lg font-semibold"
            >
              {isSubmitting ? "Сохраняем..." : "Готово"}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-xl relative bg-background shadow-xl rounded-2xl">
        <CardHeader className="text-center pb-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Пару вопросов — и начнём персональную подготовку</h1>
            <p className="text-muted-foreground">Курс: {course.title}</p>
          </div>
          
          <div className="space-y-2">
            <Progress value={(currentStep / TOTAL_STEPS) * 100} className="h-2" />
            <div className="flex justify-center space-x-2">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i + 1 <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Шаг {currentStep} из {TOTAL_STEPS}</p>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {currentStep < TOTAL_STEPS && (
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="h-10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="h-10"
              >
                Далее
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}