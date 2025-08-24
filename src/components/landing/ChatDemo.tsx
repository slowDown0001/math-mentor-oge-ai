import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { MessageCircle, Send, BookOpen, Target } from "lucide-react";

export default function ChatDemo() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            AI-ассистент Ёжик
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="max-w-3xl mx-auto"
        >
          <Card className="bg-card border-2 shadow-xl">
            <CardContent className="p-0">
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 border-b bg-muted/50">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-lg">🦔</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Ёжик AI</h3>
                  <p className="text-sm text-muted-foreground">Ваш персональный помощник</p>
                </div>
                <MessageCircle className="w-5 h-5 text-primary ml-auto" />
              </div>

              {/* Chat Messages */}
              <div className="p-6 space-y-4 min-h-[300px]">
                {/* User Message */}
                <motion.div 
                  className="flex justify-end"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%]">
                    <p>Покажи задачи по квадратным уравнениям и объясни первый шаг.</p>
                  </div>
                </motion.div>

                {/* Assistant Message */}
                <motion.div 
                  className="flex justify-start"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%]">
                    <p className="text-foreground mb-4">
                      Конечно! Квадратные уравнения имеют вид ax² + bx + c = 0. Первый шаг — определить коэффициенты a, b и c, затем выбрать подходящий метод решения: разложение на множители, формула корней или выделение полного квадрата.
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm" className="rounded-full">
                        <Link to="/questions">
                          <Target className="w-4 h-4 mr-2" />
                          Перейти к практике
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="rounded-full">
                        <Link to="/new-textbook">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Открыть учебник
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Chat Input (Demo) */}
              <motion.div 
                className="p-4 border-t bg-muted/50"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-background border rounded-full px-4 py-3 text-muted-foreground cursor-not-allowed">
                    Спросите совет по подготовке…
                  </div>
                  <Button disabled size="icon" className="rounded-full">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Демо-режим • Войдите для полного доступа к AI-ассистенту
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}