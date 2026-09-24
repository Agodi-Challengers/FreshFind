/** "Open now" / "Closing soon" / "Closed" pill with a coloured dot. */
export default function StatusPill({ status, className = "" }) {
  const cls = {
    open: "pill--green",
    soon: "pill--amber",
    closed: "pill--muted",
  }[status.state];
  const dot = { open: "dot--open", soon: "dot--soon", closed: "" }[
    status.state
  ];
  return (
    <span className={`pill ${cls} ${className}`.trim()}>
      <span className={`dot ${dot}`} aria-hidden="true" />
      {status.pill}
    </span>
  );
}

export function statusTextClass(status) {
  return {
    open: "status-text--open",
    soon: "status-text--soon",
    closed: "status-text--closed",
  }[status.state];
}
