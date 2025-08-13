import { z } from 'zod';

export const onboardingSchema = z.object({
  examType: z.enum(["OGE", "EGE_BASE", "EGE_PROFILE"]),
  schoolGrade: z.union([z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  basicLevel: z.number().min(1).max(5),
  tookMock: z.boolean(),
  mockScore: z.number().min(0).max(100).optional(),
  goalScore: z.number().min(0).max(100),
}).refine((data) => {
  // If took mock, mock score is required
  if (data.tookMock && (data.mockScore === undefined || data.mockScore === null)) {
    return false;
  }
  return true;
}, {
  message: "Mock score is required when you took a mock exam",
  path: ["mockScore"]
});

export type OnboardingData = z.infer<typeof onboardingSchema>;

export const examTypeLabels = {
  "OGE": "ОГЭ",
  "EGE_BASE": "ЕГЭ (базовый)",
  "EGE_PROFILE": "ЕГЭ (профильный)"
} as const;