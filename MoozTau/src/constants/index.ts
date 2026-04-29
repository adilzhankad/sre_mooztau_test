export const AUTH_API_URL =
  import.meta.env.VITE_AUTH_API_URL ?? "http://localhost:8004";
export const ORDERS_API_URL =
  import.meta.env.VITE_ORDERS_API_URL ?? "http://localhost:8001";
export const FINANCE_API_URL =
  import.meta.env.VITE_FINANCE_API_URL ?? "http://localhost:8003";
export const AUDIT_API_URL =
  import.meta.env.VITE_AUDIT_API_URL ?? "http://localhost:8005";
export const CHAT_API_URL =
  import.meta.env.VITE_CHAT_API_URL ?? "http://localhost:8006";

export const QUERY_KEYS = {
  me: "me",
  profileSummary: "profile-summary",
  users: "users",
  organizations: "organizations",
  orders: "orders",
  orderCounts: "order-counts",
  products: "products",
  prices: "prices",
  factory: "factory",
  inventory: "inventory",
  transactions: "transactions",
  categories: "categories",
  accounts: "accounts",
  analytics: "analytics",
  reports: "reports",
  qc: "qc",
  logistics: "logistics",
  service: "service",
  buyer: "buyer",
  audit: "audit",
} as const;
