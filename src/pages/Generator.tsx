import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Save, Share2 } from "lucide-react";
import { createStory } from "@/api/storyApi";

const Generator = () => {
  const [user, setUser] = useState<any>(null);
  const [starterText, setStarterText] = useState("");
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [tone, setTone] = useState("");
  const [style, setStyle] = useState("");
  const [generatedStory, setGeneratedStory] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ✅ GEMINI AI INTEGRATION
  const handleGenerate = async () => {
    if (!starterText) {
      toast({
        title: "Missing Input",
        description: "Please enter some starter text first!",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setGeneratedStory("");

    try {
      const prompt = `
You are a creative and imaginative storyteller.
Continue this story with emotional depth, vivid imagery, and engaging dialogue.

Title: ${title || "Untitled Story"}
Genre: ${genre || "General Fiction"}
Tone: ${tone || "Neutral"}
Style: ${style || "Descriptive"}

Story so far:
"${starterText}"

Continue this story naturally with consistent tone and pacing.
`;

      // Call your deployed Vercel API route
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message || "Gemini API error");

      setGeneratedStory(data.text);
      toast({
        title: "Story Generated!",
        description: "AI successfully wrote your story.",
      });
    } catch (err: any) {
      toast({
        title: "Error generating story",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ SAVE STORY TO SUPABASE
  const handleSave = async () => {
    if (!user || !generatedStory) {
      toast({
        title: "Missing",
        description: "Please sign in and generate a story first.",
      });
      return;
    }

    try {
      const { data } = await supabase.auth.getSession();
      const token = (data as any)?.session?.access_token;

      await createStory(
        {
          user_id: user.id,
          title: title || "Untitled Story",
          content: generatedStory,
          genre,
          tone,
          style,
          is_published: false,
        } as any,
        { token }
      );

      toast({
        title: "Saved!",
        description: "Story saved to your profile.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Failed to save story.",
        variant: "destructive",
      });
    }
  };

  // ✅ PUBLISH STORY TO COMMUNITY
  const handlePublish = async () => {
    if (!user || !generatedStory) {
      toast({
        title: "Missing",
        description: "Please sign in and generate a story first.",
      });
      return;
    }

    try {
      const { data } = await supabase.auth.getSession();
      const token = (data as any)?.session?.access_token;

      await createStory(
        {
          user_id: user.id,
          title: title || "Untitled Story",
          content: generatedStory,
          genre,
          tone,
          style,
          is_published: true,
        } as any,
        { token }
      );

      toast({
        title: "Published!",
        description: "Your story is now live in the community feed.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Failed to publish story.",
        variant: "destructive",
      });
    }
  };

  // ✅ FRONTEND RENDER
  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gradient mb-2">
              Story Generator
            </h1>
            <p className="text-muted-foreground">
              Let AI help you craft your next masterpiece
            </p>
          </div>

          {/* INPUT CARD */}
          <Card className="p-8 bg-glass border-neon">
            <div className="space-y-6">
              <div>
                <Label htmlFor="title">Story Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your story"
                  className="bg-background/50 border-neon"
                />
              </div>

              <div>
                <Label htmlFor="starter">Starter Text</Label>
                <Textarea
                  id="starter"
                  value={starterText}
                  onChange={(e) => setStarterText(e.target.value)}
                  placeholder="Begin your story here... The AI will continue from where you leave off."
                  className="min-h-[150px] bg-background/50 border-neon"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <Select value={genre} onValueChange={setGenre}>
                    <SelectTrigger className="bg-background/50 border-neon">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fantasy">Fantasy</SelectItem>
                      <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                      <SelectItem value="mystery">Mystery</SelectItem>
                      <SelectItem value="romance">Romance</SelectItem>
                      <SelectItem value="horror">Horror</SelectItem>
                      <SelectItem value="adventure">Adventure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="bg-background/50 border-neon">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="humorous">Humorous</SelectItem>
                      <SelectItem value="serious">Serious</SelectItem>
                      <SelectItem value="suspenseful">Suspenseful</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="style">Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="bg-background/50 border-neon">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="descriptive">Descriptive</SelectItem>
                      <SelectItem value="dialogue">Dialogue-Heavy</SelectItem>
                      <SelectItem value="action">Action-Packed</SelectItem>
                      <SelectItem value="poetic">Poetic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading || !starterText}
                className="w-full hover-glow"
                size="lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {loading ? "Generating..." : "Generate Story"}
              </Button>
            </div>
          </Card>

          {/* OUTPUT CARD */}
          {generatedStory && (
            <Card className="p-8 bg-glass border-neon">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gradient">
                  Generated Story
                </h2>
                <div className="prose prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-foreground">
                    {generatedStory}
                  </p>
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={handleSave}
                    variant="outline"
                    className="border-neon"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button onClick={handlePublish} className="hover-glow">
                    <Share2 className="w-4 h-4 mr-2" />
                    Publish to Community
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generator;
