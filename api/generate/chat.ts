import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { message } = req.body || {};

  const responses: Record<string, string> = {
    default: "Hey! I'm your Creepy Zone AI assistant 🎮 Ask me anything about generating stream packs!",
    hello: "Welcome to Creepy Zone! 👻 Upload your character image or describe it, pick a theme, then hit Generate!",
    generate: "To generate: 1) Describe your character 2) Pick a theme 3) Hit generate. 6 assets created!",
    video: "For video: First generate images, select one, pick animation style, then Generate Animation!",
    payment: "To unlock after trial: Click any plan. Send via Payoneer to ID 74660788.",
    download: "Each image has a DOWNLOAD button. Download ALL as ZIP bundle too!",
    trial: "Creepy Zone is FREE for 24 hours! No credit card needed.",
  };

  const msg = (message || "").toLowerCase();
  let reply = responses.default;
  if (msg.includes("hello") || msg.includes("hi")) reply = responses.hello;
  else if (msg.includes("generat")) reply = responses.generate;
  else if (msg.includes("video")) reply = responses.video;
  else if (msg.includes("pay")) reply = responses.payment;
  else if (msg.includes("download")) reply = responses.download;
  else if (msg.includes("trial") || msg.includes("free")) reply = responses.trial;

  return res.status(200).json({ reply });
}