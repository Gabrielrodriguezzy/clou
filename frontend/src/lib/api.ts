const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;

  const res = await fetch(`${API}${path}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Erro na requisição");
  }

  return res.json();
}

export const api = {
  get: <T>(path: string, token?: string) => request<T>(path, { token }),

  post: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: "POST", body, token }),

  put: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: "PUT", body, token }),

  // Auth
  login: (email: string, password: string) =>
    request<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: { email, password },
    }),

  register: (email: string, password: string, name: string) =>
    request<{ access_token: string }>("/auth/register", {
      method: "POST",
      body: { email, password, name },
    }),

  me: (token: string) =>
    request<{ id: number; email: string; name: string; balance: number; role: string }>(
      "/auth/me",
      { token }
    ),

  // Services
  platforms: () => request<Platform[]>("/platforms"),
  services: () => request<Service[]>("/services"),
};

export interface Platform {
  id: number; name: string; slug: string; icon: string | null;
}

export interface Service {
  id: number; name: string; description: string | null;
  price: number; min_amount: number; max_amount: number;
  avg_time: string; platform_id: number; slug?: string;
}
