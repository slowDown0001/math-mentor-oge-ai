export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          art: string | null
          skill: number
        }
        Insert: {
          art?: string | null
          skill?: number
        }
        Update: {
          art?: string | null
          skill?: number
        }
        Relationships: []
      }
      articles2: {
        Row: {
          art: string | null
          skill: number
        }
        Insert: {
          art?: string | null
          skill?: number
        }
        Update: {
          art?: string | null
          skill?: number
        }
        Relationships: []
      }
      articles3: {
        Row: {
          art: string | null
          skill: number
        }
        Insert: {
          art?: string | null
          skill?: number
        }
        Update: {
          art?: string | null
          skill?: number
        }
        Relationships: []
      }
      copy: {
        Row: {
          answer: string | null
          calculation_required: string | null
          calculator_allowed: boolean | null
          checked: boolean | null
          code: string | null
          corrected: boolean | null
          difficulty: string | null
          problem_image: string | null
          problem_number: number | null
          problem_text: string | null
          question_id: string
          rec_time: string | null
          skills: string | null
          skills_for_step_1: string | null
          skills_for_step_10: string | null
          skills_for_step_11: string | null
          skills_for_step_12: string | null
          skills_for_step_13: string | null
          skills_for_step_14: string | null
          skills_for_step_15: string | null
          skills_for_step_2: string | null
          skills_for_step_3: string | null
          skills_for_step_4: string | null
          skills_for_step_5: string | null
          skills_for_step_6: string | null
          skills_for_step_7: string | null
          skills_for_step_8: string | null
          skills_for_step_9: string | null
          solution_text: string | null
          solutiontextexpanded: string | null
          source: string | null
          step1_expanded_text: string | null
          step1_text: string | null
          step10_expanded_text: string | null
          step10_text: string | null
          step11_expanded_text: string | null
          step11_text: string | null
          step12_expanded_text: string | null
          step12_text: string | null
          step13_expanded_text: string | null
          step13_text: string | null
          step14_expanded_text: string | null
          step14_text: string | null
          step15_expanded_text: string | null
          step15_text: string | null
          step2_expanded_text: string | null
          step2_text: string | null
          step3_expanded_text: string | null
          step3_text: string | null
          step4_expanded_text: string | null
          step4_text: string | null
          step5_expanded_text: string | null
          step5_text: string | null
          step6_expanded_text: string | null
          step6_text: string | null
          step7_expanded_text: string | null
          step7_text: string | null
          step8_expanded_text: string | null
          step8_text: string | null
          step9_expanded_text: string | null
          step9_text: string | null
          steps_number: number | null
          type: string | null
        }
        Insert: {
          answer?: string | null
          calculation_required?: string | null
          calculator_allowed?: boolean | null
          checked?: boolean | null
          code?: string | null
          corrected?: boolean | null
          difficulty?: string | null
          problem_image?: string | null
          problem_number?: number | null
          problem_text?: string | null
          question_id: string
          rec_time?: string | null
          skills?: string | null
          skills_for_step_1?: string | null
          skills_for_step_10?: string | null
          skills_for_step_11?: string | null
          skills_for_step_12?: string | null
          skills_for_step_13?: string | null
          skills_for_step_14?: string | null
          skills_for_step_15?: string | null
          skills_for_step_2?: string | null
          skills_for_step_3?: string | null
          skills_for_step_4?: string | null
          skills_for_step_5?: string | null
          skills_for_step_6?: string | null
          skills_for_step_7?: string | null
          skills_for_step_8?: string | null
          skills_for_step_9?: string | null
          solution_text?: string | null
          solutiontextexpanded?: string | null
          source?: string | null
          step1_expanded_text?: string | null
          step1_text?: string | null
          step10_expanded_text?: string | null
          step10_text?: string | null
          step11_expanded_text?: string | null
          step11_text?: string | null
          step12_expanded_text?: string | null
          step12_text?: string | null
          step13_expanded_text?: string | null
          step13_text?: string | null
          step14_expanded_text?: string | null
          step14_text?: string | null
          step15_expanded_text?: string | null
          step15_text?: string | null
          step2_expanded_text?: string | null
          step2_text?: string | null
          step3_expanded_text?: string | null
          step3_text?: string | null
          step4_expanded_text?: string | null
          step4_text?: string | null
          step5_expanded_text?: string | null
          step5_text?: string | null
          step6_expanded_text?: string | null
          step6_text?: string | null
          step7_expanded_text?: string | null
          step7_text?: string | null
          step8_expanded_text?: string | null
          step8_text?: string | null
          step9_expanded_text?: string | null
          step9_text?: string | null
          steps_number?: number | null
          type?: string | null
        }
        Update: {
          answer?: string | null
          calculation_required?: string | null
          calculator_allowed?: boolean | null
          checked?: boolean | null
          code?: string | null
          corrected?: boolean | null
          difficulty?: string | null
          problem_image?: string | null
          problem_number?: number | null
          problem_text?: string | null
          question_id?: string
          rec_time?: string | null
          skills?: string | null
          skills_for_step_1?: string | null
          skills_for_step_10?: string | null
          skills_for_step_11?: string | null
          skills_for_step_12?: string | null
          skills_for_step_13?: string | null
          skills_for_step_14?: string | null
          skills_for_step_15?: string | null
          skills_for_step_2?: string | null
          skills_for_step_3?: string | null
          skills_for_step_4?: string | null
          skills_for_step_5?: string | null
          skills_for_step_6?: string | null
          skills_for_step_7?: string | null
          skills_for_step_8?: string | null
          skills_for_step_9?: string | null
          solution_text?: string | null
          solutiontextexpanded?: string | null
          source?: string | null
          step1_expanded_text?: string | null
          step1_text?: string | null
          step10_expanded_text?: string | null
          step10_text?: string | null
          step11_expanded_text?: string | null
          step11_text?: string | null
          step12_expanded_text?: string | null
          step12_text?: string | null
          step13_expanded_text?: string | null
          step13_text?: string | null
          step14_expanded_text?: string | null
          step14_text?: string | null
          step15_expanded_text?: string | null
          step15_text?: string | null
          step2_expanded_text?: string | null
          step2_text?: string | null
          step3_expanded_text?: string | null
          step3_text?: string | null
          step4_expanded_text?: string | null
          step4_text?: string | null
          step5_expanded_text?: string | null
          step5_text?: string | null
          step6_expanded_text?: string | null
          step6_text?: string | null
          step7_expanded_text?: string | null
          step7_text?: string | null
          step8_expanded_text?: string | null
          step8_text?: string | null
          step9_expanded_text?: string | null
          step9_text?: string | null
          steps_number?: number | null
          type?: string | null
        }
        Relationships: []
      }
      daily_activities: {
        Row: {
          activity_date: string
          activity_type: string
          created_at: string | null
          duration_minutes: number | null
          id: string
          user_id: string
        }
        Insert: {
          activity_date?: string
          activity_type: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          user_id: string
        }
        Update: {
          activity_date?: string
          activity_type?: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      diagnostic_responses: {
        Row: {
          answered_at: string
          correct_answer: string
          difficulty: number
          id: string
          is_correct: boolean
          question_id: string
          response_time_seconds: number | null
          session_id: string
          skill_id: number
          user_answer: string | null
        }
        Insert: {
          answered_at?: string
          correct_answer: string
          difficulty: number
          id?: string
          is_correct: boolean
          question_id: string
          response_time_seconds?: number | null
          session_id: string
          skill_id: number
          user_answer?: string | null
        }
        Update: {
          answered_at?: string
          correct_answer?: string
          difficulty?: number
          id?: string
          is_correct?: boolean
          question_id?: string
          response_time_seconds?: number | null
          session_id?: string
          skill_id?: number
          user_answer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_sessions: {
        Row: {
          completed_at: string | null
          correct_answers: number
          final_difficulty: number
          id: string
          started_at: string
          status: string
          total_questions: number
          uid: string
        }
        Insert: {
          completed_at?: string | null
          correct_answers?: number
          final_difficulty?: number
          id?: string
          started_at?: string
          status?: string
          total_questions?: number
          uid: string
        }
        Update: {
          completed_at?: string | null
          correct_answers?: number
          final_difficulty?: number
          id?: string
          started_at?: string
          status?: string
          total_questions?: number
          uid?: string
        }
        Relationships: []
      }
      diagnostic_test_problems_1: {
        Row: {
          answer: string | null
          calculation_required: string | null
          calculator_allowed: string | null
          checked: boolean | null
          code: string | null
          corrected: boolean | null
          difficulty: number | null
          problem_answer: string | null
          problem_image: string | null
          problem_number: number | null
          problem_text: string | null
          question_id: string
          rec_time: string | null
          skill: number | null
          skills: number | null
          skills_for_step_1: string | null
          skills_for_step_10: string | null
          skills_for_step_11: string | null
          skills_for_step_12: string | null
          skills_for_step_13: string | null
          skills_for_step_14: string | null
          skills_for_step_15: string | null
          skills_for_step_2: string | null
          skills_for_step_3: string | null
          skills_for_step_4: string | null
          skills_for_step_5: string | null
          skills_for_step_6: string | null
          skills_for_step_7: string | null
          skills_for_step_8: string | null
          skills_for_step_9: string | null
          solution_text: string | null
          solutiontextexpanded: string | null
          source: string | null
          step1_expanded_text: string | null
          step1_text: string | null
          step10_expanded_text: string | null
          step10_text: string | null
          step11_expanded_text: string | null
          step11_text: string | null
          step12_expanded_text: string | null
          step12_text: string | null
          step13_expanded_text: string | null
          step13_text: string | null
          step14_expanded_text: string | null
          step14_text: string | null
          step15_expanded_text: string | null
          step15_text: string | null
          step2_expanded_text: string | null
          step2_text: string | null
          step3_expanded_text: string | null
          step3_text: string | null
          step4_expanded_text: string | null
          step4_text: string | null
          step5_expanded_text: string | null
          step5_text: string | null
          step6_expanded_text: string | null
          step6_text: string | null
          step7_expanded_text: string | null
          step7_text: string | null
          step8_expanded_text: string | null
          step8_text: string | null
          step9_expanded_text: string | null
          step9_text: string | null
          steps_number: number | null
          type: string | null
        }
        Insert: {
          answer?: string | null
          calculation_required?: string | null
          calculator_allowed?: string | null
          checked?: boolean | null
          code?: string | null
          corrected?: boolean | null
          difficulty?: number | null
          problem_answer?: string | null
          problem_image?: string | null
          problem_number?: number | null
          problem_text?: string | null
          question_id: string
          rec_time?: string | null
          skill?: number | null
          skills?: number | null
          skills_for_step_1?: string | null
          skills_for_step_10?: string | null
          skills_for_step_11?: string | null
          skills_for_step_12?: string | null
          skills_for_step_13?: string | null
          skills_for_step_14?: string | null
          skills_for_step_15?: string | null
          skills_for_step_2?: string | null
          skills_for_step_3?: string | null
          skills_for_step_4?: string | null
          skills_for_step_5?: string | null
          skills_for_step_6?: string | null
          skills_for_step_7?: string | null
          skills_for_step_8?: string | null
          skills_for_step_9?: string | null
          solution_text?: string | null
          solutiontextexpanded?: string | null
          source?: string | null
          step1_expanded_text?: string | null
          step1_text?: string | null
          step10_expanded_text?: string | null
          step10_text?: string | null
          step11_expanded_text?: string | null
          step11_text?: string | null
          step12_expanded_text?: string | null
          step12_text?: string | null
          step13_expanded_text?: string | null
          step13_text?: string | null
          step14_expanded_text?: string | null
          step14_text?: string | null
          step15_expanded_text?: string | null
          step15_text?: string | null
          step2_expanded_text?: string | null
          step2_text?: string | null
          step3_expanded_text?: string | null
          step3_text?: string | null
          step4_expanded_text?: string | null
          step4_text?: string | null
          step5_expanded_text?: string | null
          step5_text?: string | null
          step6_expanded_text?: string | null
          step6_text?: string | null
          step7_expanded_text?: string | null
          step7_text?: string | null
          step8_expanded_text?: string | null
          step8_text?: string | null
          step9_expanded_text?: string | null
          step9_text?: string | null
          steps_number?: number | null
          type?: string | null
        }
        Update: {
          answer?: string | null
          calculation_required?: string | null
          calculator_allowed?: string | null
          checked?: boolean | null
          code?: string | null
          corrected?: boolean | null
          difficulty?: number | null
          problem_answer?: string | null
          problem_image?: string | null
          problem_number?: number | null
          problem_text?: string | null
          question_id?: string
          rec_time?: string | null
          skill?: number | null
          skills?: number | null
          skills_for_step_1?: string | null
          skills_for_step_10?: string | null
          skills_for_step_11?: string | null
          skills_for_step_12?: string | null
          skills_for_step_13?: string | null
          skills_for_step_14?: string | null
          skills_for_step_15?: string | null
          skills_for_step_2?: string | null
          skills_for_step_3?: string | null
          skills_for_step_4?: string | null
          skills_for_step_5?: string | null
          skills_for_step_6?: string | null
          skills_for_step_7?: string | null
          skills_for_step_8?: string | null
          skills_for_step_9?: string | null
          solution_text?: string | null
          solutiontextexpanded?: string | null
          source?: string | null
          step1_expanded_text?: string | null
          step1_text?: string | null
          step10_expanded_text?: string | null
          step10_text?: string | null
          step11_expanded_text?: string | null
          step11_text?: string | null
          step12_expanded_text?: string | null
          step12_text?: string | null
          step13_expanded_text?: string | null
          step13_text?: string | null
          step14_expanded_text?: string | null
          step14_text?: string | null
          step15_expanded_text?: string | null
          step15_text?: string | null
          step2_expanded_text?: string | null
          step2_text?: string | null
          step3_expanded_text?: string | null
          step3_text?: string | null
          step4_expanded_text?: string | null
          step4_text?: string | null
          step5_expanded_text?: string | null
          step5_text?: string | null
          step6_expanded_text?: string | null
          step6_text?: string | null
          step7_expanded_text?: string | null
          step7_text?: string | null
          step8_expanded_text?: string | null
          step8_text?: string | null
          step9_expanded_text?: string | null
          step9_text?: string | null
          steps_number?: number | null
          type?: string | null
        }
        Relationships: []
      }
      marking: {
        Row: {
          id: number
          marking_text: string | null
          text: string | null
        }
        Insert: {
          id?: number
          marking_text?: string | null
          text?: string | null
        }
        Update: {
          id?: number
          marking_text?: string | null
          text?: string | null
        }
        Relationships: []
      }
      mcq: {
        Row: {
          answer: string | null
          calculation_required: string | null
          calculator_allowed: string | null
          checked: boolean | null
          code: string | null
          corrected: boolean | null
          difficulty: number | null
          problem_image: string | null
          problem_number: number | null
          problem_text: string | null
          question_id: string
          rec_time: string | null
          skills: number | null
          skills_for_step_1: string | null
          skills_for_step_10: string | null
          skills_for_step_11: string | null
          skills_for_step_12: string | null
          skills_for_step_13: string | null
          skills_for_step_14: string | null
          skills_for_step_15: string | null
          skills_for_step_2: string | null
          skills_for_step_3: string | null
          skills_for_step_4: string | null
          skills_for_step_5: string | null
          skills_for_step_6: string | null
          skills_for_step_7: string | null
          skills_for_step_8: string | null
          skills_for_step_9: string | null
          solution_text: string | null
          solutiontextexpanded: string | null
          source: string | null
          step1_expanded_text: string | null
          step1_text: string | null
          step10_expanded_text: string | null
          step10_text: string | null
          step11_expanded_text: string | null
          step11_text: string | null
          step12_expanded_text: string | null
          step12_text: string | null
          step13_expanded_text: string | null
          step13_text: string | null
          step14_expanded_text: string | null
          step14_text: string | null
          step15_expanded_text: string | null
          step15_text: string | null
          step2_expanded_text: string | null
          step2_text: string | null
          step3_expanded_text: string | null
          step3_text: string | null
          step4_expanded_text: string | null
          step4_text: string | null
          step5_expanded_text: string | null
          step5_text: string | null
          step6_expanded_text: string | null
          step6_text: string | null
          step7_expanded_text: string | null
          step7_text: string | null
          step8_expanded_text: string | null
          step8_text: string | null
          step9_expanded_text: string | null
          step9_text: string | null
          steps_number: number | null
          type: string | null
        }
        Insert: {
          answer?: string | null
          calculation_required?: string | null
          calculator_allowed?: string | null
          checked?: boolean | null
          code?: string | null
          corrected?: boolean | null
          difficulty?: number | null
          problem_image?: string | null
          problem_number?: number | null
          problem_text?: string | null
          question_id: string
          rec_time?: string | null
          skills?: number | null
          skills_for_step_1?: string | null
          skills_for_step_10?: string | null
          skills_for_step_11?: string | null
          skills_for_step_12?: string | null
          skills_for_step_13?: string | null
          skills_for_step_14?: string | null
          skills_for_step_15?: string | null
          skills_for_step_2?: string | null
          skills_for_step_3?: string | null
          skills_for_step_4?: string | null
          skills_for_step_5?: string | null
          skills_for_step_6?: string | null
          skills_for_step_7?: string | null
          skills_for_step_8?: string | null
          skills_for_step_9?: string | null
          solution_text?: string | null
          solutiontextexpanded?: string | null
          source?: string | null
          step1_expanded_text?: string | null
          step1_text?: string | null
          step10_expanded_text?: string | null
          step10_text?: string | null
          step11_expanded_text?: string | null
          step11_text?: string | null
          step12_expanded_text?: string | null
          step12_text?: string | null
          step13_expanded_text?: string | null
          step13_text?: string | null
          step14_expanded_text?: string | null
          step14_text?: string | null
          step15_expanded_text?: string | null
          step15_text?: string | null
          step2_expanded_text?: string | null
          step2_text?: string | null
          step3_expanded_text?: string | null
          step3_text?: string | null
          step4_expanded_text?: string | null
          step4_text?: string | null
          step5_expanded_text?: string | null
          step5_text?: string | null
          step6_expanded_text?: string | null
          step6_text?: string | null
          step7_expanded_text?: string | null
          step7_text?: string | null
          step8_expanded_text?: string | null
          step8_text?: string | null
          step9_expanded_text?: string | null
          step9_text?: string | null
          steps_number?: number | null
          type?: string | null
        }
        Update: {
          answer?: string | null
          calculation_required?: string | null
          calculator_allowed?: string | null
          checked?: boolean | null
          code?: string | null
          corrected?: boolean | null
          difficulty?: number | null
          problem_image?: string | null
          problem_number?: number | null
          problem_text?: string | null
          question_id?: string
          rec_time?: string | null
          skills?: number | null
          skills_for_step_1?: string | null
          skills_for_step_10?: string | null
          skills_for_step_11?: string | null
          skills_for_step_12?: string | null
          skills_for_step_13?: string | null
          skills_for_step_14?: string | null
          skills_for_step_15?: string | null
          skills_for_step_2?: string | null
          skills_for_step_3?: string | null
          skills_for_step_4?: string | null
          skills_for_step_5?: string | null
          skills_for_step_6?: string | null
          skills_for_step_7?: string | null
          skills_for_step_8?: string | null
          skills_for_step_9?: string | null
          solution_text?: string | null
          solutiontextexpanded?: string | null
          source?: string | null
          step1_expanded_text?: string | null
          step1_text?: string | null
          step10_expanded_text?: string | null
          step10_text?: string | null
          step11_expanded_text?: string | null
          step11_text?: string | null
          step12_expanded_text?: string | null
          step12_text?: string | null
          step13_expanded_text?: string | null
          step13_text?: string | null
          step14_expanded_text?: string | null
          step14_text?: string | null
          step15_expanded_text?: string | null
          step15_text?: string | null
          step2_expanded_text?: string | null
          step2_text?: string | null
          step3_expanded_text?: string | null
          step3_text?: string | null
          step4_expanded_text?: string | null
          step4_text?: string | null
          step5_expanded_text?: string | null
          step5_text?: string | null
          step6_expanded_text?: string | null
          step6_text?: string | null
          step7_expanded_text?: string | null
          step7_text?: string | null
          step8_expanded_text?: string | null
          step8_text?: string | null
          step9_expanded_text?: string | null
          step9_text?: string | null
          steps_number?: number | null
          type?: string | null
        }
        Relationships: []
      }
      mcq_with_options: {
        Row: {
          answer: string | null
          calculation_required: string | null
          calculator_allowed: string | null
          checked: boolean | null
          code: string | null
          corrected: boolean | null
          difficulty: number | null
          option1: string | null
          option2: string | null
          option3: string | null
          option4: string | null
          problem_image: string | null
          problem_number: number | null
          problem_text: string | null
          question_id: string
          rec_time: string | null
          skills: number | null
          skills_for_step_1: string | null
          skills_for_step_10: string | null
          skills_for_step_11: string | null
          skills_for_step_12: string | null
          skills_for_step_13: string | null
          skills_for_step_14: string | null
          skills_for_step_15: string | null
          skills_for_step_2: string | null
          skills_for_step_3: string | null
          skills_for_step_4: string | null
          skills_for_step_5: string | null
          skills_for_step_6: string | null
          skills_for_step_7: string | null
          skills_for_step_8: string | null
          skills_for_step_9: string | null
          solution_text: string | null
          solutiontextexpanded: string | null
          source: string | null
          step1_expanded_text: string | null
          step1_text: string | null
          step10_expanded_text: string | null
          step10_text: string | null
          step11_expanded_text: string | null
          step11_text: string | null
          step12_expanded_text: string | null
          step12_text: string | null
          step13_expanded_text: string | null
          step13_text: string | null
          step14_expanded_text: string | null
          step14_text: string | null
          step15_expanded_text: string | null
          step15_text: string | null
          step2_expanded_text: string | null
          step2_text: string | null
          step3_expanded_text: string | null
          step3_text: string | null
          step4_expanded_text: string | null
          step4_text: string | null
          step5_expanded_text: string | null
          step5_text: string | null
          step6_expanded_text: string | null
          step6_text: string | null
          step7_expanded_text: string | null
          step7_text: string | null
          step8_expanded_text: string | null
          step8_text: string | null
          step9_expanded_text: string | null
          step9_text: string | null
          steps_number: number | null
          type: string | null
        }
        Insert: {
          answer?: string | null
          calculation_required?: string | null
          calculator_allowed?: string | null
          checked?: boolean | null
          code?: string | null
          corrected?: boolean | null
          difficulty?: number | null
          option1?: string | null
          option2?: string | null
          option3?: string | null
          option4?: string | null
          problem_image?: string | null
          problem_number?: number | null
          problem_text?: string | null
          question_id: string
          rec_time?: string | null
          skills?: number | null
          skills_for_step_1?: string | null
          skills_for_step_10?: string | null
          skills_for_step_11?: string | null
          skills_for_step_12?: string | null
          skills_for_step_13?: string | null
          skills_for_step_14?: string | null
          skills_for_step_15?: string | null
          skills_for_step_2?: string | null
          skills_for_step_3?: string | null
          skills_for_step_4?: string | null
          skills_for_step_5?: string | null
          skills_for_step_6?: string | null
          skills_for_step_7?: string | null
          skills_for_step_8?: string | null
          skills_for_step_9?: string | null
          solution_text?: string | null
          solutiontextexpanded?: string | null
          source?: string | null
          step1_expanded_text?: string | null
          step1_text?: string | null
          step10_expanded_text?: string | null
          step10_text?: string | null
          step11_expanded_text?: string | null
          step11_text?: string | null
          step12_expanded_text?: string | null
          step12_text?: string | null
          step13_expanded_text?: string | null
          step13_text?: string | null
          step14_expanded_text?: string | null
          step14_text?: string | null
          step15_expanded_text?: string | null
          step15_text?: string | null
          step2_expanded_text?: string | null
          step2_text?: string | null
          step3_expanded_text?: string | null
          step3_text?: string | null
          step4_expanded_text?: string | null
          step4_text?: string | null
          step5_expanded_text?: string | null
          step5_text?: string | null
          step6_expanded_text?: string | null
          step6_text?: string | null
          step7_expanded_text?: string | null
          step7_text?: string | null
          step8_expanded_text?: string | null
          step8_text?: string | null
          step9_expanded_text?: string | null
          step9_text?: string | null
          steps_number?: number | null
          type?: string | null
        }
        Update: {
          answer?: string | null
          calculation_required?: string | null
          calculator_allowed?: string | null
          checked?: boolean | null
          code?: string | null
          corrected?: boolean | null
          difficulty?: number | null
          option1?: string | null
          option2?: string | null
          option3?: string | null
          option4?: string | null
          problem_image?: string | null
          problem_number?: number | null
          problem_text?: string | null
          question_id?: string
          rec_time?: string | null
          skills?: number | null
          skills_for_step_1?: string | null
          skills_for_step_10?: string | null
          skills_for_step_11?: string | null
          skills_for_step_12?: string | null
          skills_for_step_13?: string | null
          skills_for_step_14?: string | null
          skills_for_step_15?: string | null
          skills_for_step_2?: string | null
          skills_for_step_3?: string | null
          skills_for_step_4?: string | null
          skills_for_step_5?: string | null
          skills_for_step_6?: string | null
          skills_for_step_7?: string | null
          skills_for_step_8?: string | null
          skills_for_step_9?: string | null
          solution_text?: string | null
          solutiontextexpanded?: string | null
          source?: string | null
          step1_expanded_text?: string | null
          step1_text?: string | null
          step10_expanded_text?: string | null
          step10_text?: string | null
          step11_expanded_text?: string | null
          step11_text?: string | null
          step12_expanded_text?: string | null
          step12_text?: string | null
          step13_expanded_text?: string | null
          step13_text?: string | null
          step14_expanded_text?: string | null
          step14_text?: string | null
          step15_expanded_text?: string | null
          step15_text?: string | null
          step2_expanded_text?: string | null
          step2_text?: string | null
          step3_expanded_text?: string | null
          step3_text?: string | null
          step4_expanded_text?: string | null
          step4_text?: string | null
          step5_expanded_text?: string | null
          step5_text?: string | null
          step6_expanded_text?: string | null
          step6_text?: string | null
          step7_expanded_text?: string | null
          step7_text?: string | null
          step8_expanded_text?: string | null
          step8_text?: string | null
          step9_expanded_text?: string | null
          step9_text?: string | null
          steps_number?: number | null
          type?: string | null
        }
        Relationships: []
      }
      OGE_SHFIPI_problems_1_25: {
        Row: {
          answer: string | null
          calculation_required: string | null
          calculator_allowed: boolean | null
          checked: boolean | null
          code: number | null
          corrected: boolean | null
          difficulty: number | null
          problem_image: string | null
          problem_number: string | null
          problem_text: string | null
          question_id: string
          rec_time: string | null
          skills: string | null
          skills_for_step_1: string | null
          skills_for_step_10: string | null
          skills_for_step_11: string | null
          skills_for_step_12: string | null
          skills_for_step_13: string | null
          skills_for_step_14: string | null
          skills_for_step_15: string | null
          skills_for_step_2: string | null
          skills_for_step_3: string | null
          skills_for_step_4: string | null
          skills_for_step_5: string | null
          skills_for_step_6: string | null
          skills_for_step_7: string | null
          skills_for_step_8: string | null
          skills_for_step_9: string | null
          solution_image: string | null
          solution_text: string | null
          solutiontextexpanded: string | null
          source: string | null
          step1_expanded_text: string | null
          step1_text: string | null
          step10_expanded_text: string | null
          step10_text: string | null
          step11_expanded_text: string | null
          step11_text: string | null
          step12_expanded_text: string | null
          step12_text: string | null
          step13_expanded_text: string | null
          step13_text: string | null
          step14_expanded_text: string | null
          step14_text: string | null
          step15_expanded_text: string | null
          step15_text: string | null
          step2_expanded_text: string | null
          step2_text: string | null
          step3_expanded_text: string | null
          step3_text: string | null
          step4_expanded_text: string | null
          step4_text: string | null
          step5_expanded_text: string | null
          step5_text: string | null
          step6_expanded_text: string | null
          step6_text: string | null
          step7_expanded_text: string | null
          step7_text: string | null
          step8_expanded_text: string | null
          step8_text: string | null
          step9_expanded_text: string | null
          step9_text: string | null
          steps_number: number | null
          type: string | null
        }
        Insert: {
          answer?: string | null
          calculation_required?: string | null
          calculator_allowed?: boolean | null
          checked?: boolean | null
          code?: number | null
          corrected?: boolean | null
          difficulty?: number | null
          problem_image?: string | null
          problem_number?: string | null
          problem_text?: string | null
          question_id: string
          rec_time?: string | null
          skills?: string | null
          skills_for_step_1?: string | null
          skills_for_step_10?: string | null
          skills_for_step_11?: string | null
          skills_for_step_12?: string | null
          skills_for_step_13?: string | null
          skills_for_step_14?: string | null
          skills_for_step_15?: string | null
          skills_for_step_2?: string | null
          skills_for_step_3?: string | null
          skills_for_step_4?: string | null
          skills_for_step_5?: string | null
          skills_for_step_6?: string | null
          skills_for_step_7?: string | null
          skills_for_step_8?: string | null
          skills_for_step_9?: string | null
          solution_image?: string | null
          solution_text?: string | null
          solutiontextexpanded?: string | null
          source?: string | null
          step1_expanded_text?: string | null
          step1_text?: string | null
          step10_expanded_text?: string | null
          step10_text?: string | null
          step11_expanded_text?: string | null
          step11_text?: string | null
          step12_expanded_text?: string | null
          step12_text?: string | null
          step13_expanded_text?: string | null
          step13_text?: string | null
          step14_expanded_text?: string | null
          step14_text?: string | null
          step15_expanded_text?: string | null
          step15_text?: string | null
          step2_expanded_text?: string | null
          step2_text?: string | null
          step3_expanded_text?: string | null
          step3_text?: string | null
          step4_expanded_text?: string | null
          step4_text?: string | null
          step5_expanded_text?: string | null
          step5_text?: string | null
          step6_expanded_text?: string | null
          step6_text?: string | null
          step7_expanded_text?: string | null
          step7_text?: string | null
          step8_expanded_text?: string | null
          step8_text?: string | null
          step9_expanded_text?: string | null
          step9_text?: string | null
          steps_number?: number | null
          type?: string | null
        }
        Update: {
          answer?: string | null
          calculation_required?: string | null
          calculator_allowed?: boolean | null
          checked?: boolean | null
          code?: number | null
          corrected?: boolean | null
          difficulty?: number | null
          problem_image?: string | null
          problem_number?: string | null
          problem_text?: string | null
          question_id?: string
          rec_time?: string | null
          skills?: string | null
          skills_for_step_1?: string | null
          skills_for_step_10?: string | null
          skills_for_step_11?: string | null
          skills_for_step_12?: string | null
          skills_for_step_13?: string | null
          skills_for_step_14?: string | null
          skills_for_step_15?: string | null
          skills_for_step_2?: string | null
          skills_for_step_3?: string | null
          skills_for_step_4?: string | null
          skills_for_step_5?: string | null
          skills_for_step_6?: string | null
          skills_for_step_7?: string | null
          skills_for_step_8?: string | null
          skills_for_step_9?: string | null
          solution_image?: string | null
          solution_text?: string | null
          solutiontextexpanded?: string | null
          source?: string | null
          step1_expanded_text?: string | null
          step1_text?: string | null
          step10_expanded_text?: string | null
          step10_text?: string | null
          step11_expanded_text?: string | null
          step11_text?: string | null
          step12_expanded_text?: string | null
          step12_text?: string | null
          step13_expanded_text?: string | null
          step13_text?: string | null
          step14_expanded_text?: string | null
          step14_text?: string | null
          step15_expanded_text?: string | null
          step15_text?: string | null
          step2_expanded_text?: string | null
          step2_text?: string | null
          step3_expanded_text?: string | null
          step3_text?: string | null
          step4_expanded_text?: string | null
          step4_text?: string | null
          step5_expanded_text?: string | null
          step5_text?: string | null
          step6_expanded_text?: string | null
          step6_text?: string | null
          step7_expanded_text?: string | null
          step7_text?: string | null
          step8_expanded_text?: string | null
          step8_text?: string | null
          step9_expanded_text?: string | null
          step9_text?: string | null
          steps_number?: number | null
          type?: string | null
        }
        Relationships: []
      }
      OGE_SHFIPI_problems_1_25_old: {
        Row: {
          answer: string | null
          calculation_required: string | null
          calculator_allowed: boolean | null
          checked: boolean | null
          code: number | null
          corrected: boolean | null
          difficulty: string | null
          problem_image: string | null
          problem_number: string | null
          problem_text: string | null
          question_id: string
          rec_time: string | null
          skills: string | null
          skills_for_step_1: string | null
          skills_for_step_10: string | null
          skills_for_step_11: string | null
          skills_for_step_12: string | null
          skills_for_step_13: string | null
          skills_for_step_14: string | null
          skills_for_step_15: string | null
          skills_for_step_2: string | null
          skills_for_step_3: string | null
          skills_for_step_4: string | null
          skills_for_step_5: string | null
          skills_for_step_6: string | null
          skills_for_step_7: string | null
          skills_for_step_8: string | null
          skills_for_step_9: string | null
          solution_image: string | null
          solution_text: string | null
          solutiontextexpanded: string | null
          source: string | null
          step1_expanded_text: string | null
          step1_text: string | null
          step10_expanded_text: string | null
          step10_text: string | null
          step11_expanded_text: string | null
          step11_text: string | null
          step12_expanded_text: string | null
          step12_text: string | null
          step13_expanded_text: string | null
          step13_text: string | null
          step14_expanded_text: string | null
          step14_text: string | null
          step15_expanded_text: string | null
          step15_text: string | null
          step2_expanded_text: string | null
          step2_text: string | null
          step3_expanded_text: string | null
          step3_text: string | null
          step4_expanded_text: string | null
          step4_text: string | null
          step5_expanded_text: string | null
          step5_text: string | null
          step6_expanded_text: string | null
          step6_text: string | null
          step7_expanded_text: string | null
          step7_text: string | null
          step8_expanded_text: string | null
          step8_text: string | null
          step9_expanded_text: string | null
          step9_text: string | null
          steps_number: number | null
          type: string | null
        }
        Insert: {
          answer?: string | null
          calculation_required?: string | null
          calculator_allowed?: boolean | null
          checked?: boolean | null
          code?: number | null
          corrected?: boolean | null
          difficulty?: string | null
          problem_image?: string | null
          problem_number?: string | null
          problem_text?: string | null
          question_id: string
          rec_time?: string | null
          skills?: string | null
          skills_for_step_1?: string | null
          skills_for_step_10?: string | null
          skills_for_step_11?: string | null
          skills_for_step_12?: string | null
          skills_for_step_13?: string | null
          skills_for_step_14?: string | null
          skills_for_step_15?: string | null
          skills_for_step_2?: string | null
          skills_for_step_3?: string | null
          skills_for_step_4?: string | null
          skills_for_step_5?: string | null
          skills_for_step_6?: string | null
          skills_for_step_7?: string | null
          skills_for_step_8?: string | null
          skills_for_step_9?: string | null
          solution_image?: string | null
          solution_text?: string | null
          solutiontextexpanded?: string | null
          source?: string | null
          step1_expanded_text?: string | null
          step1_text?: string | null
          step10_expanded_text?: string | null
          step10_text?: string | null
          step11_expanded_text?: string | null
          step11_text?: string | null
          step12_expanded_text?: string | null
          step12_text?: string | null
          step13_expanded_text?: string | null
          step13_text?: string | null
          step14_expanded_text?: string | null
          step14_text?: string | null
          step15_expanded_text?: string | null
          step15_text?: string | null
          step2_expanded_text?: string | null
          step2_text?: string | null
          step3_expanded_text?: string | null
          step3_text?: string | null
          step4_expanded_text?: string | null
          step4_text?: string | null
          step5_expanded_text?: string | null
          step5_text?: string | null
          step6_expanded_text?: string | null
          step6_text?: string | null
          step7_expanded_text?: string | null
          step7_text?: string | null
          step8_expanded_text?: string | null
          step8_text?: string | null
          step9_expanded_text?: string | null
          step9_text?: string | null
          steps_number?: number | null
          type?: string | null
        }
        Update: {
          answer?: string | null
          calculation_required?: string | null
          calculator_allowed?: boolean | null
          checked?: boolean | null
          code?: number | null
          corrected?: boolean | null
          difficulty?: string | null
          problem_image?: string | null
          problem_number?: string | null
          problem_text?: string | null
          question_id?: string
          rec_time?: string | null
          skills?: string | null
          skills_for_step_1?: string | null
          skills_for_step_10?: string | null
          skills_for_step_11?: string | null
          skills_for_step_12?: string | null
          skills_for_step_13?: string | null
          skills_for_step_14?: string | null
          skills_for_step_15?: string | null
          skills_for_step_2?: string | null
          skills_for_step_3?: string | null
          skills_for_step_4?: string | null
          skills_for_step_5?: string | null
          skills_for_step_6?: string | null
          skills_for_step_7?: string | null
          skills_for_step_8?: string | null
          skills_for_step_9?: string | null
          solution_image?: string | null
          solution_text?: string | null
          solutiontextexpanded?: string | null
          source?: string | null
          step1_expanded_text?: string | null
          step1_text?: string | null
          step10_expanded_text?: string | null
          step10_text?: string | null
          step11_expanded_text?: string | null
          step11_text?: string | null
          step12_expanded_text?: string | null
          step12_text?: string | null
          step13_expanded_text?: string | null
          step13_text?: string | null
          step14_expanded_text?: string | null
          step14_text?: string | null
          step15_expanded_text?: string | null
          step15_text?: string | null
          step2_expanded_text?: string | null
          step2_text?: string | null
          step3_expanded_text?: string | null
          step3_text?: string | null
          step4_expanded_text?: string | null
          step4_text?: string | null
          step5_expanded_text?: string | null
          step5_text?: string | null
          step6_expanded_text?: string | null
          step6_text?: string | null
          step7_expanded_text?: string | null
          step7_text?: string | null
          step8_expanded_text?: string | null
          step8_text?: string | null
          step9_expanded_text?: string | null
          step9_text?: string | null
          steps_number?: number | null
          type?: string | null
        }
        Relationships: []
      }
      ogemath_fipi_bank: {
        Row: {
          answer: string | null
          checked: string | null
          comments: string | null
          corrected: string | null
          problem_image: string | null
          problem_link: string | null
          problem_number_type: number | null
          problem_text: string | null
          question_id: number
          solution_text: string | null
          solutiontextexpanded: string | null
        }
        Insert: {
          answer?: string | null
          checked?: string | null
          comments?: string | null
          corrected?: string | null
          problem_image?: string | null
          problem_link?: string | null
          problem_number_type?: number | null
          problem_text?: string | null
          question_id: number
          solution_text?: string | null
          solutiontextexpanded?: string | null
        }
        Update: {
          answer?: string | null
          checked?: string | null
          comments?: string | null
          corrected?: string | null
          problem_image?: string | null
          problem_link?: string | null
          problem_number_type?: number | null
          problem_text?: string | null
          question_id?: number
          solution_text?: string | null
          solutiontextexpanded?: string | null
        }
        Relationships: []
      }
      student_skills: {
        Row: {
          created_at: string | null
          skill_1: number | null
          skill_10: number | null
          skill_100: number | null
          skill_101: number | null
          skill_102: number | null
          skill_103: number | null
          skill_104: number | null
          skill_105: number | null
          skill_106: number | null
          skill_107: number | null
          skill_108: number | null
          skill_109: number | null
          skill_11: number | null
          skill_110: number | null
          skill_111: number | null
          skill_112: number | null
          skill_113: number | null
          skill_114: number | null
          skill_115: number | null
          skill_116: number | null
          skill_117: number | null
          skill_118: number | null
          skill_119: number | null
          skill_12: number | null
          skill_120: number | null
          skill_121: number | null
          skill_122: number | null
          skill_123: number | null
          skill_124: number | null
          skill_125: number | null
          skill_126: number | null
          skill_127: number | null
          skill_128: number | null
          skill_129: number | null
          skill_13: number | null
          skill_130: number | null
          skill_131: number | null
          skill_132: number | null
          skill_133: number | null
          skill_134: number | null
          skill_135: number | null
          skill_136: number | null
          skill_137: number | null
          skill_138: number | null
          skill_139: number | null
          skill_14: number | null
          skill_140: number | null
          skill_141: number | null
          skill_142: number | null
          skill_143: number | null
          skill_144: number | null
          skill_145: number | null
          skill_146: number | null
          skill_147: number | null
          skill_148: number | null
          skill_149: number | null
          skill_15: number | null
          skill_150: number | null
          skill_151: number | null
          skill_152: number | null
          skill_153: number | null
          skill_154: number | null
          skill_155: number | null
          skill_156: number | null
          skill_157: number | null
          skill_158: number | null
          skill_159: number | null
          skill_16: number | null
          skill_160: number | null
          skill_161: number | null
          skill_162: number | null
          skill_163: number | null
          skill_164: number | null
          skill_165: number | null
          skill_166: number | null
          skill_167: number | null
          skill_168: number | null
          skill_169: number | null
          skill_17: number | null
          skill_170: number | null
          skill_171: number | null
          skill_172: number | null
          skill_173: number | null
          skill_174: number | null
          skill_175: number | null
          skill_176: number | null
          skill_177: number | null
          skill_178: number | null
          skill_179: number | null
          skill_18: number | null
          skill_180: number | null
          skill_181: number | null
          skill_19: number | null
          skill_2: number | null
          skill_20: number | null
          skill_21: number | null
          skill_22: number | null
          skill_23: number | null
          skill_24: number | null
          skill_25: number | null
          skill_26: number | null
          skill_27: number | null
          skill_28: number | null
          skill_29: number | null
          skill_3: number | null
          skill_30: number | null
          skill_31: number | null
          skill_32: number | null
          skill_33: number | null
          skill_34: number | null
          skill_35: number | null
          skill_36: number | null
          skill_37: number | null
          skill_38: number | null
          skill_39: number | null
          skill_4: number | null
          skill_40: number | null
          skill_41: number | null
          skill_42: number | null
          skill_43: number | null
          skill_44: number | null
          skill_45: number | null
          skill_46: number | null
          skill_47: number | null
          skill_48: number | null
          skill_49: number | null
          skill_5: number | null
          skill_50: number | null
          skill_51: number | null
          skill_52: number | null
          skill_53: number | null
          skill_54: number | null
          skill_55: number | null
          skill_56: number | null
          skill_57: number | null
          skill_58: number | null
          skill_59: number | null
          skill_6: number | null
          skill_60: number | null
          skill_61: number | null
          skill_62: number | null
          skill_63: number | null
          skill_64: number | null
          skill_65: number | null
          skill_66: number | null
          skill_67: number | null
          skill_68: number | null
          skill_69: number | null
          skill_7: number | null
          skill_70: number | null
          skill_71: number | null
          skill_72: number | null
          skill_73: number | null
          skill_74: number | null
          skill_75: number | null
          skill_76: number | null
          skill_77: number | null
          skill_78: number | null
          skill_79: number | null
          skill_8: number | null
          skill_80: number | null
          skill_81: number | null
          skill_82: number | null
          skill_83: number | null
          skill_84: number | null
          skill_85: number | null
          skill_86: number | null
          skill_87: number | null
          skill_88: number | null
          skill_89: number | null
          skill_9: number | null
          skill_90: number | null
          skill_91: number | null
          skill_92: number | null
          skill_93: number | null
          skill_94: number | null
          skill_95: number | null
          skill_96: number | null
          skill_97: number | null
          skill_98: number | null
          skill_99: number | null
          uid: string
        }
        Insert: {
          created_at?: string | null
          skill_1?: number | null
          skill_10?: number | null
          skill_100?: number | null
          skill_101?: number | null
          skill_102?: number | null
          skill_103?: number | null
          skill_104?: number | null
          skill_105?: number | null
          skill_106?: number | null
          skill_107?: number | null
          skill_108?: number | null
          skill_109?: number | null
          skill_11?: number | null
          skill_110?: number | null
          skill_111?: number | null
          skill_112?: number | null
          skill_113?: number | null
          skill_114?: number | null
          skill_115?: number | null
          skill_116?: number | null
          skill_117?: number | null
          skill_118?: number | null
          skill_119?: number | null
          skill_12?: number | null
          skill_120?: number | null
          skill_121?: number | null
          skill_122?: number | null
          skill_123?: number | null
          skill_124?: number | null
          skill_125?: number | null
          skill_126?: number | null
          skill_127?: number | null
          skill_128?: number | null
          skill_129?: number | null
          skill_13?: number | null
          skill_130?: number | null
          skill_131?: number | null
          skill_132?: number | null
          skill_133?: number | null
          skill_134?: number | null
          skill_135?: number | null
          skill_136?: number | null
          skill_137?: number | null
          skill_138?: number | null
          skill_139?: number | null
          skill_14?: number | null
          skill_140?: number | null
          skill_141?: number | null
          skill_142?: number | null
          skill_143?: number | null
          skill_144?: number | null
          skill_145?: number | null
          skill_146?: number | null
          skill_147?: number | null
          skill_148?: number | null
          skill_149?: number | null
          skill_15?: number | null
          skill_150?: number | null
          skill_151?: number | null
          skill_152?: number | null
          skill_153?: number | null
          skill_154?: number | null
          skill_155?: number | null
          skill_156?: number | null
          skill_157?: number | null
          skill_158?: number | null
          skill_159?: number | null
          skill_16?: number | null
          skill_160?: number | null
          skill_161?: number | null
          skill_162?: number | null
          skill_163?: number | null
          skill_164?: number | null
          skill_165?: number | null
          skill_166?: number | null
          skill_167?: number | null
          skill_168?: number | null
          skill_169?: number | null
          skill_17?: number | null
          skill_170?: number | null
          skill_171?: number | null
          skill_172?: number | null
          skill_173?: number | null
          skill_174?: number | null
          skill_175?: number | null
          skill_176?: number | null
          skill_177?: number | null
          skill_178?: number | null
          skill_179?: number | null
          skill_18?: number | null
          skill_180?: number | null
          skill_181?: number | null
          skill_19?: number | null
          skill_2?: number | null
          skill_20?: number | null
          skill_21?: number | null
          skill_22?: number | null
          skill_23?: number | null
          skill_24?: number | null
          skill_25?: number | null
          skill_26?: number | null
          skill_27?: number | null
          skill_28?: number | null
          skill_29?: number | null
          skill_3?: number | null
          skill_30?: number | null
          skill_31?: number | null
          skill_32?: number | null
          skill_33?: number | null
          skill_34?: number | null
          skill_35?: number | null
          skill_36?: number | null
          skill_37?: number | null
          skill_38?: number | null
          skill_39?: number | null
          skill_4?: number | null
          skill_40?: number | null
          skill_41?: number | null
          skill_42?: number | null
          skill_43?: number | null
          skill_44?: number | null
          skill_45?: number | null
          skill_46?: number | null
          skill_47?: number | null
          skill_48?: number | null
          skill_49?: number | null
          skill_5?: number | null
          skill_50?: number | null
          skill_51?: number | null
          skill_52?: number | null
          skill_53?: number | null
          skill_54?: number | null
          skill_55?: number | null
          skill_56?: number | null
          skill_57?: number | null
          skill_58?: number | null
          skill_59?: number | null
          skill_6?: number | null
          skill_60?: number | null
          skill_61?: number | null
          skill_62?: number | null
          skill_63?: number | null
          skill_64?: number | null
          skill_65?: number | null
          skill_66?: number | null
          skill_67?: number | null
          skill_68?: number | null
          skill_69?: number | null
          skill_7?: number | null
          skill_70?: number | null
          skill_71?: number | null
          skill_72?: number | null
          skill_73?: number | null
          skill_74?: number | null
          skill_75?: number | null
          skill_76?: number | null
          skill_77?: number | null
          skill_78?: number | null
          skill_79?: number | null
          skill_8?: number | null
          skill_80?: number | null
          skill_81?: number | null
          skill_82?: number | null
          skill_83?: number | null
          skill_84?: number | null
          skill_85?: number | null
          skill_86?: number | null
          skill_87?: number | null
          skill_88?: number | null
          skill_89?: number | null
          skill_9?: number | null
          skill_90?: number | null
          skill_91?: number | null
          skill_92?: number | null
          skill_93?: number | null
          skill_94?: number | null
          skill_95?: number | null
          skill_96?: number | null
          skill_97?: number | null
          skill_98?: number | null
          skill_99?: number | null
          uid: string
        }
        Update: {
          created_at?: string | null
          skill_1?: number | null
          skill_10?: number | null
          skill_100?: number | null
          skill_101?: number | null
          skill_102?: number | null
          skill_103?: number | null
          skill_104?: number | null
          skill_105?: number | null
          skill_106?: number | null
          skill_107?: number | null
          skill_108?: number | null
          skill_109?: number | null
          skill_11?: number | null
          skill_110?: number | null
          skill_111?: number | null
          skill_112?: number | null
          skill_113?: number | null
          skill_114?: number | null
          skill_115?: number | null
          skill_116?: number | null
          skill_117?: number | null
          skill_118?: number | null
          skill_119?: number | null
          skill_12?: number | null
          skill_120?: number | null
          skill_121?: number | null
          skill_122?: number | null
          skill_123?: number | null
          skill_124?: number | null
          skill_125?: number | null
          skill_126?: number | null
          skill_127?: number | null
          skill_128?: number | null
          skill_129?: number | null
          skill_13?: number | null
          skill_130?: number | null
          skill_131?: number | null
          skill_132?: number | null
          skill_133?: number | null
          skill_134?: number | null
          skill_135?: number | null
          skill_136?: number | null
          skill_137?: number | null
          skill_138?: number | null
          skill_139?: number | null
          skill_14?: number | null
          skill_140?: number | null
          skill_141?: number | null
          skill_142?: number | null
          skill_143?: number | null
          skill_144?: number | null
          skill_145?: number | null
          skill_146?: number | null
          skill_147?: number | null
          skill_148?: number | null
          skill_149?: number | null
          skill_15?: number | null
          skill_150?: number | null
          skill_151?: number | null
          skill_152?: number | null
          skill_153?: number | null
          skill_154?: number | null
          skill_155?: number | null
          skill_156?: number | null
          skill_157?: number | null
          skill_158?: number | null
          skill_159?: number | null
          skill_16?: number | null
          skill_160?: number | null
          skill_161?: number | null
          skill_162?: number | null
          skill_163?: number | null
          skill_164?: number | null
          skill_165?: number | null
          skill_166?: number | null
          skill_167?: number | null
          skill_168?: number | null
          skill_169?: number | null
          skill_17?: number | null
          skill_170?: number | null
          skill_171?: number | null
          skill_172?: number | null
          skill_173?: number | null
          skill_174?: number | null
          skill_175?: number | null
          skill_176?: number | null
          skill_177?: number | null
          skill_178?: number | null
          skill_179?: number | null
          skill_18?: number | null
          skill_180?: number | null
          skill_181?: number | null
          skill_19?: number | null
          skill_2?: number | null
          skill_20?: number | null
          skill_21?: number | null
          skill_22?: number | null
          skill_23?: number | null
          skill_24?: number | null
          skill_25?: number | null
          skill_26?: number | null
          skill_27?: number | null
          skill_28?: number | null
          skill_29?: number | null
          skill_3?: number | null
          skill_30?: number | null
          skill_31?: number | null
          skill_32?: number | null
          skill_33?: number | null
          skill_34?: number | null
          skill_35?: number | null
          skill_36?: number | null
          skill_37?: number | null
          skill_38?: number | null
          skill_39?: number | null
          skill_4?: number | null
          skill_40?: number | null
          skill_41?: number | null
          skill_42?: number | null
          skill_43?: number | null
          skill_44?: number | null
          skill_45?: number | null
          skill_46?: number | null
          skill_47?: number | null
          skill_48?: number | null
          skill_49?: number | null
          skill_5?: number | null
          skill_50?: number | null
          skill_51?: number | null
          skill_52?: number | null
          skill_53?: number | null
          skill_54?: number | null
          skill_55?: number | null
          skill_56?: number | null
          skill_57?: number | null
          skill_58?: number | null
          skill_59?: number | null
          skill_6?: number | null
          skill_60?: number | null
          skill_61?: number | null
          skill_62?: number | null
          skill_63?: number | null
          skill_64?: number | null
          skill_65?: number | null
          skill_66?: number | null
          skill_67?: number | null
          skill_68?: number | null
          skill_69?: number | null
          skill_7?: number | null
          skill_70?: number | null
          skill_71?: number | null
          skill_72?: number | null
          skill_73?: number | null
          skill_74?: number | null
          skill_75?: number | null
          skill_76?: number | null
          skill_77?: number | null
          skill_78?: number | null
          skill_79?: number | null
          skill_8?: number | null
          skill_80?: number | null
          skill_81?: number | null
          skill_82?: number | null
          skill_83?: number | null
          skill_84?: number | null
          skill_85?: number | null
          skill_86?: number | null
          skill_87?: number | null
          skill_88?: number | null
          skill_89?: number | null
          skill_9?: number | null
          skill_90?: number | null
          skill_91?: number | null
          skill_92?: number | null
          skill_93?: number | null
          skill_94?: number | null
          skill_95?: number | null
          skill_96?: number | null
          skill_97?: number | null
          skill_98?: number | null
          skill_99?: number | null
          uid?: string
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          activity_id: string
          activity_type: string
          completed_at: string
          id: string
          points_earned: number
          subunit_number: number | null
          time_spent_minutes: number | null
          unit_number: number
          user_id: string
        }
        Insert: {
          activity_id: string
          activity_type: string
          completed_at?: string
          id?: string
          points_earned?: number
          subunit_number?: number | null
          time_spent_minutes?: number | null
          unit_number: number
          user_id: string
        }
        Update: {
          activity_id?: string
          activity_type?: string
          completed_at?: string
          id?: string
          points_earned?: number
          subunit_number?: number | null
          time_spent_minutes?: number | null
          unit_number?: number
          user_id?: string
        }
        Relationships: []
      }
      user_mastery: {
        Row: {
          created_at: string
          id: string
          mastery_level: string
          mastery_points: number
          subunit_number: number | null
          total_possible_points: number
          unit_number: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mastery_level?: string
          mastery_points?: number
          subunit_number?: number | null
          total_possible_points?: number
          unit_number: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mastery_level?: string
          mastery_points?: number
          subunit_number?: number | null
          total_possible_points?: number
          unit_number?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_statistics: {
        Row: {
          average_score: number
          completed_lessons: number
          created_at: string
          energy_points: number
          id: string
          practice_problems: number
          quizzes_completed: number
          updated_at: string
          user_id: string
        }
        Insert: {
          average_score?: number
          completed_lessons?: number
          created_at?: string
          energy_points?: number
          id?: string
          practice_problems?: number
          quizzes_completed?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          average_score?: number
          completed_lessons?: number
          created_at?: string
          energy_points?: number
          id?: string
          practice_problems?: number
          quizzes_completed?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string | null
          current_streak: number
          daily_goal_minutes: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number
          daily_goal_minutes?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number
          daily_goal_minutes?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
