import { readFile } from 'node:fs/promises';
import path from 'node:path';

export async function htmlResponse(fileName: string) {
  const filePath = path.join(process.cwd(), 'content', fileName);
  const html = await readFile(filePath, 'utf8');
  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate'
    }
  });
}