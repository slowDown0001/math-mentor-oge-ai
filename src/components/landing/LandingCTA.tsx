import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Crown, Shield, RefreshCw, CreditCard } from "lucide-react";

export default function LandingCTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Подписка за{" "}
            <span className="text-primary">999 ₽/месяц</span>{" "}
            — полный доступ ко всему!
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed">
            Учебник, видео, база задач, практика и AI-ассистент.
          </p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button 
              asChild 
              size="lg" 
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-12 py-6 text-xl rounded-full font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <Link to="/subscribe" className="flex items-center gap-3">
                <Crown className="w-6 h-6" />
                Оформить подписку
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="border-2 border-foreground/20 text-foreground hover:bg-muted px-8 py-6 text-lg rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Link to="/pricing">
                Узнать больше
              </Link>
            </Button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div 
            className="flex flex-wrap justify-center items-center gap-8 text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Безопасная оплата</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              <span className="font-medium">Отмена в любой момент</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              <span className="font-medium">Все способы оплаты</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}