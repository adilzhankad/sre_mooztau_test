import { Pagination } from "@/components/ui/Pagination";
import type { AuditLog, AuditLogListResponse } from "@/types";
import { formatAuditDate, getActionColor, getActionLabel, getLogTitle } from "../utils";

interface AuditLogListProps {
  data?: AuditLogListResponse;
  isLoading: boolean;
  expandedId: string | null;
  onToggle: (id: string) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export function AuditLogList({
  data,
  isLoading,
  expandedId,
  onToggle,
  onPrevPage,
  onNextPage,
}: AuditLogListProps) {
  const results = Array.isArray(data?.results) ? data.results : [];
  const page = data?.page ?? 1;
  const pages = data?.pages ?? 1;

  if (isLoading) {
    return (
      <div className="stack" style={{ gap: 8 }}>
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="card" style={{ padding: 14 }}>
            <div className="skeleton" style={{ width: 220, height: 12, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: "100%", height: 10 }} />
          </div>
        ))}
      </div>
    );
  }

  if (!data || results.length === 0) {
    return (
      <div className="empty-state fade-up" style={{ padding: "48px 16px" }}>
        <p className="text-sm font-semibold text-default" style={{ marginBottom: 4 }}>
          Записей пока нет
        </p>
        <p className="text-xs text-secondary">Попробуйте изменить фильтры или обновить страницу.</p>
      </div>
    );
  }

  return (
    <>
      <div className="stack" style={{ gap: 8 }}>
        {results.map((log) => {
          const isExpanded = expandedId === log.id;
          const actionColor = getActionColor(log.action);

          return (
            <article
              key={log.id}
              className="card"
              style={{ padding: 14, cursor: "pointer" }}
              onClick={() => onToggle(log.id)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 999,
                    background: `${actionColor}18`,
                    color: actionColor,
                  }}
                >
                  {getActionLabel(log.action)}
                </span>
                <span className="text-xs text-muted">{getLogTitle(log)}</span>
                <span className="text-xs text-muted" style={{ marginLeft: "auto" }}>
                  {formatAuditDate(log.event_time)}
                </span>
              </div>

              <p className="text-sm text-default" style={{ margin: 0 }}>
                {log.comment || "Без комментария"}
              </p>
              <p className="text-xs text-secondary" style={{ margin: "6px 0 0" }}>
                Роль: {log.user_role || "не указана"}
                {log.user_id ? ` • ID: ${log.user_id}` : ""}
                {log.ip_address ? ` • IP: ${log.ip_address}` : ""}
              </p>

              {isExpanded ? <AuditLogDetails log={log} /> : null}
            </article>
          );
        })}
      </div>

      <Pagination
        page={page}
        pages={pages}
        onPrev={onPrevPage}
        onNext={onNextPage}
      />
    </>
  );
}

function AuditLogDetails({ log }: { log: AuditLog }) {
  return (
    <div style={{ marginTop: 12, padding: 12, background: "var(--bg-subtle)", borderRadius: 10 }}>
      {log.old_value ? (
        <div style={{ marginBottom: 10 }}>
          <div className="text-xs font-semibold text-secondary">Было</div>
          <pre className="text-xs text-muted" style={{ margin: "4px 0 0", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {JSON.stringify(log.old_value, null, 2)}
          </pre>
        </div>
      ) : null}
      {log.new_value ? (
        <div>
          <div className="text-xs font-semibold text-secondary">Стало</div>
          <pre className="text-xs text-muted" style={{ margin: "4px 0 0", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {JSON.stringify(log.new_value, null, 2)}
          </pre>
        </div>
      ) : null}
      {log.request_id ? (
        <p className="text-xs text-muted" style={{ margin: "8px 0 0" }}>
          Request ID: {log.request_id}
        </p>
      ) : null}
    </div>
  );
}
