import topicMappingData from '../data/topic_skill_mapping_with_names.json';

export interface TopicNode {
  topic: string;
  name: string;
  skills: number[];
  section: number; // 1-8 for different math sections
}

export const getTopicMap = (): TopicNode[] => {
  console.log('getTopicMap - Raw data:', topicMappingData);
  console.log('getTopicMap - Raw data length:', topicMappingData?.length);
  console.log('getTopicMap - First raw item:', topicMappingData?.[0]);
  
  const filteredData = topicMappingData.filter(item => item.topic !== "Special");
  console.log('getTopicMap - Filtered data length:', filteredData.length);
  
  const result = filteredData.map(item => ({
    ...item,
    section: parseInt(item.topic.split('.')[0]) // Extract section number (1.1 -> 1)
  }));
  
  console.log('getTopicMap - Final result:', result);
  return result;
};

export const getTopicIcon = (section: number) => {
  const icons = {
    1: "calculator", // Числа и вычисления
    2: "function-square", // Алгебраические выражения
    3: "sigma", // Уравнения и неравенства
    4: "trending-up", // Числовые последовательности
    5: "line-chart", // Функции
    6: "map-pin", // Координаты
    7: "shapes", // Геометрия
    8: "pie-chart" // Вероятность и статистика
  };
  return icons[section as keyof typeof icons] || "circle";
};

export const getSectionName = (section: number) => {
  const names = {
    1: "Числа и вычисления",
    2: "Алгебраические выражения", 
    3: "Уравнения и неравенства",
    4: "Числовые последовательности",
    5: "Функции",
    6: "Координаты",
    7: "Геометрия",
    8: "Вероятность и статистика"
  };
  return names[section as keyof typeof names] || "";
};