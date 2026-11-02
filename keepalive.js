const defaultUrls = [
  'https://awaaz-1-ol1a.onrender.com',
  'https://anywhere-37sw.onrender.com',
  // Add more service URLs here.
];

const targetUrls = process.env.TARGET_URLS
  ? process.env.TARGET_URLS.split(',').map((url) => url.trim()).filter(Boolean)
  : defaultUrls;
const requestTimeoutMs = 30 * 1000;

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

export async function pingAllUrls() {
  return Promise.all(
    targetUrls.map(async (targetUrl) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

      try {
        const response = await fetch(targetUrl, { signal: controller.signal });
        const result = {
          status: response.status,
          url: targetUrl,
        };
        console.log(
          `[${new Date().toISOString()}] ${targetUrl} responded with ${response.status}`,
        );
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(
          `[${new Date().toISOString()}] ${targetUrl} request failed: ${message}`,
        );
        return { error: message, url: targetUrl };
      } finally {
        clearTimeout(timeout);
      }
    }),
  );
}
