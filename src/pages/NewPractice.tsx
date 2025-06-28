
import React from 'react';
import Header from '@/components/Header';
import Practice from '@/components/backend/Practice';

const NewPracticePage: React.FC = () => {
  const handlePracticeComplete = (results: { totalQuestions: number; correctAnswers: number }) => {
    console.log('Practice completed with results:', results);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Практические тесты
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Выберите темы и количество вопросов для практики. Тестируйте свои знания с мгновенной обратной связью.
            </p>
          </div>
          
          <Practice onComplete={handlePracticeComplete} />
        </div>
      </div>
    </div>
  );
};

export default NewPracticePage;
