import { useAuth } from '@/contexts/AuthContext';
import { trackTextbookProgress, ActivityType } from '@/services/textbookProgressService';

export const useTextbookProgress = () => {
  const { user } = useAuth();

  const trackActivity = async (
    activityType: ActivityType,
    activity: string,
    workDone: string
  ) => {
    if (!user?.id) {
      console.warn('No user ID available for tracking');
      return { success: false, error: 'No user authenticated' };
    }

    return await trackTextbookProgress(user.id, activityType, activity, workDone);
  };

  const trackExerciseProgress = async (exerciseName: string, current: number, total: number) => {
    const workDone = current === 0 ? 'exercise started' : `${current}/${total} solved`;
    return await trackActivity('exercise', exerciseName, workDone);
  };

  const trackTestProgress = async (testName: string, current: number, total: number) => {
    const workDone = current === 0 ? 'test started' : `${current}/${total} solved`;
    return await trackActivity('test', testName, workDone);
  };

  const trackExamProgress = async (examName: string, current: number, total: number) => {
    const workDone = current === 0 ? 'exam started' : `${current}/${total} solved`;
    return await trackActivity('exam', examName, workDone);
  };

  const trackVideoProgress = async (videoName: string, isFinished: boolean = false) => {
    const workDone = isFinished ? 'video finished' : 'video watched';
    return await trackActivity('video', videoName, workDone);
  };

  const trackArticleRead = async (articleName: string) => {
    return await trackActivity('article', articleName, 'article read');
  };

  return {
    trackActivity,
    trackExerciseProgress,
    trackTestProgress,
    trackExamProgress,
    trackVideoProgress,
    trackArticleRead
  };
};