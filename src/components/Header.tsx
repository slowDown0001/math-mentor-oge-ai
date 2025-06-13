
import { useState } from "react";
import { Menu, X, BookOpen, Brain, Users, BarChart3, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "./auth/AuthModal";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: "Главная", href: "/", icon: BookOpen },
    { name: "Учебник", href: "/textbook", icon: BookOpen },
    { name: "Ресурсы", href: "/resources", icon: Brain },
  ];

  const userNavigation = user ? [
    { name: "Панель управления", href: "/dashboard", icon: BarChart3 },
    { name: "Профиль", href: "/profile", icon: Users },
    { name: "Статистика", href: "/statistics", icon: BarChart3 },
    { name: "Практика", href: "/practice", icon: Calculator },
  ] : [];

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ОГЭ</span>
            </div>
            <span className="font-bold text-xl text-primary font-heading">Hedgehog</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-primary bg-primary/10"
                      : "text-gray-700 hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            {userNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-primary bg-primary/10"
                      : "text-gray-700 hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Привет, {user.email?.split('@')[0]}!
                </span>
                <Button onClick={signOut} variant="outline" size="sm">
                  Выйти
                </Button>
              </div>
            ) : (
              <AuthModal />
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md text-base font-medium transition-colors ${
                          isActive(item.href)
                            ? "text-primary bg-primary/10"
                            : "text-gray-700 hover:text-primary hover:bg-primary/5"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                  {userNavigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md text-base font-medium transition-colors ${
                          isActive(item.href)
                            ? "text-primary bg-primary/10"
                            : "text-gray-700 hover:text-primary hover:bg-primary/5"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                  
                  <div className="pt-4 border-t">
                    {user ? (
                      <div className="space-y-4">
                        <div className="px-4">
                          <p className="text-sm text-gray-700">
                            Привет, {user.email?.split('@')[0]}!
                          </p>
                        </div>
                        <Button 
                          onClick={() => {
                            signOut();
                            setIsMenuOpen(false);
                          }} 
                          variant="outline" 
                          className="w-full"
                        >
                          Выйти
                        </Button>
                      </div>
                    ) : (
                      <div className="px-4">
                        <AuthModal />
                      </div>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
