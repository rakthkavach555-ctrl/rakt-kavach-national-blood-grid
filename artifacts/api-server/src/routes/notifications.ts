import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, notificationsTable } from "@workspace/db";
import { authenticate, type AuthRequest } from "../lib/auth";

const router: IRouter = Router();

router.get("/notifications", authenticate, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(String(req.query["page"] ?? "1"));
    const limit = parseInt(String(req.query["limit"] ?? "20"));
    const unreadOnly = req.query["unreadOnly"] === "true";
    const userId = req.user!.userId;
    const conditions = [eq(notificationsTable.userId, userId)];
    if (unreadOnly) conditions.push(eq(notificationsTable.isRead, false));
    const rows = await db.select().from(notificationsTable).where(and(...conditions)).orderBy(desc(notificationsTable.createdAt)).limit(limit).offset((page - 1) * limit);
    const unreadCount = (await db.select().from(notificationsTable).where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.isRead, false)))).length;
    res.json({
      notifications: rows.map(n => ({ ...n, metadata: n.metadata ? JSON.stringify(n.metadata) : null, createdAt: n.createdAt.toISOString() })),
      total: rows.length, unreadCount, page, limit,
    });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.patch("/notifications/:id/read", authenticate, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(String(req.params["id"]));
    await db.update(notificationsTable).set({ isRead: true }).where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, req.user!.userId)));
    res.json({ message: "Marked as read" });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.patch("/notifications/read-all", authenticate, async (req: AuthRequest, res) => {
  try {
    await db.update(notificationsTable).set({ isRead: true }).where(and(eq(notificationsTable.userId, req.user!.userId), eq(notificationsTable.isRead, false)));
    res.json({ message: "All notifications marked as read" });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

export default router;
