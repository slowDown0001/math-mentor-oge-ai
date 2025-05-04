
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: "📊",
    title: "Персонализированные учебные планы",
    description: "Получите учебный план, адаптированный к вашим сильным и слабым сторонам на основе результатов входного теста."
  },
  {
    icon: "📝",
    title: "Практика с прошлогодними заданиями",
    description: "Доступ к базе заданий прошлых лет ОГЭ с пошаговыми решениями."
  },
  {
    icon: "🎓",
    title: "Видеоуроки",
    description: "Смотрите понятные объяснения ключевых математических концепций от опытных преподавателей."
  },
  {
    icon: "🤖",
    title: "ИИ-репетитор",
    description: "Получайте мгновенную помощь с задачами и персонализированное руководство в любое время."
  },
  {
    icon: "📈",
    title: "Отслеживание прогресса",
    description: "Следите за своим улучшением с течением времени с помощью подробной статистики и аналитики."
  },
  {
    icon: "🏆",
    title: "Цели и достижения",
    description: "Ставьте цели и зарабатывайте достижения по мере продвижения к успеху на экзамене."
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Функции платформы</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Всё необходимое для успешной сдачи ОГЭ по математике находится здесь.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-3xl mb-2">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
