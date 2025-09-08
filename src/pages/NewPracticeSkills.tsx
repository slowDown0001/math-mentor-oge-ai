import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import Practice from '@/components/backend/Practice';

const NewPracticeSkills: React.FC = () => {
  const handlePracticeComplete = (results: { totalQuestions: number; correctAnswers: number }) => {
    console.log('Practice completed with results:', results);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link to="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Главная
              </Button>
            </Link>
            <Link to="/mydashboard">
              <Button className="bg-gradient-to-r from-yellow-200 to-yellow-300 hover:from-yellow-300 hover:to-yellow-400 text-black shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                Профиль
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="pt-8 pb-8">
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

export default NewPracticeSkills;