import { OnboardingData } from '@/lib/onboardingSchema';

export async function saveOnboarding(data: OnboardingData): Promise<void> {
  // TODO: Replace with real Supabase integration
  // Should save to profiles table with columns:
  // exam_type, school_grade, basic_level, took_mock, mock_score, goal_score, onboarded_at
  
  try {
    console.log('Saving onboarding data:', data);
    
    // Simulate API call
    const response = await fetch("/api/onboarding", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // For now, just simulate a successful save
    await new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    // For now, don't throw - just log the error
    // throw new Error('Failed to save onboarding data');
  }
}