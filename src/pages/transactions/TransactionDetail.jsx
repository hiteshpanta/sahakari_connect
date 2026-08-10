import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { exportReportPdf } from '../../utils/pdfExport';
import toast from 'react-hot-toast';
import { useGetTransactionByIdQuery } from '../../store/mainApi';

export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [txn, setTxn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { data: txnData, isLoading, isError } = useGetTransactionByIdQuery(id);

  useEffect(() => {
    setLoading(isLoading);
    if (isError) setError('Transaction not found');
    else if (txnData !== undefined) setTxn(txnData);
  }, [txnData, isLoading, isError]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <Loader2 size={28} className="spin" style={{ color: 'var(--emerald)' }} />
      </div>
    );
  }

  if (error || !txn) {
    return (
      <div className="empty-state">
        <AlertTriangle size={22} style={{ color: 'var(--red-light)' }} />
        <h3>{error || 'Transaction not found'}</h3>
        <button className="btn btn-primary mt-4" onClick={() => navigate('/transactions')}>Go Back</button>
      </div>
    );
  }

  const isCredit = txn.type !== 'Withdrawal' && txn.type !== 'Loan Payment';

  const handleDownload = async () => {
    try {
      await exportReportPdf({
        title: 'Transaction Receipt',
        subtitle: `TXN ${txn.txnNo} — ${txn.status?.toUpperCase() || 'COMPLETED'}`,
        filename: `receipt-${txn.txnNo}`,
        columns: [
          { header: 'Field' },
          { header: 'Value' },
        ],
        rows: [
          ['Transaction No.', txn.txnNo],
          ['Customer', txn.customerName],
          ['Account No.', txn.accountNo],
          ['Transaction Type', txn.type],
          ['Amount', `${isCredit ? '+' : '−'}${formatCurrency(txn.amount)}`],
          ['Balance After', formatCurrency(txn.balance)],
          ['Date & Time', `${txn.date || ''} at ${txn.time || ''}`.trim()],
          ['Branch', txn.branch],
          ['Processed By', txn.staff || 'System'],
          ['Payment Method', txn.paymentMethod || 'cash'],
          ['Remarks', txn.remarks || '—'],
          ['Status', txn.status],
        ],
      });
      toast.success('Receipt downloaded as PDF');
    } catch {
      toast.error('Failed to download receipt');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <button className="btn btn-outline btn-icon" onClick={() => navigate('/transactions')}><ArrowLeft size={16} /></button>
          <div>
            <h1 className="page-title">Transaction Receipt</h1>
            <p className="page-subtitle">{txn.txnNo}</p>
          </div>
        </div>
        <button className="btn btn-outline" onClick={() => toast.success('Receipt printed')} id="btn-print-receipt">
          <Printer size={14} /> Print Receipt
        </button>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Success Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(42,157,143,0.15), rgba(42,157,143,0.05))',
          border: '1px solid rgba(42,157,143,0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          textAlign: 'center',
          marginBottom: 'var(--space-5)'
        }}>
          <CheckCircle size={40} color="#2A9D8F" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, color: 'var(--emerald)', fontWeight: 600, marginBottom: 8 }}>Transaction Successful</p>
          <p style={{
            fontSize: 36,
            fontWeight: 900,
            color: isCredit ? 'var(--emerald)' : 'var(--red-light)',
            fontVariantNumeric: 'tabular-nums'
          }}>
            {isCredit ? '+' : '−'}{formatCurrency(txn.amount)}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{txn.type}</p>
        </div>

        {/* Details */}
        <div className="card">
          <h3 className="card-title mb-4">Transaction Details</h3>
          <div className="detail-rows">
            <div className="detail-row"><label>Transaction No.</label><span style={{ fontFamily: 'monospace', color: 'var(--text-accent)' }}>{txn.txnNo}</span></div>
            <div className="detail-row"><label>Customer</label><span>{txn.customerName}</span></div>
            <div className="detail-row"><label>Account No.</label><span style={{ fontFamily: 'monospace' }}>{txn.accountNo}</span></div>
            <div className="detail-row"><label>Transaction Type</label><span>{txn.type}</span></div>
            <div className="detail-row"><label>Amount</label><span style={{ color: isCredit ? 'var(--emerald)' : 'var(--red-light)', fontWeight: 700 }}>{formatCurrency(txn.amount)}</span></div>
            <div className="detail-row"><label>Balance After</label><span style={{ fontWeight: 600 }}>{formatCurrency(txn.balance)}</span></div>
            <div className="detail-row"><label>Date & Time</label><span>{txn.date} at {txn.time}</span></div>
            <div className="detail-row"><label>Branch</label><span>{txn.branch}</span></div>
            <div className="detail-row"><label>Processed By</label><span>{txn.staff || 'System'}</span></div>
            <div className="detail-row"><label>Remarks</label><span>{txn.remarks}</span></div>
            <div className="detail-row"><label>Status</label>
              <span className="badge badge-success"><span className="badge-dot" />{txn.status}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', justifyContent: 'center' }}>
          <button className="btn btn-outline" onClick={() => navigate('/transactions')}>
            <ArrowLeft size={14} /> Back to Transactions
          </button>
          <button className="btn btn-primary" onClick={handleDownload} id="btn-download-receipt">
            <Download size={14} /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
