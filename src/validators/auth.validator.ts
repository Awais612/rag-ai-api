import { z } from "zod";

export const signupSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email().max(255),
  password: z.string().min(8).max(255),
  workspaceId: z.string().min(1).max(120).optional(),
});

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(255),
});
