export function UserCardSkeleton() {
  return (
    <div className="ucard ucard--skeleton">
      <div className="ucard-top">
        <div className="skeleton ucard-avatar-skel" />
        <div className="ucard-meta">
          <div className="skeleton" style={{ width: 140, height: 13, borderRadius: 6 }} />
          <div className="skeleton" style={{ width: 100, height: 11, borderRadius: 6, marginTop: 6 }} />
        </div>
      </div>
    </div>
  );
}
