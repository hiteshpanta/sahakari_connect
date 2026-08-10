import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Download, Eye, AlertTriangle, Loader2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { exportReportPdf } from '../../utils/pdfExport';
import toast from 'react-hot-toast';
import { useGetTransactionsQuery } from '../../store/mainApi';

const TXN_TYPE_COLORS = {
  'Deposit': 'badge-success',
  'Withdrawal': 'badge-danger',
  'Transfer': 'badge-info',
  'Interest Credit': 'badge-purple',
  'Loan Payment': 'badge-warning',
};

const isOutflow = (type) => type === 'Withdrawal' || type === 'Loan Payment';

export default function TransactionList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { data: transactionsData, isLoading, isError, error: queryError } = useGetTransactionsQuery();

  useEffect(() => {
    setLoading(isLoading);
    if (isError) setError(queryError?.data?.message || 'Failed to load transactions');
    else if (transactionsData !== undefined) setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
  }, [transactionsData, isLoading, isError, queryError]);

  const filtered = transactions.filter(t => {
    const matchSearch = (t.txnNo || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.accountNo || '').toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    const matchFrom = !dateFrom || (t.date || '') >= dateFrom;
    const matchTo = !dateTo || (t.date || '') <= dateTo;
    return matchSearch && matchType && matchFrom && matchTo;
  });

  const totalDeposits = filtered.filter(t => t.type === 'Deposit' || t.type === 'Interest Credit').reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const totalWithdrawals = filtered.filter(t => isOutflow(t.type)).reduce((s, t) => s + (Number(t.amount) || 0), 0);

  const handleExport = async () => {
    if (filtered.length === 0) {
      toast.error('No transactions to export');
      return;
    }
    try {
      await exportReportPdf({
        title: 'Transaction Report',
        subtitle: `${filtered.length} record${filtered.length === 1 ? '' : 's'} ${dateFrom ? `from ${dateFrom}` : ''}${dateTo ? ` to ${dateTo}` : ''}`,
        filename: `transactions-${new Date().toISOString().slice(0, 10)}`,
        columns: [
          { header: 'Txn No.' },
          { header: 'Customer' },
          { header: 'Account' },
          { header: 'Type' },
          { header: 'Amount', align: 'right' },
          { header: 'Balance', align: 'right' },
          { header: 'Date & Time' },
          { header: 'Branch' },
          { header: 'Status' },
        ],
        rows: filtered.map((t) => [
          t.txnNo || '',
          t.customerName || '',
          t.accountNo || '',
          t.type || '',
          formatCurrency(t.amount),
          formatCurrency(t.balance),
          `${t.date || ''} ${t.time || ''}`.trim(),
          t.branch || '',
          t.status || '',
        ]),
        summary: [
          { label: 'Total Deposits', value: formatCurrency(totalDeposits) },
          { label: 'Withdrawals & Loans', value: formatCurrency(totalWithdrawals) },
          { label: 'Transactions', value: String(filtered.length) },
        ],
      });
      toast.success('Transaction report exported as PDF');
    } catch (e) {
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{loading ? 'Loading...' : `${filtered.length} records`}</p>
        </div>
        <button className="btn btn-outline" onClick={handleExport} disabled={filtered.length === 0} id="btn-export-txns">
          <Download size={14} /> Export PDF
        </button>
      </div>

      {/* Summary */}
      <div className="stat-cards-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 'var(--space-5)' }}>
        <div className="stat-card" style={{ '--card-accent': '#2A9D8F' }}>
          <div className="stat-card-value" style={{ fontSize: 20, color: 'var(--emerald)' }}>{formatCurrency(totalDeposits)}</div>
          <div className="stat-card-label">Total Deposits</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#EF4444' }}>
          <div className="stat-card-value" style={{ fontSize: 20, color: 'var(--red-light)' }}>{formatCurrency(totalWithdrawals)}</div>
          <div className="stat-card-label">Total Withdrawals & Loan Payments</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#06b6d4' }}>
          <div className="stat-card-value" style={{ fontSize: 20 }}>{filtered.length}</div>
          <div className="stat-card-label">Transactions</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-row">
        <div className="search-box">
          <Search size={15} className="search-icon" />
          <input id="search-txns" className="form-input" placeholder="Search by txn no., customer, or account..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select id="filter-txn-type" className="form-select" style={{ width: 160 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option>Deposit</option>
          <option>Withdrawal</option>
          <option>Transfer</option>
          <option>Interest Credit</option>
          <option>Loan Payment</option>
        </select>
        <input type="date" className="form-input" style={{ width: 150 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} id="filter-date-from" title="From date" />
        <input type="date" className="form-input" style={{ width: 150 }} value={dateTo} onChange={e => setDateTo(e.target.value)} id="filter-date-to" title="To date" />
        <button className="btn btn-outline btn-icon" title="Clear filters" onClick={() => { setTypeFilter('all'); setDateFrom(''); setDateTo(''); setSearch(''); }}>
          <Filter size={14} />
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <Loader2 size={26} className="spin" style={{ color: 'var(--emerald)' }} />
            </div>
          ) : error ? (
            <div className="empty-state">
              <AlertTriangle size={22} style={{ color: 'var(--red-light)' }} />
              <h3>{error}</h3>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Txn No.</th>
                  <th>Customer</th>
                  <th>Account</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Balance After</th>
                  <th>Date & Time</th>
                  <th>Branch</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t._id}>
                    <td className="td-mono">
                      {t.txnNo}
                      {t.isFraudulent && (
                        <span className="badge badge-danger" style={{ marginLeft: 8, padding: '2px 4px', fontSize: '10px' }} title={t.fraudReason}>
                          <AlertTriangle size={10} style={{ display: 'inline', marginRight: 2 }} /> Fraud Risk
                        </span>
                      )}
                    </td>
                    <td className="td-primary">{t.customerName}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-accent)' }}>{t.accountNo}</td>
                    <td><span className={`badge ${TXN_TYPE_COLORS[t.type] || 'badge-neutral'}`}>{t.type}</span></td>
                    <td className={`td-amount ${isOutflow(t.type) ? 'debit' : 'credit'}`}>
                      {isOutflow(t.type) ? '−' : '+'}{formatCurrency(t.amount)}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{formatCurrency(t.balance)}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.date} {t.time}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.branch}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          className="btn btn-outline btn-sm btn-icon"
                          onClick={() => navigate(`/transactions/${t._id}`)}
                          title="View receipt"
                          id={`btn-view-txn-${t._id}`}
                        >
                          <Eye size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="empty-state"><div className="empty-state-icon"><Search size={22} /></div><h3>No transactions match your filters</h3></div>
          )}
        </div>
      </div>
    </div>
  );
}
