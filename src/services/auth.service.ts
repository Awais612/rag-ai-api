import argon2 from "argon2";
import crypto from "crypto";
import { prisma } from "../db/client.js";
import { HttpError } from "../utils/httpError.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function signup(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  worksapceName?: string;
}) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) throw new HttpError(409, "Email already in use");

  const passwordHash = await argon2.hash(input.password);

  const user = await prisma.user.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: input.worksapceName ?? "My Workspace",
    },
  });

  await prisma.workspaceMember.create({
    data: {
      userId: user.id,
      workspaceId: workspace.id,
      role: "owner",
    },
  });

  const accessToken = signAccessToken({
    sub: user.id,
    workspaceId: workspace.id,
  });
  const refreshToken = signRefreshToken({ sub: user.id });

  const days = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30);
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256(refreshToken),
      expiresAt,
    },
  });

  return { user, refreshToken, accessToken, workspace };
}
export async function login(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new HttpError(401, "Invalid Credentials");

  const ok = await argon2.verify(user.passwordHash, input.password);
  if (!ok) throw new HttpError(401, "Invalid Credentials");

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: user.id },
  });

  if (!membership) throw new HttpError(403, "User has no workspace");

  const accessToken = signAccessToken({
    sub: user.id,
    workspaceId: membership.workspaceId,
  });
  const refreshToken = signRefreshToken({ sub: user.id });

  const days = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30);
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256(refreshToken),
      expiresAt,
    },
  });

  return {
    user,
    refreshToken,
    accessToken,
    workspaceId: membership.workspaceId,
  };
}

export async function refresh(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);
  const tokenHash = sha256(refreshToken);

  const record = await prisma.refreshToken.findFirst({
    where: { userId: payload.sub, tokenHash, revokedAt: null },
  });

  if (!record) throw new HttpError(401, "Refresh Token revoked/Not Found");
  if (record.expiresAt < new Date())
    throw new HttpError(401, "Refresh Token Expired.");

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: payload.sub },
  });

  const accessToken = signAccessToken({
    sub: payload.sub,
    workspaceId: membership?.workspaceId,
  });

  return { accessToken };
}

export async function logout(refreshToken?: string) {
  if (!refreshToken) return;

  const tokenHash = sha256(refreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: {
      revokedAt: new Date(),
    },
  });
  console.log("User logged out OK!");
}
