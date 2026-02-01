import type { Request, Response } from "express";
import { HttpError } from "../utils/httpError.js";
import {
  createDocumentSchema,
  ingestParamsSchema,
} from "../validators/documents.validator.js";
import * as documentsService from "../services/documents.service.js";

export async function create(req: Request, res: Response) {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) throw new HttpError(401, "Missing workspace");

  const parsed = createDocumentSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "Validation Failed", parsed.error.flatten());
  }

  const doc = await documentsService.createDocument({
    workspaceId,
    title: parsed.data.title,
    content: parsed.data.content,
  });


  return res.status(201).json({
    document: {
      id: doc.id,
      title: doc.title,
      status: doc.status,
    },
  });
}

export async function ingest(req: Request, res: Response) {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) throw new HttpError(401, "Missing workspace");

  const params = ingestParamsSchema.safeParse(req.params);
  if (!params.success) {
    throw new HttpError(400, "Validation Failed", params.error.flatten());
  }

  const result = await documentsService.ingestDocument(
    workspaceId,
    params.data.id,
  );

  return res.json(result);
}

export async function list(req: Request, res: Response) {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) throw new HttpError(401, "Missing workspace");

  const docs = await documentsService.listDocuments(workspaceId);
  return res.json({ documents: docs });
}
