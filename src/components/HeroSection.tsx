import { Button } from "@/components/ui/button";
const HeroSection = () => {
  return <section className="pt-24 pb-12 md:pt-32 md:pb-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-6">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight text-gray-900">
              Master OGE Math with Your <span className="text-primary">Personal AI Tutor!</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-xl">
              Get personalized learning plans, instant help with problems, and track your progress towards exam success.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-6 text-lg">
                Start Learning Now
              </Button>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 px-6 py-6 text-lg">
                Take Placement Test
              </Button>
            </div>
          </div>
          <div className="flex-1 mt-8 md:mt-0">
            <div className="relative">
              <div className="absolute -bottom-6 -right-6 w-full h-full rounded-xl bg-secondary/20 z-0"></div>
              <img alt="Student learning math" className="rounded-xl shadow-lg z-10 relative" src="/lovable-uploads/faaba9f8-cfbb-4a31-b175-a0c76248f917.png" />
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;