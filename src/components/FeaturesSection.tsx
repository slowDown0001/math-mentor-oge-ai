
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: "📊",
    title: "Personalized Study Plans",
    description: "Get a learning plan tailored to your strengths and weaknesses based on placement test results."
  },
  {
    icon: "📝",
    title: "Practice with Past Papers",
    description: "Access a database of previous OGE questions with step-by-step solutions."
  },
  {
    icon: "🎓",
    title: "Video Lessons",
    description: "Watch clear explanations of key math concepts from experienced teachers."
  },
  {
    icon: "🤖",
    title: "AI Tutoring",
    description: "Get immediate help with problems and personalized guidance at any time."
  },
  {
    icon: "📈",
    title: "Progress Tracking",
    description: "Monitor your improvement over time with detailed statistics and insights."
  },
  {
    icon: "🏆",
    title: "Goals & Achievements",
    description: "Set targets and earn achievements as you make progress towards exam success."
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Features</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to excel in your OGE Math exam is right here.
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
