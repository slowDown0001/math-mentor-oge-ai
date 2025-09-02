import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import PromptBar from "@/components/PromptBar";

const EgeMathBasic = () => {
  const navigate = useNavigate();

  const handleNavigateToProfile = () => {
    navigate("/mydashboard");
  };

  const handlePracticeClick = () => {
    // TODO: Add practice functionality
    console.log("Practice clicked");
  };

  const handleTextbookClick = () => {
    // TODO: Add textbook functionality  
    console.log("Textbook clicked");
  };

  const handleProgressClick = () => {
    // TODO: Add progress functionality
    console.log("Progress clicked");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-muted/20 relative overflow-hidden">
      {/* Background glassmorphism panel */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-primary/5 backdrop-blur-sm" />
      
      {/* Top-right profile button */}
      <div className="absolute top-6 right-6 z-10">
        <Button
          onClick={handleNavigateToProfile}
          className="group relative px-6 py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 
                     hover:from-blue-400 hover:via-blue-500 hover:to-blue-600 
                     text-white font-medium rounded-2xl shadow-lg 
                     transform transition-all duration-300 ease-in-out
                     hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30
                     active:scale-95 active:transition-all active:duration-150"
        >
          <User className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
          Профиль
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 to-blue-600/20 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Button>
      </div>

      {/* Left side menu */}
      <div className="absolute left-8 top-1/2 transform -translate-y-1/2 z-10">
        <div className="flex flex-col space-y-6">
          <Button
            onClick={handlePracticeClick}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-400 via-purple-500 to-purple-600 
                       hover:from-blue-300 hover:via-purple-400 hover:to-purple-500
                       text-white font-medium rounded-2xl shadow-lg min-w-[160px]
                       transform transition-all duration-300 ease-in-out
                       hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30
                       active:scale-95 active:transition-all active:duration-150"
          >
            Практика
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>

          <Button
            onClick={handleTextbookClick}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-400 via-purple-500 to-purple-600 
                       hover:from-blue-300 hover:via-purple-400 hover:to-purple-500
                       text-white font-medium rounded-2xl shadow-lg min-w-[160px]
                       transform transition-all duration-300 ease-in-out
                       hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30
                       active:scale-95 active:transition-all active:duration-150"
          >
            Учебник
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>

          <Button
            onClick={handleProgressClick}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-400 via-purple-500 to-purple-600 
                       hover:from-blue-300 hover:via-purple-400 hover:to-purple-500
                       text-white font-medium rounded-2xl shadow-lg min-w-[160px]
                       transform transition-all duration-300 ease-in-out
                       hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30
                       active:scale-95 active:transition-all active:duration-150"
          >
            Прогресс
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </div>
      </div>

      {/* Top-left title */}
      <div className="absolute top-6 left-6 z-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ЕГЭ Базовая Математика
        </h1>
      </div>

      {/* Bottom center prompt bar */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-2xl px-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 
                          rounded-2xl blur-sm transform scale-105" />
          <div className="relative bg-background/80 backdrop-blur-md border border-primary/20 rounded-2xl 
                          shadow-2xl">
            <PromptBar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EgeMathBasic;