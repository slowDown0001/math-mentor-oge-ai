
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
const Profile = lazy(() => import("./pages/Profile"));
const DiagnosticTest = lazy(() => import("./pages/DiagnosticTest"));
const Statistics = lazy(() => import("./pages/Statistics"));
const DetailedStatistics = lazy(() => import("./pages/DetailedStatistics"));
const PracticeExercise = lazy(() => import("./pages/PracticeExercise"));
const NewPractice = lazy(() => import("./pages/NewPractice"));
const PracticeNow = lazy(() => import("./pages/PracticeNow"));
const DigitalTextbook = lazy(() => import("./pages/DigitalTextbook"));
const MCQPractice = lazy(() => import("./pages/MCQPractice"));
const Scanner = lazy(() => import("./pages/Scanner"));
const Videos = lazy(() => import("./pages/Videos"));
const Questions = lazy(() => import("./pages/Questions"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
                <Route path="/mcq-practice" element={<MCQPractice />} />
                <Route path="/scanner" element={<Scanner />} />
                <Route path="/videos" element={<Videos />} />
                <Route path="/questions" element={<Questions />} />
                <Route path="/new-practice" element={<NewPractice />} />
                <Route path="/practice-now" element={<PracticeNow />} />
                <Route element={<PrivateRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/diagnostic" element={<DiagnosticTest />} />
                  <Route path="/statistics" element={<Statistics />} />
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
