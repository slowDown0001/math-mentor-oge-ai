
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import Index from "./pages/Index";
import PrivateRoute from "./components/PrivateRoute";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const MyDashboard = lazy(() => import("./pages/MyDashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const DiagnosticTest = lazy(() => import("./pages/DiagnosticTest"));
const Statistics = lazy(() => import("./pages/Statistics"));
const DetailedStatistics = lazy(() => import("./pages/DetailedStatistics"));
const StatisticsVisual = lazy(() => import("./pages/StatisticsVisual"));
const PracticeExercise = lazy(() => import("./pages/PracticeExercise"));
const NewPractice = lazy(() => import("./pages/NewPractice"));
const PracticeNow = lazy(() => import("./pages/PracticeNow"));
const PracticeByNumber = lazy(() => import("./pages/PracticeByNumber"));
const DigitalTextbook = lazy(() => import("./pages/DigitalTextbook"));
const TextbookTopic = lazy(() => import("./pages/TextbookTopic"));
const TriangleSimilarity = lazy(() => import("./pages/TriangleSimilarity"));
const TriangleSimilarityVideo = lazy(() => import("./pages/TriangleSimilarityVideo"));
const TriangleSimilarityBrainrot = lazy(() => import("./pages/TriangleSimilarityBrainrot"));
const Textbook2 = lazy(() => import("./pages/Textbook2"));
const MCQPractice = lazy(() => import("./pages/MCQPractice"));
const MCQPracticeSkill120 = lazy(() => import("./pages/MCQPracticeSkill120"));
const Scanner = lazy(() => import("./pages/Scanner"));
const Videos = lazy(() => import("./pages/Videos"));
const Questions = lazy(() => import("./pages/Questions"));
const FipiBank = lazy(() => import("./pages/FipiBank"));
const DailyPractice = lazy(() => import("./pages/DailyPractice"));
const BookTest = lazy(() => import("./pages/BookTest"));
const AfterRegistration = lazy(() => import("./pages/AfterRegistration"));
const NewTextbook = lazy(() => import("./pages/NewTextbook"));
const Textbook3 = lazy(() => import("./pages/Textbook3"));
const Db2 = lazy(() => import("./pages/Db2"));
const Subscribe = lazy(() => import("./pages/Subscribe"));
const Pricing = lazy(() => import("./pages/Pricing"));
const FAQ = lazy(() => import("./pages/FAQ"));
const About = lazy(() => import("./pages/About"));
const EgeMathProf = lazy(() => import("./pages/EgeMathProf"));
const EgeMathBasic = lazy(() => import("./pages/EgeMathBasic"));
const OgeMath = lazy(() => import("./pages/OgeMath"));
const OgemathPractice = lazy(() => import("./pages/OgemathPractice"));
const OgemathProgress = lazy(() => import("./pages/OgemathProgress"));
const OgemathProgress2 = lazy(() => import("./pages/OgemathProgress2"));
const EgemathbasicProgress = lazy(() => import("./pages/EgemathbasicProgress"));
const EgemathprofProgress = lazy(() => import("./pages/EgemathprofProgress"));
const PracticeByNumberOgemath = lazy(() => import("./pages/PracticeByNumberOgemath"));
const PracticeByNumberEgeBasicMath = lazy(() => import("./pages/PracticeByNumberEgeBasicMath"));
const PracticeByNumberEgeProfMath = lazy(() => import("./pages/PracticeByNumberEgeProfMath"));
const EgemathprofPractice = lazy(() => import("./pages/EgemathprofPractice"));
const EgemathbasicPractice = lazy(() => import("./pages/EgemathbasicPractice"));
const NewPracticeSkills = lazy(() => import("./pages/NewPracticeSkills"));
const LearningPlatform = lazy(() => import("./pages/LearningPlatform"));
const ModuleNumbersCalculations = lazy(() => import("./pages/ModuleNumbersCalculations"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MyDb3 = lazy(() => import("./pages/MyDb3"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/textbook" element={<DigitalTextbook />} />
                <Route path="/textbook/topic/:topicCode" element={<TextbookTopic />} />
                <Route path="/new-textbook" element={<NewTextbook />} />
                <Route path="/triangle-similarity" element={<TriangleSimilarity />} />
                <Route path="/triangle-similarity-video" element={<TriangleSimilarityVideo />} />
                <Route path="/triangle-similarity-brainrot" element={<TriangleSimilarityBrainrot />} />
                <Route path="/textbook2" element={<Textbook2 />} />
                <Route path="/textbook3" element={<Textbook3 />} />
                <Route path="/mcq-practice" element={<MCQPractice />} />
                <Route path="/mcq-practice-skill-120" element={<MCQPracticeSkill120 />} />
                <Route path="/scanner" element={<Scanner />} />
                <Route path="/videos" element={<Videos />} />
                <Route path="/questions" element={<Questions />} />
                <Route path="/subscribe" element={<Subscribe />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/about" element={<About />} />
                <Route path="/egemathprof" element={<EgeMathProf />} />
                <Route path="/egemathbasic" element={<EgeMathBasic />} />
                <Route path="/ogemath" element={<OgeMath />} />
                <Route path="/ogemath-practice" element={<OgemathPractice />} />
                <Route path="/ogemath-progress" element={<OgemathProgress />} />
                <Route path="/ogemath-progress2" element={<OgemathProgress2 />} />
                <Route path="/egemathbasic-progress" element={<EgemathbasicProgress />} />
                <Route path="/egemathprof-progress" element={<EgemathprofProgress />} />
                <Route path="/practice-by-number-ogemath" element={<PracticeByNumberOgemath />} />
                <Route path="/practice-by-number-egebasicmath" element={<PracticeByNumberEgeBasicMath />} />
                <Route path="/practice-by-number-egeprofmath" element={<PracticeByNumberEgeProfMath />} />
                <Route path="/egemathprof-practice" element={<EgemathprofPractice />} />
                <Route path="/egemathbasic-practice" element={<EgemathbasicPractice />} />
                <Route path="/new-practice-skills" element={<NewPracticeSkills />} />
                <Route path="/learning-platform" element={<LearningPlatform />} />
                <Route path="/module/numbers-calculations" element={<ModuleNumbersCalculations />} />
        <Route path="/book-test" element={<BookTest />} />
        <Route path="/after-registration" element={<AfterRegistration />} />
        <Route path="/db2" element={<Db2 />} />
                <Route path="/fipi-bank" element={<FipiBank />} />
                <Route path="/new-practice" element={<NewPractice />} />
                <Route path="/practice-now" element={<PracticeNow />} />
                <Route path="/practice-by-number" element={<PracticeByNumber />} />
                <Route path="/daily-practice" element={<DailyPractice />} />
                <Route element={<PrivateRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/mydashboard" element={<MyDashboard />} />
                  <Route path="/mydb3" element={<MyDb3 />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/diagnostic" element={<DiagnosticTest />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/statistics/detailed" element={<DetailedStatistics />} />
          <Route path="/statistics/visual" element={<StatisticsVisual />} />
                <Route path="/detailed-statistics" element={<DetailedStatistics />} />
                  <Route path="/practice" element={<PracticeExercise />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </TooltipProvider>
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
