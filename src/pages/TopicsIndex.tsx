// src/pages/TopicsIndex.tsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { buildTopicRoutingMap } from "@/lib/topic-routing";

const TOPICS_32 = [
  {"topic_name":"Натуральные и целые числа","topic_number":"1.1"},
  {"topic_name":"Дроби и проценты","topic_number":"1.2"},
  {"topic_name":"Рациональные числа и арифметические действия","topic_number":"1.3"},
  {"topic_name":"Действительные числа","topic_number":"1.4"},
  {"topic_name":"Приближённые вычисления","topic_number":"1.5"},
  {"topic_name":"Буквенные выражения","topic_number":"2.1"},
  {"topic_name":"Степени","topic_number":"2.2"},
  {"topic_name":"Многочлены","topic_number":"2.3"},
  {"topic_name":"Алгебраические дроби","topic_number":"2.4"},
  {"topic_name":"Арифметические корни","topic_number":"2.5"},
  {"topic_name":"Уравнения и системы","topic_number":"3.1"},
  {"topic_name":"Неравенства и системы","topic_number":"3.2"},
  {"topic_name":"Текстовые задачи","topic_number":"3.3"},
  {"topic_name":"Последовательности","topic_number":"4.1"},
  {"topic_name":"Арифметическая и геометрическая прогрессии. Формула сложных процентов","topic_number":"4.2"},
  {"topic_name":"Свойства и графики функций","topic_number":"5.1"},
  {"topic_name":"Координатная прямая","topic_number":"6.1"},
  {"topic_name":"Декартовы координаты","topic_number":"6.2"},
  {"topic_name":"Геометрические фигуры","topic_number":"7.1"},
  {"topic_name":"Треугольники","topic_number":"7.2"},
  {"topic_name":"Многоугольники","topic_number":"7.3"},
  {"topic_name":"Окружность и круг","topic_number":"7.4"},
  {"topic_name":"Измерения","topic_number":"7.5"},
  {"topic_name":"Векторы","topic_number":"7.6"},
  {"topic_name":"Дополнительные темы по геометрии","topic_number":"7.7"},
  {"topic_name":"Описательная статистика","topic_number":"8.1"},
  {"topic_name":"Вероятность","topic_number":"8.2"},
  {"topic_name":"Комбинаторика","topic_number":"8.3"},
  {"topic_name":"Множества","topic_number":"8.4"},
  {"topic_name":"Графы","topic_number":"8.5"},
  {"topic_name":"Работа с данными и графиками","topic_number":"9.1"},
  {"topic_name":"Прикладная геометрия / Чтение и анализ графических схем","topic_number":"9.2"}
];

const TopicsIndex: React.FC = () => {
  const nameMap = useMemo(
    () => Object.fromEntries(TOPICS_32.map(t => [t.topic_number, t.topic_name])),
    []
  );
  const routing = useMemo(() => buildTopicRoutingMap(nameMap), [nameMap]);

  // Sorted by topic_number like "1.1", "1.2", ..., "9.2"
  const sorted = [...TOPICS_32].sort((a,b) => a.topic_number.localeCompare(b.topic_number, "ru"));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Все темы курса (32)</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map(({ topic_number, topic_name }) => {
          const r = routing[topic_number];
          if (!r) {
            // If a topic_number isn’t in modulesRegistry.topicMapping, show disabled card
            return (
              <Card key={topic_number} className="p-4 opacity-60">
                <div className="text-sm text-gray-500">{topic_number}</div>
                <div className="font-medium">{topic_name}</div>
                <div className="text-xs text-red-500 mt-1">Нет соответствия в modulesRegistry</div>
              </Card>
            );
          }
          return (
            <Link key={topic_number} to={`/module/${r.moduleSlug}/topic/${r.topicId}`}>
              <Card className="p-4 hover:border-purple-400 transition-colors">
                <div className="text-sm text-gray-500">{topic_number} • {r.moduleTitle}</div>
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
