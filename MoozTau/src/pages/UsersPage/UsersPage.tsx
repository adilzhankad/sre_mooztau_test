import { useState } from "react";
import { useUsers, useCreateUser, useToggleUserActive } from "@/hooks/useUsers";
import { useOrganizations } from "@/hooks/useUsers";
import { useAuthStore } from "@/stores/auth-store";
import { rawPhone } from "@/lib/phone-mask";
import type { UserCreate } from "@/types";

import { FilterBar } from "./components/FilterBar";
import { StatsRow } from "./components/StatsRow";
import { UserCard } from "./components/UserCard";
import { UserCardSkeleton } from "./components/UserCardSkeleton";
import { CreateUserForm } from "./components/CreateUserForm";
import { useUserFilters } from "./hooks/useUserFilters";

import "./users-page.css";

const makeDefaultForm = (orgId: number): UserCreate => ({
  organization_id: orgId,
  role: "DEALER_MANAGER",
  full_name: "",
  phone: "",
  email: "",
  password: "",
});

export function UsersPage() {
  const role = useAuthStore((s) => s.role);
  const organizationId = useAuthStore((s) => s.organizationId);
  const isSuperAdmin = role?.toUpperCase() === "SUPER_ADMIN";

  const { data: allUsers, isLoading } = useUsers();
  const { data: organizations } = useOrganizations();
  const createUser = useCreateUser();
  const toggleActive = useToggleUserActive();

  const scopedUsers = isSuperAdmin
    ? allUsers
    : allUsers?.filter((u) => u.organization_id === organizationId);

  const { search, setSearch, roleFilter, setRoleFilter, sort, setSort, filtered, stats } =
    useUserFilters(scopedUsers);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<UserCreate>(
    makeDefaultForm(isSuperAdmin ? 0 : (organizationId ?? 0))
  );

  const handleCreate = async () => {
    await createUser.mutateAsync({ ...form, phone: rawPhone(form.phone) });
    setShowForm(false);
    setForm(makeDefaultForm(isSuperAdmin ? 0 : (organizationId ?? 0)));
  };

  return (
    <div className="users-page">
      <div className="users-topbar">
        <div className="users-topbar-left">
          <h1 className="users-title">Пользователи</h1>
          <span className="users-subtitle">
            {filtered.length} из {stats.total}
          </span>
        </div>
        <button
          className="users-add-btn"
          onClick={() => setShowForm((v) => !v)}
        >
          <PlusIcon />
          Добавить
        </button>
      </div>

      {showForm && (
        <div className="users-form-wrap">
          <CreateUserForm
            form={form}
            setForm={setForm}
            onSubmit={handleCreate}
            isPending={createUser.isPending}
            isSuperAdmin={isSuperAdmin}
            organizationId={organizationId}
            organizations={organizations}
            currentRole={role}
          />
        </div>
      )}

      <FilterBar
        search={search}
        onSearch={setSearch}
        roleFilter={roleFilter}
        onRoleFilter={setRoleFilter}
        sort={sort}
        onSort={setSort}
      />

      <StatsRow {...stats} />

      <div className="users-list">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => <UserCardSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <div className="users-empty">
            <div className="users-empty-icon" />
            <p className="users-empty-title">Ничего не найдено</p>
            <p className="users-empty-sub">Попробуйте изменить фильтры или поисковой запрос</p>
          </div>
        ) : (
          filtered.map((user, i) => (
            <UserCard
              key={user.id}
              user={user}
              organizations={organizations}
              onToggle={(id) => toggleActive.mutate(id)}
              style={{ animationDelay: `${i * 30}ms` }}
            />
          ))
        )}
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
