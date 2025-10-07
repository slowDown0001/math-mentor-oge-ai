// src/lib/topic-routing.ts
import { modulesRegistry } from "@/lib/modules.registry";

export type TopicRoute = {
  topicNumber: string;
  topicName?: string;
  moduleSlug: string;
  moduleTitle: string;
  topicId: string;
  topicTitle: string;
};

// Topic name to number mapping
const TOPIC_NAME_NUMBER_MAP = [
  { "topic_name": "Натуральные и целые числа", "topic_number": "1.1" },
  { "topic_name": "Дроби и проценты", "topic_number": "1.2" },
  { "topic_name": "Рациональные числа и арифметические действия", "topic_number": "1.3" },
  { "topic_name": "Действительные числа", "topic_number": "1.4" },
  { "topic_name": "Приближённые вычисления", "topic_number": "1.5" },
  { "topic_name": "Буквенные выражения", "topic_number": "2.1" },
  { "topic_name": "Степени", "topic_number": "2.2" },
  { "topic_name": "Многочлены", "topic_number": "2.3" },
  { "topic_name": "Алгебраические дроби", "topic_number": "2.4" },
  { "topic_name": "Арифметические корни", "topic_number": "2.5" },
  { "topic_name": "Уравнения и системы", "topic_number": "3.1" },
  { "topic_name": "Неравенства и системы", "topic_number": "3.2" },
  { "topic_name": "Текстовые задачи", "topic_number": "3.3" },
  { "topic_name": "Последовательности", "topic_number": "4.1" },
  { "topic_name": "Арифметическая и геометрическая прогрессии. Формула сложных процентов", "topic_number": "4.2" },
  { "topic_name": "Свойства и графики функций", "topic_number": "5.1" },
  { "topic_name": "Координатная прямая", "topic_number": "6.1" },
  { "topic_name": "Декартовы координаты", "topic_number": "6.2" },
  { "topic_name": "Геометрические фигуры", "topic_number": "7.1" },
  { "topic_name": "Треугольники", "topic_number": "7.2" },
  { "topic_name": "Многоугольники", "topic_number": "7.3" },
  { "topic_name": "Окружность и круг", "topic_number": "7.4" },
  { "topic_name": "Измерения", "topic_number": "7.5" },
  { "topic_name": "Векторы", "topic_number": "7.6" },
  { "topic_name": "Дополнительные темы по геометрии", "topic_number": "7.7" },
  { "topic_name": "Описательная статистика", "topic_number": "8.1" },
  { "topic_name": "Вероятность", "topic_number": "8.2" },
  { "topic_name": "Комбинаторика", "topic_number": "8.3" },
  { "topic_name": "Множества", "topic_number": "8.4" },
  { "topic_name": "Графы", "topic_number": "8.5" },
  { "topic_name": "Работа с данными и графиками", "topic_number": "9.1" },
  { "topic_name": "Прикладная геометрия / Чтение и анализ графических схем", "topic_number": "9.2" }
];

// Create quick lookup maps
const topicNameToNumber = new Map(
  TOPIC_NAME_NUMBER_MAP.map(t => [t.topic_name.toLowerCase(), t.topic_number])
);
const topicNumberToName = new Map(
  TOPIC_NAME_NUMBER_MAP.map(t => [t.topic_number, t.topic_name])
);

export function buildTopicRoutingMap(topicNames?: Record<string,string>): Record<string, TopicRoute> {
  const map: Record<string, TopicRoute> = {};

  Object.entries(modulesRegistry).forEach(([registryKey, mod]) => {
    const moduleSlug = (mod as any).slug ?? registryKey;
    mod.topicMapping.forEach((tn: string, i: number) => {
      const topic = mod.topics[i];
      if (!topic) return;
      map[tn] = {
        topicNumber: tn,
        topicName: topicNames?.[tn] || topicNumberToName.get(tn),
        moduleSlug,
        moduleTitle: mod.title,
        topicId: topic.id,
        topicTitle: topic.title,
      };
    });
  });

  return map;
}

/**
 * Find a topic route by either topic number or topic name
 * @param identifier - Either a topic number (e.g., "1.2") or topic name (e.g., "Дроби и проценты")
 * @returns TopicRoute object or null if not found
 */
export function findTopicRoute(identifier: string): TopicRoute | null {
  const routingMap = buildTopicRoutingMap();
  
  // First, try direct lookup by topic number
  if (routingMap[identifier]) {
    return routingMap[identifier];
  }
  
  // Try to find by topic name (case-insensitive)
  const topicNumber = topicNameToNumber.get(identifier.toLowerCase());
  if (topicNumber && routingMap[topicNumber]) {
    return routingMap[topicNumber];
  }
  
  return null;
}

/**
 * Convert topic name to topic number
 */
export function getTopicNumberFromName(topicName: string): string | undefined {
  return topicNameToNumber.get(topicName.toLowerCase());
}

/**
 * Convert topic number to topic name
 */
export function getTopicNameFromNumber(topicNumber: string): string | undefined {
  return topicNumberToName.get(topicNumber);
}
