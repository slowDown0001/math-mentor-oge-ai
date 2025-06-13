
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
const Resources = lazy(() => import("./pages/Resources"));
const DigitalTextbook = lazy(() => import("./pages/DigitalTextbook"));
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
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/resources" element={<Resources />} />
              <Route 
                path="/textbook" 
                element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <DigitalTextbook />
                  </Suspense>
                } 
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<div>Loading...</div>}>
                      <Dashboard />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<div>Loading...</div>}>
                      <Profile />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/diagnostic"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<div>Loading...</div>}>
                      <DiagnosticTest />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/statistics"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<div>Loading...</div>}>
                      <Statistics />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/detailed-statistics"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<div>Loading...</div>}>
                      <DetailedStatistics />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/practice"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PracticeExercise />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
