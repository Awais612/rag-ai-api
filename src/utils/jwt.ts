import jwt, { type SignOptions } from "jsonwebtoken";

const accessSecret = process.env.JWT_ACCESS_SECRET!;
const refreshSecret = process.env.JWT_REFRESH_SECRET!;
const accessTtl = process.env.ACCESS_TOKEN_TTL || "15m";

export type AccessTokenPayload = { sub: string; workspaceId?: string };
export type RefreshTokenPayload = { sub: string };

export function signAccessToken(payload: AccessTokenPayload) {
  if (!accessSecret) throw new Error("JWT_ACCESS_SECRET is not set");
  const options: SignOptions = {
    expiresIn: accessTtl as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, accessSecret, options);
}

export function signRefreshToken(payload: RefreshTokenPayload) {
  if (!refreshSecret) throw new Error("JWT_REFRESH_SECRET is not set");
  return jwt.sign(payload, refreshSecret, { expiresIn: "30d" });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  if (!accessSecret) throw new Error("JWT_ACCESS_TOKEN is not set");
  return jwt.verify(token, accessSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  if (!refreshSecret) throw new Error("JWT_REFRESH_TOKEN is not set");
  return jwt.verify(token, refreshSecret) as RefreshTokenPayload;
}
