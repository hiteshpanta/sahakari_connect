import React, { useState, useEffect } from 'react';
import { Search, Download, Filter, Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime, statusColor } from '../../utils/formatters';
import { exportReportPdf } from '../../utils/pdfExport';
import { useGetMemberTransactionsQuery } from '../../store/mainApi';
import { useMemberCooperative } from '../../context/MemberCooperativeContext';
import CooperativeSwitcher from '../../components/member/CooperativeSwitcher';

const txnSign = (type) => (type === 'Withdrawal' || type === 'Loan Payment' ? '-' : '+');
const isOutflow = (type) => type === 'Withdrawal' || type === 'Loan Payment';
const methodLabel = (m) => (m === 'esewa' ? 'eSewa' : m === 'stripe' ? 'Stripe' : m === 'bank_transfer' ? 'Bank Transfer' : 'Cash');

export default function MemberTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { activeCoopId, activeCoop } = useMemberCooperative();

  const { data: transactionsData, isLoading, isError, error: txnsError } = useGetMemberTransactionsQuery({
    cooperativeId: activeCoopId || undefined,
    type: typeFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined
  }, { skip: !activeCoopId });

  useEffect(() => {
    setLoading(isLoading);
    if (isError) {
      setError(txnsError?.data?.message || 'Failed to load transactions');
    } else if (transactionsData !== undefined) {
      setTransactions(transactionsData);
    }
  }, [transactionsData, isLoading, isError, txnsError]);

  const filteredTxns = transactions.filter((txn) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (txn.txnNo || '').toLowerCase().includes(q) ||
      (txn.accountNo || '').toLowerCase().includes(q) ||
      (txn.remarks || '').toLowerCase().includes(q) ||
      (txn.type || '').toLowerCase().includes(q)
    );
  });

  const handleDownload = async () => {
    if (filteredTxns.length === 0) return;
    try {
      const totalIn = filteredTxns.filter((t) => !isOutflow(t.type)).reduce((s, t) => s + Number(t.amount || 0), 0);
      const totalOut = filteredTxns.filter((t) => isOutflow(t.type)).reduce((s, t) => s + Number(t.amount || 0), 0);
      await exportReportPdf({
        title: 'Account Statement',
        subtitle: `${filteredTxns.length} transaction${filteredTxns.length === 1 ? '' : 's'} ${startDate ? `from ${startDate}` : ''}${endDate ? ` to ${endDate}` : ''}`,
        filename: `account-statement-${new Date().toISOString().slice(0, 10)}`,
        columns: [
          { header: 'Date & Time' },
          { header: 'Txn No.' },
          { header: 'Account' },
          { header: 'Type' },
          { header: 'Method' },
          { header: 'Remarks' },
          { header: 'Amount', align: 'right' },
          { header: 'Balance', align: 'right' },
        ],
        rows: filteredTxns.map((txn) => [
          `${txn.date || ''} ${txn.time || ''}`.trim(),
          txn.txnNo || '',
          txn.accountNo || '',
          txn.type || '',
          methodLabel(txn.paymentMethod),
          txn.remarks || '',
          `${txnSign(txn.type)}${formatCurrency(txn.amount)}`,
          formatCurrency(txn.balance),
        ]),
        summary: [
          { label: 'Total In', value: formatCurrency(totalIn) },
          { label: 'Total Out', value: formatCurrency(totalOut) },
          { label: 'Net', value: formatCurrency(totalIn - totalOut) },
        ],
      });
    } catch {
      // Silently ignore export failures on the member side
    }
  };

  return (
    <div className="glass-page animate-fade-in">
      <div className="glass-orb glass-orb-1" />
      <div className="glass-orb glass-orb-3" />

      <div className="glass-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Transaction History</h1>
            <p className="page-subtitle">
              View, filter and download your account statements
              {activeCoop?.cooperative?.name ? ` • ${activeCoop.cooperative.name}` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <CooperativeSwitcher compact />
            <button className="btn btn-primary" onClick={handleDownload} disabled={filteredTxns.length === 0}>
              <Download size={16} /> Download PDF
            </button>
          </div>
        </div>

        <div className="glass-card" style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <span className="input-icon" style={{ left: 12, color: 'var(--text-muted)' }}><Search size={16} /></span>
              <input
                type="text"
                className="glass-input"
                style={{ paddingLeft: 38 }}
                placeholder="Search by Txn No, Account, Type or Remarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="glass-select"
              style={{ width: 160 }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Deposit">Deposit</option>
              <option value="Withdrawal">Withdrawal</option>
              <option value="Transfer">Transfer</option>
              <option value="Loan Payment">Loan Payment</option>
              <option value="Interest Credit">Interest Credit</option>
            </select>
            <input
              type="date"
              className="glass-input"
              style={{ width: 165 }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="From date"
            />
            <input
              type="date"
              className="glass-input"
              style={{ width: 165 }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="To date"
            />
            <button
              className="btn btn-ghost btn-icon"
              title="Clear filters"
              onClick={() => { setTypeFilter(''); setStartDate(''); setEndDate(''); setSearchTerm(''); }}
            >
              <Filter size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <Loader2 size={30} className="spin" style={{ color: 'var(--emerald)' }} />
          </div>
        ) : error ? (
          <div className="glass-card" style={{ display: 'flex', gap: 12, alignItems: 'center', color: 'var(--red-light)' }}>
            <AlertCircle size={20} /> {error}
          </div>
        ) : (
          <div className="glass-table-wrap">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Txn No</th>
                    <th>Account</th>
                    <th>Type</th>
                    <th>Method</th>
                    <th>Remarks</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'right' }}>Balance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTxns.length > 0 ? (
                    filteredTxns.map((txn) => (
                      <tr key={txn._id}>
                        <td>{formatDateTime(txn.date, txn.time)}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{txn.txnNo}</td>
                        <td>{txn.accountNo}</td>
                        <td>
                          <span className={`badge ${
                            txn.type === 'Withdrawal' ? 'danger' :
                            txn.type === 'Loan Payment' ? 'badge-purple' :
                            txn.type === 'Transfer' ? 'warning' : 'success'
                          }`}>
                            {txn.type}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${txn.paymentMethod === 'esewa' ? 'badge-success' : txn.paymentMethod === 'stripe' ? 'badge-info' : 'badge-neutral'}`}>
                            {methodLabel(txn.paymentMethod)}
                          </span>
                        </td>
                        <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {txn.remarks || '-'}
                          {txn.transactionCode && <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{txn.transactionCode}</span>}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }} className={isOutflow(txn.type) ? 'txn-down' : 'txn-up'}>
                          {txnSign(txn.type)}{formatCurrency(txn.amount)}
                        </td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(txn.balance)}</td>
                        <td><span className={`badge ${statusColor(txn.status)}`}>{txn.status}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                        <p style={{ color: 'var(--text-muted)' }}>No transactions found matching your filters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
