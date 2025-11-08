import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

interface Story {
  id: string;
  title: string;
  content: string;
  genre?: string;
  likes_count?: number;
  comments_count?: number;
  created_at?: string;
  user_id: string;
  is_published?: boolean;
}

interface StoryWithProfile extends Story {
  username?: string;
}

const Feed = () => {
  const [user, setUser] = useState<any>(null);
  const [stories, setStories] = useState<StoryWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // ✅ Get current user
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

  // ✅ Load stories on mount
  useEffect(() => {
    fetchStories();
  }, []);

  // ✅ Fetch published stories and usernames
  const fetchStories = async () => {
    try {
      setLoading(true);

      const { data: storiesData, error: storiesError } = await supabase
        .from("stories")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (storiesError) throw storiesError;

      if (storiesData && storiesData.length > 0) {
        const userIds = [...new Set(storiesData.map((s) => s.user_id))];

        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);

        if (profilesError) throw profilesError;

        const profileMap = new Map(
          profilesData?.map((p) => [p.id, p.username]) || []
        );

        const storiesWithProfiles = storiesData.map((story) => ({
          ...story,
          username: profileMap.get(story.user_id) || "Anonymous",
        }));

        setStories(storiesWithProfiles);
      } else {
        setStories([]);
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error loading stories",
        description: error.message || "Failed to load community stories.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Like/Unlike toggle using Supabase
  const handleLike = async (storyId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like stories.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Try inserting like first
      const { error: insertError } = await supabase.from("likes").insert({
        story_id: storyId,
        user_id: user.id,
      });

      if (insertError) {
        // If duplicate (already liked), delete instead
        if (insertError.code === "23505") {
          await supabase
            .from("likes")
            .delete()
            .eq("story_id", storyId)
            .eq("user_id", user.id);
        } else {
          throw insertError;
        }
      }

      // Refresh stories to reflect like count
      fetchStories();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error updating like",
        description: error.message || "Unable to update like status.",
        variant: "destructive",
      });
    }
  };

  // ✅ UI Rendering
  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gradient mb-2">
              Community Stories
            </h1>
            <p className="text-muted-foreground">
              Discover amazing stories from the community
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No stories yet. Be the first to share your masterpiece!
              </p>
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
                        <span>by {story.username}</span>
                        {story.genre && (
                          <span className="px-2 py-1 rounded bg-primary/20 text-primary">
                            {story.genre}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground line-clamp-3">
                        {story.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(story.id)}
                          className="gap-2"
                        >
                          <Heart className="w-4 h-4" />
                          {story.likes_count ?? 0}
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <MessageCircle className="w-4 h-4" />
                          {story.comments_count ?? 0}
                        </Button>
                      </div>

                      <Link to={`/story/${story.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-neon"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Read More
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
