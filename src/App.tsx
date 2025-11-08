import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import StoryView from "@/pages/StoryView";
import Story from "@/pages/Story";

// Pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Generator from "./pages/Generator";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch current session and subscribe to changes
  useEffect(() => {
    const initSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ✅ Loading Spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // ✅ Protected Route Wrapper
  const ProtectedRoute = ({ element }: { element: JSX.Element }) =>
    user ? element : <Navigate to="/auth" replace />;

  // ✅ Auth Route Wrapper
  const AuthRoute = ({ element }: { element: JSX.Element }) =>
    user ? <Navigate to="/generator" replace /> : element;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/auth" element={<AuthRoute element={<Auth />} />} />
            <Route path="/story/:id" element={<StoryView />} />
            <Route path="/story/:id" element={<Story />} />
            {/* Protected Routes */}
            <Route path="/generator" element={<ProtectedRoute element={<Generator />} />} />
            <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />

            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
