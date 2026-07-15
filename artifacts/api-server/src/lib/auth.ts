import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";

const ACCESS_SECRET = process.env["SESSION_SECRET"] || "rakt-kavach-secret-2024";
const REFRESH_SECRET = process.env["SESSION_SECRET"] + "-refresh" || "rakt-kavach-refresh-2024";

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateTokens(userId: number, role: string) {
  const accessToken = jwt.sign({ userId, role }, ACCESS_SECRET, { expiresIn: "1h" });
  const refreshToken = jwt.sign({ userId, role }, REFRESH_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): { userId: number; role: string } | null {
  try {
    return jwt.verify(token, ACCESS_SECRET) as { userId: number; role: string };
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: number; role: string } | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as { userId: number; role: string };
  } catch {
    return null;
  }
}

export interface AuthRequest extends Request {
  user?: { userId: number; role: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const payload = verifyAccessToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
  req.user = payload;
  next();
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}
