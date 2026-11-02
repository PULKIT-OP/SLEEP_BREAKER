import { pingAllUrls } from '../keepalive.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const results = await pingAllUrls();
  response.status(200).json({ results });
}
