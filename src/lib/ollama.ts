const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

export async function embedText(text: string) {
  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "nomic-embed-text",
      prompt: text,
    }),
  });

  if (!res.ok) throw new Error("Embedding failed");
  const data = await res.json();
  return data.embedding as number[];
}

export async function chatStream(messages: any[]) {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.1:latest",
      messages,
      stream: true,
    }),
  });

  if (!res.ok) throw new Error("Chat failed");
  return res;
}