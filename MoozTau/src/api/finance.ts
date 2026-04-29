import { financeApi } from "@/lib/axios";
import type {
  FinCategory,
  FinCategoryCreate,
  BankAccount,
  BankAccountCreate,
  BankAccountUpdate,
  FinTransaction,
  FinTransactionCreate,
  TransactionFilters,
  TransactionListResponse,
  ReportSummary,
  CategoryBreakdown,
  InitiatorBreakdown,
  TransactionType,
} from "@/types";

// ── Categories ──

export async function getCategories(filters?: {
  level?: number;
  parent_id?: number;
}): Promise<FinCategory[]> {
  const params = filters
    ? Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null))
    : undefined;
  const { data } = await financeApi.get("/api/finance/categories/", { params });
  return data;
}

export async function createCategory(cat: FinCategoryCreate): Promise<FinCategory> {
  const { data } = await financeApi.post("/api/finance/categories/", cat);
  return data;
}

export async function deleteCategory(id: number): Promise<void> {
  await financeApi.delete(`/api/finance/categories/${id}`);
}

// ── Bank Accounts ──

export async function getAccounts(): Promise<BankAccount[]> {
  const { data } = await financeApi.get("/api/finance/accounts/");
  return data;
}

export async function createAccount(acc: BankAccountCreate): Promise<BankAccount> {
  const { data } = await financeApi.post("/api/finance/accounts/", acc);
  return data;
}

export async function updateAccount(id: number, acc: BankAccountUpdate): Promise<BankAccount> {
  const { data } = await financeApi.put(`/api/finance/accounts/${id}`, acc);
  return data;
}

// ── Transactions ──

export async function getTransactions(
  filters: TransactionFilters = {},
): Promise<TransactionListResponse> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v != null && v !== ""),
  );
  const { data } = await financeApi.get("/api/finance/transactions/", {
    params,
  });
  return data;
}

export async function getTransaction(id: number): Promise<FinTransaction> {
  const { data } = await financeApi.get(`/api/finance/transactions/${id}`);
  return data;
}

export async function createTransaction(
  tx: FinTransactionCreate,
): Promise<FinTransaction> {
  const { data } = await financeApi.post("/api/finance/transactions/", tx);
  return data;
}

export async function deleteTransaction(id: number): Promise<void> {
  await financeApi.delete(`/api/finance/transactions/${id}`);
}

// ── Reports ──

export async function getReportSummary(filters?: {
  date_from?: string;
  date_to?: string;
}): Promise<ReportSummary> {
  const params = filters
    ? Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null))
    : undefined;
  const { data } = await financeApi.get("/api/finance/reports/summary", {
    params,
  });
  return data;
}

export async function getReportByCategory(filters?: {
  date_from?: string;
  date_to?: string;
  transaction_type?: TransactionType;
}): Promise<CategoryBreakdown[]> {
  const params = filters
    ? Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null))
    : undefined;
  const { data } = await financeApi.get("/api/finance/reports/by-category", {
    params,
  });
  return data;
}

export async function getReportByInitiator(filters?: {
  date_from?: string;
  date_to?: string;
  transaction_type?: TransactionType;
}): Promise<InitiatorBreakdown[]> {
  const params = filters
    ? Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null))
    : undefined;
  const { data } = await financeApi.get("/api/finance/reports/by-initiator", {
    params,
  });
  return data;
}

export function getExportUrl(filters?: {
  date_from?: string;
  date_to?: string;
  type?: TransactionType;
  account_id?: number;
  category_l1_id?: number;
  initiator_id?: number;
  search?: string;
}): string {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v != null && v !== "") params.set(k, String(v));
    });
  }
  const qs = params.toString();
  return `/api/finance/reports/export/excel${qs ? `?${qs}` : ""}`;
}
