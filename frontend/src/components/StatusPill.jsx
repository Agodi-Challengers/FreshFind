/** "Open now" / "Closing soon" / "Closed" pill with a coloured dot. */
export default function StatusPill({ status, className = '' }) {
  const cls = {
    open: 'ff-pill--green',
    soon: 'ff-pill--amber',
    closed: 'ff-pill--muted',
  }[status.state];
  const dot = { open: 'ff-dot--open', soon: 'ff-dot--soon', closed: '' }[status.state];
  return (
    <span className={`ff-pill ${cls} ${className}`.trim()}>
      <span className={`ff-dot ${dot}`} aria-hidden="true" />
      {status.pill}
    </span>
  );
}

export function statusTextClass(status) {
  return { open: 'ff-status-text--open', soon: 'ff-status-text--soon', closed: 'ff-status-text--closed' }[status.state];
}
