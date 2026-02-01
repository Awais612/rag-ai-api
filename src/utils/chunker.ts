export function chunkText(
  text: string,
  opts: { chunkSize?: number; overlap?: number } = {},
) {
  const chunkSize = opts.chunkSize ?? 1200;
  const overlap = opts.overlap ?? 200;

  const chunks: string[] = [];
  let i = 0;

  while (i < text.length) {
    const end = Math.min(i + chunkSize, text.length);
    const chunk = text.slice(i, end).trim();
    if (chunk) chunks.push(chunk);
    i = end - overlap;
    if (i < 0) i = 0;
    if (end === text.length) break;
  }

  return chunks;
}
