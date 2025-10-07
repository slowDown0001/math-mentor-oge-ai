import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface NewTextbookReadButtonProps {
  skillId: number;
  isRead: boolean;
  onMarkAsRead: (skillId: number) => void;
}

const NewTextbookReadButton = ({ 
  skillId, 
  isRead, 
  onMarkAsRead 
}: NewTextbookReadButtonProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleMarkAsRead = async () => {
    if (isRead) return;

    setIsAnimating(true);

    // Trigger confetti animation
    if (typeof window !== 'undefined' && (window as any).confetti) {
      (window as any).confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B']
      });
    }

    // Call parent function
    onMarkAsRead(skillId);

    // Show toast notification
    toast({
      title: "Отлично! 🎉",
      description: "Статья отмечена как прочитанная. Вы получили баллы к недельной активности!",
      duration: 3000,
    });

    // Reset animation after delay
    setTimeout(() => {
      setIsAnimating(false);
    }, 2000);
  };

  if (isRead) {
    return (
      <Button
        disabled
        className="flex-1 bg-green-100 text-green-800 border border-green-200 hover:bg-green-100 cursor-default"
        size="lg"
      >
        <Check className="w-5 h-5 mr-2" />
        Прочитано
      </Button>
    );
  }

  return (
    <Button
      onClick={handleMarkAsRead}
      disabled={isAnimating}
      className={`flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 ${
        isAnimating ? 'animate-pulse scale-105' : ''
      }`}
      size="lg"
    >
      {isAnimating ? (
        <>
          <Star className="w-5 h-5 mr-2 animate-spin" />
          Засчитываем...
        </>
      ) : (
        <>
          <Sparkles className="w-5 h-5 mr-2" />
          Я прочитал это!
        </>
      )}
    </Button>
  );
};

export default NewTextbookReadButton;