export const getAccountStatusClass = (status) => {
  if (status === 'active') return 'badge-success';
  if (status === 'frozen') return 'badge-warning';
  return 'badge-neutral';
};

export const getAccountStatusLabel = (status) => status || '—';

export const getCoopStatus = (status, map) =>
  map[status] || {
    label: status || '—',
    className: 'badge-neutral',
  };

export const getTransactionTone = (type, map) =>
  map[type] || {
    color: '#2A9D8F',
    background: 'rgba(42,157,143,0.12)',
  };

export const isOutflow = (type) =>
  type === 'Withdrawal' || type === 'Loan Payment';

export const getPaymentMethodLabel = (method) => {
  const labels = {
    esewa: 'eSewa',
    stripe: 'Stripe',
    bank_transfer: 'Bank Transfer',
  };

  return labels[method] || 'Cash';
};

export const getToday = () =>
  new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
