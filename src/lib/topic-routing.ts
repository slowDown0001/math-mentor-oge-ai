// src/lib/topic-routing.ts
import { modulesRegistry } from "@/lib/modules.registry";

export type TopicRoute = {
  topicNumber: string;            // e.g. "4.2"
  topicName?: string;             // optional pretty name if you have it
  moduleSlug: string;             // e.g. "sequences"
  moduleTitle: string;            // e.g. "Модуль 4: Числовые последовательности"
  topicId: string;                // e.g. "progressions"
  topicTitle: string;             // e.g. "Арифметическая и геометрическая прогрессии..."
};

export function buildTopicRoutingMap(topicNames?: Record<string,string>): Record<string, TopicRoute> {
  const map: Record<string, TopicRoute> = {};

  Object.values(modulesRegistry).forEach((mod) => {
    mod.topicMapping.forEach((tn, i) => {
      const topic = mod.topics[i];
      if (!topic) return;

      map[tn] = {
        topicNumber: tn,
        topicName: topicNames?.[tn],
        moduleSlug: mod.slug,
        moduleTitle: mod.title,
        topicId: topic.id,
        topicTitle: topic.title,
      };
    });
  });

  return map;
}
