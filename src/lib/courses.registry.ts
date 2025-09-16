export type CourseId = 'oge-math' | 'ege-basic' | 'ege-advanced';

export interface Course {
  id: CourseId;
  title: string;
  tag: string;
  topicsUrl: string;
}

export const COURSES: Record<CourseId, Course> = {
  'oge-math': {
    id: 'oge-math',
    title: 'ОГЭ Математика',
    tag: 'OGE',
    topicsUrl: 'https://kbaazksvkvnafrwtmkcw.supabase.co/storage/v1/object/public/jsons_for_topic_skills/ogemath_topics_only_with_names.json'
  },
  'ege-basic': {
    id: 'ege-basic',
    title: 'ЕГЭ (Базовый)',
    tag: 'EGE Basic',
    topicsUrl: 'https://kbaazksvkvnafrwtmkcw.supabase.co/storage/v1/object/public/jsons_for_topic_skills/EGE_math_basic_topicsonly_with_names.json'
  },
  'ege-advanced': {
    id: 'ege-advanced',
    title: 'ЕГЭ (Профильный)',
    tag: 'EGE Profi',
    topicsUrl: 'https://kbaazksvkvnafrwtmkcw.supabase.co/storage/v1/object/public/jsons_for_topic_skills/ege_math_profil_topics_only_with_names.json'
  }
};

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