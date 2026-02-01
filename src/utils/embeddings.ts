type OllamaEmbeddingResponse = { embedding: number[] };

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";

export async function embed(text: string): Promise<number[]> {
  const r = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: EMBED_MODEL, prompt: text }),
  });

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`Ollama embeddings failed: ${r.status} ${t}`);
  }

  const j = (await r.json()) as OllamaEmbeddingResponse;
  if (!Array.isArray(j.embedding) || j.embedding.length === 0) {
    throw new Error("Ollama returned empty embedding");
  }

  return j.embedding;
}

export function toVectorLiteral(vec: number[]) {
  const safe = vec.map((n) => {
    if (!Number.isFinite(n)) throw new Error("Invalid Embedding Value");
    return n;
  });
  return `[${safe.join(",")}]`;
}
