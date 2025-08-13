export interface StudentProgress {
  uid: string;
  [key: string]: any; // For skill_1, skill_2, etc.
}

export interface TopicMastery {
  topic: string;
  name: string;
  mastery: number; // 0-100
  status: 'not_started' | 'in_progress' | 'mastered';
  isNext?: boolean;
}

export const calculateTopicMastery = (skillData: StudentProgress, topicSkills: number[], topic: string = '', name: string = ''): TopicMastery => {
  if (!skillData || !topicSkills.length) {
    return {
      topic,
      name,
      mastery: 0,
      status: 'not_started'
    };
  }

  const skillScores = topicSkills.map(skillNum => {
    const skillKey = `skill_${skillNum}`;
    return skillData[skillKey] as number || 0;
  });

  const mastery = Math.round(
    skillScores.reduce((sum, score) => sum + score, 0) / skillScores.length
  );

  let status: 'not_started' | 'in_progress' | 'mastered';
  if (mastery === 0) {
    status = 'not_started';
  } else if (mastery >= 80) {
    status = 'mastered';
  } else {
    status = 'in_progress';
  }

  return {
    topic,
    name,
    mastery,
    status
  };
};

export const calculateOverallProgress = (skillData: StudentProgress): number => {
  if (!skillData) return 0;
  
  const allSkillScores: number[] = [];
  for (let i = 1; i <= 181; i++) {
    const skillKey = `skill_${i}`;
    const skillValue = skillData[skillKey] as number;
    if (skillValue !== undefined && skillValue !== null) {
      allSkillScores.push(skillValue);
    }
  }

  return allSkillScores.length > 0 
    ? Math.round(allSkillScores.reduce((sum, score) => sum + score, 0) / allSkillScores.length)
    : 7; // Default demo value
};

export const getRecentlyCompletedTopics = (topicMasteries: TopicMastery[]): string[] => {
  // For demo purposes, return 1.1 and 1.2 as recently completed
  return ['1.1', '1.2'];
};

export const getNextTopic = (topicMasteries: TopicMastery[]): string => {
  // For demo purposes, return 1.3 as next topic
  return '1.3';
};