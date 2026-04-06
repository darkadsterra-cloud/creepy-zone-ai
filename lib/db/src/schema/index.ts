import { pgTable, text, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email"),
  passwordHash: text("password_hash"),
  fingerprint: text("fingerprint").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  trialEndsAt: timestamp("trial_ends_at").notNull(),
  planType: text("plan_type"),
  planExpiresAt: timestamp("plan_expires_at"),
});

export const generationsTable = pgTable("generations", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  type: text("type").notNull(),
  prompt: text("prompt").notNull(),
  aesthetic: text("aesthetic").notNull(),
  resultUrls: text("result_urls").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const paymentsTable = pgTable("payments", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  plan: text("plan").notNull(),
  amount: numeric("amount").notNull(),
  payoneerTransactionId: text("payoneer_transaction_id").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const insertSessionSchema = createInsertSchema(sessionsTable);
export const insertGenerationSchema = createInsertSchema(generationsTable);
export const insertPaymentSchema = createInsertSchema(paymentsTable);

export type Session = typeof sessionsTable.$inferSelect;
export type Generation = typeof generationsTable.$inferSelect;
export type Payment = typeof paymentsTable.$inferSelect;
