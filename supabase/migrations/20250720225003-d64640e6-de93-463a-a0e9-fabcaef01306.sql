
-- Update student skills for user ae47de5d-cde4-4ddd-8f41-7e624532ab0c
-- Setting skills to reflect 76% overall completion with realistic patterns

UPDATE student_skills 
SET 
  -- Topic 1.1: Натуральные и целые числа (skills 1-5) - Strong foundation: 85-95%
  skill_1 = 90, skill_2 = 85, skill_3 = 95, skill_4 = 88, skill_5 = 92,
  
  -- Topic 1.2: Дроби и проценты (skills 6-10) - Good: 80-90%
  skill_6 = 85, skill_7 = 82, skill_8 = 88, skill_9 = 90, skill_10 = 86,
  
  -- Topic 1.3: Рациональные числа (skills 11-17, 180) - Average: 70-80%
  skill_11 = 75, skill_12 = 78, skill_13 = 72, skill_14 = 80, skill_15 = 76, skill_16 = 74, skill_17 = 77, skill_180 = 73,
  
  -- Topic 1.4: Действительные числа (skills 18-20) - Weaker area: 60-70%
  skill_18 = 65, skill_19 = 62, skill_20 = 68,
  
  -- Topic 1.5: Приближённые вычисления (skills 21-23) - Average: 70-75%
  skill_21 = 72, skill_22 = 74, skill_23 = 70,
  
  -- Topic 1.6: Работа с данными и графиками (skills 24-31) - Good: 80-85%
  skill_24 = 82, skill_25 = 84, skill_26 = 80, skill_27 = 85, skill_28 = 83, skill_29 = 81, skill_30 = 86, skill_31 = 84,
  
  -- Topic 1.7: Прикладная геометрия (skills 32-34) - Average: 75%
  skill_32 = 75, skill_33 = 76, skill_34 = 74,
  
  -- Topic 2.1: Буквенные выражения (skills 35-38) - Good: 80-85%
  skill_35 = 82, skill_36 = 84, skill_37 = 80, skill_38 = 83,
  
  -- Topic 2.2: Степени (skills 39-44) - Strong: 85-90%
  skill_39 = 88, skill_40 = 90, skill_41 = 86, skill_42 = 89, skill_43 = 87, skill_44 = 85,
  
  -- Topic 2.3: Многочлены (skills 45-49, 179) - Average: 70-80%
  skill_45 = 75, skill_46 = 78, skill_47 = 72, skill_48 = 80, skill_49 = 76, skill_179 = 74,
  
  -- Topic 2.4: Алгебраические дроби (skills 50-53) - Challenging: 65-75%
  skill_50 = 68, skill_51 = 72, skill_52 = 65, skill_53 = 70,
  
  -- Topic 2.5: Арифметические корни (skills 54-57) - Weak area: 55-65%
  skill_54 = 58, skill_55 = 62, skill_56 = 55, skill_57 = 60,
  
  -- Topic 3.1: Уравнения и системы (skills 58-62) - Good: 80-85%
  skill_58 = 82, skill_59 = 84, skill_60 = 80, skill_61 = 85, skill_62 = 83,
  
  -- Topic 3.2: Неравенства (skills 63-68) - Average: 70-75%
  skill_63 = 72, skill_64 = 74, skill_65 = 70, skill_66 = 75, skill_67 = 73, skill_68 = 71,
  
  -- Topic 3.3: Текстовые задачи (skills 69-75) - Challenging: 60-70%
  skill_69 = 65, skill_70 = 62, skill_71 = 68, skill_72 = 60, skill_73 = 66, skill_74 = 64, skill_75 = 67,
  
  -- Topic 4.1: Последовательности (skills 76-79) - Average: 70-75%
  skill_76 = 72, skill_77 = 74, skill_78 = 70, skill_79 = 73,
  
  -- Topic 4.2: Прогрессии (skills 80-88) - Good: 80-85%
  skill_80 = 82, skill_81 = 84, skill_82 = 80, skill_83 = 85, skill_84 = 83, skill_85 = 81, skill_86 = 86, skill_87 = 84, skill_88 = 82,
  
  -- Topic 5.1: Функции (skills 89-102) - Strong area: 85-95%
  skill_89 = 90, skill_90 = 88, skill_91 = 92, skill_92 = 85, skill_93 = 94, skill_94 = 89, skill_95 = 91, skill_96 = 87, skill_97 = 93, skill_98 = 86, skill_99 = 95, skill_100 = 88, skill_101 = 90, skill_102 = 92,
  
  -- Topic 6.1: Координатная прямая (skills 103-109) - Good: 80-85%
  skill_103 = 82, skill_104 = 84, skill_105 = 80, skill_106 = 85, skill_107 = 83, skill_108 = 81, skill_109 = 86,
  
  -- Topic 6.2: Декартовы координаты (skills 110-111) - Good: 80%
  skill_110 = 80, skill_111 = 82,
  
  -- Topic 7.1: Геометрические фигуры (skills 112-116) - Average: 75%
  skill_112 = 75, skill_113 = 76, skill_114 = 74, skill_115 = 77, skill_116 = 73,
  
  -- Topic 7.2: Треугольники (skills 117-124) - Good: 80-85%
  skill_117 = 82, skill_118 = 84, skill_119 = 80, skill_120 = 85, skill_121 = 83, skill_122 = 81, skill_123 = 86, skill_124 = 84,
  
  -- Topic 7.3: Многоугольники (skills 125-134) - Average: 70-80%
  skill_125 = 75, skill_126 = 78, skill_127 = 72, skill_128 = 80, skill_129 = 76, skill_130 = 74, skill_131 = 77, skill_132 = 73, skill_133 = 79, skill_134 = 71,
  
  -- Topic 7.4: Окружность и круг (skills 135-138) - Weak area: 60-70%
  skill_135 = 65, skill_136 = 62, skill_137 = 68, skill_138 = 60,
  
  -- Topic 7.5: Измерения (skills 139-153) - Average: 70-80%
  skill_139 = 75, skill_140 = 78, skill_141 = 72, skill_142 = 80, skill_143 = 76, skill_144 = 74, skill_145 = 77, skill_146 = 73, skill_147 = 79, skill_148 = 71, skill_149 = 76, skill_150 = 78, skill_151 = 74, skill_152 = 72, skill_153 = 75,
  
  -- Topic 7.6: Векторы (skills 154-157) - Challenging: 55-65%
  skill_154 = 58, skill_155 = 62, skill_156 = 55, skill_157 = 60,
  
  -- Topic 7.7: Дополнительные темы геометрии (skills 158-161) - Weak: 50-60%
  skill_158 = 52, skill_159 = 58, skill_160 = 50, skill_161 = 55,
  
  -- Topic 8.1: Описательная статистика (skills 162-165) - Good: 80-85%
  skill_162 = 82, skill_163 = 84, skill_164 = 80, skill_165 = 85,
  
  -- Topic 8.2: Вероятность (skills 166-168) - Average: 70-75%
  skill_166 = 72, skill_167 = 74, skill_168 = 70,
  
  -- Topic 8.3: Комбинаторика (skills 169-172) - Challenging: 60-70%
  skill_169 = 65, skill_170 = 62, skill_171 = 68, skill_172 = 60,
  
  -- Topic 8.4: Множества (skills 173-174) - Average: 75%
  skill_173 = 75, skill_174 = 76,
  
  -- Topic 8.5: Графы (skills 175-178) - Weak area: 55-65%
  skill_175 = 58, skill_176 = 62, skill_177 = 55, skill_178 = 60,
  
  -- Special skills (1001-1004) - Not covered: 0%
  -- These are already set to 0 by default, so no need to update them
  
  -- Set remaining skills to 0 (skills that don't exist in the mapping)
  skill_181 = 0
  
WHERE uid = 'ae47de5d-cde4-4ddd-8f41-7e624532ab0c';
