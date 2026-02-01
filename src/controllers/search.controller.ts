import type { Request, Response } from "express";
import { HttpError } from "../utils/httpError.js";
import { searchSchema } from "../validators/search.validator.js";
import * as searchService from "../services/search.service.js";
import { serializeSearchResults } from "../serializers/search.serializer.js";

export async function search(req: Request, res: Response) {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) throw new HttpError(401, "Missing workspace");

  const parsed = searchSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "Validation Failed", parsed.error.flatten());
  }

  const rows = await searchService.search({
    workspaceId,
    query: parsed.data.query,
    topK: parsed.data.topK,
    documentId: parsed.data.documentId,
    minScore: parsed.data.minScore,
  });

  return res.json({
    query: parsed.data.query,
    count: rows.length,
    results: serializeSearchResults(rows),
  });
}
