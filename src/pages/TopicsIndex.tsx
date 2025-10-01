// src/pages/TopicsIndex.tsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { modulesRegistry } from "@/lib/modules.registry";

type TopicEntry = { topic_number: string; topic_name: string };

const TOPICS_32: TopicEntry[] = [
  { topic_name: "Натуральные и целые числа", topic_number: "1.1" },
  { topic_name: "Дроби и проценты", topic_number: "1.2" },
  { topic_name: "Рациональные числа и арифметические действия", topic_number: "1.3" },
  { topic_name: "Действительные числа", topic_number: "1.4" },
  { topic_name: "Приближённые вычисления", topic_number: "1.5" },
  { topic_name: "Буквенные выражения", topic_number: "2.1" },
  { topic_name: "Степени", topic_number: "2.2" },
  { topic_name: "Многочлены", topic_number: "2.3" },
  { topic_name: "Алгебраические дроби", topic_number: "2.4" },
  { topic_name: "Арифметические корни", topic_number: "2.5" },
  { topic_name: "Уравнения и системы", topic_number: "3.1" },
  { topic_name: "Неравенства и системы", topic_number: "3.2" },
  { topic_name: "Текстовые задачи", topic_number: "3.3" },
  { topic_name: "Последовательности", topic_number: "4.1" },
  { topic_name: "Арифметическая и геометрическая прогрессии. Формула сложных процентов", topic_number: "4.2" },
  { topic_name: "Свойства и графики функций", topic_number: "5.1" },
  { topic_name: "Координатная прямая", topic_number: "6.1" },
  { topic_name: "Декартовы координаты", topic_number: "6.2" },
  { topic_name: "Геометрические фигуры", topic_number: "7.1" },
  { topic_name: "Треугольники", topic_number: "7.2" },
  { topic_name: "Многоугольники", topic_number: "7.3" },
  { topic_name: "Окружность и круг", topic_number: "7.4" },
  { topic_name: "Измерения", topic_number: "7.5" },
  { topic_name: "Векторы", topic_number: "7.6" },
  { topic_name: "Дополнительные темы по геометрии", topic_number: "7.7" },
  { topic_name: "Описательная статистика", topic_number: "8.1" },
  { topic_name: "Вероятность", topic_number: "8.2" },
  { topic_name: "Комбинаторика", topic_number: "8.3" },
  { topic_name: "Множества", topic_number: "8.4" },
  { topic_name: "Графы", topic_number: "8.5" },
  { topic_name: "Работа с данными и графиками", topic_number: "9.1" },
  { topic_name: "Прикладная геометрия / Чтение и анализ графических схем", topic_number: "9.2" }
];

type RoutingInfo = {
  moduleSlug: string;
  moduleTitle: string;
  topicId: string;
  topicTitle: string;
};

/** Build a map from topic_number (e.g., "4.2") -> routing info using modulesRegistry */
function buildRoutingFromRegistry(): Record<string, RoutingInfo> {
  const map: Record<string, RoutingInfo> = {};
  for (const [moduleSlug, mod] of Object.entries(modulesRegistry)) {
    mod.topicMapping.forEach((topicNum, idx) => {
      const topic = mod.topics[idx];
      if (!topic) return;
      map[topicNum] = {
        moduleSlug,
        moduleTitle: mod.title,
        topicId: topic.id,
        topicTitle: topic.title
      };
    });
  }
  return map;
}

/** Numeric compare for strings like "7.10" vs "7.2" */
function compareTopicNumbers(a: string, b: string) {
  const [am, at] = a.split(".").map(Number);
  const [bm, bt] = b.split(".").map(Number);
  if (am !== bm) return am - bm;
  return (at || 0) - (bt || 0);
}

const TopicsIndex: React.FC = () => {
  const routing = useMemo(buildRoutingFromRegistry, []);
  const sorted = useMemo(
    () => [...TOPICS_32].sort((x, y) => compareTopicNumbers(x.topic_number, y.topic_number)),
    []
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Все темы курса (32)</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map(({ topic_number, topic_name }) => {
          const r = routing[topic_number];
          if (!r) {
            return (
              <Card key={topic_number} className="p-4 opacity-60">
                <div className="text-sm text-gray-500">{topic_number}</div>
                <div className="font-medium">{topic_name}</div>
                <div className="text-xs text-red-500 mt-1">
                  Нет соответствия в <code>modulesRegistry</code>
                </div>
              </Card>
            );
          }
          return (
            <Link key={topic_number} to={`/module/${r.moduleSlug}/topic/${r.topicId}`}>
              <Card className="p-4 hover:border-purple-400 transition-colors">
                <div className="text-sm text-gray-500">
                  {topic_number} • {r.moduleTitle}
                </div>
                <div className="font-medium">{topic_name}</div>
                <div className="text-xs text-gray-500 mt-1">({r.topicTitle})</div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TopicsIndex;
