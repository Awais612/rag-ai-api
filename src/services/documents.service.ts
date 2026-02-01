import { prisma } from "../db/client.js";
import { HttpError } from "../utils/httpError.js";
import { chunkText } from "../utils/chunker.js";
import { embed, toVectorLiteral } from "../utils/embeddings.js";

export async function createDocument(input: {
  workspaceId: string;
  title: string;
  content: string;
}) {
  const doc = await prisma.document.create({
    data: {
      workspaceId: input.workspaceId,
      title: input.title,
      content: input.content,
      status: "uploaded",
    },
  });
  return doc;
}

export async function ingestDocument(workspaceId: string, documentId: string) {
  const doc = await prisma.document.findFirst({
    where: { id: documentId, workspaceId },
    select: { id: true, content: true, status: true },
  });

  if (!doc) throw new HttpError(404, "Document not found");
  if (!doc.content) throw new HttpError(400, "Document has no content");

  // Idempotency for MVP
  if (doc.status === "indexed") {
    return { indexed: true, chunks: 0, skipped: true };
  }

  await prisma.document.update({
    where: { id: documentId },
    data: { status: "processing", errorMessage: null },
  });

  // Clear previous chunks (re-ingest safe)
  await prisma.documentChunk.deleteMany({
    where: { documentId, workspaceId },
  });

  const chunks = chunkText(doc.content, { chunkSize: 1200, overlap: 200 });

  try {
    for (let i = 0; i < chunks.length; i++) {
      const text = chunks[i];
      const embedding = await embed(text);
      const vectorLiteral = toVectorLiteral(embedding);

      await prisma.$executeRawUnsafe(
        `
        INSERT INTO "document_chunks"
          ("id","workspace_id","document_id","chunk_index","content","embedding","created_at")
        VALUES
          (gen_random_uuid(), $1::uuid, $2::uuid, $3, $4, $5::vector, now())
        `,
        workspaceId,
        documentId,
        i,
        text,
        vectorLiteral,
      );
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { status: "indexed" },
    });

    return { indexed: true, chunks: chunks.length, skipped: false };
  } catch (err: any) {
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: "failed",
        errorMessage: err?.message ?? "Ingestion failed",
      },
    });
    throw err;
  }
}

export async function listDocuments(workspaceId: string) {
  return prisma.document.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      errorMessage: true,
    },
  });
}
