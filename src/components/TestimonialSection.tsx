
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    quote: "ИИ-репетитор помог мне понять концепции алгебры, с которыми я боролась годами. Мои оценки улучшились с С до А!",
    name: "Мария К.",
    role: "Ученица 9 класса"
  },
  {
    quote: "Персонализированный план обучения сосредоточился на моих слабых местах. Теперь я чувствую себя намного увереннее перед экзаменом ОГЭ.",
    name: "Алексей С.",
    role: "Ученик 9 класса"
  },
  {
    quote: "Как родитель, я люблю, что могу видеть прогресс моего ребенка. ИИ-репетитор всегда рядом, когда я не могу помочь с вопросами по математике.",
    name: "Елена П.",
    role: "Родитель"
  }
];

const TestimonialSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Что говорят ученики</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Реальные результаты учеников, которые использовали нашу платформу для подготовки к экзаменам.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all rounded-xl overflow-hidden">
              <CardContent className="p-8">
                <div className="text-primary text-5xl mb-4">"</div>
                <p className="text-gray-700 mb-8 text-lg">{testimonial.quote}</p>
                <div className="flex flex-col pt-4 border-t border-gray-100">
                  <span className="font-medium text-gray-900">{testimonial.name}</span>
                  <span className="text-sm text-gray-500">{testimonial.role}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
