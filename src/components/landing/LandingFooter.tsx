import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const footerSections = [
  {
    title: "Продукт",
    links: [
      { label: "Новый Учебник", href: "/new-textbook", enabled: true },
      { label: "Practice", href: "/questions", enabled: true },
      { label: "Learning platform", href: "/textbook3", enabled: true },
      { label: "FAQ", href: "/faq", enabled: true }
    ]
  },
  {
    title: "Экзамены",
    links: [
      { label: "ОГЭ", href: "/new-textbook", enabled: true },
      { label: "ЕГЭ Базовый", href: "#", enabled: false, tooltip: "скоро" },
      { label: "ЕГЭ Профильный", href: "#", enabled: false, tooltip: "скоро" }
    ]
  },
  {
    title: "Правовое",
    links: [
      { label: "Политика конфиденциальности", href: "/privacy", enabled: true },
      { label: "Условия использования", href: "/terms", enabled: true }
    ]
  },
  {
    title: "Контакты",
    links: [
      { label: "support@hedgehog.edu", href: "mailto:support@hedgehog.edu", enabled: true }
    ]
  }
];

export default function LandingFooter() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <h3 className="font-semibold text-foreground mb-4 text-lg">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.enabled ? (
                      <Link
                        to={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <span 
                        className="text-muted-foreground/50 cursor-not-allowed"
                        title={link.tooltip}
                      >
                        {link.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">🦔</span>
              </div>
              <span className="font-bold text-xl text-foreground">Hedgehog</span>
            </Link>
            <p className="text-muted-foreground">
              © {new Date().getFullYear()} Hedgehog Education. Все права защищены.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium">
              RU
            </button>
            <span className="text-muted-foreground">|</span>
            <button className="text-muted-foreground hover:text-primary transition-colors duration-200">
              EN
            </button>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}