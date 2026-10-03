import { htmlResponse } from '../html-response';

export async function GET() {
  return htmlResponse('modulo-rechner.html');
}
