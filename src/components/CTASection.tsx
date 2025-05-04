
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section id="about" className="py-16 bg-primary/10">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Excel in OGE Math?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of students who have improved their exam scores with Math Mentor.
            Start your personalized learning journey today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg">
              Sign Up Free
            </Button>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 px-8 py-6 text-lg">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
