import { motion } from "framer-motion";
import { useState } from "react";
import { Play, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VideoEmbed() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const videoUrl = "https://vkvideo.ru/video-232034222_456239025?ref_domain=egechat.ru";

  const handleFallbackClick = () => {
    window.open(videoUrl, '_blank', 'noopener,noreferrer');
  };

  const handleIframeLoad = () => {
    setIsLoaded(true);
  };

  const handleIframeError = () => {
    setHasError(true);
  };

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Короткое демо платформы
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl bg-muted">
            {!hasError ? (
              <>
                {!isLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                )}
                <iframe
                  src={videoUrl}
                  className="w-full h-full"
                  allowFullScreen
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  title="Platform Demo Video"
                />
              </>
            ) : (
              // Fallback preview card
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-8">
                <div className="bg-background/80 backdrop-blur-sm rounded-lg p-8 text-center max-w-md">
                  <Play className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Демо платформы
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Посмотрите как работает наша платформа подготовки к экзаменам
                  </p>
                  <Button onClick={handleFallbackClick} className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Смотреть видео
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <motion.p 
            className="text-center text-muted-foreground mt-6 text-lg"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Навигация по учебнику, практика, и AI-ассистент.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}