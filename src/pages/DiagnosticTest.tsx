
import React from 'react';
import { DiagnosticTest } from '@/components/diagnostic/DiagnosticTest';
import { useNavigate } from 'react-router-dom';

const DiagnosticTestPage: React.FC = () => {
  const navigate = useNavigate();

  const handleTestComplete = (results: Record<string, number>) => {
    console.log('Diagnostic test completed with results:', results);
    // Navigate to dashboard or statistics page
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
            Этот тест поможет оценить ваш уровень знаний по математике. 
            Результаты будут использованы для персонализации вашего обучения.
          </p>
        </div>
        
        <DiagnosticTest onComplete={handleTestComplete} />
      </div>
    </div>
  );
};

export default DiagnosticTestPage;
