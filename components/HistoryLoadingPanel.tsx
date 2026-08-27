type HistoryLoadingPanelProps = {
  eyebrow: string;
  message: string;
  className?: string;
};

export function HistoryLoadingPanel({
  eyebrow,
  message,
  className,
}: HistoryLoadingPanelProps) {
  return (
    <section
      className={
        className
          ? `panel studentDashboardEmpty ${className}`
          : "panel studentDashboardEmpty"
      }
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="eyebrow">{eyebrow}</span>
      <p className="studentDashboardEmptyMessage">{message}</p>
    </section>
  );
}
