import { useState } from "react";
import { ProfileModal } from "./ProfileModal";

interface ChangePasswordModalProps {
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: { oldPassword: string; newPassword: string }) => Promise<void>;
}

export function ChangePasswordModal({ isPending, onClose, onSubmit }: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit() {
    setError("");
    setSuccess("");

    if (newPassword.length < 6) {
      setError("Новый пароль должен содержать минимум 6 символов.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Пароли не совпадают.");
      return;
    }

    try {
      await onSubmit({ oldPassword, newPassword });
      setSuccess("Пароль успешно обновлён.");
      setTimeout(onClose, 900);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Не удалось изменить пароль.");
    }
  }

  return (
    <ProfileModal
      title="Сменить пароль"
      description="Используйте надёжный пароль, который вы не применяете в других сервисах."
      onClose={onClose}
    >
      <div className="profile-form-grid">
        <label className="profile-field">
          <span>Текущий пароль</span>
          <input
            className="input"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </label>
        <label className="profile-field">
          <span>Новый пароль</span>
          <input
            className="input"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>
        <label className="profile-field">
          <span>Подтвердите пароль</span>
          <input
            className="input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>
      </div>

      {error ? <p className="profile-form-error">{error}</p> : null}
      {success ? <p className="profile-form-success">{success}</p> : null}

      <div className="profile-modal-actions">
        <button className="btn btn-secondary btn-lg" onClick={onClose}>
          Отмена
        </button>
        <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Обновляем..." : "Обновить пароль"}
        </button>
      </div>
    </ProfileModal>
  );
}
