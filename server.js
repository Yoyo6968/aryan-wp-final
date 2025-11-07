import express from "express";
import cors from "cors";

// ✅ Use built-in fetch if available, else import node-fetch
const fetchFn = globalThis.fetch || (await import("node-fetch")).default;

const app = express();
app.use(express.json());
app.use(cors());

const GEMINI_API_KEY = "AIzaSyCSMo7V0haFka3B6T6lN9p9jbhd2AESRdY";

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const response = await fetchFn(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return res.status(response.status).json({ error: data });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    res.json({ text });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(8081, () => console.log("🚀 Gemini Proxy running on http://localhost:8081"));
