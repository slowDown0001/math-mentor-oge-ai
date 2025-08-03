import React, { useState, useEffect } from 'react';
import { Star, Zap } from 'lucide-react';

interface EnergyPointsHeaderAnimationProps {
  points: number;
  isVisible: boolean;
  onAnimationComplete?: () => void;
}

export const EnergyPointsHeaderAnimation: React.FC<EnergyPointsHeaderAnimationProps> = ({
  points,
  isVisible,
  onAnimationComplete
}) => {
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'pulse' | 'glow' | 'complete'>('idle');
  const [displayPoints, setDisplayPoints] = useState(0);
  const [showFloatingPoints, setShowFloatingPoints] = useState(false);

  useEffect(() => {
    if (isVisible && points > 0) {
      // Start animation sequence
      setAnimationPhase('pulse');
      setShowFloatingPoints(true);
      
      // Animate points counter
      let currentPoints = 0;
      const increment = Math.ceil(points / 20);
      const pointsInterval = setInterval(() => {
        currentPoints += increment;
        if (currentPoints >= points) {
          currentPoints = points;
          clearInterval(pointsInterval);
        }
        setDisplayPoints(currentPoints);
      }, 50);

      // Animation phases
      const phaseTimers = [
        setTimeout(() => setAnimationPhase('glow'), 300),
        setTimeout(() => setAnimationPhase('complete'), 1200),
        setTimeout(() => {
          setShowFloatingPoints(false);
          onAnimationComplete?.();
        }, 2000)
      ];

      return () => {
        clearInterval(pointsInterval);
        phaseTimers.forEach(clearTimeout);
      };
    } else {
      setAnimationPhase('idle');
      setDisplayPoints(0);
      setShowFloatingPoints(false);
    }
  }, [isVisible, points, onAnimationComplete]);

  if (!isVisible) return null;

  return (
    <>
      {/* Floating points animation */}
      {showFloatingPoints && (
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
          <div className="animate-fade-in flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full shadow-lg animate-bounce">
            <Zap className="w-4 h-4" />
            <span className="font-bold text-sm">+{displayPoints}</span>
            <span className="text-xs">очков</span>
          </div>
        </div>
      )}
      
      {/* Glow effect overlay */}
      {animationPhase === 'glow' && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/30 to-orange-500/30 animate-pulse pointer-events-none" />
      )}
      
      {/* Star burst effect */}
      {animationPhase === 'pulse' && (
        <div className="absolute inset-0 pointer-events-none">
          <Star className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-3 h-3 text-yellow-400 animate-ping" />
          <Star className="absolute bottom-0 right-0 transform translate-x-1 translate-y-1 w-2 h-2 text-orange-400 animate-ping" style={{ animationDelay: '0.2s' }} />
          <Star className="absolute top-1/2 left-0 transform -translate-x-1 -translate-y-1/2 w-2 h-2 text-yellow-300 animate-ping" style={{ animationDelay: '0.4s' }} />
        </div>
      )}
    </>
  );
};