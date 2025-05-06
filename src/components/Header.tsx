
import { Button } from "@/components/ui/button";
import { useState } from "react";
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return <header className="bg-white shadow-sm py-4 fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img alt="Логотип Ёжик" className="h-10 w-auto" src="/lovable-uploads/9082b302-65e2-4b6f-b4e2-850a5f0c9bb1.png" />
          <div className="font-bold text-xl text-primary mx-0">Ёжик <span className="text-secondary">AI</span></div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-gray-600 hover:text-primary transition-colors">Главная</a>
          <a href="#features" className="text-gray-600 hover:text-primary transition-colors">Функции</a>
          <a href="#resources" className="text-gray-600 hover:text-primary transition-colors">Ресурсы</a>
          <a href="#about" className="text-gray-600 hover:text-primary transition-colors">О нас</a>
        </nav>
        
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">Вход</Button>
          <Button className="bg-primary hover:bg-primary/80">Регистрация</Button>
        </div>
        
        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && <div className="absolute top-16 left-0 w-full bg-white shadow-md py-4 px-4 md:hidden z-50 animate-fade-in">
          <div className="flex flex-col space-y-4">
            <a href="#" className="text-gray-600 hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>Главная</a>
            <a href="#features" className="text-gray-600 hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>Функции</a>
            <a href="#resources" className="text-gray-600 hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>Ресурсы</a>
            <a href="#about" className="text-gray-600 hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>О нас</a>
            <div className="flex flex-col space-y-2 pt-2 border-t">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 w-full">Вход</Button>
              <Button className="bg-primary hover:bg-primary/80 w-full">Регистрация</Button>
            </div>
          </div>
        </div>}
    </header>;
};
export default Header;
