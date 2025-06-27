
import React from 'react';
import DiagnosticTest from '@/components/DiagnosticTest';
import { useNavigate } from 'react-router-dom';

const DiagnosticTestPage: React.FC = () => {
  const navigate = useNavigate();

  const handleTestComplete = (results: { totalQuestions: number; correctAnswers: number; testedSkills: number[] }) => {
    console.log('Diagnostic test completed with results:', results);
    // Navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Диагностический тест
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Этот тест поможет оценить ваш уровень базовых математических знаний.
          </p>
        </div>
        
        <DiagnosticTest onComplete={handleTestComplete} />
      </div>
    </div>
  );
};

export default DiagnosticTestPage;
