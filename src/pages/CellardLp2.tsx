import React, { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { animate, stagger } from "animejs";
import Splitting from "splitting";
import "splitting/dist/splitting.css";
import p5 from "p5";
import { moduleImgs } from "@/lib/assets";

type ModuleCard = {
  n: number;
  title: string;
  subtitle: string;
  img: string;
  progress: number; // 0..100
  locked?: boolean;
};

const modules: ModuleCard[] = [
  { n: 1, title: "1. Числа и вычисления", subtitle: "Основы арифметики и работа с числами", img: moduleImgs[1], progress: 50 },
  { n: 2, title: "2. Алгебраические выражения", subtitle: "Работа с переменными и формулами", img: moduleImgs[2], progress: 100 },
  { n: 3, title: "3. Уравнения и неравенства", subtitle: "Решение уравнений и систем", img: moduleImgs[3], progress: 0, locked: true },
  { n: 4, title: "4. Числовые последовательности", subtitle: "Арифметическая и геометрическая прогрессии", img: moduleImgs[4], progress: 0, locked: true },
  { n: 5, title: "5. Функции", subtitle: "Графики и свойства функций", img: moduleImgs[5], progress: 0, locked: true },
  { n: 6, title: "6. Координаты на прямой и плоскости", subtitle: "Геометрия координат", img: moduleImgs[6], progress: 0, locked: true },
  { n: 7, title: "7. Геометрия", subtitle: "Планиметрия и стереометрия", img: moduleImgs[7], progress: 0, locked: true },
  { n: 8, title: "8. Вероятность и статистика", subtitle: "Теория вероятностей и анализ данных", img: moduleImgs[8], progress: 0, locked: true },
  { n: 9, title: "9. Применение математики", subtitle: "Реальные задачи и прикладные проблемы", img: moduleImgs[9], progress: 0, locked: true },
];

const circumference = 2 * Math.PI * 28; // radius 28 in your SVG

const CellardLp2: React.FC = () => {
  const navigate = useNavigate();
  const canvasParentRef = useRef<HTMLDivElement | null>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  // Smooth scroll to modules
  const scrollToModules = () => {
    document.getElementById("modules")?.scrollIntoView({ behavior: "smooth" });
  };

  // Where to go when user clicks a module
  const goToModule = (n: number) => {
    navigate("/learning-platform");
  };

  // “Start mock exam” navigation
  const startMock = () => {
    navigate("/practice-now"); // or dedicated route if you have one
  };

  // Splitting + Anime init
  useEffect(() => {
    Splitting(); // splits [data-splitting]
    animate("[data-splitting] .char", {
      translateY: [100, 0],
      opacity: [0, 1],
      easing: "out(3)",
      duration: 1400,
      delay: stagger(30),
    });

    // Animate module cards when in view
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animate(e.target as Element, {
              translateY: [50, 0],
              opacity: [0, 1],
              easing: "out(4)",
              duration: 800,
            });
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll(".module-card").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Animate progress rings on intersection
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const ring = e.target as SVGCircleElement;
          const pct = Number(ring.getAttribute("data-progress") || "0");
          const offset = circumference - (pct / 100) * circumference;
          animate(ring, {
            strokeDashoffset: [circumference, offset],
            easing: "out(4)",
            duration: 1500,
            delay: 300,
          });
          io.unobserve(ring);
        });
      },
      { threshold: 0.3 }
    );

    document.querySelectorAll<SVGCircleElement>(".progress-ring-circle").forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, []);

  // p5 background
  useEffect(() => {
    if (!canvasParentRef.current) return;

    const sketch = (p: p5) => {
      const syms = ["∑", "∫", "π", "∞", "√", "Δ", "θ", "α", "β"];
      type Part = { x: number; y: number; vx: number; vy: number; size: number; opacity: number; sym: string };
      const parts: Part[] = [];

      p.setup = () => {
        const c = p.createCanvas(p.windowWidth, p.windowHeight);
        c.parent(canvasParentRef.current!);
        p.pixelDensity(p.displayDensity()); // crisp on HiDPI
        p.clear(); // transparent background

        for (let i = 0; i < 50; i++) {
          parts.push({
            x: p.random(p.width),
            y: p.random(p.height),
            vx: p.random(-0.5, 0.5),
            vy: p.random(-0.5, 0.5),
            size: p.random(2, 4),
            opacity: p.random(0.1, 0.3),
            sym: syms[Math.floor(p.random(syms.length))],
          });
        }
      };

      p.draw = () => {
        p.clear(); // keep canvas transparent each frame

        parts.forEach((pt) => {
          pt.x += pt.vx;
          pt.y += pt.vy;
          if (pt.x < 0) pt.x = p.width;
          if (pt.x > p.width) pt.x = 0;
          if (pt.y < 0) pt.y = p.height;
          if (pt.y > p.height) pt.y = 0;

          p.fill(245, 158, 11, pt.opacity * 255); // amber-ish
          p.noStroke();
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(pt.size * 8);
          p.text(pt.sym, pt.x, pt.y);
        });

        // simple connections
        p.stroke(245, 158, 11, 60);
        p.strokeWeight(1);
        for (let i = 0; i < parts.length; i++) {
          for (let j = i + 1; j < parts.length; j++) {
            const d = p.dist(parts[i].x, parts[i].y, parts[j].x, parts[j].y);
            if (d < 100) p.line(parts[i].x, parts[i].y, parts[j].x, parts[j].y);
          }
        }
      };

      p.windowResized = () => p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    p5InstanceRef.current = new p5(sketch);

    return () => {
      p5InstanceRef.current?.remove();
      p5InstanceRef.current = null;
    };
  }, []);

  const completedCount = useMemo(() => modules.filter((m) => m.progress === 100).length, []);

  return (
    <div
      className="min-h-screen text-white relative"
      style={{ background: "linear-gradient(135deg, #1a1f36 0%, #2d3748 50%, #1a1f36 100%)" }}
    >
      {/* p5 background container (VISIBLE layer, click-through) */}
      <div
        ref={canvasParentRef}
        className="fixed inset-0 z-10 pointer-events-none"
        aria-hidden="true"
      />

      {/* Nav stays on top of everything */}
      <nav className="fixed top-0 w-full z-30 backdrop-blur-lg bg-[#1a1f36]/80 border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-[#1a1f36] font-bold text-xl">M</span>
            </div>
            <h1 className="font-display text-xl font-semibold">Математика ОГЭ</h1>
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

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Keep bg under canvas */}
        <div
          className="absolute inset-0 bg-center bg-cover z-0"
          style={{ backgroundImage: `url(${moduleImgs.hero})` }}
        />
        <div className="absolute inset-0 bg-[#1a1f36]/30 z-0" />
        {/* Raise the text above the canvas */}
        <div className="relative z-20 text-center max-w-4xl mx-auto px-4">
          <h1
            className="font-display text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-500 to-emerald-500 text-transparent bg-clip-text"
            data-splitting
          >
            Математика — это просто!
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Подготовка к ОГЭ по математике через 9 интерактивных модулей. Каждый шаг приближает тебя к успеху!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={scrollToModules}
              className="bg-yellow-500 text-[#1a1f36] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-400 transition-all hover:scale-105"
            >
              Начать обучение
            </button>
            <button
              onClick={startMock}
              className="border-2 border-yellow-500 text-yellow-500 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-500 hover:text-[#1a1f36] transition-all"
            >
              Пробный экзамен
            </button>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="py-20 relative">
        <div className="relative z-20 max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-500 to-emerald-500 text-transparent bg-clip-text">
              Путь к успеху
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Пройди все 9 модулей и стань мастером математики. Каждый модуль содержит теорию, практику и интерактивные задания.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {modules.map((m, i) => {
              const offsetClass = ["mt-24", "mt-12", "mt-36", "mt-20", "mt-28", "mt-16", "mt-24", "mt-20", "mt-28"][i] || "mt-16";
              const strokeColor = m.progress === 100 ? "#10b981" : m.progress > 0 ? "#f59e0b" : "#64748b";
              const statusText = m.locked ? "Заблокировано" : m.progress === 100 ? "Завершено" : m.progress > 0 ? "В процессе" : "Не начато";

              return (
                <div
                  key={m.n}
                  className={`module-card rounded-xl p-6 cursor-pointer bg-white/95 text-[#1a1f36] border border-white/20 ${offsetClass}`}
                  onClick={() => (m.locked ? null : goToModule(m.n))}
                  style={{ backdropFilter: "blur(10px)" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <img src={m.img} alt={m.title} className="w-16 h-16" />
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16" style={{ transform: "rotate(-90deg)" }}>
                        <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="4" fill="none" />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth="4"
                          className="progress-ring-circle"
                          data-progress={m.progress}
                          style={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-[#1a1f36]">{m.progress}%</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">{m.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{m.subtitle}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${m.locked ? "text-gray-500" : "text-emerald-600"}`}>{statusText}</span>
                    <span className={`${m.locked ? "text-gray-400 cursor-not-allowed" : "text-yellow-600 hover:text-yellow-700"} font-medium text-sm`}>
                      {m.locked ? "Скоро →" : m.progress === 100 ? "Повторить →" : "Продолжить →"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mock exam */}
          <div className="text-center mt-20">
            <div
              className="rounded-xl p-8 max-w-md mx-auto cursor-pointer bg-white/95 text-[#1a1f36] border border-white/20"
              onClick={startMock}
            >
              <img src={moduleImgs.mock} alt="Пробный экзамен" className="w-20 h-20 mx-auto mb-6" />
              <h3 className="font-display text-2xl font-semibold mb-4">Пробный экзамен</h3>
              <p className="text-gray-600 mb-6">Проверь свои знания перед настоящим ОГЭ</p>
              <button className="bg-gradient-to-r from-yellow-500 to-emerald-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
                Начать экзамен
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Progress */}
      <section id="progress" className="py-20 bg-[#1a1f36]/50">
        <div className="relative z-20 max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-500 to-emerald-500 text-transparent bg-clip-text">
              Твой прогресс
            </h2>
            <p className="text-xl text-gray-300">Отслеживай свое развитие и достижения</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Overall Progress */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <svg className="w-24 h-24" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="6" fill="none" />
                  <circle cx="48" cy="48" r="40" stroke="#f59e0b" strokeWidth="6" fill="none" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">25%</span>
                </div>
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Общий прогресс</h3>
              <p className="text-gray-300">{completedCount} из 9 модулей завершено</p>
            </div>

            {/* Badges */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h3 className="font-display text-xl font-semibold mb-4 text-center">Достижения</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-yellow-500 to-emerald-500 rounded-lg p-3 text-center animate-pulse">
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="text-xs">Первый модуль</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-emerald-500 rounded-lg p-3 text-center animate-pulse">
                  <div className="text-2xl mb-1">⭐</div>
                  <div className="text-xs">Отличник</div>
                </div>
                <div className="bg-gray-600 rounded-lg p-3 text-center opacity-50">
                  <div className="text-2xl mb-1">🎯</div>
                  <div className="text-xs">Все модули</div>
                </div>
                <div className="bg-gray-600 rounded-lg p-3 text-center opacity-50">
                  <div className="text-2xl mb-1">🚀</div>
                  <div className="text-xs">Экзамен</div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h3 className="font-display text-xl font-semibold mb-4 text-center">Статистика</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-300">Дней подряд</span>
                  <span className="font-bold text-yellow-500">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Решено задач</span>
                  <span className="font-bold text-emerald-500">127</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Правильных ответов</span>
                  <span className="font-bold text-yellow-500">89%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Время обучения</span>
                  <span className="font-bold text-emerald-500">12ч 30м</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-[#1a1f36] font-bold text-xl">M</span>
            </div>
            <h3 className="font-display text-xl font-semibold">Математическая Платформа</h3>
          </div>
          <p className="text-gray-400">© 2024 Все права защищены. Сделано с ❤️ для студентов</p>
        </div>
      </footer>
    </div>
  );
};

export default CellardLp2;
