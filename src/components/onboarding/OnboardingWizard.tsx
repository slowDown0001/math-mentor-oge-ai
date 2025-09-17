import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, BookOpen, Target, Award, Sparkles } from 'lucide-react';
import { onboardingSchema, OnboardingData, examTypeLabels } from '@/lib/onboardingSchema';
import { daysUntilNextMay24 } from '@/lib/date';
import { saveOnboarding } from '@/services/profile';
import { useNavigate } from 'react-router-dom';

const TOTAL_STEPS = 5;

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const daysToExam = daysUntilNextMay24();

  const updateData = (newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const getSmartComment = (): string => {
    if (!data.goalScore) return '';

    const baselineFromSelfAssessment = (data.basicLevel || 1) * 15;
    const mockScore = data.tookMock ? data.mockScore : null;
    const ambitionGap = data.goalScore - (mockScore ?? baselineFromSelfAssessment);

    if (data.goalScore >= 90) {
      return "Вау! Очень амбициозно! 🚀";
    }
    if (ambitionGap >= 25) {
      return `Отлично! Любим вызовы. За ${daysToExam} дней настроим умный план 💪`;
    }
    if (data.goalScore < 50) {
      return "Ну а если поставить цель повыше? Думаю, ты можешь лучше 😉";
    }
    if (data.tookMock && mockScore && mockScore <= 40 && data.goalScore >= 70) {
      return "План жёсткий, но реальный. Поехали шаг за шагом!";
    }
    return "Хороший ориентир. Давай начнём!";
  };

  const getEmojiForLevel = (level: number): string => {
    const emojis = ['😞', '😐', '🙂', '😊', '😍'];
    return emojis[level - 1] || '🙂';
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!data.examType;
      case 2:
        return !!(data.schoolGrade && data.basicLevel);
      case 3:
        return data.tookMock !== undefined && (!data.tookMock || (data.mockScore !== undefined && data.mockScore >= 0 && data.mockScore <= 100));
      case 4:
        return data.goalScore !== undefined && data.goalScore >= 0 && data.goalScore <= 100;
      case 5:
        return true;
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
      
      // Validate data
      const validatedData = onboardingSchema.parse(data);
      
      // Save data
      await saveOnboarding(validatedData);
      
      // Show success
      setShowConfetti(true);
      
      toast({
        title: "Добро пожаловать!",
        description: "Персональный план готов. Начинаем обучение!",
      });

      // Navigate after a delay
      setTimeout(() => {
        navigate('/mydb3');
        onComplete();
      }, 2000);
      
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить данные. Попробуйте ещё раз.",
        variant: "destructive",
      });
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
              <BookOpen className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">К какому экзамену ты готовишься?</h3>
              <p className="text-muted-foreground">Это поможет настроить программу и задания.</p>
            </div>
            
            <div className="grid gap-3">
              {Object.entries(examTypeLabels).map(([key, label]) => (
                <Button
                  key={key}
                  variant={data.examType === key ? "default" : "outline"}
                  className="h-12 text-left justify-start"
                  onClick={() => updateData({ examType: key as OnboardingData['examType'] })}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Award className="mx-auto h-12 w-12 text-primary mb-4" />
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Твоя текущая школьная оценка по математике</Label>
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[2, 3, 4, 5].map((grade) => (
                    <Button
                      key={grade}
                      variant={data.schoolGrade === grade ? "default" : "outline"}
                      className="h-12 text-lg font-bold"
                      onClick={() => updateData({ schoolGrade: grade as OnboardingData['schoolGrade'] })}
                    >
                      {grade}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Как ты оцениваешь свои базовые математические навыки?</Label>
                <div className="mt-4 space-y-3">
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
            </div>
          </div>
        );

      case 3:
        const examName = data.examType ? examTypeLabels[data.examType] : '';
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Проходил(а) ли ты пробный вариант по {examName}?</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={data.tookMock === true ? "default" : "outline"}
                className="h-12"
                onClick={() => updateData({ tookMock: true })}
              >
                Да
              </Button>
              <Button
                variant={data.tookMock === false ? "default" : "outline"}
                className="h-12"
                onClick={() => updateData({ tookMock: false, mockScore: undefined })}
              >
                Нет
              </Button>
            </div>

            {data.tookMock && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <Label className="text-base font-medium">Какой был результат (%)</Label>
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

            <div className="text-center text-sm text-muted-foreground">
              До экзамена ориентировочно осталось: {daysToExam} дней
            </div>
          </div>
        );

      case 4:
        const examNameForGoal = data.examType ? examTypeLabels[data.examType] : '';
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Какой результат хочешь получить на {examNameForGoal}?</h3>
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
                  value={[data.goalScore || 50]}
                  onValueChange={([value]) => updateData({ goalScore: value })}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>0%</span>
                  <span className="font-semibold text-lg text-foreground">{data.goalScore || 50}%</span>
                  <span>100%</span>
                </div>
              </div>

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
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Sparkles className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Всё готово!</h3>
              <p className="text-muted-foreground">Мы составим персональный план и дадим первые рекомендации.</p>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <div><strong>Экзамен:</strong> {data.examType ? examTypeLabels[data.examType] : ''}</div>
              <div><strong>Школьная оценка:</strong> {data.schoolGrade}</div>
              <div><strong>Самооценка навыков:</strong> {data.basicLevel}/5 {data.basicLevel ? getEmojiForLevel(data.basicLevel) : ''}</div>
              {data.tookMock && data.mockScore && (
                <div><strong>Результат пробного:</strong> {data.mockScore}%</div>
              )}
              <div><strong>Цель на экзамене:</strong> {data.goalScore}%</div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 relative overflow-hidden"
            >
              {isSubmitting ? (
                "Настраиваем план..."
              ) : (
                <>
                  Начать обучение!!!
                  <Sparkles className="ml-2 h-5 w-5" />
                </>
              )}
              {showConfetti && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-20"
                />
              )}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4 z-50">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-primary/10 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-24 h-24 border-2 border-secondary/10 rounded-lg"
        />
      </div>

      <Card className="w-full max-w-xl md:max-w-2xl relative bg-background/95 backdrop-blur shadow-xl rounded-2xl border-0">
        <CardHeader className="text-center pb-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Добро пожаловать!</h1>
            <p className="text-muted-foreground">Пару вопросов — и начнём персональную подготовку.</p>
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