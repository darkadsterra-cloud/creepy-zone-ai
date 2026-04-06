import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { generationsTable, sessionsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  GenerateImageBody,
  GenerateVideoBody,
  GenerateVideoResponse,
  GetGenerationHistoryParams,
  GetGenerationHistoryResponse,
} from "@workspace/api-zod";
import { generateImageBuffer, editImages } from "@workspace/integrations-openai-ai-server/image";

const router: IRouter = Router();

async function canGenerate(sessionId: string): Promise<boolean> {
  const sessions = await db.select().from(sessionsTable).where(eq(sessionsTable.id, sessionId)).limit(1);
  if (sessions.length === 0) return false;
  const session = sessions[0];
  const now = new Date();
  if (session.trialEndsAt > now) return true;
  if (session.planExpiresAt && session.planExpiresAt > now) return true;
  return false;
}

const MASTER_CONSISTENCY_PREFIX = `Ultra high quality cinematic streaming overlay art. STRICT CONSISTENCY REQUIRED: Same character identity (same face, same outfit, same colors, same proportions), same environment layout, same lighting setup, same art style across all variations. Professional Twitch/YouTube stream pack. Dark cinematic atmosphere.`;

export const IMAGE_SETS = [
  {
    label: "Starting Soon",
    tag: "STARTING SOON",
    dimensions: "1920x1080px",
    scene: "The character is preparing to start the stream, calm idle anticipation pose, subtle setup action, leaning forward with excitement. Stream countdown atmosphere.",
  },
  {
    label: "Be Right Back",
    tag: "BRB",
    dimensions: "1920x1080px",
    scene: "The character is on a short break, relaxed natural pose, sitting back comfortably, holding a cup or snack, casual waiting mood.",
  },
  {
    label: "Stream Ending",
    tag: "ENDING",
    dimensions: "1920x1080px",
    scene: "The character is ending the stream, waving goodbye to the camera with a warm expression, closing action, farewell mood.",
  },
  {
    label: "Webcam Overlay",
    tag: "WEBCAM OVERLAY",
    dimensions: "400x300px",
    scene: "Decorative frame border for a webcam, character positioned around the edges of a central empty transparent area, ornate gaming frame design.",
  },
  {
    label: "Chat Box",
    tag: "CHAT BOX",
    dimensions: "340x500px",
    scene: "Vertical chat panel, character positioned beside or behind a translucent dark panel, gesturing or reacting to chat, interactive pose.",
  },
  {
    label: "Alert Box",
    tag: "ALERT BOX",
    dimensions: "600x160px",
    scene: "Wide horizontal alert banner, character reacting with excitement to a new follower event, clapping or welcoming gesture, celebratory energy.",
  },
];

function buildPrompt(set: (typeof IMAGE_SETS)[0], aesthetic: string, userPrompt: string) {
  return `${MASTER_CONSISTENCY_PREFIX} Theme: ${aesthetic}. Character/environment base: ${userPrompt}. Scene: ${set.scene}. Use EXACTLY the same character, outfit, face, environment across all bundle images. No text overlay in the image. Professional stream overlay asset optimized for ${set.dimensions}.`;
}

async function generateWithOptionalReference(
  promptText: string,
  masterImageUrl: string | undefined,
  size: "1024x1024" | "1792x1024" = "1024x1024"
): Promise<Buffer> {
  if (masterImageUrl && masterImageUrl.startsWith("data:image")) {
    const match = masterImageUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      const tmpFile = path.join(os.tmpdir(), `master_${randomUUID()}.png`);
      try {
        fs.writeFileSync(tmpFile, Buffer.from(match[2], "base64"));
        const buf = await editImages([tmpFile], promptText);
        return buf;
      } finally {
        if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
      }
    }
  }
  return generateImageBuffer(promptText, size);
}

router.post("/image", async (req, res) => {
  const body = GenerateImageBody.parse(req.body);
  const masterImageUrl: string | undefined = req.body.masterImageUrl;

  const allowed = await canGenerate(body.sessionId);
  if (!allowed) {
    return res.status(403).json({ error: "Trial expired. Please subscribe to continue." });
  }

  const generationId = randomUUID();
  const aesthetic = body.aesthetic || "Dark Horror";
  const userPrompt = body.prompt || "dark creepy horror gaming character";

  const buffers = await Promise.all(
    IMAGE_SETS.map((set) =>
      generateWithOptionalReference(buildPrompt(set, aesthetic, userPrompt), masterImageUrl)
    )
  );

  const images = IMAGE_SETS.map((set, i) => ({
    url: `data:image/png;base64,${buffers[i].toString("base64")}`,
    label: set.label,
    dimensions: set.dimensions,
  }));

  await db.insert(generationsTable).values({
    id: generationId,
    sessionId: body.sessionId,
    type: "image",
    prompt: body.prompt,
    aesthetic: body.aesthetic,
    resultUrls: JSON.stringify(images.map(() => "[base64]")),
  });

  res.json({ images, generationId });
});

router.post("/scene", async (req, res) => {
  const { sessionId, prompt, aesthetic, sceneIndex, masterImageUrl } = req.body as {
    sessionId: string;
    prompt: string;
    aesthetic: string;
    sceneIndex: number;
    masterImageUrl?: string;
  };

  const allowed = await canGenerate(sessionId);
  if (!allowed) {
    return res.status(403).json({ error: "Trial expired. Please subscribe to continue." });
  }

  const set = IMAGE_SETS[sceneIndex];
  if (!set) {
    return res.status(400).json({ error: "Invalid scene index." });
  }

  const promptText = buildPrompt(set, aesthetic || "Dark Horror", prompt || "dark horror character");
  const buffer = await generateWithOptionalReference(promptText, masterImageUrl);
  const url = `data:image/png;base64,${buffer.toString("base64")}`;

  res.json({ url, label: set.label, tag: set.tag, dimensions: set.dimensions, index: sceneIndex });
});

router.post("/video", async (req, res) => {
  const body = GenerateVideoBody.parse(req.body);
  const allowed = await canGenerate(body.sessionId);
  if (!allowed) {
    return res.status(403).json({ error: "Trial expired. Please subscribe to continue." });
  }

  const generationId = randomUUID();
  const style = body.style || "Epic Reveal";
  const promptBase = body.prompt || "dark cinematic streaming intro animation";

  let videoUrl: string;

  try {
    if (body.sourceImageUrl && body.sourceImageUrl.startsWith("data:image")) {
      const match = body.sourceImageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const tmpFile = path.join(os.tmpdir(), `src_${randomUUID()}.png`);
        fs.writeFileSync(tmpFile, Buffer.from(match[2], "base64"));
        const editPrompt = `${MASTER_CONSISTENCY_PREFIX} Animation style: ${style}. Transform this stream overlay into a dramatic cinematic animated intro concept. ${promptBase}. Epic motion effects, particle systems, dramatic lighting changes, camera zoom effect, professional streaming animation style. Keep the same character and environment but add dynamic energy and movement.`;
        const editedBuffer = await editImages([tmpFile], editPrompt);
        if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
        videoUrl = `data:image/png;base64,${editedBuffer.toString("base64")}`;
      } else {
        throw new Error("Could not parse source image");
      }
    } else {
      const videoPrompt = `${MASTER_CONSISTENCY_PREFIX} Style: ${style}. Cinematic streaming intro frame: ${promptBase}. Epic dramatic scene, particle effects, dynamic lighting, professional animated intro for streaming. Single high-impact frame designed for animation.`;
      const buffer = await generateImageBuffer(videoPrompt, "1024x1024");
      videoUrl = `data:image/png;base64,${buffer.toString("base64")}`;
    }
  } catch {
    const fallbackPrompt = `Cinematic epic streaming intro concept art, style: ${style}, theme: ${promptBase}, dark dramatic atmosphere, particle effects, professional quality`;
    const buffer = await generateImageBuffer(fallbackPrompt, "1024x1024");
    videoUrl = `data:image/png;base64,${buffer.toString("base64")}`;
  }

  await db.insert(generationsTable).values({
    id: generationId,
    sessionId: body.sessionId,
    type: "video",
    prompt: body.prompt,
    aesthetic: body.style,
    resultUrls: JSON.stringify(["[base64]"]),
  });

  const data = GenerateVideoResponse.parse({ videoUrl, generationId });
  res.json(data);
});

router.post("/chat", async (req, res) => {
  const { message } = req.body as { message: string };
  const responses: Record<string, string> = {
    default: "Hey! I'm your Creepy Zone AI assistant 🎮 Ask me anything about generating stream packs, videos, payment, or downloads!",
    hello: "Welcome to Creepy Zone! 👻 Upload your character image or describe it, pick a theme, then hit Generate. The AI creates 6 consistent streaming assets!",
    generate: "To generate: 1) Upload your character image OR describe it 2) Pick a theme (auto-loads prompt) 3) Hit the generate button. 6 consistent assets are created in ~60 seconds!",
    video: "For video: First generate your images, select one by clicking it, pick an animation style, then hit Generate Animation! The AI animates your selected image.",
    payment: "To unlock after trial: Click any plan (Weekly $5 or Monthly $15). Send via Payoneer to ID 74660788 or email kaleemji788@gmail.com, then enter your transaction ID.",
    download: "Each image has a DOWNLOAD button. You can also download ALL images as a ZIP bundle using Download All (ZIP)!",
    trial: "Creepy Zone is completely FREE for 24 hours! No credit card needed. After 24 hours, subscribe weekly ($5) or monthly ($15) via Payoneer.",
    upload: "You can upload your character image using the Upload Character button! This sets your character as the master reference for consistent AI generation across all 6 assets.",
    regenerate: "Each generated image has a Regenerate button (circular arrow icon). Click it to re-generate just that one scene while keeping the same character and style!",
  };

  const msg = (message || "").toLowerCase();
  let reply = responses.default;
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey") || msg.includes("start")) reply = responses.hello;
  else if (msg.includes("upload") || msg.includes("reference") || msg.includes("my image")) reply = responses.upload;
  else if (msg.includes("regenerat") || msg.includes("redo") || msg.includes("try again")) reply = responses.regenerate;
  else if (msg.includes("generat") || msg.includes("image") || msg.includes("creat")) reply = responses.generate;
  else if (msg.includes("video") || msg.includes("animat")) reply = responses.video;
  else if (msg.includes("pay") || msg.includes("unlock") || msg.includes("plan") || msg.includes("subscr")) reply = responses.payment;
  else if (msg.includes("download") || msg.includes("zip") || msg.includes("save")) reply = responses.download;
  else if (msg.includes("trial") || msg.includes("free") || msg.includes("hour")) reply = responses.trial;

  res.json({ reply });
});

router.get("/history/:sessionId", async (req, res) => {
  const params = GetGenerationHistoryParams.parse(req.params);
  const items = await db
    .select()
    .from(generationsTable)
    .where(eq(generationsTable.sessionId, params.sessionId))
    .orderBy(generationsTable.createdAt);

  const data = GetGenerationHistoryResponse.parse({
    items: items.map((item) => ({
      id: item.id,
      type: item.type,
      prompt: item.prompt,
      aesthetic: item.aesthetic,
      createdAt: item.createdAt.toISOString(),
    })),
  });
  res.json(data);
});

export default router;
