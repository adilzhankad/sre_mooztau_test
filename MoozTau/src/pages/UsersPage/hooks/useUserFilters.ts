import { useState, useMemo } from "react";
import type { User, UserRole } from "@/types";

export type SortKey = "name" | "role" | "status";
export type SortDir = "asc" | "desc";

export interface SortOption {
  key: SortKey;
  dir: SortDir;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { key: "name", dir: "asc", label: "Имя А → Я" },
  { key: "name", dir: "desc", label: "Имя Я → А" },
  { key: "role", dir: "asc", label: "По роли" },
  { key: "status", dir: "desc", label: "Активные сначала" },
  { key: "status", dir: "asc", label: "Неактивные сначала" },
];

export function useUserFilters(users: User[] | undefined) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [sort, setSort] = useState<SortOption>(SORT_OPTIONS[0]);

  const filtered = useMemo(() => {
    if (!users) return [];

    let list = users.filter((u) => {
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        u.full_name.toLowerCase().includes(q) ||
        u.phone.includes(q);
      return matchRole && matchSearch;
    });

    list = [...list].sort((a, b) => {
      if (sort.key === "name") {
        const cmp = a.full_name.localeCompare(b.full_name, "ru");
        return sort.dir === "asc" ? cmp : -cmp;
      }
      if (sort.key === "role") {
        return a.role.localeCompare(b.role);
      }
      if (sort.key === "status") {
        const cmp = Number(b.is_active) - Number(a.is_active);
        return sort.dir === "desc" ? cmp : -cmp;
      }
      return 0;
    });

    return list;
  }, [users, search, roleFilter, sort]);

  const stats = useMemo(() => ({
    total: users?.length ?? 0,
    active: users?.filter((u) => u.is_active).length ?? 0,
    inactive: users?.filter((u) => !u.is_active).length ?? 0,
  }), [users]);

  return {
    search, setSearch,
    roleFilter, setRoleFilter,
    sort, setSort,
    filtered,
    stats,
  };
}
