import { createServer } from 'node:http';

const defaultUrls = [
  'https://awaaz-1-ol1a.onrender.com',
  'https://anywhere-37sw.onrender.com'
  // Add more service URLs here.
];
const targetUrls = process.env.TARGET_URLS
  ? process.env.TARGET_URLS.split(',').map((url) => url.trim()).filter(Boolean)
  : process.env.TARGET_URL
    ? [process.env.TARGET_URL]
    : process.argv[2]
      ? [process.argv[2]]
      : defaultUrls;
const intervalMs = 14 * 60 * 1000;
const requestTimeoutMs = 30 * 1000;
const port = Number(process.env.PORT || 3000);

if (targetUrls.length === 0) {
  throw new Error('At least one target URL is required.');
}

for (const targetUrl of targetUrls) {
  try {
    new URL(targetUrl);
  } catch {
    throw new Error(`Target URL must be valid: ${targetUrl}`);
  }
}

async function pingUrl(targetUrl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(targetUrl, {
      signal: controller.signal,
    });

    console.log(
      `[${new Date().toISOString()}] ${targetUrl} responded with ${response.status}`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[${new Date().toISOString()}] Request failed: ${message}`);
  } finally {
    clearTimeout(timeout);
  }
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`PORT must be a valid port number: ${process.env.PORT}`);
}

const server = createServer((request, response) => {
  if (request.url === '/health' && request.method === 'GET') {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('ok');
    return;
  }

  response.writeHead(404);
  response.end('Not found');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Keepalive service listening on port ${port}`);
});

const pingAllUrls = () => Promise.all(targetUrls.map((targetUrl) => pingUrl(targetUrl)));

void pingAllUrls();
setInterval(() => {
  void pingAllUrls();
}, intervalMs);
