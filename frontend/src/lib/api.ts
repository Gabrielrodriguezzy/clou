const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ─── Tipos Compartilhados ───────────────────────────────────────────

export interface Platform {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
}

export interface Service {
  id: number;
  name: string;
  description: string | null;
  price: number;
  min_amount: number;
  max_amount: number;
  avg_time: string;
  platform_id: number;
  slug?: string;
  platform?: Platform;
}

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  balance: number;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface OrderResponse {
  id: number;
  user_id: number;
  service_id: number;
  provider_id: number | null;
  provider_order_id: string | null;
  link: string;
  quantity: number;
  charge: number;
  cost: number;
  status: string;
  start_count: number | null;
  remains: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  service?: Service;
}

export interface DepositResponse {
  id: number;
  user_id: number;
  amount: number;
  fee: number;
  net_amount: number;
  payment_method: string;
  status: string;
  external_id: string | null;
  pix_qr_text: string | null;
  pix_qr_code: string | null;
  expires_at: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface CouponResponse {
  code: string;
  discount_percent: number;
  discount_amount: number;
  final_amount: number;
  valid: boolean;
}

export interface StatsResponse {
  total_orders: number;
  total_users: number;
  avg_delivery_rate: number;
  total_services: number;
}

// ─── Erro ───────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

// ─── Helpers ────────────────────────────────────────────────────────

function getStatusMessage(status: number, detail: string): string {
  switch (status) {
    case 401:
      return "Sessão expirada. Faça login novamente.";
    case 402:
      return "Saldo insuficiente. Deposite antes de comprar.";
    case 403:
      return "Acesso negado.";
    case 404:
      return "Recurso não encontrado.";
    case 409:
      return detail || "Já existe um registro com esses dados.";
    case 422:
      return detail || "Dados inválidos. Verifique os campos.";
    case 500:
      return "Erro interno do servidor. Tente novamente em alguns minutos.";
    default:
      return detail || "Erro na requisição.";
  }
}

function isTokenExpired(status: number): boolean {
  return status === 401;
}

// ─── Request ────────────────────────────────────────────────────────

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
    let detail = res.statusText;
    try {
      const errBody = await res.json();
      detail = errBody.detail || detail;
    } catch {
      // keep default
    }

    // Se token expirou, limpar e redirecionar
    if (isTokenExpired(res.status) && typeof window !== "undefined") {
      localStorage.removeItem("clou_token");
      window.location.href = "/login";
    }

    throw new ApiError(res.status, getStatusMessage(res.status, detail));
  }

  return res.json();
}

// ─── API ────────────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, token?: string) => request<T>(path, { token }),

  post: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: "POST", body, token }),

  put: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: "PUT", body, token }),

  patch: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: "PATCH", body, token }),

  // Auth
  login: (email: string, password: string) =>
    request<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: { email, password },
    }),

  register: (email: string, password: string, name: string, refCode?: string) =>
    request<{ access_token: string }>("/auth/register", {
      method: "POST",
      body: { email, password, name, ref_code: refCode },
    }),

  me: (token: string) => request<UserResponse>("/auth/me", { token }),

  // Services
  platforms: (token?: string) => request<Platform[]>("/platforms", { token }),
  services: (token?: string) => request<Service[]>("/services", { token }),
};
