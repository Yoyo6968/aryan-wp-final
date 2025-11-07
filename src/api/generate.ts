import type { VercelRequest, VercelResponse } from "@vercel/node";
import fetch from "node-fetch";

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { prompt } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing Gemini API key" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data: GeminiResponse = await response.json();
    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return res.status(response.status).json(data);
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No output";
    res.status(200).json({ text });
  } catch (err: any) {
    console.error("Server Error:", err);
    res.status(500).json({ error: err.message });
  }
}
