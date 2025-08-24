import React from 'react';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { useNavigate } from 'react-router-dom';

export default function AfterRegistration() {
  const navigate = useNavigate();

  const handleComplete = () => {
    // This will be called after successful onboarding
    // The wizard itself handles navigation to dashboard
  };

  return (
    <div className="min-h-screen">
      <OnboardingWizard onComplete={handleComplete} />
    </div>
  );
}