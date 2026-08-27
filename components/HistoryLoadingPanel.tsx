type HistoryLoadingPanelProps = {
  eyebrow: string;
  message: string;
};

export function HistoryLoadingPanel({
  eyebrow,
  message,
}: HistoryLoadingPanelProps) {
  return (
    <section
      className="panel studentDashboardEmpty"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="eyebrow">{eyebrow}</span>
      <p className="studentDashboardEmptyMessage">{message}</p>
    </section>
  );
}
