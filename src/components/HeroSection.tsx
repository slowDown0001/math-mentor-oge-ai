
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="pt-28 pb-12 md:pt-36 md:pb-20 bg-gradient-to-br from-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 tracking-tight">
              Подготовка к ОГЭ по математике с <span className="text-primary">искусственным интеллектом</span>
            </h1>
            <p className="text-lg text-gray-700 max-w-xl">
              Персонализированное обучение, мгновенная помощь и отслеживание прогресса для успешной сдачи экзамена.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button asChild className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-full">
                <Link to="/practice">
                  Начать обучение
                </Link>
              </Button>
              <Button variant="outline" asChild className="border-primary text-primary hover:bg-primary/5 px-8 py-6 text-lg rounded-full">
                <Link to="#">
                  Узнать больше
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex-1 mt-8 md:mt-0">
            <div className="relative">
              <div className="absolute -bottom-6 -right-6 w-full h-full rounded-xl bg-secondary/20 z-0"></div>
              <img 
                alt="Ученик изучает математику" 
                className="rounded-2xl shadow-lg z-10 relative w-full" 
                src="/lovable-uploads/faaba9f8-cfbb-4a31-b175-a0c76248f917.png" 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
