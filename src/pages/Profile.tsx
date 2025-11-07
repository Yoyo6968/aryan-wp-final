import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, BookOpen, Heart, Save } from "lucide-react";

interface Story {
  id: string;
  title: string;
  content: string;
  genre: string;
  created_at: string;
}

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  const [likedStories, setLikedStories] = useState<Story[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchMyStories(session.user.id);
        fetchSavedStories(session.user.id);
        fetchLikedStories(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error) setProfile(data);
  };

  const fetchMyStories = async (userId: string) => {
    const { data, error } = await supabase
      .from("stories")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error) setMyStories(data || []);
  };

  const fetchSavedStories = async (userId: string) => {
    const { data, error } = await supabase
      .from("saved_stories")
      .select("story_id, stories(*)")
      .eq("user_id", userId);

    if (!error) setSavedStories(data?.map((s: any) => s.stories) || []);
  };

  const fetchLikedStories = async (userId: string) => {
    const { data, error } = await supabase
      .from("likes")
      .select("story_id, stories(*)")
      .eq("user_id", userId);

    if (!error) setLikedStories(data?.map((l: any) => l.stories) || []);
  };

  const StoryCard = ({ story }: { story: Story }) => (
    <Card className="p-4 bg-glass border-neon hover-glow transition-all">
      <h3 className="font-bold mb-2">{story.title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
        {story.content}
      </p>
      {story.genre && (
        <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">
          {story.genre}
        </span>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="p-8 bg-glass border-neon">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[hsl(var(--neon-purple))] to-[hsl(var(--neon-cyan))] flex items-center justify-center">
                <User className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gradient">
                  {profile?.username || "Loading..."}
                </h1>
                <p className="text-muted-foreground">{profile?.email}</p>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="my-stories" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-glass">
              <TabsTrigger value="my-stories">
                <BookOpen className="w-4 h-4 mr-2" />
                My Stories
              </TabsTrigger>
              <TabsTrigger value="saved">
                <Save className="w-4 h-4 mr-2" />
                Saved
              </TabsTrigger>
              <TabsTrigger value="liked">
                <Heart className="w-4 h-4 mr-2" />
                Liked
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-stories" className="space-y-4 mt-6">
              {myStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
              {myStories.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No stories yet. Start creating!
                </p>
              )}
            </TabsContent>

            <TabsContent value="saved" className="space-y-4 mt-6">
              {savedStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
              {savedStories.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No saved stories yet.
                </p>
              )}
            </TabsContent>

            <TabsContent value="liked" className="space-y-4 mt-6">
              {likedStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
              {likedStories.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No liked stories yet.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
