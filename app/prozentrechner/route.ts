import { htmlResponse } from '../html-response';

export async function GET() {
  return htmlResponse('prozentrechner.html');
}
