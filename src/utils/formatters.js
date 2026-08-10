export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'NPR 0';
  return `NPR ${Number(amount).toLocaleString('en-NP', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatToday = () => {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (dateStr, timeStr) => {
  if (!dateStr) return '—';
  return `${formatDate(dateStr)}${timeStr ? ' ' + timeStr : ''}`;
};

export const formatShortDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

export const calcLoanProgress = (paid, total) => {
  if (!total) return 0;
  return Math.round((paid / total) * 100);
};

export const statusColor = (status) => {
  const map = {
    active: 'success',
    completed: 'success',
    paid: 'success',
    approved: 'success',
    sent: 'success',
    delivered: 'success',
    closed: 'neutral',
    inactive: 'neutral',
    frozen: 'warning',
    pending: 'warning',
    pending_approval: 'warning',
    on_hold: 'info',
    failed: 'danger',
    rejected: 'danger',
    overdue: 'danger',
  };
  return map[status?.toLowerCase()] || 'neutral';
};
