import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { paymentsTable, sessionsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  CreatePaymentBody,
  CreatePaymentResponse,
  GetPaymentHistoryParams,
  GetPaymentHistoryResponse,
  VerifyPlanParams,
  VerifyPlanResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const PLAN_DURATIONS: Record<string, number> = {
  weekly: 7 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
};

router.post("/create", async (req, res) => {
  const body = CreatePaymentBody.parse(req.body);
  const id = randomUUID();
  const now = new Date();
  const duration = PLAN_DURATIONS[body.plan] ?? PLAN_DURATIONS.weekly;
  const expiresAt = new Date(now.getTime() + duration);

  await db.insert(paymentsTable).values({
    id,
    sessionId: body.sessionId,
    plan: body.plan,
    amount: String(body.amount),
    payoneerTransactionId: body.payoneerTransactionId,
    status: "active",
    createdAt: now,
    expiresAt,
  });

  await db
    .update(sessionsTable)
    .set({ planType: body.plan, planExpiresAt: expiresAt })
    .where(eq(sessionsTable.id, body.sessionId));

  const data = CreatePaymentResponse.parse({
    id,
    plan: body.plan,
    amount: body.amount,
    status: "active",
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  });
  res.json(data);
});

router.get("/history/:sessionId", async (req, res) => {
  const params = GetPaymentHistoryParams.parse(req.params);
  const payments = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.sessionId, params.sessionId))
    .orderBy(paymentsTable.createdAt);

  const data = GetPaymentHistoryResponse.parse({
    payments: payments.map((p) => ({
      id: p.id,
      plan: p.plan,
      amount: Number(p.amount),
      status: p.status,
      createdAt: p.createdAt.toISOString(),
      expiresAt: p.expiresAt.toISOString(),
    })),
  });
  res.json(data);
});

router.get("/verify/:sessionId", async (req, res) => {
  const params = VerifyPlanParams.parse(req.params);
  const sessions = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, params.sessionId))
    .limit(1);

  if (sessions.length === 0) {
    return res.json(VerifyPlanResponse.parse({ isActive: false, planType: null, expiresAt: null }));
  }

  const session = sessions[0];
  const now = new Date();
  const isActive = session.planExpiresAt ? session.planExpiresAt > now : false;

  const data = VerifyPlanResponse.parse({
    isActive,
    planType: session.planType,
    expiresAt: session.planExpiresAt ? session.planExpiresAt.toISOString() : null,
  });
  res.json(data);
});

export default router;
