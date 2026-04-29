interface Props {
  page: number;
  pages: number;
  onPrev: () => void;
  onNext: () => void;
}

export function Pagination({ page, pages, onPrev, onNext }: Props) {
  if (pages <= 1) return null;

  return (
    <div className="row" style={{ justifyContent: "center", gap: 6, padding: "16px 0 4px" }}>
      <button
        className="btn btn-secondary btn-sm"
        disabled={page <= 1}
        onClick={onPrev}
        style={{ gap: 4 }}
      >
        <ChevronLeft />
        Назад
      </button>

      <span className="text-sm font-semibold text-secondary" style={{ minWidth: 52, textAlign: "center" }}>
        {page} / {pages}
      </span>

      <button
        className="btn btn-secondary btn-sm"
        disabled={page >= pages}
        onClick={onNext}
        style={{ gap: 4 }}
      >
        Вперёд
        <ChevronRight />
      </button>
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}
