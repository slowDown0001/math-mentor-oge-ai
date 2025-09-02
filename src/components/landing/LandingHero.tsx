import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import FloatingElements from "./FloatingElements";
import PromptBar from "../PromptBar";
import AuthModal from "../auth/AuthModal";

export default function LandingHero() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/50">
      {/* Floating Math Elements */}
      <FloatingElements />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="mb-8"
          >
            <PromptBar />
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Умная платформа подготовки к{" "}
            <span className="text-primary">ОГЭ и ЕГЭ</span>{" "}
            по математике
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            Видео и статьи на каждое умение, база заданий как в FIPI, и умный AI-ассистент, который подскажет следующий шаг.
          </motion.p>
          
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <Button 
              size="lg" 
              onClick={() => setShowAuthModal(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-6 text-lg rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Войти с помощью Google, Yandex, VK, email
            </Button>
          </motion.div>
          
          <motion.div 
            className="mt-8 flex justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          >
            <Button 
              variant="ghost" 
              size="lg" 
              className="text-muted-foreground hover:text-primary px-8 py-6 text-lg rounded-full font-medium transition-all duration-300 hover:scale-105 bg-yellow-100 hover:bg-yellow-200"
              onClick={() => {
                const nextSection = document.querySelector('main > *:nth-child(2)');
                nextSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Узнайте больше ⬇️
            </Button>
          </motion.div>
        </div>
      </div>
      
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent pointer-events-none" />
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialView="signin"
      />
    </section>
  );
}