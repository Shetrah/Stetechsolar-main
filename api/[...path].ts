import { handleApi, type Env } from '../server/app';

type VercelRequest = AsyncIterable<Uint8Array | string> & {
  method: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
};
type VercelResponse = {
  status(code: number): VercelResponse;
  json(body: unknown): void;
  setHeader(name: string, value: string): void;
  send(body: Buffer): void;
};

export const config = { api: { bodyParser: false } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const env = process.env;
  try {
    let backend: { BUCKET?: Env['BUCKET']; RETAIL?: Env['RETAIL']; error?: string } | undefined;
    if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      try {
        backend = (await import('../server/firebase')).createFirebaseBackend(env);
      } catch (error) {
        console.error('STETECH Firebase module failed to load:', error);
        backend = { error: 'Firebase Admin could not load in this deployment. Verify the Node.js runtime and firebase-admin installation.' };
      }
    }
    const chunks: Uint8Array[] = [];
    let size = 0;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      for await (const chunk of req) {
        const bytes = typeof chunk === 'string' ? new TextEncoder().encode(chunk) : new Uint8Array(chunk);
        size += bytes.byteLength;
        if (size > 3 * 1024 * 1024) {
          res.status(413).json({ error: 'Request exceeds 3 MB.' });
          return;
        }
        chunks.push(bytes);
      }
    }

    const headers = new Headers();
    for (const [name, value] of Object.entries(req.headers || {})) {
      if (typeof value === 'string') headers.set(name, value);
      else if (Array.isArray(value)) headers.set(name, value.join(', '));
    }
    const request = new Request(`https://${req.headers.host || 'localhost'}${req.url || '/'}`, {
      method: req.method,
      headers,
      ...(chunks.length ? { body: new Blob(chunks) } : {}),
    });
    const response = await handleApi(request, {
      ADMIN_PASSWORD: env.ADMIN_PASSWORD,
      SESSION_SECRET: env.SESSION_SECRET,
      OPENROUTER_API_KEY: env.OPENROUTER_API_KEY,
      OPENROUTER_MODEL: env.OPENROUTER_MODEL,
      SITE_URL: env.SITE_URL,
      BUCKET: backend?.error ? undefined : backend?.BUCKET,
      RETAIL: backend?.error ? undefined : backend?.RETAIL,
      PERSISTENCE_ERROR: backend?.error,
    } satisfies Env);

    res.status(response.status);
    response.headers.forEach((value, name) => res.setHeader(name, value));
    res.send(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error('STETECH Vercel API:', error);
    res.status(500).json({ error: 'Unable to complete the request. Please try again.' });
  }
}