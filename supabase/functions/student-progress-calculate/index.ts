import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  user_id: string;
}

interface TopicMapping {
  code: string;
  name: string;
}

interface ProgressItem {
  topic?: string;
  "задача ФИПИ"?: string;
  "навык"?: string;
  prob: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { user_id }: RequestBody = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Calculating progress for user: ${user_id}`);

    // Define topic mappings
    const topicMappings: TopicMapping[] = [
      { code: "1.1", name: "1.1 - Натуральные и целые числа" },
      { code: "1.2", name: "1.2 - Дроби и проценты" },
      { code: "1.3", name: "1.3 - Рациональные числа и арифметические действия" },
      { code: "1.4", name: "1.4 - Действительные числа" },
      { code: "1.5", name: "1.5 - Приближённые вычисления" },
      { code: "2.1", name: "2.1 - Буквенные выражения" },
      { code: "2.2", name: "2.2 - Степени" },
      { code: "2.3", name: "2.3 - Многочлены" },
      { code: "2.4", name: "2.4 - Алгебраические дроби" },
      { code: "2.5", name: "2.5 - Арифметические корни" },
      { code: "3.1", name: "3.1 - Уравнения и системы" },
      { code: "3.2", name: "3.2 - Неравенства и системы" },
      { code: "3.3", name: "3.3 - Текстовые задачи" },
      { code: "4.1", name: "4.1 - Последовательности" },
      { code: "4.2", name: "4.2 - Арифметическая и геометрическая прогрессии. Формула сложных процентов" },
      { code: "5.1", name: "5.1 - Свойства и графики функций" },
      { code: "6.1", name: "6.1 - Координатная прямая" },
      { code: "6.2", name: "6.2 - Декартовы координаты" },
      { code: "7.1", name: "7.1 - Геометрические фигуры" },
      { code: "7.2", name: "7.2 - Треугольники" },
      { code: "7.3", name: "7.3 - Многоугольники" },
      { code: "7.4", name: "7.4 - Окружность и круг" },
      { code: "7.5", name: "7.5 - Измерения" },
      { code: "7.6", name: "7.6 - Векторы" },
      { code: "7.7", name: "7.7 - Дополнительные темы по геометрии" },
      { code: "8.1", name: "8.1 - Описательная статистика" },
      { code: "8.2", name: "8.2 - Вероятность" },
      { code: "8.3", name: "8.3 - Комбинаторика" },
      { code: "8.4", name: "8.4 - Множества" },
      { code: "8.5", name: "8.5 - Графы" },
      { code: "9.1", name: "9.1 - Работа с данными и графиками" },
      { code: "9.2", name: "9.2 - Прикладная геометрия / Чтение и анализ графических схем" }
    ];

    const result: ProgressItem[] = [];

    // Calculate topic mastery for each topic
    console.log('Calculating topic mastery...');
    for (const topicMapping of topicMappings) {
      try {
        const { data: topicData, error: topicError } = await supabase.functions.invoke(
          'compute-topic-mastery-with-decay',
          {
            body: {
              user_id,
              topic_code: parseFloat(topicMapping.code),
              course_id: 'ogemath'
            }
          }
        );

        if (topicError) {
          console.error(`Error computing topic mastery for ${topicMapping.code}:`, topicError);
          result.push({
            topic: topicMapping.name,
            prob: 0.02 // Default low value
          });
        } else {
          const probability = topicData?.topic_mastery_probability || 0.02;
          result.push({
            topic: topicMapping.name,
            prob: Math.round(probability * 100) / 100 // Round to 2 decimal places
          });
        }
      } catch (error) {
        console.error(`Error processing topic ${topicMapping.code}:`, error);
        result.push({
          topic: topicMapping.name,
          prob: 0.02
        });
      }
    }

    // Calculate problem type progress
    console.log('Calculating problem type progress...');
    const problemTypes = [1, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
    
    try {
      const { data: problemData, error: problemError } = await supabase.functions.invoke(
        'compute-problem-number-type-progress-bars',
        {
          body: {
            user_id,
            problem_number_types: problemTypes,
            course_id: 'ogemath'
          }
        }
      );

      if (problemError) {
        console.error('Error computing problem type progress:', problemError);
        // Add default values for all problem types
        problemTypes.forEach(problemType => {
          result.push({
            "задача ФИПИ": problemType.toString(),
            prob: 0.02
          });
        });
      } else {
        const progressBars = problemData?.progress_bars || [];
        problemTypes.forEach((problemType, index) => {
          const probability = progressBars[index] || 0.02;
          result.push({
            "задача ФИПИ": problemType.toString(),
            prob: Math.round(probability * 100) / 100 // Round to 2 decimal places
          });
        });
      }
    } catch (error) {
      console.error('Error processing problem types:', error);
      // Add default values for all problem types
      problemTypes.forEach(problemType => {
        result.push({
          "задача ФИПИ": problemType.toString(),
          prob: 0.02
        });
      });
    }

    // Calculate skill mastery for all skills (1-180)
    console.log('Calculating skill mastery...');
    const allSkills = Array.from({ length: 180 }, (_, i) => i + 1); // Skills 1 through 180
    
    try {
      const { data: skillData, error: skillError } = await supabase.functions.invoke(
        'compute-skills-progress-bars',
        {
          body: {
            user_id,
            skill_ids: allSkills
          }
        }
      );

      if (skillError) {
        console.error('Error computing skill progress:', skillError);
        // Add default values for all skills
        allSkills.forEach(skillId => {
          result.push({
            "навык": skillId.toString(),
            prob: 0.02
          });
        });
      } else {
        const progressBars = skillData?.data?.progress_bars || [];
        progressBars.forEach((skillProgress: Record<string, number>) => {
          // skillProgress is in format { "skillId": probability }
          Object.entries(skillProgress).forEach(([skillId, probability]) => {
            result.push({
              "навык": skillId,
              prob: Math.round(probability * 100) / 100 // Round to 2 decimal places
            });
          });
        });
      }
    } catch (error) {
      console.error('Error processing skills:', error);
      // Add default values for all skills
      allSkills.forEach(skillId => {
        result.push({
          "навык": skillId.toString(),
          prob: 0.02
        });
      });
    }

    console.log(`Successfully calculated progress for user ${user_id}, returning ${result.length} items`);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in student-progress-calculate function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});