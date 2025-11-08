// src/api/storyApi.ts
import { supabase } from "@/integrations/supabase/client";

/** Story type definition */
export type StoryData = {
  id?: string;
  user_id?: string;
  title?: string;
  content: string;
  genre?: string;
  tone?: string;
  style?: string;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
};

/** Get all published community stories */
export async function getStories() {
  const { data, error } = await supabase
    .from("stories")
    .select(
      `
        id,
        title,
        content,
        genre,
        tone,
        style,
        is_published,
        created_at,
        updated_at,
        user_id,
        profiles(username)
      `
    )
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

/** Create a new story (draft or published) */
export async function createStory(story: StoryData, opts?: { token?: string }) {
  const { data, error } = await supabase.from("stories").insert([story]).select();
  if (error) throw new Error(error.message);
  return data?.[0];
}

/** Update an existing story (for edit/save) */
export async function updateStory(
  id: string,
  updates: Partial<StoryData>
) {
  const { data, error } = await supabase
    .from("stories")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) throw new Error(error.message);
  return data?.[0];
}

/** Like a story (simple local simulation — you can add a likes table if needed) */
export async function likeStory(storyId: string) {
  // Optional: If you later add a "likes" table
  // const { data, error } = await supabase
  //   .from("likes")
  //   .insert([{ story_id: storyId, user_id: currentUser.id }]);
  // if (error) throw new Error(error.message);
  // return data;

  // For now, just return a dummy success response
  return { success: true, message: "Liked story successfully" };
}
