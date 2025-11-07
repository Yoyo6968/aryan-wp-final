import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Sparkles, BookOpen, User, LogOut, PenTool } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NavigationProps {
  user?: any;
}

export const Navigation = ({ user }: NavigationProps) => {
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-glass border-b border-neon">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Sparkles className="w-6 h-6 text-gradient animate-glow" />
            <span className="text-xl font-bold text-gradient">AI StoryForge</span>
          </Link>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link to="/generator">
                  <Button
                    variant={isActive("/generator") ? "default" : "ghost"}
                    className="gap-2"
                  >
                    <PenTool className="w-4 h-4" />
                    Generator
                  </Button>
                </Link>
                <Link to="/feed">
                  <Button
                    variant={isActive("/feed") ? "default" : "ghost"}
                    className="gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Stories
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button
                    variant={isActive("/profile") ? "default" : "ghost"}
                    className="gap-2"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Button>
                </Link>
                <Button variant="ghost" onClick={handleLogout} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button>Get Started</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
