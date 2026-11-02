const targetUrl =
  process.env.TARGET_URL ||
  process.argv[2] ||
  'https://awaaz-1-ol1a.onrender.com';
const intervalMs = 14 * 60 * 1000;
const requestTimeoutMs = 30 * 1000;

if (!targetUrl) {
  throw new Error(
    'A URL is required. Use: node index.js "https://example.com/health"',
  );
}

try {
  new URL(targetUrl);
} catch {
  throw new Error(`TARGET_URL must be a valid URL: ${targetUrl}`);
}

async function pingUrl() {
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

void pingUrl();
setInterval(() => {
  void pingUrl();
}, intervalMs);
