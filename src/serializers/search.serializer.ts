import type { SearchRow } from "../services/search.service.js";

export type SearchResultDTO = {
  chunkId: string;
  documentId: string;
  chunkIndex: number;
  score: number;
  distance: number;
  preview: string;
};

function clip(text: string, max = 280) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1) + "…";
}

export function serializeSearchResults(rows: SearchRow[]): SearchResultDTO[] {
  return rows.map((r) => ({
    chunkId: r.id,
    documentId: r.documentId,
    chunkIndex: r.chunkIndex,
    score: Math.round(r.score * 1000) / 1000,
    distance: Math.round(r.distance * 1000) / 1000,
    preview: clip(r.content, 280),
  }));
}
