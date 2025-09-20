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
  goalScore?: number;
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
    // Reset wizard state when courseId changes
    setCurrentStep(1);
    setData({});
    setError(null);
    setIsSubmitting(false);
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
          goalScore: profile[`course_${courseNumber}_goal`] ? parseInt(profile[`course_${courseNumber}_goal`]) : undefined,
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

  const getSmartComment = (): string => {
    if (!data.goalScore) return '';

    const isOGE = courseId === 'oge-math';
    
    if (isOGE) {
      const score = data.goalScore;
      if (score >= 22) return "Отлично! Целишься на 5! 🚀";
      if (score >= 15) return "Хороша цель! На 4 вполне реально 💪";
      if (score >= 8) return "Неплохо! Тройка будет в кармане 😊";
      return "Давай поставим цель чуть повыше? 😉";
    }

    const baselineFromSelfAssessment = (data.basicLevel || 1) * 15;
    const mockScore = data.tookMock ? data.mockScore : null;
    const ambitionGap = data.goalScore - (mockScore ?? baselineFromSelfAssessment);

    if (data.goalScore >= 90) {
      return "Вау! Очень амбициозно! 🚀";
    }
    if (ambitionGap >= 25) {
      return `Отлично! Любим вызовы. Настроим умный план 💪`;
    }
    if (data.goalScore < 50) {
      return "Ну а если поставить цель повыше? Думаю, ты можешь лучше 😉";
    }
    if (data.tookMock && mockScore && mockScore <= 40 && data.goalScore >= 70) {
      return "План жёсткий, но реальный. Поехали шаг за шагом!";
    }
    return "Хороший ориентир. Давай начнём!";
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
        const isOGE = courseId === 'oge-math';
        const maxScore = isOGE ? 31 : 100;
        return data.goalScore !== undefined && data.goalScore >= 0 && data.goalScore <= maxScore;
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
        [`course_${courseNumber}_goal`]: data.goalScore ? data.goalScore.toString() : null,
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
        const isOGE = courseId === 'oge-math';
        const maxScore = isOGE ? 31 : 100;
        const defaultScore = isOGE ? 15 : 50;
        
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Какой результат хочешь получить на {course.title}?</h3>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <div 
                  className="h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 mb-2"
                  style={{
                    background: `linear-gradient(to right, 
                      #ef4444 0%, 
                      #f97316 25%, 
                      #eab308 50%, 
                      #84cc16 75%, 
                      #22c55e 100%)`
                  }}
                />
                <Slider
                  value={[data.goalScore || defaultScore]}
                  onValueChange={([value]) => updateData({ goalScore: value })}
                  min={0}
                  max={maxScore}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>0{isOGE ? '' : '%'}</span>
                  <span className="font-semibold text-lg text-foreground">
                    {data.goalScore || defaultScore}{isOGE ? '' : '%'}
                  </span>
                  <span>{maxScore}{isOGE ? '' : '%'}</span>
                </div>
              </div>

              {isOGE && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground text-center">Оценки по баллам:</div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
                      <div className="font-bold text-red-700 dark:text-red-400">2</div>
                      <div className="text-xs text-red-600 dark:text-red-500">0-7</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                      <div className="font-bold text-orange-700 dark:text-orange-400">3</div>
                      <div className="text-xs text-orange-600 dark:text-orange-500">8-14</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                      <div className="font-bold text-blue-700 dark:text-blue-400">4</div>
                      <div className="text-xs text-blue-600 dark:text-blue-500">15-21</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                      <div className="font-bold text-green-700 dark:text-green-400">5</div>
                      <div className="text-xs text-green-600 dark:text-green-500">22-31</div>
                    </div>
                  </div>
                </div>
              )}

              {data.goalScore && (
                <motion.div
                  key={getSmartComment()}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-sm bg-muted/50 rounded-lg p-3"
                >
                  {getSmartComment()}
                </motion.div>
              )}
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