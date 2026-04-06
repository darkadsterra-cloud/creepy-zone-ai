import type { VercelRequest, VercelResponse } from "@vercel/node";

const HF_API_KEY = process.env.HF_API_KEY || "";
const HF_MODEL = "black-forest-labs/FLUX.1-schnell";

const IMAGE_SETS = [
  { label: "Starting Soon", tag: "STARTING SOON", dimensions: "1920x1080px" },
  { label: "Be Right Back", tag: "BRB", dimensions: "1920x1080px" },
  { label: "Stream Ending", tag: "ENDING", dimensions: "1920x1080px" },
  { label: "Webcam Overlay", tag: "WEBCAM OVERLAY", dimensions: "400x300px" },
  { label: "Chat Box", tag: "CHAT BOX", dimensions: "340x500px" },
  { label: "Alert Box", tag: "ALERT BOX", dimensions: "600x160px" },
];

async function generateImage(prompt: string): Promise<string> {
  const response = await fetch(
    `https://api-inference.huggingface.co/models/${HF_MODEL}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    }
  );
  if (!response.ok) throw new Error(`HF error: ${response.statusText}`);
  const buffer = await response.arrayBuffer();
  return `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt, aesthetic } = req.body || {};

  try {
    const images = await Promise.all(
      IMAGE_SETS.map(async (set) => {
        const fullPrompt = `${aesthetic || "Dark Horror"} streaming overlay, ${set.label} scene, ${prompt || "dark creepy horror gaming character"}, professional stream asset`;
        const url = await generateImage(fullPrompt);
        return { url, label: set.label, dimensions: set.dimensions };
      })
    );
    return res.status(200).json({ images, generationId: Date.now().toString() });
  } catch (err) {
    return res.status(503).json({ error: err instanceof Error ? err.message : "Generation failed" });
  }
}