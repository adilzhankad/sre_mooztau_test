export function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted font-medium" style={{ margin: 0 }}>{label}</p>
      <p className="text-sm font-medium text-default" style={{ margin: "2px 0 0" }}>
        {value || "—"}
      </p>
    </div>
  );
}
