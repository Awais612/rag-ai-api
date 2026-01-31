import type { Request, Response, NextFunction } from "express";
import { verifyAcessToken } from "../utils/jwt.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token)
    return res.status(401).json({
      error: "Invalid or expired token",
    });

  try {
    const payload = verifyAcessToken(token);
    (req as any).user = { id: payload?.sub, workspaceId: payload?.workspaceId };
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
