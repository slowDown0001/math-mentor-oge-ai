
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "./auth/AuthModal";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'signin' | 'signup'>('signin');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const handleSignInClick = () => {
    setAuthModalView('signin');
    setIsAuthModalOpen(true);
  };

  const handleSignUpClick = () => {
    setAuthModalView('signup');
    setIsAuthModalOpen(true);
  };

  const handleProfileButton = () => {
    navigate("/profile");
  };

  const handleLogout = async () => {
    await signOut();
  };
  
  return (
    <header className="bg-white shadow-sm py-4 fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            alt="Логотип Ёжик" 
            className="h-10 w-auto" 
            src="/lovable-uploads/9082b302-65e2-4b6f-b4e2-850a5f0c9bb1.png" 
          />
          <div className="font-heading font-bold text-xl text-primary">
            Ёжик <span className="text-accent">AI</span>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-700 hover:text-primary font-medium transition-colors">Главная</Link>
          <Link to="#features" className="text-gray-700 hover:text-primary font-medium transition-colors">Функции</Link>
          <Link to="/resources" className="text-gray-700 hover:text-primary font-medium transition-colors">Ресурсы</Link>
          <Link to="/practice" className="text-gray-700 hover:text-primary font-medium transition-colors">Практика</Link>
        </nav>
        
        <div className="hidden md:flex items-center space-x-4">
          {!user ? (
            <>
              <Button 
                variant="outline" 
                className="border-2 border-primary text-primary hover:bg-primary/5 rounded-full"
                onClick={handleSignInClick}
              >
                Вход
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90 rounded-full"
                onClick={handleSignUpClick}
              >
                Начать бесплатно
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                className="gap-2 border-gray-300 rounded-full"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Выйти
              </Button>
              <Button 
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 rounded-full"
                onClick={handleProfileButton}
              >
                <User className="h-4 w-4" />
                Профиль
              </Button>
            </div>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md py-6 px-4 md:hidden z-50 animate-fade-in">
          <div className="flex flex-col space-y-5">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>
              Главная
            </Link>
            <Link to="#features" className="text-gray-700 hover:text-primary transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>
              Функции
            </Link>
            <Link to="/resources" className="text-gray-700 hover:text-primary transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>
              Ресурсы
            </Link>
            <Link to="/practice" className="text-gray-700 hover:text-primary transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>
              Практика
            </Link>
            <div className="flex flex-col space-y-3 pt-4 border-t">
              {!user ? (
                <>
                  <Button 
                    variant="outline" 
                    className="border-2 border-primary text-primary hover:bg-primary/5 w-full rounded-full"
                    onClick={handleSignInClick}
                  >
                    Вход
                  </Button>
                  <Button 
                    className="bg-primary hover:bg-primary/90 w-full rounded-full"
                    onClick={handleSignUpClick}
                  >
                    Начать бесплатно
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline"
                    className="gap-2 border-gray-300 w-full rounded-full"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Выйти
                  </Button>
                  <Button 
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 w-full rounded-full"
                    onClick={handleProfileButton}
                  >
                    <User className="h-4 w-4" />
                    Профиль
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialView={authModalView}
      />
    </header>
  );
};

export default Header;
