import express from "express";
import { db } from "@workspace/db";
import { sessionsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import {
  CreateOrGetSessionBody,
  CreateOrGetSessionResponse,
  GetSessionParams,
  GetSessionResponse,
} from "@workspace/api-zod";

const router = express.Router();

function sessionToResponse(session: any) {
  const now = new Date();
  return {
    sessionId: session.id,
    username: session.username,
    createdAt: session.createdAt.toISOString(),
    trialEndsAt: session.trialEndsAt.toISOString(),
    planType: session.planType,
    planExpiresAt: session.planExpiresAt
      ? session.planExpiresAt.toISOString()
      : null,
    isTrialActive: session.trialEndsAt > now,
    isPlanActive: session.planExpiresAt
      ? session.planExpiresAt > now
      : false,
  };
}

// ================= REGISTER =================
router.post("/register", async (req: any, res: any) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password too short" });
    }

    const existing = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const id = randomUUID();
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + 86400000);

    await db.insert(sessionsTable).values({
      id,
      username: displayName || email.split("@")[0],
      email: email.toLowerCase().trim(),
      passwordHash,
      fingerprint: `email:${email}`,
      createdAt: now,
      trialEndsAt,
      planType: null,
      planExpiresAt: null,
    });

    return res.json({ sessionId: id });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// ================= LOGIN =================
router.post("/login", async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const sessions = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (sessions.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const session = sessions[0];

    const valid = await bcrypt.compare(password, session.passwordHash);

    if (!valid) {
      return res.status(401).json({ error: "Wrong password" });
    }

    return res.json({
      sessionId: session.id,
      username: session.username,
      email: session.email,
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// ================= CREATE / GET SESSION =================
router.post("/session", async (req: any, res: any) => {
  try {
    const body = CreateOrGetSessionBody.parse(req.body);

    const existing = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.fingerprint, body.fingerprint))
      .limit(1);

    if (existing.length > 0) {
      return res.json(sessionToResponse(existing[0]));
    }

    const id = randomUUID();
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + 86400000);

    await db.insert(sessionsTable).values({
      id,
      username: body.username,
      fingerprint: body.fingerprint,
      createdAt: now,
      trialEndsAt,
      planType: null,
      planExpiresAt: null,
    });

    const [created] = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.id, id))
      .limit(1);

    if (!created) {
      return res.status(500).json({ error: "Failed to create session" });
    }

    return res.json(sessionToResponse(created));
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// ================= GET SESSION =================
router.get("/session/:sessionId", async (req: any, res: any) => {
  try {
    const params = GetSessionParams.parse(req.params);

    const sessions = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.id, params.sessionId))
      .limit(1);

    if (sessions.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    return res.json(sessionToResponse(sessions[0]));
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
