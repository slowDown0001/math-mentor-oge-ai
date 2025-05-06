
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="bg-white shadow-sm py-3 fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img 
            alt="Логотип Ёжик" 
            className="h-10 w-auto" 
            src="/lovable-uploads/9082b302-65e2-4b6f-b4e2-850a5f0c9bb1.png" 
          />
          <div className="font-bold text-xl text-primary">
            Ёжик <span className="text-accent">AI</span>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-700 hover:text-primary font-medium transition-colors">Главная</Link>
          <Link to="#features" className="text-gray-700 hover:text-primary font-medium transition-colors">Функции</Link>
          <Link to="#resources" className="text-gray-700 hover:text-primary font-medium transition-colors">Ресурсы</Link>
          <Link to="/practice" className="text-gray-700 hover:text-primary font-medium transition-colors">Практика</Link>
        </nav>
        
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 rounded-full">
            Вход
          </Button>
          <Button className="bg-primary hover:bg-primary/90 rounded-full">
            Начать бесплатно
          </Button>
        </div>
        
        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md py-4 px-4 md:hidden z-50 animate-fade-in">
          <div className="flex flex-col space-y-4">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
              Главная
            </Link>
            <Link to="#features" className="text-gray-700 hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
              Функции
            </Link>
            <Link to="#resources" className="text-gray-700 hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
              Ресурсы
            </Link>
            <Link to="/practice" className="text-gray-700 hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
              Практика
            </Link>
            <div className="flex flex-col space-y-2 pt-2 border-t">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 w-full rounded-full">
                Вход
              </Button>
              <Button className="bg-primary hover:bg-primary/90 w-full rounded-full">
                Начать бесплатно
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
