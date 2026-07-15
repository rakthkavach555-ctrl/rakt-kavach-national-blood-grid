import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, walletsTable, walletTransactionsTable, usersTable } from "@workspace/db";
import { authenticate, type AuthRequest } from "../lib/auth";
import { auditLog } from "../lib/audit";

const router: IRouter = Router();

function formatWallet(w: typeof walletsTable.$inferSelect, userName?: string) {
  return { id: w.id, userId: w.userId, userName: userName ?? "", bloodCredits: w.bloodCredits, donationCredits: w.donationCredits, emergencyCredits: w.emergencyCredits, familyProtected: w.familyProtected, qrCode: w.qrCode, createdAt: w.createdAt.toISOString() };
}

router.get("/wallet/:userId", authenticate, async (req, res) => {
  try {
    const userId = parseInt(String(req.params["userId"]));
    let [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, userId)).limit(1);
    if (!wallet) {
      [wallet] = await db.insert(walletsTable).values({ userId }).returning();
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    res.json(formatWallet(wallet!, user?.name));
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/wallet/transactions", authenticate, async (req, res) => {
  try {
    const userId = parseInt(String(req.query["userId"]!));
    const page = parseInt(String(req.query["page"] ?? "1"));
    const limit = parseInt(String(req.query["limit"] ?? "20"));
    const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, userId)).limit(1);
    if (!wallet) { res.json({ transactions: [], total: 0, page, limit }); return; }
    const txs = await db.select().from(walletTransactionsTable).where(eq(walletTransactionsTable.walletId, wallet.id)).orderBy(desc(walletTransactionsTable.createdAt)).limit(limit).offset((page - 1) * limit);
    res.json({ transactions: txs.map(t => ({ ...t, createdAt: t.createdAt.toISOString() })), total: txs.length, page, limit });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/wallet/transfer", authenticate, async (req: AuthRequest, res) => {
  try {
    const { fromUserId, toUserId, amount, reason } = req.body;
    const [fromWallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, parseInt(fromUserId))).limit(1);
    const [toWallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, parseInt(toUserId))).limit(1);
    if (!fromWallet || !toWallet) { res.status(404).json({ error: "Wallet not found" }); return; }
    if (fromWallet.bloodCredits < parseFloat(amount)) { res.status(400).json({ error: "Insufficient credits" }); return; }
    const newFrom = fromWallet.bloodCredits - parseFloat(amount);
    const newTo = toWallet.bloodCredits + parseFloat(amount);
    await db.update(walletsTable).set({ bloodCredits: newFrom, updatedAt: new Date() }).where(eq(walletsTable.id, fromWallet.id));
    await db.update(walletsTable).set({ bloodCredits: newTo, updatedAt: new Date() }).where(eq(walletsTable.id, toWallet.id));
    await db.insert(walletTransactionsTable).values({ walletId: fromWallet.id, type: "INTRA_FAMILY_TRANSFER", amount: -parseFloat(amount), description: reason ?? "Family transfer", balanceAfter: newFrom });
    await db.insert(walletTransactionsTable).values({ walletId: toWallet.id, type: "INTRA_FAMILY_TRANSFER", amount: parseFloat(amount), description: reason ?? "Family transfer received", balanceAfter: newTo });
    await auditLog({ action: "WALLET_TRANSFER", userId: req.user!.userId, metadata: { fromUserId, toUserId, amount } });
    res.json({ success: true, message: "Transfer successful", fromBalance: newFrom, toBalance: newTo });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

export default router;
