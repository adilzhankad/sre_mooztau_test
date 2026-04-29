import { formatPhone } from "@/lib/phone-mask";
import { getCreatableRoles } from "@/lib/permissions";
import { ROLE_LABELS } from "../constants/roles";
import { useRoles } from "@/hooks/useProfile";
import type { UserRole, UserCreate } from "@/types";
import type { Organization } from "@/types";

interface CreateUserFormProps {
  form: UserCreate;
  setForm: (form: UserCreate) => void;
  onSubmit: () => void;
  isPending: boolean;
  isSuperAdmin: boolean;
  organizationId?: number | null;
  organizations?: Organization[];
  currentRole: UserRole | null;
}

export function CreateUserForm({
  form, setForm, onSubmit, isPending,
  isSuperAdmin, organizationId, organizations, currentRole,
}: CreateUserFormProps) {
  const { data: rolesRef } = useRoles();
  const isDisabled =
    isPending || !form.full_name || !form.phone || !form.password || !form.organization_id;

  // Allow only roles the current role is allowed to create, keep the backend-provided order.
  const creatable = new Set(getCreatableRoles(currentRole));
  const roleOptions: UserRole[] = rolesRef
    ? rolesRef.filter((r) => creatable.has(r.value as UserRole)).map((r) => r.value as UserRole)
    : getCreatableRoles(currentRole);

  return (
    <div className="create-form">
      <p className="create-form__title">Новый пользователь</p>

      <div className="create-form__grid">
        <div className="create-form__field create-form__field--full">
          <label className="create-form__lbl">ФИО</label>
          <input className="input" placeholder="Иванов Иван Иванович"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        </div>

        <div className="create-form__field">
          <label className="create-form__lbl">Телефон</label>
          <input className="input" type="tel" placeholder="+7 (700) 000-00-00"
            value={form.phone || "+7"}
            onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })} />
        </div>

        <div className="create-form__field">
          <label className="create-form__lbl">Email</label>
          <input className="input" type="email" placeholder="example@mail.com"
            value={form.email ?? ""}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>

        <div className="create-form__field">
          <label className="create-form__lbl">Пароль</label>
          <input className="input" type="password" placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>

        <div className="create-form__field">
          <label className="create-form__lbl">Роль</label>
          <select className="input" value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
            {roleOptions.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
        </div>

        <div className="create-form__field">
          <label className="create-form__lbl">Организация</label>
          {isSuperAdmin ? (
            <select className="input" value={form.organization_id}
              onChange={(e) => setForm({ ...form, organization_id: Number(e.target.value) })}>
              <option value={0}>Выберите...</option>
              {organizations?.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          ) : (
            <div className="input create-form__org-static">
              {organizations?.find((o) => o.id === organizationId)?.name ?? "Моя организация"}
            </div>
          )}
        </div>

        <button
          className="btn btn-primary create-form__submit"
          onClick={onSubmit}
          disabled={isDisabled}
        >
          {isPending && <span className="create-form__spinner" />}
          {isPending ? "Создание..." : "Создать пользователя"}
        </button>
      </div>
    </div>
  );
}
