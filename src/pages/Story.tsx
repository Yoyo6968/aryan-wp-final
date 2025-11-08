import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Heart } from "lucide-react";

interface Story {
  id: string;
  title: string;
  content: string;
  genre?: string;
  created_at?: string;
  user_id: string;
  username?: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  username?: string;
}

const StoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    fetchStory();
    fetchComments();
  }, [id]);

  // 🧠 Fetch story details
  const fetchStory = async () => {
    const { data, error } = await supabase
      .from("stories")
      .select("*, profiles(username)")
      .eq("id", id)
      .single();

    if (error) {
      toast({
        title: "Error loading story",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setStory({
        ...data,
        username: data.profiles?.username || "Anonymous",
      });
    }
  };

  // 💬 Fetch comments
  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*, profiles(username)")
      .eq("story_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
    } else {
      const formatted = data.map((c: any) => ({
        ...c,
        username: c.profiles?.username || "Anonymous",
      }));
      setComments(formatted);
    }
  };

  // 📝 Post a comment
  const handlePostComment = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to post a comment.",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;

    const { error } = await supabase.from("comments").insert({
      story_id: id,
      user_id: user.id,
      content: newComment.trim(),
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setNewComment("");
      fetchComments();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <div className="container mx-auto px-4 pt-24 pb-12 max-w-3xl">
        <Link to="/feed">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Feed
          </Button>
        </Link>

        {story ? (
          <Card className="p-8 bg-glass border-neon space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{story.title}</h1>
              <p className="text-sm text-muted-foreground mb-4">
                by {story.username}
              </p>
              <p className="whitespace-pre-wrap text-foreground">
                {story.content}
              </p>
            </div>

            {/* ❤️ Like button placeholder */}
            <Button variant="ghost" size="sm" className="gap-2">
              <Heart className="w-4 h-4" /> Like
            </Button>

            {/* 💬 Comments Section */}
            <div className="pt-6 border-t border-border">
              <h2 className="text-xl font-semibold mb-4">Comments</h2>

              {comments.length === 0 ? (
                <p className="text-muted-foreground">No comments yet.</p>
              ) : (
                <div className="space-y-3">
                  {comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-lg bg-background/40 border border-border"
                    >
                      <p className="text-sm text-muted-foreground mb-1">
                        {c.username}
                      </p>
                      <p>{c.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ✍️ Comment Input */}
              <div className="mt-4 space-y-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button onClick={handlePostComment}>Post Comment</Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading story...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryPage;
