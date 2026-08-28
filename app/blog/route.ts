import { htmlResponse } from '../html-response';

export async function GET() {
  return htmlResponse('blog.html');
}
