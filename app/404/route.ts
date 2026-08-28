import { htmlResponse } from '../html-response';

export async function GET() {
  return htmlResponse('404.html');
}
