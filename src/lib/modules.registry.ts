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
    slug: 'algebraic-expressions',
    moduleNumber: 2,
    title: 'Модуль 2: Алгебраические выражения',
    subtitle: '5 тем • 15 видео • 5 статей • 15 упражнений',
    masteryPoints: 1500,
    skillsDescription: 'Навыки: Выражения, Степени, Многочлены, Дроби, Корни',
    topicMapping: ['2.1', '2.2', '2.3', '2.4', '2.5'],
    topics: [
      { id: 'literal-expressions', title: 'Буквенные выражения', videos: 3, articles: 1, exercises: 2 },
      { id: 'powers', title: 'Степени', videos: 3, articles: 1, exercises: 3 },
      { id: 'polynomials', title: 'Многочлены', videos: 3, articles: 1, exercises: 3 },
      { id: 'algebraic-fractions', title: 'Алгебраические дроби', videos: 3, articles: 1, exercises: 3 },
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
          ? { title: 'Буквенные выражения 1', skills: [35, 36] }
          : { title: 'Буквенные выражения 2', skills: [37, 38] };
      }
      if (topicId === 'powers') {
        if (exerciseIndex === 0) return { title: 'Степени 1', skills: [39, 40] };
        if (exerciseIndex === 1) return { title: 'Степени 2', skills: [41, 42, 43] };
        if (exerciseIndex === 2) return { title: 'Степени 3', skills: [44] };
      }
      if (topicId === 'polynomials') {
        if (exerciseIndex === 0) return { title: 'Многочлены 1', skills: [45, 46] };
        if (exerciseIndex === 1) return { title: 'Многочлены 2', skills: [47, 48] };
        if (exerciseIndex === 2) return { title: 'Многочлены 3', skills: [49, 179] };
      }
      if (topicId === 'algebraic-fractions') {
        if (exerciseIndex === 0) return { title: 'Алгебраические дроби 1', skills: [50, 51] };
        if (exerciseIndex === 1) return { title: 'Алгебраические дроби 2', skills: [52, 53] };
        if (exerciseIndex === 2) return { title: 'Алгебраические дроби 3', skills: [] };
      }
      if (topicId === 'arithmetic-roots') {
        if (exerciseIndex === 0) return { title: 'Арифметические корни 1', skills: [54, 55] };
        if (exerciseIndex === 1) return { title: 'Арифметические корни 2', skills: [56] };
        if (exerciseIndex === 2) return { title: 'Арифметические корни 3', skills: [57] };
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
    slug: 'equations-inequalities',
    moduleNumber: 3,
    title: 'Модуль 3: Уравнения и неравенства',
    subtitle: '3 темы • 9 видео • 3 статьи • 13 упражнений',
    masteryPoints: 1350,
    skillsDescription: 'Навыки: Уравнения, Неравенства, Системы, Текстовые задачи',
    topicMapping: ['3.1', '3.2', '3.3'],
    topics: [
      // 3.1: Уравнения и системы — 5 упражнений
      { id: 'equations-systems', title: 'Уравнения и системы', videos: 3, articles: 1, exercises: 5 },
      // 3.2: Неравенства и системы — 4 упражнения
      { id: 'inequalities-systems', title: 'Неравенства и системы', videos: 3, articles: 1, exercises: 4 },
      // 3.3: Текстовые задачи — 4 упражнения
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
      // 0-based indices -> exercise # = index + 1
      if (topicId === 'equations-systems') {
        // ex1: 58,59; ex2: 60; ex3: 61; ex4: 62; ex5*: 188,190,191
        if (exerciseIndex === 0) return { title: 'Уравнения и системы — 1', skills: [58, 59] };
        if (exerciseIndex === 1) return { title: 'Уравнения и системы — 2', skills: [60] };
        if (exerciseIndex === 2) return { title: 'Уравнения и системы — 3', skills: [61] };
        if (exerciseIndex === 3) return { title: 'Уравнения и системы — 4', skills: [62] };
        if (exerciseIndex === 4) return { title: 'Уравнения и системы — 5', skills: [188, 190, 191], isAdvanced: true };
      }
      if (topicId === 'inequalities-systems') {
        // ex1: 63,64; ex2: 65; ex3: 66; ex4: 67,68
        if (exerciseIndex === 0) return { title: 'Неравенства и системы — 1', skills: [63, 64] };
        if (exerciseIndex === 1) return { title: 'Неравенства и системы — 2', skills: [65] };
        if (exerciseIndex === 2) return { title: 'Неравенства и системы — 3', skills: [66] };
        if (exerciseIndex === 3) return { title: 'Неравенства и системы — 4', skills: [67, 68] };
      }
      if (topicId === 'word-problems') {
        // ex1: 69; ex2: 70-74; ex3: 75,184; ex4*: 185
        if (exerciseIndex === 0) return { title: 'Текстовые задачи — 1', skills: [69] };
        if (exerciseIndex === 1) return { title: 'Текстовые задачи — 2', skills: Array.from({ length: 5 }, (_, i) => 70 + i) };
        if (exerciseIndex === 2) return { title: 'Текстовые задачи — 3', skills: [75, 184] };
        if (exerciseIndex === 3) return { title: 'Текстовые задачи — 4', skills: [185], isAdvanced: true };
      }
      return { title: `Упражнение ${exerciseIndex + 1}`, skills: [] };
    },
    getQuizData: (quizId: string) => {
      if (quizId === 'quiz-1') {
        // test1: 58–62
        return {
          title: 'Тест 1: Уравнения и системы',
          skills: Array.from({ length: 5 }, (_, i) => 58 + i), // 58..62
          questionCount: 6,
          isTest: true
        };
      }
      if (quizId === 'quiz-2') {
        // test2: 63–68
        return {
          title: 'Тест 2: Неравенства и системы',
          skills: Array.from({ length: 6 }, (_, i) => 63 + i), // 63..68
          questionCount: 6,
          isTest: true
        };
      }
      if (quizId === 'quiz-3') {
        // test3: 69–75, 184
        return {
          title: 'Тест 3: Текстовые задачи',
          skills: [...Array.from({ length: 7 }, (_, i) => 69 + i), 184], // 69..75, 184
          questionCount: 6,
          isTest: true
        };
      }
      if (quizId === 'module-exam') {
        // Final exam: 58–75, 184
        return {
          title: 'Итоговый экзамен модуля',
          skills: [...Array.from({ length: 18 }, (_, i) => 58 + i), 184], // 58..75, 184
          questionCount: 10,
          isExam: true
        };
      }
      return null;
    }
  },


  'sequences': {
    slug: 'sequences',
    moduleNumber: 4,
    title: 'Модуль 4: Числовые последовательности',
    subtitle: '2 темы • 6 видео • 2 статьи • 6 упражнений',
    masteryPoints: 900,
    skillsDescription: 'Навыки: Последовательности, Арифметическая прогрессия, Геометрическая прогрессия',
    topicMapping: ['4.1', '4.2'],
    topics: [
      { id: 'sequences', title: 'Последовательности', videos: 3, articles: 1, exercises: 3 },
      { id: 'progressions', title: 'Арифметическая и геометрическая прогрессии. Формула сложных процентов', videos: 3, articles: 1, exercises: 3 }
    ],
    quizzes: [
      { id: 'quiz-1', title: 'Тест 1', description: 'Повысьте уровень навыков и получите до 400 баллов мастерства' }
    ],
    orderedContent: [
      { type: 'topic', topicIndex: 0 },
      { type: 'topic', topicIndex: 1 },
      { type: 'quiz', quizIndex: 0 },
      { type: 'quiz', isFinalTest: true }
    ]
  },

  'functions': {
    slug: 'functions',
    moduleNumber: 5,
    title: 'Модуль 5: Функции',
    subtitle: '1 тема • 3 видео • 1 статья • 3 упражнения',
    masteryPoints: 450,
    skillsDescription: 'Навыки: Свойства функций, Графики, Область определения, Монотонность',
    topicMapping: ['5.1'],
    topics: [
      { id: 'functions-properties', title: 'Свойства и графики функций', videos: 3, articles: 1, exercises: 3 }
    ],
    quizzes: [
      { id: 'quiz-1', title: 'Тест 1', description: 'Повысьте уровень навыков и получите до 400 баллов мастерства' }
    ],
    orderedContent: [
      { type: 'topic', topicIndex: 0 },
      { type: 'quiz', quizIndex: 0 },
      { type: 'quiz', isFinalTest: true }
    ]
  },

  'coordinates': {
    slug: 'coordinates',
    moduleNumber: 6,
    title: 'Модуль 6: Координаты на прямой и плоскости',
    subtitle: '2 темы • 6 видео • 2 статьи • 6 упражнений',
    masteryPoints: 900,
    skillsDescription: 'Навыки: Координатная прямая, Декартовы координаты',
    topicMapping: ['6.1', '6.2'],
    topics: [
      { id: 'coordinate-line', title: 'Координатная прямая', videos: 3, articles: 1, exercises: 3 },
      { id: 'cartesian-coordinates', title: 'Декартовы координаты', videos: 3, articles: 1, exercises: 3 }
    ],
    quizzes: [
      { id: 'quiz-1', title: 'Тест 1', description: 'Повысьте уровень навыков и получите до 400 баллов мастерства' }
    ],
    orderedContent: [
      { type: 'topic', topicIndex: 0 },
      { type: 'topic', topicIndex: 1 },
      { type: 'quiz', quizIndex: 0 },
      { type: 'quiz', isFinalTest: true }
    ]
  },

  'geometry': {
    slug: 'geometry',
    moduleNumber: 7,
    title: 'Модуль 7: Геометрия',
    subtitle: '7 тем • 21 видео • 7 статей • 21 упражнение',
    masteryPoints: 3150,
    skillsDescription: 'Навыки: Геометрические фигуры, Треугольники, Многоугольники, Окружности, Измерения, Векторы',
    topicMapping: ['7.1', '7.2', '7.3', '7.4', '7.5', '7.6', '7.7'],
    topics: [
      { id: 'geometric-figures', title: 'Геометрические фигуры', videos: 3, articles: 1, exercises: 3 },
      { id: 'triangles', title: 'Треугольники', videos: 3, articles: 1, exercises: 3 },
      { id: 'polygons', title: 'Многоугольники', videos: 3, articles: 1, exercises: 3 },
      { id: 'circles', title: 'Окружность и круг', videos: 3, articles: 1, exercises: 3 },
      { id: 'measurements', title: 'Измерения', videos: 3, articles: 1, exercises: 3 },
      { id: 'vectors', title: 'Векторы', videos: 3, articles: 1, exercises: 3 },
      { id: 'additional-geometry', title: 'Дополнительные темы по геометрии', videos: 3, articles: 1, exercises: 3 }
    ],
    quizzes: [
      { id: 'quiz-1', title: 'Тест 1', description: 'Повысьте уровень навыков и получите до 400 баллов мастерства' },
      { id: 'quiz-2', title: 'Тест 2', description: 'Повысьте уровень навыков и получите до 400 баллов мастерства' },
      { id: 'quiz-3', title: 'Тест 3', description: 'Повысьте уровень навыков и получите до 400 баллов мастерства' }
    ],
    orderedContent: [
      { type: 'topic', topicIndex: 0 },
      { type: 'topic', topicIndex: 1 },
      { type: 'quiz', quizIndex: 0 },
      { type: 'topic', topicIndex: 2 },
      { type: 'topic', topicIndex: 3 },
      { type: 'quiz', quizIndex: 1 },
      { type: 'topic', topicIndex: 4 },
      { type: 'topic', topicIndex: 5 },
      { type: 'quiz', quizIndex: 2 },
      { type: 'topic', topicIndex: 6 },
      { type: 'quiz', isFinalTest: true }
    ]
  },

  'probability-statistics': {
    slug: 'probability-statistics',
    moduleNumber: 8,
    title: 'Модуль 8: Вероятность и статистика',
    subtitle: '3 темы • 9 видео • 3 статьи • 9 упражнений',
    masteryPoints: 1350,
    skillsDescription: 'Навыки: Статистика, Вероятность, Комбинаторика',
    topicMapping: ['8.1', '8.2', '8.3'],
    topics: [
      { id: 'statistics', title: 'Статистика', videos: 3, articles: 1, exercises: 3 },
      { id: 'probability', title: 'Вероятность', videos: 3, articles: 1, exercises: 3 },
      { id: 'combinatorics', title: 'Комбинаторика', videos: 3, articles: 1, exercises: 3 }
    ],
    quizzes: [
      { id: 'quiz-1', title: 'Тест 1', description: 'Повысьте уровень навыков и получите до 400 баллов мастерства' },
      { id: 'quiz-2', title: 'Тест 2', description: 'Повысьте уровень навыков и получите до 400 баллов мастерства' }
    ],
    orderedContent: [
      { type: 'topic', topicIndex: 0 },
      { type: 'quiz', quizIndex: 0 },
      { type: 'topic', topicIndex: 1 },
      { type: 'topic', topicIndex: 2 },
      { type: 'quiz', quizIndex: 1 },
      { type: 'quiz', isFinalTest: true }
    ]
  },

  'applied-math': {
    slug: 'applied-math',
    moduleNumber: 9,
    title: 'Модуль 9: Прикладная математика',
    subtitle: '2 темы • 6 видео • 2 статьи • 6 упражнений',
    masteryPoints: 900,
    skillsDescription: 'Навыки: Графики, Расчёты, Оценка величин',
    topicMapping: ['9.1', '9.2'],
    topics: [
      { id: 'applied-tasks', title: 'Прикладные задачи', videos: 3, articles: 1, exercises: 3 },
      { id: 'graphs-calculations', title: 'Графики и расчёты', videos: 3, articles: 1, exercises: 3 }
    ],
    quizzes: [
      { id: 'quiz-1', title: 'Тест 1', description: 'Повысьте уровень навыков и получите до 400 баллов мастерства' }
    ],
    orderedContent: [
      { type: 'topic', topicIndex: 0 },
      { type: 'topic', topicIndex: 1 },
      { type: 'quiz', quizIndex: 0 },
      { type: 'quiz', isFinalTest: true }
    ]
  }
};

export type { ModuleConfig, TopicContent, QuizContent, ExerciseConfig };
