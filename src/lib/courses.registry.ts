export type CourseId = 'oge-math' | 'ege-basic' | 'ege-advanced';

export interface Course {
  id: CourseId;
  numericId: number;
  title: string;
  tag: string;
  homeRoute: string;
  routePatterns: string[];
  topicsUrl: string;
}

export const COURSES: Record<CourseId, Course> = {
  'oge-math': {
    id: 'oge-math',
    numericId: 1,
    title: 'Математика ОГЭ',
    tag: 'OGE',
    homeRoute: '/ogemath',
    routePatterns: [
      '/ogemath',
      '/homework',
      '/cellard-lp2',
      '/digital-textbook',
      '/ogemath-mock',
      '/ogemath-practice',
      '/ogemath-progress2',
      '/ogemath-revision',
      '/practice-by-number-ogemath',
      '/topics',
      '/topic/',
      '/modules/'
    ],
    topicsUrl: 'https://kbaazksvkvnafrwtmkcw.supabase.co/storage/v1/object/public/jsons_for_topic_skills/ogemath_topics_only_with_names.json'
  },
  'ege-basic': {
    id: 'ege-basic',
    numericId: 2,
    title: 'Математика ЕГЭ (Базовый уровень)',
    tag: 'EGE Basic',
    homeRoute: '/egemathbasic',
    routePatterns: [
      '/egemathbasic',
      '/egemathbasic-practice',
      '/egemathbasic-progress',
      '/practice-by-number-egebasicmath'
    ],
    topicsUrl: 'https://kbaazksvkvnafrwtmkcw.supabase.co/storage/v1/object/public/jsons_for_topic_skills/EGE_math_basic_topicsonly_with_names.json'
  },
  'ege-advanced': {
    id: 'ege-advanced',
    numericId: 3,
    title: 'Математика ЕГЭ (Профильный уровень)',
    tag: 'EGE Profi',
    homeRoute: '/egemathprof',
    routePatterns: [
      '/egemathprof',
      '/egemathprof-practice',
      '/egemathprof-progress',
      '/practice-by-number-egeprofmath'
    ],
    topicsUrl: 'https://kbaazksvkvnafrwtmkcw.supabase.co/storage/v1/object/public/jsons_for_topic_skills/ege_math_profil_topics_only_with_names.json'
  }
};

// Helper to get course from current route
export function getCourseFromRoute(pathname: string): Course | null {
  for (const course of Object.values(COURSES)) {
    if (course.routePatterns.some(pattern => pathname.startsWith(pattern))) {
      return course;
    }
  }
  return null;
}

export const courseIdToNumber: Record<CourseId, number> = {
  'oge-math': 1,
  'ege-basic': 2,
  'ege-advanced': 3,
};

export interface Topic {
  name: string;
  number?: string;
  importance?: number;
}