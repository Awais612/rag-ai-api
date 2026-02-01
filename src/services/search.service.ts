import { prisma } from "../db/client.js";
import { embed, toVectorLiteral } from "../utils/embeddings.js";

export type SearchRow = {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  distance: number;
  score: number;
};

export async function search(input: {
  workspaceId: string;
  query: string;
  topK: number;
  documentId?: string;
  minScore: number;
}): Promise<SearchRow[]> {
  const qVec = await embed(input.query);
  const qLiteral = toVectorLiteral(qVec);

  if (input.documentId) {
    return prisma.$queryRawUnsafe<SearchRow[]>(
      `
      SELECT
        dc.id,
        dc.document_id as "documentId",
        dc.chunk_index as "chunkIndex",
        dc.content,
        (dc.embedding <=> $1::vector) AS distance,
        (1 - (dc.embedding <=> $1::vector)) AS score
      FROM "document_chunks" dc
      JOIN "documents" d ON d.id = dc.document_id
      WHERE dc.workspace_id = $2::uuid
        AND dc.document_id = $3::uuid
        AND d.status = 'indexed'
        AND (1 - (dc.embedding <=> $1::vector)) >= $4
      ORDER BY dc.embedding <=> $1::vector
      LIMIT $5
      `,
      qLiteral,
      input.workspaceId,
      input.documentId,
      input.minScore,
      input.topK,
    );
  }

  return prisma.$queryRawUnsafe<SearchRow[]>(
    `
    SELECT
      dc.id,
      dc.document_id as "documentId",
      dc.chunk_index as "chunkIndex",
      dc.content,
      (dc.embedding <=> $1::vector) AS distance,
      (1 - (dc.embedding <=> $1::vector)) AS score
    FROM "document_chunks" dc
    JOIN "documents" d ON d.id = dc.document_id
    WHERE dc.workspace_id = $2::uuid
      AND d.status = 'indexed'
      AND (1 - (dc.embedding <=> $1::vector)) >= $3
    ORDER BY dc.embedding <=> $1::vector
    LIMIT $4
    `,
    qLiteral,
    input.workspaceId,
    input.minScore,
    input.topK,
  );
}
