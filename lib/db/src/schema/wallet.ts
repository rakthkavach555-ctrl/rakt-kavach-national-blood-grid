import { pgTable, serial, integer, text, timestamp, real, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const walletTransactionTypeEnum = pgEnum("wallet_transaction_type", [
  "CREDIT_DONATION", "DEBIT_EMERGENCY", "INTRA_FAMILY_TRANSFER", "BONUS", "PENALTY"
]);

export const walletsTable = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  bloodCredits: real("blood_credits").notNull().default(0),
  donationCredits: real("donation_credits").notNull().default(0),
  emergencyCredits: real("emergency_credits").notNull().default(0),
  familyProtected: boolean("family_protected").notNull().default(false),
  qrCode: text("qr_code"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const walletTransactionsTable = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull(),
  type: walletTransactionTypeEnum("type").notNull(),
  amount: real("amount").notNull(),
  description: text("description").notNull(),
  referenceId: text("reference_id"),
  balanceAfter: real("balance_after").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWalletSchema = createInsertSchema(walletsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWalletTransactionSchema = createInsertSchema(walletTransactionsTable).omit({ id: true, createdAt: true });

export type Wallet = typeof walletsTable.$inferSelect;
export type WalletTransaction = typeof walletTransactionsTable.$inferSelect;
