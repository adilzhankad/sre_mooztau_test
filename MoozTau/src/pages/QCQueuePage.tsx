import { useNavigate } from "react-router-dom";
import { useQCQueue } from "@/hooks/useQC";
import { formatDate } from "@/lib/order-helpers";
import type { AxiosError } from "axios";

export function QCQueuePage() {
  const navigate = useNavigate();
  const { data: queue, isLoading, error } = useQCQueue();
  const errorDetail =
    ((error as AxiosError<{ detail?: string }>)?.response?.data?.detail) ||
    (error instanceof Error ? error.message : "Не удалось загрузить очередь QC");

  return (
    <div>
      <div style={{ padding: "16px 16px 12px" }}>
        <h2 className="text-lg font-bold text-default" style={{ margin: 0 }}>
          Очередь QC
        </h2>
        <p className="text-xs text-secondary" style={{ margin: "4px 0 0" }}>
          Заказы, ожидающие проверки качества
        </p>
      </div>

      <div className="stack" style={{ padding: "0 16px 16px", gap: 10 }}>
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton" style={{ width: 140, height: 14, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: 100, height: 11, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: 80, height: 11 }} />
            </div>
          ))
        ) : error ? (
          <div className="empty-state fade-up" style={{ padding: "48px 16px" }}>
            <div className="empty-state-icon">
              <svg width={28} height={28} fill="none" viewBox="0 0 24 24" stroke="var(--danger)" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.007v.008H12v-.008z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86L1.82 18a2.25 2.25 0 001.93 3.375h16.5A2.25 2.25 0 0022.18 18L13.71 3.86a2.25 2.25 0 00-3.42 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-default" style={{ marginBottom: 4 }}>
              Очередь QC не загрузилась
            </p>
            <p className="text-xs text-secondary">{errorDetail}</p>
          </div>
        ) : queue && queue.length > 0 ? (
          queue.map((item) => {
            const isUrgent = item.deadline
              ? new Date(item.deadline).getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000
              : false;

            return (
              <div key={item.id} className="card" style={{ cursor: "pointer" }} onClick={() => navigate(`/qc/${item.id}`)}>
                <div className="row-between" style={{ marginBottom: 6 }}>
                  <p className="text-sm font-bold text-default" style={{ margin: 0 }}>
                    {item.order_number}
                  </p>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 6,
                      background: "#FEF3C7",
                      color: "#92400E",
                    }}
                  >
                    На проверке
                  </span>
                </div>

                <p className="text-xs text-secondary" style={{ margin: "0 0 4px" }}>
                  Клиент: {item.client_name}
                </p>

                {item.deadline && (
                  <p
                    className="text-xs"
                    style={{
                      margin: "0 0 4px",
                      fontWeight: 600,
                      color: isUrgent ? "#DC2626" : "var(--text-secondary)",
                    }}
                  >
                    Дедлайн: {formatDate(item.deadline)}
                    {isUrgent && " (срочно!)"}
                  </p>
                )}

                <p className="text-xs text-muted" style={{ margin: "4px 0 0" }}>
                  {item.items.length} позиций: {item.items.map((it) => it.model).join(", ")}
                </p>

                <button
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: 10, width: "100%" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/qc/${item.id}`);
                  }}
                >
                  Начать проверку
                </button>
              </div>
            );
          })
        ) : (
          <div className="empty-state fade-up" style={{ padding: "48px 16px" }}>
            <div className="empty-state-icon">
              <svg width={28} height={28} fill="none" viewBox="0 0 24 24" stroke="var(--success)" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-default" style={{ marginBottom: 4 }}>
              Очередь пуста
            </p>
            <p className="text-xs text-secondary">Нет заказов для проверки</p>
          </div>
        )}
      </div>
    </div>
  );
}
