import "server-only";

const API_BASE = "https://apiv2.shiprocket.in/v1/external";
let cachedToken: { value: string; expiresAt: number } | null = null;

function credentials() {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) throw new Error("SHIPROCKET_NOT_CONFIGURED");
  return { email, password };
}

export async function shiprocketRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { email, password } = credentials();
  if (!cachedToken || cachedToken.expiresAt <= Date.now()) {
    const auth = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    if (!auth.ok) throw new Error("SHIPROCKET_AUTH_FAILED");
    const data = (await auth.json()) as { token?: string };
    if (!data.token) throw new Error("SHIPROCKET_AUTH_FAILED");
    cachedToken = { value: data.token, expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000 };
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${cachedToken.value}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof body?.message === "string" ? body.message : "Shiprocket request failed";
    throw new Error(message);
  }
  return body as T;
}

export function shiprocketConfigured() {
  return Boolean(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD);
}
