import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/httpError.js";
import { verifyAccessToken } from "../utils/jwt.js"; // adjust path/name

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return next(new HttpError(401, "Missing Authorization header"));
    }

    const token = header.slice("Bearer ".length).trim();
    const payload = verifyAccessToken(token); // must throw on invalid

    req.user = {
      id: payload.sub,
      workspaceId: payload.workspaceId, // should exist in access token payload
    };

    if (!req.user.workspaceId) {
      return next(new HttpError(401, "Missing workspace"));
    }

    return next();
  } catch (err) {
    return next(new HttpError(401, "Invalid access token"));
  }
}
