import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchStudentProgress } from "@/services/progressApi";
import { calculateOverallProgress } from "@/lib/progress";
import Header from "@/components/Header";
import StudentBar from "@/components/db2/StudentBar";
import ChatDock from "@/components/db2/ChatDock";
import TopicRope from "@/components/db2/TopicRope";
import PracticeCards from "@/components/db2/PracticeCards";
import { ChatProvider } from "@/contexts/ChatContext";

const Db2 = () => {
  const { user } = useAuth();
  const [studentProgress, setStudentProgress] = useState<any>(null);
  const [overallProgress, setOverallProgress] = useState(7); // Default demo value
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStudentData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const progress = await fetchStudentProgress(user.id);
        if (progress) {
          setStudentProgress(progress);
          const calculated = calculateOverallProgress(progress);
          setOverallProgress(calculated);
        }
      } catch (error) {
        console.error('Error loading student data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStudentData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-20">
              <div className="text-lg text-muted-foreground">Загрузка данных...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ChatProvider>
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Main content */}
        <div className="pt-16 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Student Summary Bar */}
            <StudentBar 
              overallProgress={overallProgress}
              streakWeeks={3}
              level={5}
            />

            {/* Three-column main area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[700px]">
              {/* Left column - Chat (5/12 width on desktop) */}
              <div className="lg:col-span-5 order-3 lg:order-1">
                <ChatDock />
              </div>

              {/* Center column - Topic Rope (7/12 width on desktop) */}
              <div className="lg:col-span-4 order-1 lg:order-2">
                <TopicRope 
                  overallProgress={overallProgress}
                  studentProgress={studentProgress}
                />
              </div>

              {/* Right column - Practice Cards */}
              <div className="lg:col-span-3 order-2 lg:order-3">
                <PracticeCards />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ChatProvider>
  );
};

export default Db2;