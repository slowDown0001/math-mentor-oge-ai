
import { Button } from "@/components/ui/button";

const resources = [
  {
    title: "Digital Textbook",
    description: "Comprehensive theory explanations and practice problems with solutions.",
    icon: "📚",
    buttonText: "Access Textbook"
  },
  {
    title: "Video Lessons",
    description: "Visual explanations of key concepts by experienced math teachers.",
    icon: "🎬",
    buttonText: "Watch Videos"
  },
  {
    title: "Practice Exercises",
    description: "Database of past OGE questions with AI-powered feedback.",
    icon: "✏️",
    buttonText: "Start Practicing"
  }
];

const ResourcesSection = () => {
  return (
    <section id="resources" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Learning Resources</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            All the materials you need to master OGE Mathematics.
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
