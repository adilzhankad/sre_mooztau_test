export function AuditAccessDenied() {
  return (
    <section className="card" style={{ padding: 24 }}>
      <h2 style={{ margin: 0, fontSize: 24 }}>Доступ закрыт</h2>
      <p className="text-sm text-secondary" style={{ margin: "10px 0 0" }}>
        Аудит доступен только пользователям с ролью SUPER_ADMIN.
      </p>
    </section>
  );
}
