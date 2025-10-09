interface VideoData {
  videoId: string;
  title: string;
  description: string;
}

interface TopicContent {
  id: string;
  title: string;
  videos: number;
  articles: number;
  exercises: number;
  videoData?: VideoData[];
}

interface QuizContent {
  id: string;
  title: string;
  description: string;
}

interface ExerciseConfig {
  title: string;
  skills: number[];
  questionCount?: number;
  isAdvanced?: boolean;
  isTest?: boolean;
  isExam?: boolean;
}

interface ModuleConfig {
  courseId: 'oge-math' | 'ege-basic' | 'ege-advanced';
  slug: string;
  moduleNumber: number;
  title: string;
  subtitle: string;
  masteryPoints: number;
  skillsDescription: string;
  topics: TopicContent[];
  quizzes: QuizContent[];
  topicMapping: string[];
  orderedContent: Array<{ type: 'topic' | 'quiz'; topicIndex?: number; quizIndex?: number; isFinalTest?: boolean }>;
  getExerciseData?: (topicId: string, exerciseIndex: number) => ExerciseConfig;
  getQuizData?: (quizId: string) => ExerciseConfig | null;
  articleContent?: { [topicId: string]: { title: string; content: string } };
}

export const modulesRegistry: Record<string, ModuleConfig> = {
  'numbers-calculations': {
    courseId: 'oge-math',
    slug: 'numbers-calculations',
    moduleNumber: 1,
    title: 'Модуль 1: Числа и вычисления',
    subtitle: '5 тем • 11 видео • 5 статей • 12 упражнений',
    masteryPoints: 1800,
    skillsDescription: 'Навыки: Натуральные числа, Дроби, Проценты, Рациональные числа, Действительные числа',
    topicMapping: ['1.1', '1.2', '1.3', '1.4', '1.5'],
    topics: [
      {
        id: 'natural-integers',
        title: 'Натуральные и целые числа',
        videos: 2,
        articles: 1,
        exercises: 2,
        videoData: [
          {
            videoId: 'WxXZaP8Y8pI',
            title: 'Натуральные и целые числа - Видео 1',
            description: 'Изучение основ натуральных и целых чисел'
          },
          {
            videoId: 'fjdeo6anRY4',
            title: 'Натуральные и целые числа - Видео 2',
            description: 'Продолжение изучения натуральных и целых чисел'
          }
        ]
      },
      {
        id: 'fractions-percentages',
        title: 'Дроби и проценты',
        videos: 2,
        articles: 1,
        exercises: 3
      },
      {
        id: 'rational-numbers',
        title: 'Рациональные числа и арифметические действия',
        videos: 4,
        articles: 1,
        exercises: 3
      },
      {
        id: 'real-numbers',
        title: 'Действительные числа',
        videos: 1,
        articles: 1,
        exercises: 2
      },
      {
        id: 'approximations',
        title: 'Приближённые вычисления',
        videos: 1,
        articles: 1,
        exercises: 2
      }
    ],
    quizzes: [
      { id: 'quiz-1', title: 'Тест 1', description: 'Повысьте уровень навыков и получите до 400 баллов мастерства' },
      { id: 'quiz-2', title: 'Тест 2', description: 'Повысьте уровень навыков и получите до 400 баллов мастерства' }
    ],
    orderedContent: [
      { type: 'topic', topicIndex: 0 },
      { type: 'topic', topicIndex: 1 },
      { type: 'quiz', quizIndex: 0 },
      { type: 'topic', topicIndex: 2 },
      { type: 'topic', topicIndex: 3 },
      { type: 'quiz', quizIndex: 1 },
      { type: 'topic', topicIndex: 4 },
      { type: 'quiz', isFinalTest: true }
    ],
    getExerciseData: (topicId: string, exerciseIndex: number) => {
      if (topicId === 'natural-integers') {
        return exerciseIndex === 0
          ? { title: 'Основы натуральных и целых чисел', skills: [1, 2, 3] }
          : { title: 'Работа с числами', skills: [4, 5] };
      }
      if (topicId === 'fractions-percentages') {
        if (exerciseIndex === 0) return { title: 'Дроби', skills: [6, 195] };
        if (exerciseIndex === 1) return { title: 'Проценты', skills: [7, 8, 9] };
        if (exerciseIndex === 2) return { title: 'Сложные дроби', skills: [10], isAdvanced: true };
      }
      if (topicId === 'rational-numbers') {
        if (exerciseIndex === 0) return { title: 'Рациональные числа', skills: [11, 12, 13] };
        if (exerciseIndex === 1) return { title: 'Арифметические действия', skills: [14, 15, 16] };
        if (exerciseIndex === 2) return { title: 'Операции с рациональными числами', skills: [17, 180] };
      }
      if (topicId === 'real-numbers') {
        if (exerciseIndex === 0) return { title: 'Действительные числа', skills: [18, 19] };
        if (exerciseIndex === 1) return { title: 'Операции с действительными числами', skills: [20, 197] };
      }
      if (topicId === 'approximations') {
        if (exerciseIndex === 0) return { title: 'Приближённые вычисления', skills: [21, 22] };
        if (exerciseIndex === 1) return { title: 'Округление', skills: [23] };
      }
      return { title: `Упражнение ${exerciseIndex + 1}`, skills: [] };
    },
    getQuizData: (quizId: string) => {
      if (quizId === 'quiz-1') {
        return {
          title: 'Тест 1: Натуральные числа и дроби',
          skills: [1, 2, 3, 4, 5, 6, 7, 8, 9, 195],
          questionCount: 6,
          isTest: true
        };
      }
      if (quizId === 'quiz-2') {
        return {
          title: 'Тест 2: Рациональные и действительные числа',
          skills: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 180, 197],
          questionCount: 6,
          isTest: true
        };
      }
      if (quizId === 'module-exam') {
        return {
          title: 'Итоговый экзамен модуля',
          skills: Array.from({ length: 23 }, (_, i) => i + 1).concat([180, 195, 197]),
          questionCount: 10,
          isExam: true
        };
      }
      return null;
    },
    articleContent: {
      'natural-integers': {
        title: 'Натуральные и целые числа — конспект',
        content: `<h1>Натуральные и целые числа — конспект</h1>

<div class="intro">
  <p>Краткий конспект по ключевым определениям и формулам: натуральные и целые числа, научная форма, делимость, признаки делимости, НОД и НОК.</p>
</div>

<div class="section-badge badge-theory">Теория</div>
<div class="theory">

  <p><b>Определения</b></p>
  <div class="definition-card">
    Натуральные числа: множество \\( \\mathbb{N} = \\{1,2,3,\\dots\\} \\).<br>
    Целые числа: множество \\( \\mathbb{Z} = \\{\\dots,-2,-1,0,1,2,\\dots\\} \\).<br>
    Модуль числа: \\( |a| = \\begin{cases} a, & a \\ge 0 \\\\ -a, & a < 0 \\end{cases} \\).<br>
    Порядок: для \\( a,b \\in \\mathbb{Z} \\) верно одно из: \\( a<b \\), \\( a=b \\), \\( a>b \\).
  </div>

  <p><b>Мини-глоссарий</b></p>
  <ul class="mini-glossary">
    <li><b>Чётность:</b> \\(a\\) чётное, если \\(2\\mid a\\); нечётное — иначе.</li>
    <li><b>Делимость:</b> \\(b\\mid a \\iff \\exists k\\in\\mathbb{Z}: a=b\\cdot k\\).</li>
    <li><b>Кратное:</b> число вида \\(a=b\\cdot k\\).</li>
  </ul>

  <p><b>Ключевые свойства операций в \\( \\mathbb{Z} \\)</b></p>
  <ul>
    <li>Замкнутость: \\( a\\pm b,\\, a\\cdot b \\in \\mathbb{Z} \\).</li>
    <li>Коммутативность и ассоциативность для \\( + \\) и \\( \\cdot \\); дистрибутивность: \\( a(b+c)=ab+ac \\).</li>
    <li>Правила знаков: \\( (+)\\cdot(+)=+,\\; (+)\\cdot(-)=-,\\; (-)\\cdot(-)=+ \\).</li>
  </ul>

  <div class="section-badge badge-theory">Научная форма числа</div>
  <div class="definition-card">
    Число в научной форме: \\( a\\times 10^{b} \\), где \\( 1\\le a<10 \\) и \\( b\\in\\mathbb{Z} \\).<br>
    Сложение/вычитание через приведение показателей; умножение и деление:<br>
    \\[
      (a_1\\cdot 10^{b_1})(a_2\\cdot 10^{b_2})=(a_1a_2)\\cdot 10^{\\,b_1+b_2},
      \\qquad
      \\frac{a_1\\cdot 10^{b_1}}{a_2\\cdot 10^{b_2}}=\\Big(\\frac{a_1}{a_2}\\Big)\\cdot 10^{\\,b_1-b_2}.
    \\]
  </div>

  <div class="section-badge badge-theory">Делимость</div>
  <div class="definition-card">
    Основное определение: \\( b\\mid a \\iff \\exists k\\in\\mathbb{Z}: a=bk \\).<br>
    Базовые свойства:<br>
    \\(\\;\\)• Транзитивность: \\( b\\mid a \\) и \\( a\\mid c \\Rightarrow b\\mid c \\).<br>
    \\(\\;\\)• Линейная комбинация: если \\( d\\mid a \\) и \\( d\\mid b \\), то \\( d\\mid (ax+by) \\) для любых \\( x,y\\in\\mathbb{Z} \\).<br>
    \\(\\;\\)• Если \\( b\\mid a \\), то \\( b\\mid ac \\) для любого \\( c\\in\\mathbb{Z} \\).
  </div>

  <p><b>Признаки делимости</b></p>
  <ul>
    <li>На \\(2\\): последняя цифра чётная \\((0,2,4,6,8)\\).</li>
    <li>На \\(3\\): сумма цифр кратна \\(3\\).</li>
    <li>На \\(5\\): последняя цифра \\(0\\) или \\(5\\).</li>
    <li>На \\(9\\): сумма цифр кратна \\(9\\).</li>
    <li>На \\(10\\): последняя цифра \\(0\\).</li>
  </ul>

  <div class="section-badge badge-theory">НОД и НОК</div>
  <div class="definition-card">
    НОД \\( (a,b) \\) — наибольшее \\( d\\in\\mathbb{Z}_{\\ge 0} \\), такое что \\( d\\mid a \\) и \\( d\\mid b \\).<br>
    НОК \\( [a,b] \\) — наименьшее положительное число, кратное и \\( a \\), и \\( b \\).<br>
    Связь: \\[
      \\gcd(a,b)\\cdot \\operatorname{lcm}(a,b)=|a\\cdot b|.
    \\]
    Разложение по простым: если \\( a=\\prod p_i^{\\alpha_i},\\; b=\\prod p_i^{\\beta_i} \\), то
    \\[
      \\gcd(a,b)=\\prod p_i^{\\min(\\alpha_i,\\beta_i)},\\qquad
      \\operatorname{lcm}(a,b)=\\prod p_i^{\\max(\\alpha_i,\\beta_i)}.
    \\]
    Евклидов алгоритм: \\( \\gcd(a,b)=\\gcd(b,\\,a\\bmod b) \\) до нулевого остатка.
  </div>

</div>

<div class="section-badge badge-conclusion">Заключение</div>
<div class="conclusion">
  <p>
    Целые числа образуют основу для изучения арифметики и алгебры. Понимание структуры множества \\(\\mathbb{Z}\\), 
    принципов делимости и методов нахождения НОД/НОК критически важно для решения задач во всех разделах математики.
  </p>
  <p>
    Практическое применение этих знаний включает решение диофантовых уравнений, работу с дробями, анализ 
    периодичности функций и многие другие задачи математики и её приложений.
  </p>
</div>`
      }
    }
  },

 'algebraic-expressions': {
    courseId: 'oge-math',
    slug: 'algebraic-expressions',
    moduleNumber: 2,
    title: 'Модуль 2: Алгебраические выражения',
    subtitle: '5 тем • 15 видео • 5 статей • 14 упражнений',
    masteryPoints: 1500,
    skillsDescription: 'Навыки: Выражения, Степени, Многочлены, Дроби, Корни',
    topicMapping: ['2.1', '2.2', '2.3', '2.4', '2.5'],
    topics: [
      { id: 'literal-expressions', title: 'Буквенные выражения', videos: 3, articles: 1, exercises: 2 },
      { id: 'powers', title: 'Степени', videos: 3, articles: 1, exercises: 3 },
      { id: 'polynomials', title: 'Многочлены', videos: 3, articles: 1, exercises: 3 },
      // ↓ was 3, now 2
      { id: 'algebraic-fractions', title: 'Алгебраические дроби', videos: 3, articles: 1, exercises: 2 },
      { id: 'arithmetic-roots', title: 'Арифметические корни', videos: 3, articles: 1, exercises: 3 }
    ],
    quizzes: [
      { id: 'quiz-1', title: 'Тест 1', description: 'Повысьте уровень навыков и получите до 400 баллов мастерства' },
      { id: 'quiz-2', title: 'Тест 2', description: 'Повысьте уровень навыков и получите до 400 баллов мастерства' }
    ],
    orderedContent: [
      { type: 'topic', topicIndex: 0 },
      { type: 'topic', topicIndex: 1 },
      { type: 'quiz', quizIndex: 0 },
      { type: 'topic', topicIndex: 2 },
      { type: 'topic', topicIndex: 3 },
      { type: 'quiz', quizIndex: 1 },
      { type: 'topic', topicIndex: 4 },
      { type: 'quiz', isFinalTest: true }
    ],
    getExerciseData: (topicId: string, exerciseIndex: number) => {
      if (topicId === 'literal-expressions') {
        return exerciseIndex === 0
          ? { title: 'Буквенные выражения: подстановка и упрощение', skills: [35, 36] }
          : { title: 'Буквенные выражения: формулы и преобразования', skills: [37, 38] };
      }
      if (topicId === 'powers') {
        if (exerciseIndex === 0) return { title: 'Степени: свойства и упрощение', skills: [39, 40] };
        if (exerciseIndex === 1) return { title: 'Степени: степень произведения и дроби', skills: [41, 42, 43] };
        if (exerciseIndex === 2) return { title: 'Показательные выражения и сравнение', skills: [44] };
      }
      if (topicId === 'polynomials') {
        if (exerciseIndex === 0) return { title: 'Многочлены: приведение подобных', skills: [45, 46] };
        if (exerciseIndex === 1) return { title: 'Многочлены: разложение на множители', skills: [47, 48] };
        if (exerciseIndex === 2) return { title: 'Многочлены: формулы сокращённого умножения', skills: [49, 179] };
      }
      if (topicId === 'algebraic-fractions') {
        if (exerciseIndex === 0) return { title: 'Алгебраические дроби: сокращение и ОДЗ', skills: [50, 51] };
        if (exerciseIndex === 1) return { title: 'Алгебраические дроби: общий знаменатель, сложение/вычитание', skills: [52, 53] };
        // (exerciseIndex === 2) — удалено
      }
      if (topicId === 'arithmetic-roots') {
        if (exerciseIndex === 0) return { title: 'Корни: свойства и извлечение', skills: [54, 55] };
        if (exerciseIndex === 1) return { title: 'Корни: рационализация знаменателя', skills: [56] };
        if (exerciseIndex === 2) return { title: 'Смешанные выражения с корнями', skills: [57] };
      }
      return { title: `Упражнение ${exerciseIndex + 1}`, skills: [] };
    },
    getQuizData: (quizId: string) => {
      if (quizId === 'quiz-1') {
        return {
          title: 'Тест 1: Буквенные выражения и степени',
          skills: Array.from({ length: 10 }, (_, i) => 35 + i),
          questionCount: 6,
          isTest: true
        };
      }
      if (quizId === 'quiz-2') {
        return {
          title: 'Тест 2: Многочлены и алгебраические дроби',
          skills: [47, 48, 49, 50, 51, 52, 53, 179],
          questionCount: 6,
          isTest: true
        };
      }
      if (quizId === 'module-exam') {
        return {
          title: 'Итоговый экзамен модуля',
          skills: [...Array.from({ length: 23 }, (_, i) => 35 + i), 179],
          questionCount: 10,
          isExam: true
        };
      }
      return null;
    }
  },

  'equations-inequalities': {
    courseId: 'oge-math',
    slug: 'equations-inequalities',
    moduleNumber: 3,
    title: 'Модуль 3: Уравнения и неравенства',
    subtitle: '3 темы • 9 видео • 3 статьи • 13 упражнений',
    masteryPoints: 1350,
    skillsDescription: 'Навыки: Уравнения, Неравенства, Системы, Текстовые задачи',
    topicMapping: ['3.1', '3.2', '3.3'],
    topics: [
      { id: 'equations-systems', title: 'Уравнения и системы', videos: 3, articles: 1, exercises: 5 },
      { id: 'inequalities-systems', title: 'Неравенства и системы', videos: 3, articles: 1, exercises: 4 },
      { id: 'word-problems', title: 'Текстовые задачи', videos: 3, articles: 1, exercises: 4 }
    ],
    quizzes: [
      { id: 'quiz-1', title: 'Тест 1', description: 'Проверьте темы 3.1: Уравнения и системы' },
      { id: 'quiz-2', title: 'Тест 2', description: 'Проверьте темы 3.2: Неравенства и системы' },
      { id: 'quiz-3', title: 'Тест 3', description: 'Проверьте темы 3.3: Текстовые задачи' }
    ],
    orderedContent: [
      { type: 'topic', topicIndex: 0 },
      { type: 'quiz', quizIndex: 0 },
      { type: 'topic', topicIndex: 1 },
      { type: 'quiz', quizIndex: 1 },
      { type: 'topic', topicIndex: 2 },
      { type: 'quiz', quizIndex: 2 },
      { type: 'quiz', isFinalTest: true }
    ],
    getExerciseData: (topicId: string, exerciseIndex: number) => {
      if (topicId === 'equations-systems') {
        if (exerciseIndex === 0) return { title: 'Линейные/квадратные уравнения, системы — базовые', skills: [58, 59] };
        if (exerciseIndex === 1) return { title: 'Рациональные уравнения', skills: [60] };
        if (exerciseIndex === 2) return { title: 'Иррациональные/модульные уравнения', skills: [61] };
        if (exerciseIndex === 3) return { title: 'Рациональные системы уравнений', skills: [62] };
        if (exerciseIndex === 4) return { title: 'Параметры и продвинутые задачи*', skills: [188, 190, 191], isAdvanced: true };
      }
      if (topicId === 'inequalities-systems') {
        if (exerciseIndex === 0) return { title: 'Линейные/квадратные неравенства — базовые', skills: [63, 64] };
        if (exerciseIndex === 1) return { title: 'Рациональные неравенства', skills: [65] };
        if (exerciseIndex === 2) return { title: 'Иррациональные/модульные неравенства', skills: [66] };
        if (exerciseIndex === 3) return { title: 'Системы неравенств', skills: [67, 68] };
      }
      if (topicId === 'word-problems') {
        if (exerciseIndex === 0) return { title: 'Текстовые задачи на уравнение', skills: [69] };
        if (exerciseIndex === 1) return { title: 'Текстовые задачи: смеси, проценты, движение', skills: Array.from({ length: 5 }, (_, i) => 70 + i) };
        if (exerciseIndex === 2) return { title: 'Задачи на прогрессию и пропорции', skills: [75, 184] };
        if (exerciseIndex === 3) return { title: 'Сложные текстовые задачи*', skills: [185], isAdvanced: true };
      }
      return { title: `Упражнение ${exerciseIndex + 1}`, skills: [] };
    },
    getQuizData: (quizId: string) => {
      if (quizId === 'quiz-1') {
        return {
          title: 'Тест 1: Уравнения и системы',
          skills: Array.from({ length: 5 }, (_, i) => 58 + i),
          questionCount: 6,
          isTest: true
        };
      }
      if (quizId === 'quiz-2') {
        return {
          title: 'Тест 2: Неравенства и системы',
          skills: Array.from({ length: 6 }, (_, i) => 63 + i),
          questionCount: 6,
          isTest: true
        };
      }
      if (quizId === 'quiz-3') {
        return {
          title: 'Тест 3: Текстовые задачи',
          skills: [...Array.from({ length: 7 }, (_, i) => 69 + i), 184],
          questionCount: 6,
          isTest: true
        };
      }
      if (quizId === 'module-exam') {
        return {
          title: 'Итоговый экзамен модуля',
          skills: [...Array.from({ length: 18 }, (_, i) => 58 + i), 184],
          questionCount: 10,
          isExam: true
        };
      }
      return null;
    }
  },


  'sequences': {
    courseId: 'oge-math',
    slug: 'sequences',
    moduleNumber: 4,
    title: 'Модуль 4: Числовые последовательности',
    subtitle: '2 темы • 6 видео • 2 статьи • 7 упражнений',
    masteryPoints: 1650,
    skillsDescription: 'Навыки: Последовательности, Арифметическая прогрессия, Геометрическая прогрессия',
    topicMapping: ['4.1', '4.2'],
    topics: [
      { id: 'sequences', title: 'Последовательности', videos: 3, articles: 1, exercises: 2 },
      { id: 'progressions', title: 'Арифметическая и геометрическая прогрессии. Формула сложных процентов', videos: 3, articles: 1, exercises: 5 }
    ],
    quizzes: [
      { id: 'quiz-1', title: 'Тест 1: Арифметическая прогрессия', description: 'Проверьте навыки по арифметической прогрессии' },
      { id: 'quiz-2', title: 'Тест 2: Геометрическая прогрессия', description: 'Проверьте навыки по геометрической прогрессии' }
    ],
    orderedContent: [
      { type: 'topic', topicIndex: 0 },
      { type: 'topic', topicIndex: 1 },
      { type: 'quiz', quizIndex: 0 },
      { type: 'quiz', quizIndex: 1 },
      { type: 'quiz', isFinalTest: true }
    ],
    getExerciseData: (topicId: string, exerciseIndex: number) => {
      if (topicId === 'sequences') {
        if (exerciseIndex === 0) return { title: 'Основные последовательности', skills: [76, 77] };
        if (exerciseIndex === 1) return { title: 'Работа с последовательностями', skills: [78, 79] };
      }
      if (topicId === 'progressions') {
        if (exerciseIndex === 0) return { title: 'Введение в арифметическую прогрессию', skills: [80, 81, 82] };
        if (exerciseIndex === 1) return { title: 'Текстовые задачи на арифметическую прогрессию', skills: [83] };
        if (exerciseIndex === 2) return { title: 'Введение в геометрическую прогрессию', skills: [84, 85, 86] };
        if (exerciseIndex === 3) return { title: 'Текстовые задачи на геометрическую прогрессию', skills: [87] };
        if (exerciseIndex === 4) return { title: 'Сложные проценты', skills: [88] };
      }
      return { title: `Упражнение ${exerciseIndex + 1}`, skills: [] };
    },
    getQuizData: (quizId: string) => {
      if (quizId === 'quiz-1') {
        return {
          title: 'Тест 1: Арифметическая прогрессия',
          skills: [80, 81, 82, 83],
          questionCount: 6,
          isTest: true
        };
      }
      if (quizId === 'quiz-2') {
        return {
          title: 'Тест 2: Геометрическая прогрессия',
          skills: [84, 85, 86, 87],
          questionCount: 6,
          isTest: true
        };
      }
      if (quizId === 'module-exam') {
        return {
          title: 'Итоговый экзамен модуля',
          skills: Array.from({ length: 13 }, (_, i) => 76 + i), // 76–88
          questionCount: 10,
          isExam: true
        };
      }
      return null;
    }
  }, 


  'functions': {
    courseId: 'oge-math',
    slug: 'functions',
    moduleNumber: 5,
    title: 'Модуль 5: Функции',
    subtitle: '1 тема • 3 видео • 1 статья • 6 упражнений',
    masteryPoints: 1200,
    skillsDescription: 'Навыки: Свойства функций, Графики, Область определения, Монотонность',
    topicMapping: ['5.1'],
    topics: [
      { id: 'functions-properties', title: 'Свойства и графики функций', videos: 3, articles: 1, exercises: 6 }
    ],
    quizzes: [
      { id: 'quiz-1', title: 'Тест 1: Основные свойства функций', description: 'Проверьте навыки 89–94' },
      { id: 'quiz-2', title: 'Тест 2: Графики функций', description: 'Проверьте навыки 96–99' }
    ],
    orderedContent: [
      { type: 'topic', topicIndex: 0 },
      { type: 'quiz', quizIndex: 0 },
      { type: 'quiz', quizIndex: 1 },
      { type: 'quiz', isFinalTest: true }
    ],
    getExerciseData: (topicId: string, exerciseIndex: number) => {
      if (topicId === 'functions-properties') {
        if (exerciseIndex === 0) return { title: 'Функции — основы', skills: [89, 90] };
        if (exerciseIndex === 1) return { title: 'Свойства функций', skills: [91, 92] };
        if (exerciseIndex === 2) return { title: 'Область определения функций', skills: [93, 94] };
        if (exerciseIndex === 3) return { title: 'Графики функций', skills: [96, 97] };
        if (exerciseIndex === 4) return { title: 'Монотонность и экстремумы', skills: [98, 99] };
        if (exerciseIndex === 5) return { title: 'Сложные задачи по функциям', skills: [95, 186, 187, 100, 101, 102], isAdvanced: true };
      }
      return { title: `Упражнение ${exerciseIndex + 1}`, skills: [] };
    },
    getQuizData: (quizId: string) => {
      if (quizId === 'quiz-1') {
        return {
          title: 'Тест 1: Основные свойства функций',
          skills: [89, 90, 91, 92, 93, 94],
          questionCount: 6,
          isTest: true
        };
      }
      if (quizId === 'quiz-2') {
        return {
          title: 'Тест 2: Графики функций',
          skills: [96, 97, 98, 99],
          questionCount: 6,
          isTest: true
        };
      }
      if (quizId === 'module-exam') {
        return {
          title: 'Итоговый экзамен модуля',
          skills: [...Array.from({ length: 6 }, (_, i) => 89 + i), ...Array.from({ length: 4 }, (_, i) => 96 + i)], // 89–94, 96–99
          questionCount: 10,
          isExam: true
        };
      }
      return null;
    }
  },


  'coordinates': {
    courseId: 'oge-math',
    slug: 'coordinates',
    moduleNumber: 6,
    title: 'Модуль 6: Координаты на прямой и плоскости',
    subtitle: '2 темы • 6 видео • 2 статьи • 4 упражнения',
    masteryPoints: 900,
    skillsDescription: 'Навыки: Координатная прямая, Интервалы и неравенства, Координаты на плоскости',
    topicMapping: ['6.1', '6.2'],
    topics: [
      { id: 'coordinate-line', title: 'Координатная прямая', videos: 3, articles: 1, exercises: 3 },
      { id: 'cartesian-coordinates', title: 'Координаты на плоскости', videos: 3, articles: 1, exercises: 1 }
    ],
    quizzes: [
      { id: 'quiz-1', title: 'Тест 1: Координатная прямая', description: 'Проверьте навыки 103–109' }
    ],
    orderedContent: [
      { type: 'topic', topicIndex: 0 },
      { type: 'quiz', quizIndex: 0 },
      { type: 'topic', topicIndex: 1 },
      { type: 'quiz', isFinalTest: true }
    ],
    getExerciseData: (topicId: string, exerciseIndex: number) => {
      if (topicId === 'coordinate-line') {
        if (exerciseIndex === 0) return { title: 'Отметка точек и расстояния на прямой', skills: [103, 104] };
        if (exerciseIndex === 1) return { title: 'Модули, интервалы и неравенства', skills: [105, 106, 107] };
        if (exerciseIndex === 2) return { title: 'Сравнение и утверждения о числах', skills: [108, 109] };
      }
      if (topicId === 'cartesian-coordinates') {
        if (exerciseIndex === 0) return { title: 'Построение и расстояния на плоскости', skills: [110, 111] };
      }
      return { title: `Упражнение ${exerciseIndex + 1}`, skills: [] };
    },
    getQuizData: (quizId: string) => {
      if (quizId === 'quiz-1') {
        return {
          title: 'Тест 1: Координатная прямая',
          skills: [103, 104, 105, 106, 107, 108, 109],
          questionCount: 6,
          isTest: true
        };
      }
      if (quizId === 'module-exam') {
        return {
          title: 'Итоговый экзамен модуля',
          skills: Array.from({ length: 9 }, (_, i) => 103 + i), // 103–111
          questionCount: 10,
          isExam: true
        };
      }
      return null;
    }
  },


  'geometry': {
    courseId: 'oge-math',
    slug: 'geometry',
    moduleNumber: 7,
    title: 'Модуль 7: Геометрия',
    subtitle: '7 тем • 21 видео • 7 статей • 26 упражнений',
    masteryPoints: 3150,
    skillsDescription:
      'Навыки: Геометрические фигуры, Треугольники, Многоугольники, Окружности, Измерения, Векторы',
    topicMapping: ['7.1', '7.2', '7.3', '7.4', '7.5', '7.6', '7.7'],
    topics: [
      { id: 'geometric-figures', title: 'Геометрические фигуры', videos: 3, articles: 1, exercises: 3 },
      { id: 'triangles', title: 'Треугольники', videos: 3, articles: 1, exercises: 3 },
      { id: 'polygons', title: 'Многоугольники', videos: 3, articles: 1, exercises: 4 },
      { id: 'circles', title: 'Окружность и круг', videos: 3, articles: 1, exercises: 3 },
      { id: 'measurements', title: 'Измерения', videos: 3, articles: 1, exercises: 6 },
      { id: 'vectors', title: 'Векторы', videos: 3, articles: 1, exercises: 3 },
      { id: 'extra-geometry', title: 'Дополнительные темы по геометрии', videos: 3, articles: 1, exercises: 4 }
    ],
    quizzes: [
      { id: 'quiz-1', title: 'Тест 1: Базовая геометрия и треугольники', description: 'Проверьте навыки 7.1–7.2 (112–124)' },
      { id: 'quiz-2', title: 'Тест 2: Многоугольники и окружности', description: 'Проверьте навыки 7.3–7.4 (125–138)' },
      { id: 'quiz-3', title: 'Тест 3: Измерения и векторы', description: 'Проверьте навыки 7.5–7.6 (139–157)' }
    ],
    orderedContent: [
      { type: 'topic', topicIndex: 0 },
      { type: 'topic', topicIndex: 1 },
      { type: 'quiz', quizIndex: 0 },          // Test 1 (112–124)
      { type: 'topic', topicIndex: 2 },
      { type: 'topic', topicIndex: 3 },
      { type: 'quiz', quizIndex: 1 },          // Test 2 (125–138)
      { type: 'topic', topicIndex: 4 },
      { type: 'topic', topicIndex: 5 },
      { type: 'quiz', quizIndex: 2 },          // Test 3 (139–157)
      { type: 'topic', topicIndex: 6 },        // Доп. темы
      { type: 'quiz', isFinalTest: true }      // Final (112–157)
    ],
    getExerciseData: (topicId: string, exerciseIndex: number) => {
      // 7.1 Геометрические фигуры
      if (topicId === 'geometric-figures') {
        if (exerciseIndex === 0) return { title: 'Точки, прямые и отрезки', skills: [112] };
        if (exerciseIndex === 1) return { title: 'Базовые фигуры и измерение углов', skills: [112, 114] };
        if (exerciseIndex === 2) return { title: 'Параллельность, перпендикулярность и серединный перпендикуляр', skills: [115, 116] };
      }
  
      // 7.2 Треугольники
      if (topicId === 'triangles') {
        if (exerciseIndex === 0) return { title: 'Виды треугольников и элементы. Углы треугольника', skills: [117, 118, 119] };
        if (exerciseIndex === 1) return { title: 'Равенство и подобие. Неравенство треугольника', skills: [120, 121, 122] };
        if (exerciseIndex === 2) return { title: 'Прямоугольный треугольник: Пифагор и тригонометрия', skills: [123, 124] };
      }
  
      // 7.3 Многоугольники
      if (topicId === 'polygons') {
        if (exerciseIndex === 0) return { title: 'Виды, элементы и углы многоугольников', skills: [125, 126, 127] };
        if (exerciseIndex === 1) return { title: 'Правильные многоугольники и разбиения', skills: [128, 129] };
        if (exerciseIndex === 2) return { title: 'Четырёхугольники: прямоугольник, ромб, квадрат', skills: [130, 131, 132] };
        if (exerciseIndex === 3) return { title: 'Параллелограмм и трапеция', skills: [133, 134] };
      }
  
      // 7.4 Окружность и круг
      if (topicId === 'circles') {
        if (exerciseIndex === 0) return { title: 'Элементы окружности и круга', skills: [135] };
        if (exerciseIndex === 1) return { title: 'Центральные и вписанные углы', skills: [136] };
        if (exerciseIndex === 2) return { title: 'Вписанные и описанные фигуры', skills: [137, 138] };
      }
  
      // 7.5 Измерения
      if (topicId === 'measurements') {
        if (exerciseIndex === 0) return { title: 'Длины: отрезки, ломаные, окружности', skills: [139, 140, 141, 142] };
        if (exerciseIndex === 1) return { title: 'Градусы и дуги окружности', skills: [143, 144] };
        if (exerciseIndex === 2) return { title: 'Площадь прямоугольника', skills: [146] }; // 146–146 → 146
        if (exerciseIndex === 3) return { title: 'Площади: параллелограмм, трапеция, треугольник', skills: [147, 148, 149] };
        if (exerciseIndex === 4) return { title: 'Площадь круга и его частей', skills: [150] };
        if (exerciseIndex === 5) return { title: '★ Продвинутое: площади, объёмы и решётка', skills: [151, 152, 153], isAdvanced: true };
      }
  
      // 7.6 Векторы
      if (topicId === 'vectors') {
        if (exerciseIndex === 0) return { title: 'Векторы: направление, длина и координаты', skills: [154, 155] };
        if (exerciseIndex === 1) return { title: 'Операции с векторами: сложение/вычитание, умножение на число', skills: [156, 157] };
        if (exerciseIndex === 2) return { title: '★ Продвинутое: скалярное произведение', skills: [196], isAdvanced: true };
      }
  
      // 7.7 Дополнительные темы (для высоко мотивированных)
      if (topicId === 'extra-geometry') {
        if (exerciseIndex === 0) return { title: 'Дополнительно: анализ геометрических высказываний', skills: [158], isAdvanced: true };
        if (exerciseIndex === 1) return { title: 'Дополнительно: работа с чертежами', skills: [159], isAdvanced: true };
        if (exerciseIndex === 2) return { title: 'Дополнительно: задачи на доказательство', skills: [160], isAdvanced: true };
        if (exerciseIndex === 3) return { title: '★ Дополнительно: задачи повышенной сложности', skills: [161], isAdvanced: true };
      }
  
      return { title: `Упражнение ${exerciseIndex + 1}`, skills: [] };
    },
    getQuizData: (quizId: string) => {
      if (quizId === 'quiz-1') {
        // 7.1–7.2 → 112–124
        return {
          title: 'Тест 1: Базовая геометрия и треугольники',
          skills: Array.from({ length: 13 }, (_, i) => 112 + i), // 112..124
          questionCount: 6,
          isTest: true
        };
      }
      if (quizId === 'quiz-2') {
        // 7.3–7.4 → 125–138
        return {
          title: 'Тест 2: Многоугольники и окружности',
          skills: Array.from({ length: 14 }, (_, i) => 125 + i), // 125..138
          questionCount: 6,
          isTest: true
        };
      }
      if (quizId === 'quiz-3') {
        // 7.5–7.6 → 139–157
        return {
          title: 'Тест 3: Измерения и векторы',
          skills: Array.from({ length: 19 }, (_, i) => 139 + i), // 139..157
          questionCount: 6,
          isTest: true
        };
      }
      if (quizId === 'module-exam') {
        // Final exam: 112–157
        return {
          title: 'Итоговый экзамен модуля',
          skills: Array.from({ length: 46 }, (_, i) => 112 + i), // 112..157
          questionCount: 10,
          isExam: true
        };
      }
      return null;
    }
  },  


  'probability-statistics': {
    courseId: 'oge-math',
    slug: 'probability-statistics',
    moduleNumber: 8,
    title: 'Модуль 8: Вероятность и статистика',
    subtitle: '5 тем • 15 видео • 5 статей • 11 упражнений',
    masteryPoints: 1350,
    skillsDescription: 'Навыки: Статистика, Вероятность, Комбинаторика, Множества, Графы',
    topicMapping: ['8.1', '8.2', '8.3', '8.4', '8.5'],
    topics: [
      { id: 'descriptive-stats', title: 'Описательная статистика', videos: 3, articles: 1, exercises: 3 },
      { id: 'probability', title: 'Вероятность', videos: 3, articles: 1, exercises: 2 },
      { id: 'combinatorics', title: 'Комбинаторика', videos: 3, articles: 1, exercises: 2 },
      { id: 'sets', title: 'Множества', videos: 3, articles: 1, exercises: 2 },
      { id: 'graphs', title: 'Графы', videos: 3, articles: 1, exercises: 2 }
    ],
    quizzes: [
      { id: 'quiz-1', title: 'Тест 1', description: 'Статистика и вероятность (162–168)' },
      { id: 'quiz-2', title: 'Тест 2', description: 'Комбинаторика и множества (169–174)' }
    ],
    orderedContent: [
      { type: 'topic', topicIndex: 0 }, // 8.1
      { type: 'topic', topicIndex: 1 }, // 8.2
      { type: 'quiz', quizIndex: 0 },   // Test 1 (162–168)
      { type: 'topic', topicIndex: 2 }, // 8.3
      { type: 'topic', topicIndex: 3 }, // 8.4
      { type: 'quiz', quizIndex: 1 },   // Test 2 (169–174)
      { type: 'topic', topicIndex: 4 }  // 8.5 (Графы)
    ],
    getExerciseData: (topicId: string, exerciseIndex: number) => {
      // 8.1 Описательная статистика
      if (topicId === 'descriptive-stats') {
        if (exerciseIndex === 0) return { title: 'Сбор данных, таблицы и диаграммы', skills: [162, 163] };
        if (exerciseIndex === 1) return { title: 'Среднее арифметическое', skills: [164] };
        if (exerciseIndex === 2) return { title: 'Мода и медиана', skills: [165] };
      }
  
      // 8.2 Вероятность
      if (topicId === 'probability') {
        if (exerciseIndex === 0) return { title: 'События и простые вероятности', skills: [166, 167] };
        if (exerciseIndex === 1) return { title: 'Формулы вероятности в задачах', skills: [168] };
      }
  
      // 8.3 Комбинаторика
      if (topicId === 'combinatorics') {
        if (exerciseIndex === 0) return { title: 'Перестановки и размещения', skills: [169, 170] };
        if (exerciseIndex === 1) return { title: 'Сочетания и подсчёт по формулам', skills: [171, 172] };
      }
  
      // 8.4 Множества
      if (topicId === 'sets') {
        if (exerciseIndex === 0) return { title: 'Операции с множествами', skills: [173] };
        if (exerciseIndex === 1) return { title: 'Диаграммы Эйлера–Венна', skills: [174] };
      }
  
      // 8.5 Графы
      if (topicId === 'graphs') {
        if (exerciseIndex === 0) return { title: 'Графы: вершины и рёбра', skills: [175] };      // 175–175
        if (exerciseIndex === 1) return { title: 'Поиск путей и прикладные задачи', skills: [177, 178] };
      }
  
      return { title: `Упражнение ${exerciseIndex + 1}`, skills: [] };
    },
    getQuizData: (quizId: string) => {
      if (quizId === 'quiz-1') {
        // 162–168
        return {
          title: 'Тест 1: Описательная статистика и вероятность',
          skills: Array.from({ length: 7 }, (_, i) => 162 + i), // 162..168
          questionCount: 6,
          isTest: true
        };
      }
      if (quizId === 'quiz-2') {
        // 169–174
        return {
          title: 'Тест 2: Комбинаторика и множества',
          skills: Array.from({ length: 6 }, (_, i) => 169 + i), // 169..174
          questionCount: 6,
          isTest: true
        };
      }
      return null;
    }
  },  


  'applied-math': {
    courseId: 'oge-math',
    slug: 'applied-math',
    moduleNumber: 9,
    title: 'Модуль 9: Прикладная математика',
    subtitle: '2 темы • 6 видео • 2 статьи • 12 упражнений',
    masteryPoints: 900,
    skillsDescription: 'Навыки: Чтение графиков/таблиц, работа с данными, прикладные расчёты и графики',
    topicMapping: ['9.1', '9.2'],
    topics: [
      { id: 'applied-tasks', title: 'Прикладные задачи', videos: 3, articles: 1, exercises: 3 },
      { id: 'graphs-calculations', title: 'Графики и расчёты', videos: 3, articles: 1, exercises: 9 }
    ],
    quizzes: [
      // нет промежуточных тестов; только итоговый
    ],
    orderedContent: [
      { type: 'topic', topicIndex: 0 }, // 9.1
      { type: 'topic', topicIndex: 1 }, // 9.2
      { type: 'quiz', isFinalTest: true } // Итоговый тест модуля
    ],
    getExerciseData: (topicId: string, exerciseIndex: number) => {
      // 9.1 — Прикладные задачи (групповые тренировки)
      if (topicId === 'applied-tasks') {
        if (exerciseIndex === 0)
          return {
            title: 'Чтение графиков и диаграмм',
            skills: [24, 25, 198] // графики, диаграммы, таблицы
          };
        if (exerciseIndex === 1)
          return {
            title: 'Извлечение данных и переводы величин',
            skills: [199, 181, 192] // расписания/таблицы→продолжительность, извлечение данных, единицы измерения
          };
        if (exerciseIndex === 2)
          return {
            title: 'Стратегии решения и построение графиков',
            skills: [182, 183, 200] // краткая запись, анализ ошибок, построение по таблице
          };
      }
  
      // 9.2 — Графики и расчёты (каждый навык — отдельное упражнение)
      if (topicId === 'graphs-calculations') {
        const exercises = [
          { title: 'Квартиры: анализ и расчёты', skills: [26] },
          { title: 'Маршруты и карты: чтение схем', skills: [27] },
          { title: 'ОСАГО: расчёт страховых выплат', skills: [28] },
          { title: 'Тарифные планы: сравнение и выбор', skills: [29] },
          { title: 'Лист бумаги: форматы и разметка', skills: [30] },
          { title: 'Печи: режимы, расход, эффективность', skills: [31] },
          { title: 'Шины: параметры и подбор', skills: [32] },
          { title: 'Участки: размеры и планировка', skills: [33] },
          { title: 'Теплицы: площади и материалы', skills: [34] }
        ];
        return exercises[exerciseIndex] || { title: `Упражнение ${exerciseIndex + 1}`, skills: [] };
      }
  
      return { title: `Упражнение ${exerciseIndex + 1}`, skills: [] };
    },
    getQuizData: (quizId: string) => {
      if (quizId === 'module-exam') {
        // Итоговый экзамен: все указанные навыки
        return {
          title: 'Итоговый экзамен модуля',
          skills: [
            24, 25, 198, // графики/диаграммы/таблицы
            199, 181, 192, // расписания, извлечение данных, единицы
            182, 183, 200, // стратегии, анализ ошибок, построение графиков
            26, 27, 28, 29, 30, 31, 32, 33, 34 // прикладные задачи 9.2
          ],
          questionCount: 10,
          isExam: true
        };
      }
      return null;
    }
  }

};

export type { ModuleConfig, TopicContent, QuizContent, ExerciseConfig };
