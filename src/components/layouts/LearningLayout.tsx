import React, { useState, useEffect } from "react";
import FlyingMathBackground from "@/components/FlyingMathBackground";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { StreakDisplay } from "@/components/streak/StreakDisplay";
import { EnergyPointsHeaderAnimation } from "@/components/streak/EnergyPointsHeaderAnimation";
import { DailyTaskStory } from "@/components/DailyTaskStory";



const LearningLayout: React.FC = () => {
  const navigate = useNavigate();
  const startMock = () => navigate("/practice-now");
  
  const [energyPointsAnimation, setEnergyPointsAnimation] = useState({ isVisible: false, points: 0 });

  // Set up global trigger for energy points animation
  useEffect(() => {
    (window as any).triggerEnergyPointsAnimation = (points: number) => {
      setEnergyPointsAnimation({ isVisible: true, points });
    };
    return () => {
      delete (window as any).triggerEnergyPointsAnimation;
    };
  }, []);

  return (
    <div
      className="min-h-screen text-foreground relative"
      style={{ background: "linear-gradient(135deg, #1a1f36 0%, #2d3748 50%, #1a1f36 100%)" }}
    >

      <FlyingMathBackground />

      <nav className="fixed top-0 w-full z-30 backdrop-blur-lg bg-[#1a1f36]/80 border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-[#1a1f36] font-bold text-xl">M</span>
            </div>
            <Link 
              to="/ogemath" 
              className="font-display text-xl font-semibold text-white hover:text-yellow-500 transition-colors"
            >
              Математика ОГЭ
            </Link>

          </div>
          <div className="flex items-center gap-6">
            <a href="#modules" className="text-white hover:text-yellow-500">Модули</a>
            <a href="#progress" className="text-white hover:text-yellow-5000">Прогресс</a>
            <button onClick={startMock} className="bg-yellow-500 text-[#1a1f36] px-4 py-2 rounded-lg hover:bg-yellow-400 font-medium">
              Экзамен
            </button>
            <DailyTaskStory />
            <div className="relative">
              <StreakDisplay />
              <EnergyPointsHeaderAnimation
                points={energyPointsAnimation.points}
                isVisible={energyPointsAnimation.isVisible}
                onAnimationComplete={() => setEnergyPointsAnimation({ isVisible: false, points: 0 })}
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-[68px] relative z-20">
        <Outlet />
      </main>
    </div>
  );
};

export default LearningLayout;
