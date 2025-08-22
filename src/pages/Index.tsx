
import { useAuth } from "@/contexts/AuthContext";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingHero from "@/components/landing/LandingHero";
import PromptBar from "@/components/PromptBar";
import HighlightCards from "@/components/landing/HighlightCards";
import VideoEmbed from "@/components/landing/VideoEmbed";
import ChatDemo from "@/components/landing/ChatDemo";
import LandingCTA from "@/components/landing/LandingCTA";
import LandingFooter from "@/components/landing/LandingFooter";

const Index = () => {
  const { isLoading } = useAuth();

  // Show loading while authentication state is being determined
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main>
        <LandingHero />
        <HighlightCards />
        <VideoEmbed />
        <ChatDemo />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
};

export default Index;
