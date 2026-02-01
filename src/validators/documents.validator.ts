import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
});

export const ingestParamsSchema = z.object({
  id: z.uuid(),
});
