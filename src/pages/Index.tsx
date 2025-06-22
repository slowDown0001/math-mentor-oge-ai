
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import ResourcesSection from "@/components/ResourcesSection";
import TestimonialSection from "@/components/TestimonialSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect if user is logged in, not loading, and specifically on the home page
    // Also check that we're not already redirecting to prevent infinite loops
    if (!isLoading && user && location.pathname === "/" && location.pathname !== "/dashboard") {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate, location.pathname]);

  // Don't render the landing page if user is logged in and on home page
  if (!isLoading && user && location.pathname === "/") {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ResourcesSection />
        <TestimonialSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
