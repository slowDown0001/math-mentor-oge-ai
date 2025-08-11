import React, { useState, useEffect } from 'react';
import { Target, Clock, Flame } from 'lucide-react';

interface StreakRingAnimationProps {
  currentMinutes: number;
  targetMinutes: number;
  addedMinutes: number;
  isVisible: boolean;
  onAnimationComplete?: () => void;
}

export const StreakRingAnimation: React.FC<StreakRingAnimationProps> = ({
  currentMinutes,
  targetMinutes,
  addedMinutes,
  isVisible,
  onAnimationComplete
}) => {
  const [animatedMinutes, setAnimatedMinutes] = useState(currentMinutes);
  const [showAnimation, setShowAnimation] = useState(false);
  
  const previousPercentage = (currentMinutes / targetMinutes) * 100;
  const newPercentage = Math.min(((currentMinutes + addedMinutes) / targetMinutes) * 100, 100);
  
  const circumference = 2 * Math.PI * 45; // radius = 45
  const previousStrokeDashoffset = circumference - (previousPercentage / 100) * circumference;
  const newStrokeDashoffset = circumference - (newPercentage / 100) * circumference;

  useEffect(() => {
    if (isVisible) {
      setShowAnimation(true);
      
      const timer = setTimeout(() => {
        setAnimatedMinutes(currentMinutes + addedMinutes);
      }, 500);
      
      const completeTimer = setTimeout(() => {
        onAnimationComplete?.();
      }, 3000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(completeTimer);
      };
    } else {
      setShowAnimation(false);
      setAnimatedMinutes(currentMinutes);
    }
  }, [isVisible, currentMinutes, addedMinutes, onAnimationComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 animate-scale-in">
        <div className="text-center">
          <div className="relative mx-auto mb-6" style={{ width: '120px', height: '120px' }}>
            {/* Background circle */}
            <svg
              className="absolute inset-0 transform -rotate-90"
              width="120"
              height="120"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              
              {/* Animated progress */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={showAnimation ? newStrokeDashoffset : previousStrokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-[1500ms] ease-out"
              />
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Flame className="h-8 w-8 text-orange-500 mb-1 animate-pulse" />
              <div className="text-lg font-bold text-gray-800 transition-all duration-300">
                {Math.min(animatedMinutes, targetMinutes)}
              </div>
              <div className="text-xs text-gray-500">
                / {targetMinutes} мин
              </div>
            </div>
          </div>
          
          <div className="space-y-2 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h3 className="text-xl font-semibold text-gray-800 flex items-center justify-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Отличная работа!
            </h3>
            
            <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium animate-scale-in"
                 style={{ animationDelay: '500ms' }}>
              <Clock className="h-4 w-4" />
              +{addedMinutes} {addedMinutes === 1 ? 'минута' : addedMinutes < 5 ? 'минуты' : 'минут'}
            </div>
            
            <p className="text-gray-600 text-sm">
              {newPercentage >= 100 
                ? "🎉 Дневная цель достигнута!" 
                : `${Math.round(newPercentage)}% от дневной цели`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};