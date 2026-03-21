// Empty state placeholder
// Shown when there are no meals planned for the current view
export default function EmptyState({ icon = '🍱', title, message }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-text">{message}</p>
    </div>
  );
}
