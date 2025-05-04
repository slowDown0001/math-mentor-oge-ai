
import { Button } from "@/components/ui/button";

const resources = [
  {
    title: "Электронный учебник",
    description: "Полные теоретические объяснения и практические задачи с решениями.",
    icon: "📚",
    buttonText: "Открыть учебник"
  },
  {
    title: "Видеоуроки",
    description: "Наглядные объяснения ключевых концепций от опытных учителей математики.",
    icon: "🎬",
    buttonText: "Смотреть видео"
  },
  {
    title: "Практические упражнения",
    description: "База заданий прошлых лет ОГЭ с обратной связью на базе ИИ.",
    icon: "✏️",
    buttonText: "Начать практику"
  }
];

const ResourcesSection = () => {
  return (
    <section id="resources" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Учебные ресурсы</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Все материалы, необходимые для освоения математики ОГЭ.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {resources.map((resource, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center">
              <div className="text-5xl mb-4">{resource.icon}</div>
              <h3 className="text-xl font-bold mb-3">{resource.title}</h3>
              <p className="text-gray-600 mb-6">{resource.description}</p>
              <Button className="bg-secondary hover:bg-secondary/90 mt-auto">
                {resource.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;
