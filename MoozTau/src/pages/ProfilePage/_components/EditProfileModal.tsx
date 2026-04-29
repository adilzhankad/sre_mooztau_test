import { useEffect, useState } from "react";
import { ProfileModal } from "./ProfileModal";
import type { MeResponse } from "@/types";

interface EditProfileModalProps {
  me: MeResponse;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: { full_name: string; phone: string; email: string | null }) => Promise<void>;
}

export function EditProfileModal({ me, isPending, onClose, onSubmit }: EditProfileModalProps) {
  const [fullName, setFullName] = useState(me.full_name);
  const [phone, setPhone] = useState(me.phone);
  const [email, setEmail] = useState(me.email ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    setFullName(me.full_name);
    setPhone(me.phone);
    setEmail(me.email ?? "");
  }, [me]);

  async function handleSubmit() {
    setError("");

    if (!fullName.trim()) {
      setError("Укажите имя пользователя.");
      return;
    }

    if (!phone.trim()) {
      setError("Укажите телефон.");
      return;
    }

    try {
      await onSubmit({
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
      });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Не удалось обновить профиль.");
    }
  }

  return (
    <ProfileModal
      title="Редактировать профиль"
      description="Изменения применятся сразу после сохранения."
      onClose={onClose}
    >
      <div className="profile-form-grid">
        <label className="profile-field">
          <span>ФИО</span>
          <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </label>
        <label className="profile-field">
          <span>Телефон</span>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label className="profile-field">
          <span>Email</span>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
      </div>

      {error ? <p className="profile-form-error">{error}</p> : null}

      <div className="profile-modal-actions">
        <button className="btn btn-secondary btn-lg" onClick={onClose}>
          Отмена
        </button>
        <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Сохраняем..." : "Сохранить"}
        </button>
      </div>
    </ProfileModal>
  );
}
