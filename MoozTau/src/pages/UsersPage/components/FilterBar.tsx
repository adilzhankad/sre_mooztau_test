import { useState, useRef, useEffect } from "react";
import { ROLE_LABELS, ROLE_FILTER_ORDER } from "../constants/roles";
import { SORT_OPTIONS } from "../hooks/useUserFilters";
import type { SortOption } from "../hooks/useUserFilters";
import { useRoles } from "@/hooks/useProfile";
import type { UserRole } from "@/types";

interface FilterBarProps {
  search: string;
  onSearch: (v: string) => void;
  roleFilter: UserRole | "all";
  onRoleFilter: (r: UserRole | "all") => void;
  sort: SortOption;
  onSort: (s: SortOption) => void;
}

export function FilterBar({
  search, onSearch,
  roleFilter, onRoleFilter,
  sort, onSort,
}: FilterBarProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const { data: rolesRef } = useRoles();
  // Prefer backend order; fall back to hardcoded list if endpoint unavailable.
  // Exclude "USER" — it's a legacy/internal value not surfaced in the UI.
  const roleOrder = (rolesRef?.filter((r) => r.value !== "USER").map((r) => r.value as UserRole))
    ?? ROLE_FILTER_ORDER;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <div className="users-filter-bar">
        <div className="users-search-wrap">
          <SearchIcon />
          <input
            className="users-search-inp"
            placeholder="Поиск по имени или телефону..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <div className="users-sort-menu" ref={sortRef}>
          <button
            className="users-sort-btn"
            onClick={() => setSortOpen((o) => !o)}
          >
            <SortIcon />
            <span>{sort.label}</span>
          </button>
          {sortOpen && (
            <div className="users-dropdown">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key + opt.dir}
                  className={`users-dropdown-item${opt.key === sort.key && opt.dir === sort.dir ? " active" : ""}`}
                  onClick={() => { onSort(opt); setSortOpen(false); }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="users-chips">
        <button
          className={`users-chip${roleFilter === "all" ? " on" : ""}`}
          onClick={() => onRoleFilter("all")}
        >
          Все
        </button>
        {roleOrder.map((r) => (
          <button
            key={r}
            className={`users-chip${roleFilter === r ? " on" : ""}`}
            onClick={() => onRoleFilter(r)}
          >
            {ROLE_LABELS[r].split(" ")[0]}
          </button>
        ))}
      </div>
    </>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", pointerEvents: "none" }}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  );
}
