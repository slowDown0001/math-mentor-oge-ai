
import { supabase } from "@/integrations/supabase/client";

export interface MathProblem {
  question_id: string;
  problem_text: string;
  problem_image?: string;
  answer: string;
  solution_text?: string;
  solutiontextexpanded?: string;
  code: string;
}

export const getCategoryByCode = (code: string): string => {
  if (!code) return 'Общее';
  
  if (code.startsWith('1.')) return 'Арифметика';
  if (code.startsWith('2.') || code.startsWith('3.') || code.startsWith('4.') || code.startsWith('5.') || code.startsWith('6.')) return 'Алгебра';
  if (code.startsWith('7.')) return 'Геометрия';
  if (code.startsWith('8.')) return 'Практическая математика';
  
  return 'Общее';
};

export const getRandomMathProblem = async (category?: string): Promise<MathProblem | null> => {
  try {
    let query = supabase.from('copy').select('*');
    
    // Filter by category if specified
    if (category) {
      switch (category.toLowerCase()) {
        case 'арифметика':
          query = query.like('code', '1.%');
          break;
        case 'алгебра':
          query = query.or('code.like.2.%,code.like.3.%,code.like.4.%,code.like.5.%,code.like.6.%');
          break;
        case 'геометрия':
          query = query.like('code', '7.%');
          break;
        case 'практическая математика':
          query = query.like('code', '8.%');
          break;
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching math problems:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      return null;
    }
    
    // Get random problem from results
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex] as MathProblem;
    
  } catch (error) {
    console.error('Error in getRandomMathProblem:', error);
    return null;
  }
};

export const getMathProblemById = async (questionId: string): Promise<MathProblem | null> => {
  try {
    const { data, error } = await supabase
      .from('copy')
      .select('*')
      .eq('question_id', questionId)
      .single();
    
    if (error) {
      console.error('Error fetching math problem by ID:', error);
      return null;
    }
    
    return data as MathProblem;
  } catch (error) {
    console.error('Error in getMathProblemById:', error);
    return null;
  }
};
