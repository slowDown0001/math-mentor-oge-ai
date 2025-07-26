import React from 'react';
import { Star } from 'lucide-react';

interface PointsAnimationProps {
  points: number;
  onComplete: () => void;
}

export const PointsAnimation: React.FC<PointsAnimationProps> = ({ points, onComplete }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 animate-scale-in">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <Star className="w-8 h-8 text-white" fill="currentColor" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Отлично!
          </h3>
          
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full text-lg font-bold mb-2">
            +{points} баллов
          </div>
          
          <p className="text-gray-600 text-sm">
            Энергетические баллы добавлены
          </p>
        </div>
      </div>
    </div>
  );
};