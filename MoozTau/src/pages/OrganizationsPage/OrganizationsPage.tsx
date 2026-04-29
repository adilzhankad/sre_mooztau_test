import { useMemo, useState } from "react";

import {
  useOrganizations,
  useCreateOrganization,
  useDeleteOrganization,
  useUpdateOrganization,
} from "@/hooks/useUsers";
import { canManageOrganizations } from "@/lib/permissions";
import { useAuthStore } from "@/stores/auth-store";
import type { Organization, OrganizationCreate } from "@/types";

import { EMPTY_ORGANIZATION_FORM } from "./constants";
import { OrganizationCard } from "./_components/OrganizationCard";
import { OrganizationForm } from "./_components/OrganizationForm";
import { OrganizationsStats } from "./_components/OrganizationsStats";
import { OrganizationsToolbar } from "./_components/OrganizationsToolbar";
import type {
  OrganizationFormValues,
  OrganizationStatusFilter,
  OrganizationTypeFilter,
} from "./types";

import "./organizations-page.css";

export function OrganizationsPage() {
  const role = useAuthStore((state) => state.role);
  const organizationId = useAuthStore((state) => state.organizationId);
  const canManage = canManageOrganizations(role);

  const { data: allOrganizations, isLoading } = useOrganizations();
  const createOrganization = useCreateOrganization();
  const updateOrganization = useUpdateOrganization();
  const deleteOrganization = useDeleteOrganization();

  const scopedOrganizations = useMemo(() => {
    if (canManage) return allOrganizations ?? [];
    return (allOrganizations ?? []).filter((organization) => organization.id === organizationId);
  }, [allOrganizations, canManage, organizationId]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrganizationStatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<OrganizationTypeFilter>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const [createForm, setCreateForm] = useState<OrganizationFormValues>(EMPTY_ORGANIZATION_FORM);

  const filteredOrganizations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return scopedOrganizations.filter((organization) => {
      const haystack = [
        organization.name,
        organization.region ?? "",
        organization.address ?? "",
        organization.contact_email ?? "",
        organization.contact_phone ?? "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && organization.is_active) ||
        (statusFilter === "inactive" && !organization.is_active);
      const matchesType =
        typeFilter === "all" || organization.org_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [scopedOrganizations, search, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const active = scopedOrganizations.filter((organization) => organization.is_active).length;
    return {
      total: scopedOrganizations.length,
      active,
      inactive: scopedOrganizations.length - active,
    };
  }, [scopedOrganizations]);

  const isBusy =
    createOrganization.isPending ||
    updateOrganization.isPending ||
    deleteOrganization.isPending;

  const resetCreateForm = () => {
    setCreateForm(EMPTY_ORGANIZATION_FORM);
    setShowCreateForm(false);
  };

  const handleCreate = async () => {
    try {
      await createOrganization.mutateAsync(sanitizeForm(createForm));
      resetCreateForm();
    } catch (error) {
      window.alert(getErrorMessage(error, "Не удалось создать организацию."));
    }
  };

  const handleStartEdit = (organization: Organization) => {
    setShowCreateForm(false);
    setEditingOrganization(organization);
  };

  const handleUpdate = async () => {
    if (!editingOrganization) return;

    try {
      await updateOrganization.mutateAsync({
        id: editingOrganization.id,
        data: sanitizeForm({
          name: editingOrganization.name,
          org_type: editingOrganization.org_type,
          contact_phone: editingOrganization.contact_phone ?? "",
          contact_email: editingOrganization.contact_email ?? "",
          address: editingOrganization.address ?? "",
          region: editingOrganization.region ?? "",
        }),
      });
      setEditingOrganization(null);
    } catch (error) {
      window.alert(getErrorMessage(error, "Не удалось обновить организацию."));
    }
  };

  const handleToggleActive = async (organization: Organization) => {
    const actionLabel = organization.is_active ? "деактивировать" : "активировать";
    const confirmed = window.confirm(
      `Точно хотите ${actionLabel} организацию "${organization.name}"?`,
    );
    if (!confirmed) return;

    try {
      await updateOrganization.mutateAsync({
        id: organization.id,
        data: { is_active: !organization.is_active },
      });
    } catch (error) {
      window.alert(getErrorMessage(error, "Не удалось изменить статус организации."));
    }
  };

  const handleDelete = async (organization: Organization) => {
    const confirmed = window.confirm(
      `Удалить организацию "${organization.name}"? Это действие нельзя отменить.`,
    );
    if (!confirmed) return;

    try {
      await deleteOrganization.mutateAsync(organization.id);
      if (editingOrganization?.id === organization.id) {
        setEditingOrganization(null);
      }
    } catch (error) {
      window.alert(getErrorMessage(error, "Не удалось удалить организацию."));
    }
  };

  return (
    <div className="orgs-page">
      <OrganizationsToolbar
        count={filteredOrganizations.length}
        search={search}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        canManage={canManage}
        showCreateForm={showCreateForm}
        onSearchChange={setSearch}
        onStatusFilterChange={setStatusFilter}
        onTypeFilterChange={setTypeFilter}
        onToggleCreateForm={() => {
          setEditingOrganization(null);
          setShowCreateForm((current) => !current);
        }}
      />

      <OrganizationsStats {...stats} />

      {canManage && showCreateForm ? (
        <section className="orgs-section">
          <OrganizationForm
            form={createForm}
            title="Новая организация"
            description="Создайте дилера, филиал или головной офис и заполните основные контакты."
            submitLabel="Создать организацию"
            isPending={createOrganization.isPending}
            onChange={setCreateForm}
            onSubmit={handleCreate}
            onCancel={resetCreateForm}
          />
        </section>
      ) : null}

      {canManage && editingOrganization ? (
        <section className="orgs-section">
          <OrganizationForm
            form={{
              name: editingOrganization.name,
              org_type: editingOrganization.org_type,
              contact_phone: editingOrganization.contact_phone ?? "",
              contact_email: editingOrganization.contact_email ?? "",
              address: editingOrganization.address ?? "",
              region: editingOrganization.region ?? "",
            }}
            title={`Редактирование: ${editingOrganization.name}`}
            description="Изменения сохраняются только после подтверждения."
            submitLabel="Сохранить изменения"
            isPending={updateOrganization.isPending}
            onChange={(next) =>
              setEditingOrganization((current) =>
                current
                  ? {
                      ...current,
                      ...sanitizeForm(next),
                    }
                  : current,
              )
            }
            onSubmit={handleUpdate}
            onCancel={() => setEditingOrganization(null)}
          />
        </section>
      ) : null}

      <section className="orgs-section orgs-list">
        {isLoading ? (
          Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="orgs-skeleton-card">
              <div className="orgs-skeleton orgs-skeleton--lg" />
              <div className="orgs-skeleton orgs-skeleton--md" />
              <div className="orgs-skeleton orgs-skeleton--sm" />
            </div>
          ))
        ) : filteredOrganizations.length === 0 ? (
          <div className="orgs-empty-card">
            <h2 className="orgs-empty-title">Организации не найдены</h2>
            <p className="orgs-empty-text">
              Попробуйте изменить фильтры или создайте новую организацию, если вы вошли как суперадмин.
            </p>
          </div>
        ) : (
          filteredOrganizations.map((organization, index) => (
            <OrganizationCard
              key={organization.id}
              organization={organization}
              canManage={canManage}
              isBusy={isBusy}
              onEdit={handleStartEdit}
              onToggleActive={handleToggleActive}
              onDelete={handleDelete}
              style={{ animationDelay: `${index * 40}ms` }}
            />
          ))
        )}
      </section>
    </div>
  );
}

function sanitizeForm(form: OrganizationFormValues): OrganizationCreate {
  return {
    name: form.name.trim(),
    org_type: form.org_type,
    contact_phone: emptyToNull(form.contact_phone),
    contact_email: emptyToNull(form.contact_email),
    address: emptyToNull(form.address),
    region: emptyToNull(form.region),
  };
}

function emptyToNull(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object"
  ) {
    const detail = (error as { response?: { data?: { detail?: string } } }).response?.data?.detail;
    if (detail) return detail;
  }

  return fallback;
}
