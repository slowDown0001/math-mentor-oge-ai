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

export function buildTopicRoutingMap(topicNames?: Record<string,string>): Record<string, TopicRoute> {
  const map: Record<string, TopicRoute> = {};

  Object.entries(modulesRegistry).forEach(([registryKey, mod]) => {
    const moduleSlug = (mod as any).slug ?? registryKey; // <— fallback to key if slug not set
    mod.topicMapping.forEach((tn: string, i: number) => {
      const topic = mod.topics[i];
      if (!topic) return;
      map[tn] = {
        topicNumber: tn,
        topicName: topicNames?.[tn],
        moduleSlug,                         // <— always defined now
        moduleTitle: mod.title,
        topicId: topic.id,
        topicTitle: topic.title,
      };
    });
  });

  return map;
}
