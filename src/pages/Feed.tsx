import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { getStories, likeStory } from "@/api/storyApi";
import { supabase } from "@/integrations/supabase/client";

interface Story {
  id: string;
  title: string;
  content: string;
  genre?: string;
  likes_count?: number;
  comments_count?: number;
  created_at?: string;
  user_id?: string;
  username?: string;
}

const Feed = () => {
  const [user, setUser] = useState<any>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const data = await getStories();
      // Expect backend to return stories with optional username attached
      setStories(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load stories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (storyId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like stories",
      });
      return;
    }

    try {
      const { data } = await supabase.auth.getSession();
      const token = (data as any)?.session?.access_token;
      // call backend like endpoint
      await likeStory(storyId, { token });
      // reload stories (or optimistically update)
      fetchStories();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Failed to like story",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gradient mb-2">Community Stories</h1>
            <p className="text-muted-foreground">Discover amazing stories from the community</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {stories.map((story) => (
                <Card
                  key={story.id}
                  className="p-6 bg-glass border-neon hover-glow transition-all duration-300"
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{story.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span>by {story.username ?? "Anonymous"}</span>
                        {story.genre && (
                          <span className="px-2 py-1 rounded bg-primary/20 text-primary">{story.genre}</span>
                        )}
                      </div>
                      <p className="text-muted-foreground line-clamp-3">{story.content}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-4">
                        <Button variant="ghost" size="sm" onClick={() => handleLike(story.id)} className="gap-2">
                          <Heart className="w-4 h-4" />
                          {story.likes_count ?? 0}
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <MessageCircle className="w-4 h-4" />
                          {story.comments_count ?? 0}
                        </Button>
                      </div>
                      <Link to={`/story/${story.id}`}>
                        <Button variant="outline" size="sm" className="border-neon">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Read More
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}

              {stories.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No stories yet. Be the first to share!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
