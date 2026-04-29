import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  danger?: boolean;
}

export function EmptyState({ icon, title, description, action, danger }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && (
        <div className={`empty-icon${danger ? " empty-icon-danger" : ""}`}>{icon}</div>
      )}
      <p className="text-base font-semibold text-default">{title}</p>
      {description && (
        <p className="text-sm text-secondary" style={{ marginTop: 4, maxWidth: 280 }}>{description}</p>
      )}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

export function ErrorState({ title, description, onRetry }: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <EmptyState
      danger
      icon={
        <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      }
      title={title ?? t("emptyState.errorTitle")}
      description={description ?? t("emptyState.errorDescription")}
      action={onRetry ? (
        <button className="btn btn-secondary btn-sm" onClick={onRetry}>{t("emptyState.retry")}</button>
      ) : undefined}
    />
  );
}

export function IconOrders() {
  return (
    <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c.98 0 1.813.626 2.115 1.5m-5.8 0c-.376.023-.75.05-1.124.08C7.095 3.007 6.25 3.97 6.25 5.108v13.642c0 1.243.996 2.25 2.25 2.25h6.5" />
    </svg>
  );
}

export function IconUsers() {
  return (
    <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

export function IconBox() {
  return (
    <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}
