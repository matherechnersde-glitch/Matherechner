import { readFileSync } from 'node:fs';
import path from 'node:path';

export default function NotFound() {
  const html = readFileSync(path.join(process.cwd(), 'content', '404.html'), 'utf8');
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? '<h1>404</h1>';
  return <div dangerouslySetInnerHTML={{ __html: body }} />;
}