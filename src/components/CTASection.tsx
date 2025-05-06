
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section id="about" className="py-20 bg-gradient-to-br from-primary/5 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Готовы преуспеть в математике ОГЭ?</h2>
          <p className="text-lg text-gray-700 mb-10">
            Присоединяйтесь к тысячам учеников, которые улучшили свои результаты на экзаменах с нашей платформой.
            Начните свой индивидуальный путь обучения сегодня.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Button asChild className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-full">
              <Link to="/practice">
                Регистрация бесплатно
              </Link>
            </Button>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 px-8 py-6 text-lg rounded-full">
              <Link to="#">
                Узнать больше
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
