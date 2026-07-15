import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, walletsTable } from "@workspace/db";
import { hashPassword, comparePassword, generateTokens, verifyRefreshToken, authenticate, type AuthRequest } from "../lib/auth";
import { auditLog } from "../lib/audit";

const router: IRouter = Router();

router.post("/auth/register", async (req, res) => {
  try {
    const { email, password, name, role = "CITIZEN", phone, state, district } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: "Email, password and name are required" });
      return;
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await hashPassword(password);
    const [user] = await db.insert(usersTable).values({
      email, passwordHash, name, role, phone: phone ?? null,
      state: state ?? null, district: district ?? null,
    }).returning();

    // Create wallet for new user
    await db.insert(walletsTable).values({ userId: user!.id }).onConflictDoNothing();

    const { accessToken, refreshToken } = generateTokens(user!.id, user!.role);
    await db.update(usersTable).set({ refreshToken }).where(eq(usersTable.id, user!.id));
    await auditLog({ action: "REGISTER", userId: user!.id, ipAddress: req.ip });

    res.status(201).json({
      accessToken, refreshToken,
      user: { id: user!.id, email: user!.email, name: user!.name, role: user!.role, phone: user!.phone, state: user!.state, district: user!.district, isActive: user!.isActive, isVerified: user!.isVerified, createdAt: user!.createdAt.toISOString() }
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user || !await comparePassword(password, user.passwordHash)) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    if (!user.isActive) {
      res.status(403).json({ error: "Account is inactive" });
      return;
    }
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    await db.update(usersTable).set({ refreshToken }).where(eq(usersTable.id, user.id));
    await auditLog({ action: "LOGIN", userId: user.id, ipAddress: req.ip });

    res.json({
      accessToken, refreshToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, state: user.state, district: user.district, isActive: user.isActive, isVerified: user.isVerified, createdAt: user.createdAt.toISOString() }
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/logout", authenticate, async (req: AuthRequest, res) => {
  try {
    await db.update(usersTable).set({ refreshToken: null }).where(eq(usersTable.id, req.user!.userId));
    await auditLog({ action: "LOGOUT", userId: req.user!.userId, ipAddress: req.ip });
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/auth/me", authenticate, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, state: user.state, district: user.district, isActive: user.isActive, isVerified: user.isVerified, createdAt: user.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) { res.status(400).json({ error: "Refresh token required" }); return; }
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) { res.status(401).json({ error: "Invalid refresh token" }); return; }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId)).limit(1);
    if (!user || user.refreshToken !== refreshToken) { res.status(401).json({ error: "Token mismatch" }); return; }
    const tokens = generateTokens(user.id, user.role);
    await db.update(usersTable).set({ refreshToken: tokens.refreshToken }).where(eq(usersTable.id, user.id));
    res.json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, state: user.state, district: user.district, isActive: user.isActive, isVerified: user.isVerified, createdAt: user.createdAt.toISOString() } });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
