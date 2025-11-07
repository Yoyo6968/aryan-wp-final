import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ParticleBackground } from "@/components/ParticleBackground";
import { Sparkles, Zap, Users, BookOpen } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground />
      
      <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block animate-float">
            <Sparkles className="w-20 h-20 text-gradient glow-purple mx-auto" />
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="text-gradient">AI StoryForge</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Where creativity meets artificial intelligence. Generate stunning stories,
            share with the community, and explore infinite narratives.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 hover-glow group">
                Start Writing Now
                <Zap className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
              </Button>
            </Link>
            <Link to="/feed">
              <Button size="lg" variant="outline" className="text-lg px-8 border-neon hover-glow">
                Explore Stories
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-32">
          <div className="bg-glass p-8 rounded-2xl hover-glow transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-[hsl(var(--neon-purple))] to-[hsl(var(--neon-cyan))] rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI-Powered Generation</h3>
            <p className="text-muted-foreground">
              Transform your ideas into captivating stories with advanced AI technology.
            </p>
          </div>

          <div className="bg-glass p-8 rounded-2xl hover-glow transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-[hsl(var(--neon-cyan))] to-[hsl(var(--neon-pink))] rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Creative Community</h3>
            <p className="text-muted-foreground">
              Share your stories, discover others, and connect with fellow writers.
            </p>
          </div>

          <div className="bg-glass p-8 rounded-2xl hover-glow transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-[hsl(var(--neon-pink))] to-[hsl(var(--neon-purple))] rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Endless Possibilities</h3>
            <p className="text-muted-foreground">
              From fantasy to sci-fi, create stories in any genre with any tone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
