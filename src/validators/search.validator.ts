import { z } from "zod";

export const searchSchema = z.object({
  query: z.string().min(1).max(5000),
  topK: z.number().int().min(1).max(20).optional().default(5),
  documentId: z.uuid().optional(),
  minScore: z.number().min(0).max(1).default(0.55),
});
