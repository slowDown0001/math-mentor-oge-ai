
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut, User, BookOpen, ScanLine, Play, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "./auth/AuthModal";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-sm z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Ё</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Ёжик</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/textbook" 
              className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                isActive('/textbook') ? 'text-primary' : 'text-gray-600 hover:text-primary'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Учебник</span>
            </Link>
            
            <Link 
              to="/videos" 
              className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                isActive('/videos') ? 'text-primary' : 'text-gray-600 hover:text-primary'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>Видео</span>
            </Link>
            
            <Link 
              to="/scanner" 
              className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                isActive('/scanner') ? 'text-primary' : 'text-gray-600 hover:text-primary'
              }`}
            >
              <ScanLine className="w-4 h-4" />
              <span>Сканер</span>
            </Link>

            <Link 
              to="/new-practice" 
              className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                isActive('/new-practice') ? 'text-primary' : 'text-gray-600 hover:text-primary'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Тесты</span>
            </Link>

            {user && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`text-sm font-medium transition-colors ${
                    isActive('/dashboard') ? 'text-primary' : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  Главная
                </Link>
                <Link 
                  to="/diagnostic" 
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                    isActive('/diagnostic') ? 'text-primary' : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Диагностика</span>
                </Link>
                <Link 
                  to="/practice" 
                  className={`text-sm font-medium transition-colors ${
                    isActive('/practice') ? 'text-primary' : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  Упражнения
                </Link>
                <Link 
                  to="/statistics" 
                  className={`text-sm font-medium transition-colors ${
                    isActive('/statistics') ? 'text-primary' : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  Статистика
                </Link>
              </>
            )}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{user.user_metadata?.full_name || user.email}</span>
                  </Button>
                </Link>
                <Button onClick={handleSignOut} variant="outline" size="sm">
                  <LogOut className="w-4 h-4 mr-1" />
                  Выйти
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsAuthModalOpen(true)} variant="default" size="sm">
                Войти
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-2">
              <Link 
                to="/textbook" 
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/textbook') ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <BookOpen className="w-4 h-4" />
                <span>Учебник</span>
              </Link>
              
              <Link 
                to="/videos" 
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/videos') ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Play className="w-4 h-4" />
                <span>Видео</span>
              </Link>
              
              <Link 
                to="/scanner" 
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/scanner') ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <ScanLine className="w-4 h-4" />
                <span>Сканер</span>
              </Link>

              <Link 
                to="/new-practice" 
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/new-practice') ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <ClipboardList className="w-4 h-4" />
                <span>Тесты</span>
              </Link>

              {user && (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/dashboard') ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Главная
                  </Link>
                  <Link 
                    to="/diagnostic" 
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/diagnostic') ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span>Диагностика</span>
                  </Link>
                  <Link 
                    to="/practice" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/practice') ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Упражнения
                  </Link>
                  <Link 
                    to="/statistics" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/statistics') ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Статистика
                  </Link>
                  <Link 
                    to="/profile" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/profile') ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Профиль
                  </Link>
                </>
              )}
            </nav>
            
            {/* Mobile Auth */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              {user ? (
                <Button onClick={handleSignOut} variant="outline" className="w-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  Выйти
                </Button>
              ) : (
                <Button 
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsMenuOpen(false);
                  }} 
                  className="w-full"
                >
                  Войти
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
};

export default Header;
