import React, { useState, useEffect } from "react";
import FlyingMathBackground from "@/components/FlyingMathBackground";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { StreakDisplay } from "@/components/streak/StreakDisplay";
import { EnergyPointsHeaderAnimation } from "@/components/streak/EnergyPointsHeaderAnimation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import ChatRenderer2 from "@/components/chat/ChatRenderer2";
import { Button } from "@/components/ui/button";



const LearningLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const startMock = () => navigate("/practice-now");
  
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [task, setTask] = useState('');
  const [storyId, setStoryId] = useState<number | null>(null);
  const [seen, setSeen] = useState(1);
  const [learningTopics, setLearningTopics] = useState<string[]>([]);
  const [energyPointsAnimation, setEnergyPointsAnimation] = useState({ isVisible: false, points: 0 });

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('tutor_avatar_url')
          .eq('user_id', user.id)
          .single();

        if (profile?.tutor_avatar_url) {
          setAvatarUrl(profile.tutor_avatar_url);
        } else {
          setAvatarUrl('https://api.dicebear.com/7.x/avataaars/svg?seed=tutor');
        }

        const { data: stories } = await supabase
          .from('stories_and_telegram')
          .select('upload_id, task, created_at, seen, hardcode_task')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (stories && stories.length > 0) {
          const story = stories[0] as any;
          setTask(story.task || '');
          setStoryId(story.upload_id);
          setSeen(story.seen);
          
          if (story.hardcode_task) {
            try {
              const parsedTask = JSON.parse(story.hardcode_task);
              const topics = parsedTask["темы для изучения"];
              if (Array.isArray(topics)) {
                setLearningTopics(topics);
              }
            } catch (error) {
              console.error('Error parsing hardcode_task:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching story data:', error);
      }
    }

    fetchData();
  }, [user]);

  // Set up global trigger for energy points animation
  useEffect(() => {
    (window as any).triggerEnergyPointsAnimation = (points: number) => {
      setEnergyPointsAnimation({ isVisible: true, points });
    };
    return () => {
      delete (window as any).triggerEnergyPointsAnimation;
    };
  }, []);

  async function handleStoryOpen() {
    setIsStoryOpen(true);

    if (storyId && seen === 0) {
      try {
        await supabase
          .from('stories_and_telegram')
          .update({ seen: 1 })
          .eq('upload_id', storyId);

        setSeen(1);
      } catch (error) {
        console.error('Error updating story seen status:', error);
      }
    }
  }

  return (
    <div
      className="min-h-screen text-foreground relative"
      style={{ background: "linear-gradient(135deg, #1a1f36 0%, #2d3748 50%, #1a1f36 100%)" }}
    >

      <FlyingMathBackground />

      <nav className="fixed top-0 w-full z-30 backdrop-blur-lg bg-[#1a1f36]/80 border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-[#1a1f36] font-bold text-xl">M</span>
            </div>
            <Link 
              to="/ogemath" 
              className="font-display text-xl font-semibold text-white hover:text-yellow-500 transition-colors"
            >
              Математика ОГЭ
            </Link>

          </div>
          <div className="flex items-center gap-6">
            <a href="#modules" className="text-white hover:text-yellow-500">Модули</a>
            <a href="#progress" className="text-white hover:text-yellow-5000">Прогресс</a>
            <button onClick={startMock} className="bg-yellow-500 text-[#1a1f36] px-4 py-2 rounded-lg hover:bg-yellow-400 font-medium">
              Экзамен
            </button>
            {user && avatarUrl && (
              <div
                className={`w-14 h-14 rounded-full overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 ${
                  seen === 0 
                    ? 'p-0.5 bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500' 
                    : 'border-2 border-muted'
                }`}
                onClick={handleStoryOpen}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-background">
                  <img
                    src={avatarUrl}
                    alt="AI Tutor"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            <div className="relative">
              <StreakDisplay />
              <EnergyPointsHeaderAnimation
                points={energyPointsAnimation.points}
                isVisible={energyPointsAnimation.isVisible}
                onAnimationComplete={() => setEnergyPointsAnimation({ isVisible: false, points: 0 })}
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-[68px] relative z-20">
        <Outlet />
      </main>

      {/* Story Modal */}
      {isStoryOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-4xl h-[80vh] bg-gradient-to-br from-background to-muted rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center gap-3 p-6 border-b border-border/20 flex-shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img
                  src={avatarUrl}
                  alt="AI Tutor"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-semibold text-foreground text-lg">AI Tutor</span>
              
              <button
                className="ml-auto w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
                onClick={() => setIsStoryOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-shrink-0 p-6 border-b border-border/20">
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={() => {
                    navigate('/ogemath-revision');
                    setIsStoryOpen(false);
                  }}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Повторение
                </Button>

                {learningTopics.length > 0 ? (
                  learningTopics.slice(0, 2).map((topic, index) => (
                    <Button
                      key={index}
                      onClick={() => {
                        navigate(`/learning-platform?topic=${topic}`);
                        setIsStoryOpen(false);
                      }}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      Изучить {topic}
                    </Button>
                  ))
                ) : (
                  <Button
                    onClick={() => {
                      navigate('/learning-platform');
                      setIsStoryOpen(false);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    Изучение
                  </Button>
                )}

                <Button
                  onClick={() => {
                    navigate('/practice-by-number-ogemath');
                    setIsStoryOpen(false);
                  }}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Практика по номерам
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-none prose prose-lg dark:prose-invert">
                <ChatRenderer2 
                  text={task || 'У вас пока нет новых заданий. Продолжайте практиковаться!'} 
                  isUserMessage={false}
                  className="text-foreground"
                />
              </div>
            </div>

            <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
              <div className="h-full w-full bg-primary"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningLayout;
