// src/pages/StoryView.tsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { Heart, ArrowLeft } from "lucide-react";

interface Story {
  id: string;
  title: string;
  content: string;
  genre?: string;
  tone?: string;
  style?: string;
  user_id: string;
  created_at: string;
}

const StoryView = () => {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [username, setUsername] = useState<string>("Anonymous");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) fetchStory(id);
  }, [id]);

  const fetchStory = async (storyId: string) => {
    try {
      const { data: storyData, error: storyError } = await supabase
        .from("stories")
        .select("*")
        .eq("id", storyId)
        .single();

      if (storyError || !storyData) throw storyError || new Error("Story not found");

      setStory(storyData);

      // Fetch author name
      const { data: profileData } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", storyData.user_id)
        .single();

      setUsername(profileData?.username || "Anonymous");
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Failed to load story.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Story Not Found</h1>
        <Link to="/feed">
          <Button variant="outline" className="border-neon">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Feed
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-12 max-w-3xl">
        <Card className="p-8 bg-glass border-neon">
          <h1 className="text-4xl font-bold text-gradient mb-4">
            {story.title}
          </h1>

          <div className="flex items-center justify-between text-muted-foreground text-sm mb-6">
            <p>
              by <span className="font-medium text-primary">{username}</span>
            </p>
            <p>{new Date(story.created_at).toLocaleDateString()}</p>
          </div>

          {story.genre && (
            <span className="inline-block mb-4 px-3 py-1 rounded bg-primary/20 text-primary text-sm">
              {story.genre}
            </span>
          )}

          <p className="whitespace-pre-wrap leading-relaxed text-foreground">
            {story.content}
          </p>

          <div className="flex justify-between items-center mt-8">
            <Link to="/feed">
              <Button variant="outline" className="border-neon">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </Link>

            <Button variant="ghost" size="sm" className="gap-2">
              <Heart className="w-4 h-4" />
              Like
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StoryView;
