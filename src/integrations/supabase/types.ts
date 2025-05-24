export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
