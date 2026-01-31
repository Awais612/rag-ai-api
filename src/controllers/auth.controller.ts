import type { Request, Response } from "express";
import { signupSchema, loginSchema } from "../validators/auth.validator.js";
import * as authService from "../services/auth.service.js";
import {
  setRefreshCookie,
  clearRefreshCookie,
  REFRESH_COOKIE_NAME,
} from "../utils/cookies.js";

import { serializeUser } from "../serializers/auth.serializer.js";
import { HttpError } from "../utils/httpError.js";

export async function signup(req: Request, res: Response) {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success)
    throw new HttpError(400, "Validation Failed", parsed.error.flatten());

  const { user, workspace, accessToken, refreshToken } =
    await authService.signup(parsed.data);

  setRefreshCookie(res, refreshToken);

  return res.status(201).json({
    accessToken,
    workspace: { id: workspace.id, name: workspace.name },
    user: serializeUser(user),
  });
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success)
    throw new HttpError(400, "Validation Failed", parsed.error.flatten());

  const { user, workspaceId, accessToken, refreshToken } =
    await authService.login(parsed.data);

  setRefreshCookie(res, refreshToken);

  return res.status(200).json({
    accessToken,
    user: serializeUser(user),
    workspace: { id: workspaceId },
  });
}

export async function refresh(req: Request, res: Response) {
  const token = (req as any).cookies?.[REFRESH_COOKIE_NAME] as
    | string
    | undefined;

  if (!token) throw new HttpError(401, "Missing Refresh Token");
  const { accessToken } = await authService.refresh(token);
  return res.status(200).json({ accessToken });
}

export async function logout(req: Request, res: Response) {
  const token = (req as any).cookies?.[REFRESH_COOKIE_NAME] as
    | string
    | undefined;

  await authService.logout(token);
  clearRefreshCookie(res);
  return res.sendStatus(204);
}

