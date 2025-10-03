import React from "react";
import FlyingMathBackground from "@/components/FlyingMathBackground";
import { Outlet, useNavigate, Link } from "react-router-dom";



const LearningLayout: React.FC = () => {
  const navigate = useNavigate();
  const startMock = () => navigate("/practice-now");

  return (
    <div
      className="min-h-screen text-white relative"
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
              className="font-display text-xl font-semibold hover:text-yellow-500 transition-colors"
            >
              Математика ОГЭ
            </Link>

          </div>
          <div className="flex items-center gap-6">
            <a href="#modules" className="hover:text-yellow-500">Модули</a>
            <a href="#progress" className="hover:text-yellow-500">Прогресс</a>
            <button onClick={startMock} className="bg-yellow-500 text-[#1a1f36] px-4 py-2 rounded-lg hover:bg-yellow-400 font-medium">
              Экзамен
            </button>
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
