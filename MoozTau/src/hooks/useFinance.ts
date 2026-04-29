import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import * as financeApi from "@/api/finance";
import type {
  FinTransactionCreate,
  FinCategoryCreate,
  BankAccountCreate,
  BankAccountUpdate,
  TransactionFilters,
  TransactionType,
} from "@/types";

// ── Categories ──

export function useCategories(filters?: {
  level?: number;
  parent_id?: number;
}) {
  return useQuery({
    queryKey: [QUERY_KEYS.categories, filters],
    queryFn: () => financeApi.getCategories(filters),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FinCategoryCreate) => financeApi.createCategory(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.categories] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => financeApi.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.categories] }),
  });
}

// ── Bank Accounts ──

export function useAccounts() {
  return useQuery({
    queryKey: [QUERY_KEYS.accounts],
    queryFn: financeApi.getAccounts,
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BankAccountCreate) => financeApi.createAccount(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.accounts] }),
  });
}

export function useUpdateAccount(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BankAccountUpdate) => financeApi.updateAccount(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.accounts] }),
  });
}

// ── Transactions ──

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.transactions, filters],
    queryFn: () => financeApi.getTransactions(filters),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FinTransactionCreate) =>
      financeApi.createTransaction(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.reports] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.accounts] });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => financeApi.deleteTransaction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.reports] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.accounts] });
    },
  });
}

// ── Reports ──

export function useReportSummary(filters?: {
  date_from?: string;
  date_to?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEYS.reports, "summary", filters],
    queryFn: () => financeApi.getReportSummary(filters),
  });
}

export function useReportByCategory(filters?: {
  date_from?: string;
  date_to?: string;
  transaction_type?: TransactionType;
}) {
  return useQuery({
    queryKey: [QUERY_KEYS.reports, "by-category", filters],
    queryFn: () => financeApi.getReportByCategory(filters),
  });
}

export function useReportByInitiator(filters?: {
  date_from?: string;
  date_to?: string;
  transaction_type?: TransactionType;
}) {
  return useQuery({
    queryKey: [QUERY_KEYS.reports, "by-initiator", filters],
    queryFn: () => financeApi.getReportByInitiator(filters),
  });
}
