// src/api/storyApi.ts
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

type StoryData = {
  title?: string;
  content: string;
  genre?: string;
  tone?: string;
  style?: string;
  is_published?: boolean;
};

async function fetchJSON(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

/** Get all published stories */
export async function getStories() {
  return fetchJSON(`${API_BASE}/api/stories`);
}

/** Create a story. If token provided, will include Authorization header. */
export async function createStory(story: StoryData, opts?: { token?: string }) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts?.token) headers["Authorization"] = `Bearer ${opts.token}`;

  return fetchJSON(`${API_BASE}/api/stories`, {
    method: "POST",
    headers,
    body: JSON.stringify(story),
  });
}

/** Like a story (POST /api/stories/:id/like) — backend must implement this endpoint */
export async function likeStory(storyId: string, opts?: { token?: string }) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts?.token) headers["Authorization"] = `Bearer ${opts.token}`;

  return fetchJSON(`${API_BASE}/api/stories/${storyId}/like`, {
    method: "POST",
    headers,
  });
}
