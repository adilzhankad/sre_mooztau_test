// @ts-nocheck
import type { AxiosInstance } from "axios";
import * as mock from "./mock-data";
import type {
  OrderStatus,
  Payment,
  PaymentMethodReference,
  PaymentVerificationStatus,
  ProfileSummary,
  User,
} from "@/types";
import ru from "@/i18n/locales/ru.json";
import kk from "@/i18n/locales/kk.json";
import en from "@/i18n/locales/en.json";

let nextOrderId = 100;
let nextPaymentId = 100;
let nextTxId = 100;
let nextUserId = Math.max(...mock.MOCK_USERS.map((user) => user.id)) + 1;
let nextOrganizationId = Math.max(...mock.MOCK_ORGANIZATIONS.map((organization) => organization.id)) + 1;

// Mutable copies
const organizations = [...mock.MOCK_ORGANIZATIONS];
const users = [...mock.MOCK_USERS];
const userPasswords: Record<number, string> = { ...mock.MOCK_USER_PASSWORDS };
const orders = [...mock.MOCK_ORDERS];
const payments: Record<number, typeof mock.MOCK_PAYMENTS[number]> = { ...mock.MOCK_PAYMENTS };
const history: Record<number, typeof mock.MOCK_HISTORY[number]> = { ...mock.MOCK_HISTORY };
const transactions = [...mock.MOCK_TRANSACTIONS];
const TRANSLATIONS = { ru, kk, en } as const;

type MockLang = keyof typeof TRANSLATIONS;
type MockRequestConfig = { headers?: Record<string, unknown> };

function getPaymentStatus(amount: number, remaining: number): PaymentVerificationStatus {
  if (amount <= 0 || amount > remaining) return "risk";
  return "review_required";
}

function normalizePhone(phone: unknown): string {
  return String(phone ?? "").replace(/\D/g, "");
}

function getUserById(id: number | null | undefined): User | null {
  if (id == null) return null;
  return users.find((user) => user.id === Number(id)) ?? null;
}

function getOrganizationById(id: number | null | undefined) {
  if (id == null) return null;
  return organizations.find((organization) => organization.id === Number(id)) ?? null;
}

function getOrganizationName(id: number | null | undefined): string {
  return getOrganizationById(id)?.name ?? "MoozTau HQ";
}

function buildTokenResponse(user: User) {
  return {
    access_token: `mock-access-token-user-${user.id}`,
    refresh_token: `mock-refresh-token-user-${user.id}`,
    token_type: "bearer",
    user_id: user.id,
    role: user.role,
    organization_id: user.organization_id,
    full_name: user.full_name,
  };
}

function buildMeResponse(user: User) {
  return {
    id: user.id,
    phone: user.phone,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    organization_id: user.organization_id,
    organization_name: getOrganizationName(user.organization_id),
    is_active: user.is_active,
  };
}

function buildProfileSummary(user: User): ProfileSummary {
  const organization = getOrganizationById(user.organization_id);
  const teammates = users.filter((teammate) => teammate.organization_id === user.organization_id);

  return {
    id: user.id,
    full_name: user.full_name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
    member_since: organization?.created_at ?? "2025-01-01T00:00:00Z",
    organization_id: organization?.id ?? null,
    organization_name: organization?.name ?? null,
    organization_type: organization?.org_type ?? null,
    organization_region: organization?.region ?? null,
    organization_address: organization?.address ?? null,
    organization_contact_phone: organization?.contact_phone ?? null,
    organization_contact_email: organization?.contact_email ?? null,
    organization_created_at: organization?.created_at ?? null,
    teammates_count: teammates.length,
    active_teammates_count: teammates.filter((teammate) => teammate.is_active).length,
  };
}

function getUserFromTokenValue(tokenValue: unknown): User | null {
  const match = String(tokenValue ?? "").match(/user-(\d+)/i);
  return match ? getUserById(Number(match[1])) : null;
}

function getCurrentUser(config: MockRequestConfig): User | null {
  const authHeader = String(config.headers?.Authorization ?? config.headers?.authorization ?? "");
  const match = authHeader.match(/Bearer\s+(.+)/i);
  return getUserFromTokenValue(match?.[1]);
}

function getRequestLang(config: MockRequestConfig): MockLang {
  const raw = String(config.headers?.["Accept-Language"] ?? config.headers?.["accept-language"] ?? "ru").slice(0, 2);
  if (raw === "kk" || raw === "en") return raw;
  return "ru";
}

function translateStatus(lang: MockLang, status: OrderStatus, ns: "orderStatus" | "buyerStatus" = "orderStatus") {
  const bundle = TRANSLATIONS[lang] as Record<string, any>;
  return bundle?.[ns]?.[status] ?? status;
}

// Mirrors the backend v4 progress map (role-agnostic).
const STATUS_PROGRESS: Record<OrderStatus, number> = {
  analysis: 5,
  in_progress: 25,
  qc_rejected: 30,
  qc_review: 45,
  qc_passed: 55,
  waiting_courier: 65,
  matching: 70,
  master_selected: 75,
  in_transit: 85,
  accepted: 100,
  completed: 100,
  returned: 100,
  cancelled: 0,
  rejected: 0,
};

function statusProgress(status: OrderStatus): number {
  return STATUS_PROGRESS[status] ?? 0;
}

function localizeOrder(order: any, lang: MockLang) {
  return {
    ...order,
    status_label: translateStatus(lang, order.status, "orderStatus"),
    status_display: translateStatus(lang, order.status, "orderStatus"),
    progress: statusProgress(order.status),
  };
}

function withinDateRange(orderDate: string, dateFrom?: string, dateTo?: string) {
  const value = new Date(orderDate).getTime();
  if (Number.isNaN(value)) return false;

  if (dateFrom) {
    const from = new Date(dateFrom).getTime();
    if (!Number.isNaN(from) && value < from) return false;
  }

  if (dateTo) {
    const to = new Date(dateTo).getTime();
    if (!Number.isNaN(to) && value > to) return false;
  }

  return true;
}

function parseListParam(value: unknown): string[] {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function scopeOrdersForUser(list: any[], user: User | null) {
  if (!user) return [...list];
  if (user.role === "DEALER_ADMIN") {
    return list.filter((order) => Number(order.organization_id) === Number(user.organization_id));
  }
  if (user.role === "DEALER_MANAGER") {
    return list.filter((order) => Number(order.manager_id) === Number(user.id));
  }
  return [...list];
}

function filterOrdersList(list: any[], params: Record<string, any>) {
  let next = [...list];

  if (params.status) {
    const statuses = parseListParam(params.status);
    if (statuses.length > 0) {
      next = next.filter((order) => statuses.includes(String(order.status)));
    }
  }
  if (params.organization_id) next = next.filter((order) => Number(order.organization_id) === Number(params.organization_id));
  if (params.manager_id) next = next.filter((order) => Number(order.manager_id) === Number(params.manager_id));
  if (params.date_from || params.date_to) {
    next = next.filter((order) => withinDateRange(order.order_date, params.date_from, params.date_to));
  }

  if (params.sales_channel) {
    const channels = parseListParam(params.sales_channel);
    if (channels.length > 0) {
      next = next.filter((order) => channels.includes(order.sales_channel));
    }
  }

  if (params.search) {
    const s = String(params.search).toLowerCase();
    next = next.filter(
      (order) =>
        String(order.order_number || "").toLowerCase().includes(s) ||
        String(order.client_name || "").toLowerCase().includes(s) ||
        String(order.client_phone || "").includes(s),
    );
  }

  if (params.ordering) {
    const ordering = String(params.ordering);
    const direction = ordering.startsWith("-") ? -1 : 1;
    const field = ordering.startsWith("-") ? ordering.slice(1) : ordering;

    next.sort((a, b) => {
      const left = a?.[field];
      const right = b?.[field];

      if (left == null && right == null) return 0;
      if (left == null) return 1;
      if (right == null) return -1;

      if (typeof left === "number" && typeof right === "number") {
        return (left - right) * direction;
      }

      return String(left).localeCompare(String(right), "ru") * direction;
    });
  }

  return next;
}

function groupSum<T>(items: T[], keyFn: (item: T) => string, valueFn: (item: T) => number) {
  const map = new Map<string, number>();

  for (const item of items) {
    const key = keyFn(item);
    map.set(key, (map.get(key) ?? 0) + valueFn(item));
  }

  return map;
}

function getOrderPaymentsList(orderId: number): Payment[] {
  if (!payments[orderId]) payments[orderId] = [];
  return payments[orderId];
}

function recalcOrderPaymentState(orderId: number) {
  const order = orders.find((item) => item.id === orderId);
  if (!order) return;

  const orderPayments = getOrderPaymentsList(orderId);
  const confirmedTotal = orderPayments
    .filter((payment) => (payment.verification_status ?? "confirmed") === "confirmed")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  order.payments = orderPayments;
  order.payment_received = confirmedTotal;
  order.payment_remaining = Math.max(Number(order.total_amount || 0) - confirmedTotal, 0);
}

function mapBuyerOrder(order: any, lang: MockLang) {
  return {
    id: order.id,
    order_number: order.order_number,
    status: order.status,
    status_label: translateStatus(lang, order.status, "buyerStatus"),
    status_display: translateStatus(lang, order.status, "buyerStatus"),
    progress: statusProgress(order.status),
    order_date: order.order_date,
    deadline: order.deadline,
    accepted_date: order.accepted_date,
    warranty_end_date: order.warranty_end_date,
    dispatch_date: order.dispatch_date,
    completed_at: order.completed_at,
    delivery_address: order.delivery_address,
    final_amount: order.final_amount ?? order.total_amount,
    payment_received: order.payment_received,
    payment_remaining: order.payment_remaining,
    manager_name: order.manager_name,
    manager_phone: order.manager_phone,
    client_name: order.client_name,
    client_iin: order.client_iin,
    client_phone: order.client_phone,
    has_contract: order.has_contract,
    contract_status: order.contract_status,
    contract_scanned_at: order.contract_scanned_at,
    contract_signed_at: order.contract_signed_at,
    contract_signed_ip: order.contract_signed_ip,
    contract_signed_user_agent: order.contract_signed_user_agent,
    contract_document_hash: order.contract_document_hash,
    contract_document_hash_alg: order.contract_document_hash_alg,
    contract_consent_version: order.contract_consent_version,
    contract_signed_full_name: order.contract_signed_full_name,
    contract_signed_iin_last4: order.contract_signed_iin_last4,
    contract_receipt_hmac: order.contract_receipt_hmac,
    contract_doc_url: order.contract_doc_url,
    contract_scan_url: order.contract_scan_url,
    items: order.items ?? [],
    payments: getOrderPaymentsList(order.id),
    created_at: order.created_at ?? new Date().toISOString(),
    updated_at: order.updated_at ?? new Date().toISOString(),
  };
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return {
    count: items.length,
    results: items.slice(start, start + pageSize),
    page,
    page_size: pageSize,
    pages: Math.ceil(items.length / pageSize) || 1,
  };
}

function withMockSuccess(config: any, data: any, status = 200) {
  return {
    ...config,
    adapter: () =>
      Promise.resolve({
        data,
        status,
        statusText: status >= 400 ? "Error" : "OK",
        headers: {},
        config,
      }),
  };
}

function withMockError(config: any, data: any, status = 400) {
  return {
    ...config,
    adapter: () =>
      Promise.reject({
        response: {
          data,
          status,
          statusText: "Error",
          headers: {},
          config,
        },
        config,
      }),
  };
}

function matchRoute(url: string, pattern: string): Record<string, string> | null {
  const urlParts = url.split("?")[0].split("/").filter(Boolean);
  const patParts = pattern.split("/").filter(Boolean);
  if (urlParts.length !== patParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < patParts.length; i++) {
    if (patParts[i].startsWith(":")) {
      params[patParts[i].slice(1)] = urlParts[i];
    } else if (patParts[i] !== urlParts[i]) {
      return null;
    }
  }
  return params;
}

export function installMockInterceptor(instance: AxiosInstance) {
  instance.interceptors.request.use(async (config) => {
    const url = config.url || "";
    const method = (config.method || "get").toLowerCase();
    const params = config.params || {};
    const body = config.data ? (typeof config.data === "string" ? JSON.parse(config.data) : config.data) : {};
    const lang = getRequestLang(config as { headers?: Record<string, unknown> });

    let result: any = null;

    // ── Auth ──
    if (url.includes("/api/auth/login") && method === "post") {
      const phone = normalizePhone(body.phone);
      const found = users.find((u) => normalizePhone(u.phone) === phone && u.is_active);
      const user = found ?? users[0];
      result = buildTokenResponse(user);
    }
    if ((url.includes("/api/auth/me") || url.includes("/api/buyer/me")) && method === "get") {
      const current = getCurrentUser(config as MockRequestConfig) ?? users[0];
      result = buildMeResponse(current);
    }
    if (url.includes("/api/auth/me") && method === "patch") {
      const current = getCurrentUser(config as MockRequestConfig) ?? users[0];
      Object.assign(current, {
        full_name: body.full_name ?? current.full_name,
        phone: body.phone ?? current.phone,
        email: body.email !== undefined ? body.email : current.email,
      });
      result = buildMeResponse(current);
    }
    if (url === "/api/auth/profile/summary" && method === "get") {
      const current = getCurrentUser(config as MockRequestConfig) ?? users[0];
      result = buildProfileSummary(current);
    }
    if (url === "/api/auth/roles" && method === "get") {
      const lang = getRequestLang(config as MockRequestConfig);
      const bundle = TRANSLATIONS[lang] as Record<string, any>;
      const labelOf = (code: string) => bundle?.role?.[code] ?? code;
      const ordered: Array<{ value: string; group: string }> = [
        { value: "SUPER_ADMIN",    group: "admin"   },
        { value: "DEALER_ADMIN",   group: "dealer"  },
        { value: "DEALER_MANAGER", group: "dealer"  },
        { value: "FACTORY_ADMIN",  group: "factory" },
        { value: "FACTORY_WORKER", group: "factory" },
        { value: "QC_INSPECTOR",   group: "factory" },
        { value: "LOGISTICS",      group: "factory" },
        { value: "MASTER",         group: "service" },
        { value: "BUYER",          group: "client"  },
        { value: "USER",           group: "client"  },
      ];
      result = ordered.map((r) => ({ ...r, label: labelOf(r.value) }));
    }
    if (url.includes("/api/auth/logout") && method === "post") {
      result = { detail: "ok" };
    }
    if (url.includes("/api/auth/refresh") && method === "post") {
      const tokenMatch = String(body.refresh_token || "").match(/user-(\d+)/);
      const user = (tokenMatch && getUserById(Number(tokenMatch[1]))) || users[0];
      result = buildTokenResponse(user);
    }
    if (url.includes("/api/auth/change-password") && method === "post") {
      const current = getCurrentUser(config as MockRequestConfig) ?? users[0];
      userPasswords[current.id] = String(body.new_password ?? userPasswords[current.id] ?? "");
      result = { detail: "ok" };
    }
    if ((url.includes("/api/auth/request-reset") || url.includes("/api/auth/reset-password")) && method === "post") {
      result = { detail: "ok" };
    }

    // ── Buyer auth ──
    if ((url === "/api/buyer/auth" || url === "/api/buyer/auth/refresh") && method === "post") {
      result = buildTokenResponse(users[0]);
    }
    if (url === "/api/buyer/auth/reset-password" && method === "post") {
      result = { detail: "ok" };
    }

    // ── Users / Organizations ──
    if (url.match(/\/api\/users\/?$/) && method === "get") {
      result = users.map((u) => ({
        ...u,
        organization_name: getOrganizationName(u.organization_id),
      }));
    }
    if (url.match(/\/api\/users\/?$/) && method === "post") {
      const id = nextUserId++;
      const newUser = {
        id,
        organization_id: body.organization_id ?? 1,
        role: body.role,
        full_name: body.full_name,
        phone: body.phone,
        email: body.email ?? null,
        is_active: body.is_active ?? true,
      } as User;
      users.push(newUser);
      if (body.password) userPasswords[id] = String(body.password);
      result = newUser;
    }
    const userById = matchRoute(url, "/api/users/:id");
    if (userById && method === "get") {
      result = getUserById(Number(userById.id));
    }
    if (userById && (method === "put" || method === "patch")) {
      const u = getUserById(Number(userById.id));
      if (u) {
        Object.assign(u, {
          full_name: body.full_name ?? u.full_name,
          phone: body.phone ?? u.phone,
          email: body.email !== undefined ? body.email : u.email,
          role: body.role ?? u.role,
          organization_id: body.organization_id ?? u.organization_id,
          is_active: body.is_active ?? u.is_active,
        });
        result = u;
      }
    }
    const userActivate = matchRoute(url, "/api/users/:id/activate");
    if (userActivate && method === "patch") {
      const u = getUserById(Number(userActivate.id));
      if (u) {
        u.is_active = body.is_active ?? !u.is_active;
        result = u;
      }
    }

    if (url.match(/\/api\/organizations\/?$/) && method === "get") {
      result = organizations;
    }
    if (url.match(/\/api\/organizations\/?$/) && method === "post") {
      const id = nextOrganizationId++;
      const org = { id, is_active: true, created_at: new Date().toISOString(), ...body };
      organizations.push(org);
      result = org;
    }
    const orgById = matchRoute(url, "/api/organizations/:id");
    if (orgById && method === "get") {
      result = getOrganizationById(Number(orgById.id));
    }
    if (orgById && (method === "put" || method === "patch")) {
      const o = getOrganizationById(Number(orgById.id));
      if (o) {
        Object.assign(o, body);
        result = o;
      }
    }

    if (url === "/api/buyer/orders" && method === "get") {
      result = orders.map((order) => mapBuyerOrder(order, lang));
    }

    const buyerOrderGet = matchRoute(url, "/api/buyer/orders/:id");
    if (buyerOrderGet && method === "get" && !url.includes("status-history") && !url.includes("contract") && !url.includes("payments")) {
      const order = orders.find((item) => item.id === Number(buyerOrderGet.id));
      result = order ? mapBuyerOrder(order, lang) : null;
    }

    const buyerOrderPayments = matchRoute(url, "/api/buyer/orders/:id/payments");
    if (buyerOrderPayments && method === "post") {
      const orderId = Number(buyerOrderPayments.id);
      const order = orders.find((item) => item.id === orderId);
      if (order) {
        const remaining = Math.max(Number(order.total_amount || order.final_amount || 0) - Number(order.payment_received || 0), 0);
        const verificationStatus = getPaymentStatus(Number(body.amount || 0), remaining);
        const payment = {
          id: nextPaymentId++,
          order_id: orderId,
          amount: Number(body.amount || 0),
          payment_date: body.payment_date,
          payment_method: body.payment_method,
          notes: body.notes ?? body.note ?? "",
          note: body.note ?? body.notes ?? "",
          created_at: new Date().toISOString(),
          payment_source: "buyer" as const,
          verification_status: verificationStatus,
          verification_comment:
            verificationStatus === "risk"
              ? "Требуется ручная проверка менеджером"
              : "Платеж отправлен на проверку",
          verified_at: null,
          verified_by_name: null,
        };
        getOrderPaymentsList(orderId).push(payment);
        recalcOrderPaymentState(orderId);
        result = payment;
      }
    }

    // ── Products ──
    if (url.includes("/api/products") && !url.includes("/prices") && method === "get") {
      const m = matchRoute(url, "/api/products/:id");
      if (m) {
        result = mock.MOCK_PRODUCTS.find((p) => p.id === Number(m.id)) || null;
      } else {
        let list = [...mock.MOCK_PRODUCTS];
        if (params.category) list = list.filter((p) => p.category === params.category);
        if (params.is_active !== undefined) list = list.filter((p) => p.is_active === (params.is_active === "true" || params.is_active === true));
        result = list;
      }
    }

    // ── Prices ──
    if (url.match(/\/api\/prices\/?$/) && method === "get") {
      result = mock.MOCK_PRICES;
    }

    // ── Orders ──
    if (url.match(/\/api\/orders\/?$/) && method === "get") {
      let list = filterOrdersList(orders, params).map((order) => localizeOrder(order, lang));
      const page = Number(params.page) || 1;
      const pageSize = Number(params.page_size) || 20;
      result = paginate(list, page, pageSize);
    }

    if (url === "/api/analytics/overview" && method === "get") {
      const list = filterOrdersList(orders, params);
      const uniqueCustomers = new Set(list.map((order) => `${order.client_name}|${order.client_phone}`));
      const totalRevenue = list.reduce((sum, order) => sum + Number(order.final_amount || order.total_amount || 0), 0);

      result = {
        total_orders: list.length,
        total_revenue: totalRevenue,
        total_customers: uniqueCustomers.size,
        avg_order_value: list.length ? totalRevenue / list.length : 0,
      };
    }

    if (url === "/api/analytics/revenue" && method === "get") {
      const list = filterOrdersList(orders, params);
      const revenueByPeriod = new Map<string, { period: string; revenue: number; orders_count: number }>();

      for (const order of list) {
        const date = new Date(order.order_date);
        const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const current = revenueByPeriod.get(period) ?? { period, revenue: 0, orders_count: 0 };
        current.revenue += Number(order.final_amount || order.total_amount || 0);
        current.orders_count += 1;
        revenueByPeriod.set(period, current);
      }

      result = Array.from(revenueByPeriod.values()).sort((a, b) => a.period.localeCompare(b.period));
    }

    if (url === "/api/analytics/orders" && method === "get") {
      const list = filterOrdersList(orders, params);
      const counts = groupSum(list, (order) => String(order.status), () => 1);

      result = Array.from(counts.entries()).map(([status, count]) => ({ status, count }));
    }

    if (url === "/api/analytics/dealers" && method === "get") {
      const list = filterOrdersList(orders, params);
      const grouped = new Map<number, {
        organization_id: number;
        organization_name: string;
        region: string;
        orders_count: number;
        total_revenue: number;
        total_paid: number;
      }>();

      for (const order of list) {
        const organizationId = Number(order.organization_id || 0);
        const current = grouped.get(organizationId) ?? {
          organization_id: organizationId,
          organization_name: order.organization_name || `Organization #${organizationId}`,
          region: order.client_region || "Не указан",
          orders_count: 0,
          total_revenue: 0,
          total_paid: 0,
        };

        current.orders_count += 1;
        current.total_revenue += Number(order.final_amount || order.total_amount || 0);
        current.total_paid += Number(order.payment_received || 0);
        grouped.set(organizationId, current);
      }

      result = Array.from(grouped.values()).sort((a, b) => b.total_revenue - a.total_revenue);
    }

    if (url === "/api/analytics/regions" && method === "get") {
      const list = filterOrdersList(orders, params);
      const grouped = new Map<string, { region: string; orders_count: number; total_revenue: number }>();

      for (const order of list) {
        const region = order.client_region || "Не указан";
        const current = grouped.get(region) ?? { region, orders_count: 0, total_revenue: 0 };
        current.orders_count += 1;
        current.total_revenue += Number(order.final_amount || order.total_amount || 0);
        grouped.set(region, current);
      }

      result = Array.from(grouped.values()).sort((a, b) => b.total_revenue - a.total_revenue);
    }

    if (url === "/api/analytics/products" && method === "get") {
      const list = filterOrdersList(orders, params);
      const grouped = new Map<number, { product_id: number; product_name: string; quantity_sold: number; total_revenue: number }>();

      for (const order of list) {
        for (const item of order.items ?? []) {
          const productId = Number(item.product_id || 0);
          const current = grouped.get(productId) ?? {
            product_id: productId,
            product_name: item.model || `Product #${productId}`,
            quantity_sold: 0,
            total_revenue: 0,
          };
          current.quantity_sold += Number(item.quantity || 0);
          current.total_revenue += Number(item.total_price || 0);
          grouped.set(productId, current);
        }
      }

      result = Array.from(grouped.values()).sort((a, b) => b.total_revenue - a.total_revenue);
    }

    if (url === "/api/analytics/payments" && method === "get") {
      const list = filterOrdersList(orders, params);
      const orderIds = new Set(list.map((order) => Number(order.id)));
      const allPayments = Object.values(payments)
        .flat()
        .filter((payment) => orderIds.has(Number(payment.order_id)));
      const grouped = new Map<string, { method: string; total: number; count: number }>();

      for (const payment of allPayments) {
        const method = payment.payment_method || "Не указан";
        const current = grouped.get(method) ?? { method, total: 0, count: 0 };
        current.total += Number(payment.amount || 0);
        current.count += 1;
        grouped.set(method, current);
      }

      result = {
        by_method: Array.from(grouped.values()).sort((a, b) => b.total - a.total),
      };
    }

    const orderGet = matchRoute(url, "/api/orders/:id");
    if (orderGet && method === "get" && !url.includes("/history") && !url.includes("/payments")) {
      const order = orders.find((item) => item.id === Number(orderGet.id));
      result = order ? localizeOrder(order, lang) : null;
    }

    if (url.match(/\/api\/orders\/?$/) && method === "post") {
      const id = nextOrderId++;
      const newOrder = {
        id,
        order_number: `MZ-${String(id).padStart(6, "0")}`,
        status: "analysis" as OrderStatus,
        ...body,
        organization_id: 1,
        manager_id: 1,
        total_amount: (body.items || []).reduce((s: number, i: any) => s + (i.total_price || 0), 0),
        dealer_cost: null,
        order_date: new Date().toISOString().split("T")[0],
        accepted_date: null,
        warranty_end_date: null,
        items: (body.items || []).map((item: any, idx: number) => ({ id: id * 100 + idx, order_id: id, ...item })),
        payment_received: 0,
        payment_remaining: (body.items || []).reduce((s: number, i: any) => s + (i.total_price || 0), 0),
        organization_name: "MoozTau HQ",
        manager_name: "Админ Тестов",
      };
      orders.unshift(newOrder);
      result = localizeOrder(newOrder, lang);
    }

    // Order status
    const orderStatus = matchRoute(url, "/api/orders/:id/status");
    if (orderStatus && method === "patch") {
      const order = orders.find((o) => o.id === Number(orderStatus.id));
      if (order) {
        order.status = body.status;
        if (body.status === "accepted") {
          order.accepted_date = new Date().toISOString().split("T")[0];
          const wy = new Date();
          wy.setFullYear(wy.getFullYear() + 1);
          order.warranty_end_date = wy.toISOString().split("T")[0];
        }
        result = localizeOrder(order, lang);
      }
    }

    // Order history
    const orderHist = matchRoute(url, "/api/orders/:id/history");
    if (orderHist && method === "get") {
      result = history[Number(orderHist.id)] || [];
    }

    // Order payments GET
    const orderPay = matchRoute(url, "/api/orders/:id/payments");
    if (orderPay && method === "get") {
      result = payments[Number(orderPay.id)] || [];
    }

    // Order payments POST
    if (orderPay && method === "post") {
      const orderId = Number(orderPay.id);
      const payment = {
        id: nextPaymentId++,
        order_id: orderId,
        received_by_id: 1,
        created_at: new Date().toISOString(),
        payment_source: "manager" as const,
        verification_status: "confirmed" as const,
        verification_comment: "Оплата добавлена менеджером",
        verified_at: new Date().toISOString(),
        verified_by_name: "Менеджер",
        ...body,
      };
      getOrderPaymentsList(orderId).push(payment);
      recalcOrderPaymentState(orderId);
      result = payment;
    }

    const verifyPaymentRoute = matchRoute(url, "/api/orders/:id/payments/:paymentId/verify");
    if (verifyPaymentRoute && method === "patch") {
      const orderId = Number(verifyPaymentRoute.id);
      const paymentId = Number(verifyPaymentRoute.paymentId);
      const payment = getOrderPaymentsList(orderId).find((item) => item.id === paymentId);
      if (payment) {
        payment.verification_status = body.verification_status;
        payment.verification_comment = body.verification_comment ?? payment.verification_comment ?? null;
        payment.verified_at = new Date().toISOString();
        payment.verified_by_name = "Менеджер";
        recalcOrderPaymentState(orderId);
        result = payment;
      }
    }

    // ── Finance: Categories ──
    if (url.includes("/api/finance/categories") && method === "get") {
      let list = [...mock.MOCK_CATEGORIES];
      if (params.level) list = list.filter((c) => c.level === Number(params.level));
      result = list;
    }

    // ── Finance: Accounts ──
    if (url.includes("/api/finance/accounts") && method === "get") {
      result = mock.MOCK_ACCOUNTS;
    }

    // ── Finance: Transactions ──
    if (url.match(/\/api\/finance\/transactions\/?$/) && method === "get") {
      let list = [...transactions];
      if (params.type) list = list.filter((t) => t.transaction_type === params.type);
      if (params.search) {
        const s = params.search.toLowerCase();
        list = list.filter(
          (t) =>
            (t.comment || "").toLowerCase().includes(s) ||
            (t.counterparty_name || "").toLowerCase().includes(s) ||
            (t.order_number || "").toLowerCase().includes(s),
        );
      }
      const page = Number(params.page) || 1;
      const pageSize = Number(params.page_size) || 30;
      result = paginate(list, page, pageSize);
    }

    if (url.match(/\/api\/finance\/transactions\/?$/) && method === "post") {
      const tx = {
        id: nextTxId++,
        ...body,
        currency: body.currency || "KZT",
        category_l1_name: mock.MOCK_CATEGORIES.find((c) => c.id === body.category_l1_id)?.name || null,
        initiator_name: "Админ Тестов",
        created_at: new Date().toISOString(),
      };
      transactions.unshift(tx);
      result = tx;
    }

    // ── Finance: Reports ──
    if (url.includes("/api/finance/reports/summary") && method === "get") {
      result = mock.MOCK_REPORT_SUMMARY;
    }
    if (url.includes("/api/finance/reports/by-category") && method === "get") {
      result =
        params.transaction_type === "income"
          ? mock.MOCK_CATEGORY_BREAKDOWN_INCOME
          : mock.MOCK_CATEGORY_BREAKDOWN_EXPENSE;
    }
    if (url.includes("/api/finance/reports/by-initiator") && method === "get") {
      result = [
        { initiator_id: 1, initiator_name: "Админ Тестов", total: 2610000 },
        { initiator_id: 3, initiator_name: "Серикова Айгуль", total: 1000000 },
        { initiator_id: 5, initiator_name: "Жумабеков Асхат", total: 660000 },
      ];
    }

    // ── Orders counts ──
    if (url === "/api/orders/counts" && method === "get") {
      const counts: Record<string, number> = {};
      for (const o of orders) counts[o.status] = (counts[o.status] ?? 0) + 1;
      counts.total = orders.length;
      result = counts;
    }

    // ── References ──
    if (url === "/api/references/sales-channels" && method === "get") {
      result = [
        { code: "showroom", label: "Шоурум" },
        { code: "online", label: "Онлайн" },
        { code: "partner", label: "Партнёр" },
        { code: "outbound", label: "Исходящий звонок" },
      ];
    }
    if (url === "/api/references/manufacturers" && method === "get") {
      result = ["Кулан", "MoozTau"];
    }
    if (url === "/api/references/payment-methods" && method === "get") {
      result = [
        { bank: "Kaspi",     person: "MoozTau" },
        { bank: "Kaspi",     person: "Талант" },
        { bank: "Kaspi",     person: "Жансерик" },
        { bank: "Halyk",     person: "Куандык" },
        { bank: "Halyk",     person: "Талант" },
        { bank: "БЦК",       person: "Ильяс" },
        { bank: "БЦК",       person: "Жансерик" },
        { bank: "Bereke",    person: "Игилик" },
        { bank: "Forte",     person: "DN Real" },
        { bank: "Наличными", person: "Сауле" },
      ];
    }

    // ── Factory ──
    if (url === "/api/factory/dashboard" && method === "get") {
      const byStatus: Record<string, number> = {};
      for (const o of orders) byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
      const factoryStatuses = ["in_progress", "qc_review", "qc_passed", "qc_rejected", "waiting_courier"];
      result = {
        total_orders: orders.filter((o) => factoryStatuses.includes(String(o.status))).length,
        in_progress: byStatus["in_progress"] ?? 0,
        qc_review: byStatus["qc_review"] ?? 0,
        qc_passed: byStatus["qc_passed"] ?? 0,
        qc_rejected: byStatus["qc_rejected"] ?? 0,
        waiting_courier: byStatus["waiting_courier"] ?? 0,
      };
    }
    if (url === "/api/factory/orders" && method === "get") {
      result = orders
        .filter((o) => ["in_progress", "qc_review", "qc_passed"].includes(String(o.status)))
        .map((o) => localizeOrder(o, lang));
    }
    if (url === "/api/factory/orders/qc-queue" && method === "get") {
      result = orders.filter((o) => o.status === "qc_review").map((o) => localizeOrder(o, lang));
    }
    if (url === "/api/factory/inventory" && method === "get") {
      result = [];
    }
    if (url === "/api/factory/inventory" && method === "post") {
      result = { id: Date.now(), ...body };
    }

    // ── Logistics ──
    if (url === "/api/logistics/dashboard" && method === "get") {
      result = {
        pending_dispatch: orders.filter((o) => o.status === "ready").length,
        in_transit: orders.filter((o) => o.status === "shipped").length,
        delivered: orders.filter((o) => o.status === "completed").length,
      };
    }
    if (url === "/api/logistics/orders" && method === "get") {
      result = orders
        .filter((o) => ["ready", "shipped", "completed"].includes(String(o.status)))
        .map((o) => localizeOrder(o, lang));
    }

    // ── Service ──
    if (url === "/api/service/masters" && method === "get") {
      result = users
        .filter((u) => u.role === "FACTORY_ADMIN" || u.role === "LOGISTICS")
        .map((u) => ({ id: u.id, full_name: u.full_name, phone: u.phone, is_active: u.is_active }));
    }
    if (url === "/api/service/requests" && method === "get") {
      result = { count: 0, results: [] };
    }
    if (url === "/api/service/public/requests" && method === "post") {
      result = { id: Date.now(), status: "new", ...body };
    }
    if (url === "/api/buyer/service/requests" && method === "get") {
      result = [];
    }
    if (url === "/api/buyer/service/requests" && method === "post") {
      result = { id: Date.now(), status: "new", ...body };
    }

    // ── Audit ──
    if (url === "/api/audit/logs" && method === "get") {
      result = { count: 0, results: [] };
    }
    if (url === "/api/audit/suspicious" && method === "get") {
      result = { mass_deletions: [], night_logins: [] };
    }

    // ── Buyer order status-history / contract ──
    const buyerHist = matchRoute(url, "/api/buyer/orders/:id/status-history");
    if (buyerHist && method === "get") {
      result = history[Number(buyerHist.id)] || [];
    }
    const buyerContract = matchRoute(url, "/api/buyer/orders/:id/contract");
    if (buyerContract && method === "get") {
      const o = orders.find((item) => item.id === Number(buyerContract.id));
      result = o ? {
        has_contract: !!o.has_contract,
        contract_status: o.contract_status ?? "none",
        contract_doc_url: o.contract_doc_url ?? null,
        contract_signed_at: o.contract_signed_at ?? null,
      } : null;
    }

    // Catch-all fallback: unknown /api/* in mock mode returns safe empty payload
    if (result === null && url.startsWith("/api/")) {
      if (method === "get") {
        result = url.includes("/counts") || url.endsWith("/summary")
          ? {}
          : [];
      } else {
        result = { detail: "ok" };
      }
      // eslint-disable-next-line no-console
      console.warn(`[mock-api] unhandled ${method.toUpperCase()} ${url} → returning ${Array.isArray(result) ? "[]" : "{}"}`);
    }

    if (result !== null) {
      // Return a fake response, aborting the real request
      return {
        ...config,
        adapter: () =>
          Promise.resolve({
            data: result,
            status: 200,
            statusText: "OK",
            headers: {},
            config,
          }),
      };
    }

    return config;
  });
}
