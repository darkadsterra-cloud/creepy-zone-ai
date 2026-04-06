import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "crypto";

const sessions = new Map<string, { id: string; username: string; trialEndsAt: Date; planExpiresAt: Date | null }>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { fingerprint, username } = req.body || {};
  const sessionId = randomUUID();
  const trialEndsAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  sessions.set(sessionId, {
    id: sessionId,
    username: username || fingerprint || "user",
    trialEndsAt,
    planExpiresAt: null,
  });

  return res.status(200).json({
    sessionId,
    username: username || fingerprint || "user",
    trialEndsAt: trialEndsAt.toISOString(),
    planExpiresAt: null,
    planStatus: "trial",
  });
}