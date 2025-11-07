import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";
import { ParticleBackground } from "@/components/ParticleBackground";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // ✅ Validation
  const validateEmail = (email: string) => email.includes("@");
  const validatePassword = (password: string) =>
    /[A-Z]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password) && /\d/.test(password);

  // ✅ Auth Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Email validation
    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Password validation on signup
    if (!isLogin && !validatePassword(password)) {
      toast({
        title: "Weak Password",
        description:
          "Must include uppercase, special character, and a number.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // ✅ Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You are now logged in.",
        });
        navigate("/generator");
      } else {
        // ✅ Signup
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
            emailRedirectTo: `${window.location.origin}/auth`, // optional redirect after email verification
          },
        });
        if (error) throw error;

        toast({
          title: "Account Created!",
          description: "Please verify your email to continue.",
        });
        navigate("/generator");
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <ParticleBackground />

      <Card className="w-full max-w-md p-8 bg-glass border-neon relative z-10">
        <div className="text-center mb-8">
          <Sparkles className="w-12 h-12 text-gradient mx-auto mb-4 animate-glow" />
          <h1 className="text-3xl font-bold text-gradient mb-2">
            {isLogin ? "Welcome Back" : "Join StoryForge"}
          </h1>
          <p className="text-muted-foreground">
            {isLogin
              ? "Continue your creative journey"
              : "Start your storytelling adventure"}
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background/50 border-neon"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-background/50 border-neon"
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background/50 border-neon"
              required
            />
            {!isLogin && (
              <p className="text-xs text-muted-foreground mt-1">
                Must contain uppercase, special character, and number
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full hover-glow"
            disabled={loading}
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
          </Button>

          <div className="text-center mt-3">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>

          {isLogin && (
            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => alert("Password reset coming soon!")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};

export default Auth;
