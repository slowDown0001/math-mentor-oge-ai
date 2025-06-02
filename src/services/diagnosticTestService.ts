
import { supabase } from "@/integrations/supabase/client";
import topicMappingData from '../../documentation/topic_skill_mapping_with_names.json';

export interface DiagnosticQuestion {
  question_id: string;
  skill_id: number;
  difficulty: number;
  problem_text: string;
  answer: string;
  code: string;
}

export interface DiagnosticResponse {
  question_id: string;
  skill_id: number;
  difficulty: number;
  user_answer: string | null;
  correct_answer: string;
  is_correct: boolean;
  response_time_seconds?: number;
}

export interface SkillNode {
  id: number;
  prerequisites: number[];
  dependents: number[];
  topic: string;
  topicName: string;
}

export interface DiagnosticSession {
  id: string;
  uid: string;
  questions: DiagnosticQuestion[];
  responses: DiagnosticResponse[];
  current_difficulty: number;
  correct_streak: number;
  incorrect_streak: number;
  skill_updates: Record<string, number>;
}

export class DiagnosticTestEngine {
  private skillGraph: Map<number, SkillNode> = new Map();
  private skillUpdateCounts: Map<number, number> = new Map();

  constructor() {
    this.buildSkillDependencyGraph();
  }

  // Step 1: Build Skill Dependency Graph
  private buildSkillDependencyGraph(): void {
    // Initialize all skills
    for (let i = 1; i <= 181; i++) {
      this.skillGraph.set(i, {
        id: i,
        prerequisites: [],
        dependents: [],
        topic: '',
        topicName: ''
      });
    }

    // Map skills to topics
    topicMappingData.forEach(topic => {
      topic.skills.forEach(skillId => {
        const skill = this.skillGraph.get(skillId);
        if (skill) {
          skill.topic = topic.topic;
          skill.topicName = topic.name;
        }
      });
    });

    // Define prerequisite relationships based on mathematical progression
    this.definePrerequisiteRelationships();
  }

  private definePrerequisiteRelationships(): void {
    const relationships = [
      // Arithmetic foundations (1.x) are prerequisites for algebra
      { prerequisites: [1, 2, 3, 4, 5], dependents: [35, 36, 37, 38] }, // Numbers → Algebraic expressions
      { prerequisites: [6, 7, 8, 9, 10], dependents: [50, 51, 52, 53] }, // Fractions → Algebraic fractions
      
      // Basic algebra before equations
      { prerequisites: [35, 36, 37, 38], dependents: [58, 59, 60] }, // Expressions → Linear equations
      { prerequisites: [58, 59], dependents: [61, 62] }, // Linear → Systems
      { prerequisites: [60, 61], dependents: [69, 70, 71] }, // Equations → Word problems
      
      // Functions require algebraic foundation
      { prerequisites: [45, 46, 47], dependents: [89, 90, 91] }, // Polynomials → Functions
      { prerequisites: [58, 59], dependents: [92, 93, 94] }, // Equations → Function properties
      
      // Geometry foundations
      { prerequisites: [112, 113, 114], dependents: [117, 118, 119] }, // Basic shapes → Triangles
      { prerequisites: [117, 118], dependents: [125, 126, 127] }, // Triangles → Polygons
      { prerequisites: [139, 140, 141], dependents: [147, 148, 149] }, // Basic measurements → Advanced
      
      // Probability and statistics
      { prerequisites: [162, 163], dependents: [166, 167, 168] }, // Statistics → Probability
      { prerequisites: [166, 167], dependents: [169, 170, 171] }, // Probability → Combinatorics
    ];

    relationships.forEach(({ prerequisites, dependents }) => {
      prerequisites.forEach(prereqId => {
        dependents.forEach(depId => {
          const prereq = this.skillGraph.get(prereqId);
          const dependent = this.skillGraph.get(depId);
          
          if (prereq && dependent) {
            prereq.dependents.push(depId);
            dependent.prerequisites.push(prereqId);
          }
        });
      });
    });
  }

  // Step 2: Generate Diagnostic Test
  async generateDiagnosticTest(): Promise<DiagnosticQuestion[]> {
    const foundationalSkills = this.getFoundationalSkills();
    const advancedSkills = this.getAdvancedSkills();
    
    // Select 15-25 questions: 70% foundational, 30% advanced
    const totalQuestions = 20;
    const foundationalCount = Math.floor(totalQuestions * 0.7);
    const advancedCount = totalQuestions - foundationalCount;

    const selectedFoundational = this.sampleSkills(foundationalSkills, foundationalCount);
    const selectedAdvanced = this.sampleSkills(advancedSkills, advancedCount);
    
    const allSelectedSkills = [...selectedFoundational, ...selectedAdvanced];
    const questions: DiagnosticQuestion[] = [];

    for (const skillId of allSelectedSkills) {
      const question = await this.getQuestionForSkill(skillId, 2); // Start at difficulty 2
      if (question) {
        questions.push(question);
      }
    }

    return this.shuffleArray(questions);
  }

  private getFoundationalSkills(): number[] {
    const foundational: number[] = [];
    
    // Skills with few or no prerequisites
    this.skillGraph.forEach((skill, id) => {
      if (skill.prerequisites.length <= 2) {
        foundational.push(id);
      }
    });
    
    return foundational;
  }

  private getAdvancedSkills(): number[] {
    const advanced: number[] = [];
    
    // Skills with many prerequisites or dependents
    this.skillGraph.forEach((skill, id) => {
      if (skill.prerequisites.length > 2 || skill.dependents.length > 3) {
        advanced.push(id);
      }
    });
    
    return advanced;
  }

  private sampleSkills(skills: number[], count: number): number[] {
    const shuffled = this.shuffleArray([...skills]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private async getQuestionForSkill(skillId: number, difficulty: number): Promise<DiagnosticQuestion | null> {
    try {
      // First, try to get a question by parsing the skills field
      const { data: questionsWithSkills, error: skillsError } = await supabase
        .from('copy')
        .select('*')
        .not('skills', 'is', null)
        .not('problem_text', 'is', null)
        .not('answer', 'is', null);

      if (!skillsError && questionsWithSkills) {
        // Filter questions that contain the target skill
        const matchingQuestions = questionsWithSkills.filter(q => {
          if (!q.skills) return false;
          try {
            const skillsArray = q.skills.split(',').map((s: string) => parseInt(s.trim()));
            return skillsArray.includes(skillId);
          } catch {
            return false;
          }
        });

        if (matchingQuestions.length > 0) {
          const randomQuestion = matchingQuestions[Math.floor(Math.random() * matchingQuestions.length)];
          return {
            question_id: randomQuestion.question_id,
            skill_id: skillId,
            difficulty: parseInt(randomQuestion.difficulty) || difficulty,
            problem_text: randomQuestion.problem_text,
            answer: randomQuestion.answer,
            code: randomQuestion.code || ''
          };
        }
      }

      // Fallback: get any question and assign the skill
      const { data: fallbackQuestions, error: fallbackError } = await supabase
        .from('copy')
        .select('*')
        .not('problem_text', 'is', null)
        .not('answer', 'is', null)
        .limit(100);

      if (!fallbackError && fallbackQuestions && fallbackQuestions.length > 0) {
        const randomQuestion = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
        return {
          question_id: randomQuestion.question_id,
          skill_id: skillId,
          difficulty: parseInt(randomQuestion.difficulty) || difficulty,
          problem_text: randomQuestion.problem_text,
          answer: randomQuestion.answer,
          code: randomQuestion.code || ''
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching question for skill:', error);
      return null;
    }
  }

  // Step 3: Adaptive Test Logic
  adjustDifficulty(session: DiagnosticSession, isCorrect: boolean): number {
    if (isCorrect) {
      session.correct_streak++;
      session.incorrect_streak = 0;
      
      // 3 correct in a row → difficulty +1
      if (session.correct_streak >= 3) {
        session.current_difficulty = Math.min(session.current_difficulty + 1, 5);
        session.correct_streak = 0;
      }
    } else {
      session.incorrect_streak++;
      session.correct_streak = 0;
      
      // 2 incorrect in a row → difficulty -1
      if (session.incorrect_streak >= 2) {
        session.current_difficulty = Math.max(session.current_difficulty - 1, 1);
        session.incorrect_streak = 0;
      }
    }
    
    return session.current_difficulty;
  }

  // Step 4: Estimate Skills from Responses
  updateSkillEstimates(session: DiagnosticSession, response: DiagnosticResponse): void {
    const skillId = response.skill_id;
    const isCorrect = response.is_correct;
    
    // Get current update count for this skill
    const updateCount = this.skillUpdateCounts.get(skillId) || 0;
    this.skillUpdateCounts.set(skillId, updateCount + 1);
    
    // Calculate skill change using decay function
    const delta = this.calculateSkillDelta(updateCount, isCorrect, response.difficulty);
    
    // Update the directly tested skill
    const currentScore = session.skill_updates[`skill_${skillId}`] || 50; // Default to 50
    const newScore = Math.max(0, Math.min(100, currentScore + delta));
    session.skill_updates[`skill_${skillId}`] = Math.round(newScore);
    
    // Propagate to related skills
    this.propagateSkillUpdates(session, skillId, isCorrect, delta * 0.3); // 30% propagation
  }

  private calculateSkillDelta(updateCount: number, isCorrect: boolean, difficulty: number): number {
    // Base change scaled by difficulty
    const baseDelta = 40 / (1 + Math.log2(1 + updateCount));
    const difficultyMultiplier = difficulty / 3; // Scale by difficulty (1-5, normalized to ~0.33-1.67)
    
    return (isCorrect ? 1 : -1) * baseDelta * difficultyMultiplier;
  }

  private propagateSkillUpdates(session: DiagnosticSession, skillId: number, isCorrect: boolean, propagationDelta: number): void {
    const skill = this.skillGraph.get(skillId);
    if (!skill) return;
    
    if (isCorrect) {
      // Success: give partial credit to prerequisites
      skill.prerequisites.forEach(prereqId => {
        const currentScore = session.skill_updates[`skill_${prereqId}`] || 50;
        const newScore = Math.max(0, Math.min(100, currentScore + propagationDelta));
        session.skill_updates[`skill_${prereqId}`] = Math.round(newScore);
      });
    } else {
      // Failure: reduce estimates for dependents
      skill.dependents.forEach(depId => {
        const currentScore = session.skill_updates[`skill_${depId}`] || 50;
        const newScore = Math.max(0, Math.min(100, currentScore + propagationDelta)); // propagationDelta is negative
        session.skill_updates[`skill_${depId}`] = Math.round(newScore);
      });
    }
  }

  // Step 5: Save to Supabase
  async createDiagnosticSession(uid: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('diagnostic_sessions')
        .insert({
          uid,
          status: 'in_progress',
          total_questions: 0,
          correct_answers: 0,
          final_difficulty: 2
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating diagnostic session:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error creating diagnostic session:', error);
      return null;
    }
  }

  async saveResponse(sessionId: string, response: DiagnosticResponse): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('diagnostic_responses')
        .insert({
          session_id: sessionId,
          question_id: response.question_id,
          skill_id: response.skill_id,
          difficulty: response.difficulty,
          user_answer: response.user_answer,
          correct_answer: response.correct_answer,
          is_correct: response.is_correct,
          response_time_seconds: response.response_time_seconds
        });

      if (error) {
        console.error('Error saving response:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving response:', error);
      return false;
    }
  }

  async completeDiagnosticSession(sessionId: string, session: DiagnosticSession): Promise<boolean> {
    try {
      // Update session status
      const { error: sessionError } = await supabase
        .from('diagnostic_sessions')
        .update({
          completed_at: new Date().toISOString(),
          status: 'completed',
          total_questions: session.responses.length,
          correct_answers: session.responses.filter(r => r.is_correct).length,
          final_difficulty: session.current_difficulty
        })
        .eq('id', sessionId);

      if (sessionError) {
        console.error('Error updating session:', sessionError);
        return false;
      }

      // Update student skills
      const { error: skillsError } = await supabase
        .from('student_skills')
        .upsert({
          uid: session.uid,
          ...session.skill_updates
        }, {
          onConflict: 'uid'
        });

      if (skillsError) {
        console.error('Error updating skills:', skillsError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error completing session:', error);
      return false;
    }
  }

  // Utility method to get current user skills
  async getCurrentSkills(uid: string): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('student_skills')
        .select('*')
        .eq('uid', uid)
        .single();

      if (error || !data) {
        // Return default skills if none found
        const defaultSkills: Record<string, number> = {};
        for (let i = 1; i <= 181; i++) {
          defaultSkills[`skill_${i}`] = 50; // Default to middle score
        }
        return defaultSkills;
      }

      const skills: Record<string, number> = {};
      for (let i = 1; i <= 181; i++) {
        const skillKey = `skill_${i}` as keyof typeof data;
        skills[`skill_${i}`] = data[skillKey] as number || 50;
      }

      return skills;
    } catch (error) {
      console.error('Error fetching current skills:', error);
      const defaultSkills: Record<string, number> = {};
      for (let i = 1; i <= 181; i++) {
        defaultSkills[`skill_${i}`] = 50;
      }
      return defaultSkills;
    }
  }
}

// Export singleton instance
export const diagnosticEngine = new DiagnosticTestEngine();
