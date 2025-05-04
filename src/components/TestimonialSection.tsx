
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    quote: "The AI tutor helped me understand algebra concepts I've been struggling with for years. My grades improved from C to A!",
    name: "Maria K.",
    role: "9th Grade Student"
  },
  {
    quote: "The personalized study plan focused on my weak areas. I feel much more confident about the OGE exam now.",
    name: "Alexei S.",
    role: "9th Grade Student"
  },
  {
    quote: "As a parent, I love that I can see my child's progress. The AI tutor is there when I can't help with math questions.",
    name: "Elena P.",
    role: "Parent"
  }
];

const TestimonialSection = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Students Say</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real results from students who used Math Mentor to prepare for their exams.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="text-2xl text-gray-400 mb-4">"</div>
                <p className="text-gray-700 mb-6 italic">{testimonial.quote}</p>
                <div className="flex flex-col">
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
