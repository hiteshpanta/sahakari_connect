import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, Mail, MapPin, Calendar, CreditCard,
  Wallet, ArrowLeftRight, Edit2, MessageSquare, MessageCircle
} from 'lucide-react';
import { customers, accounts, transactions, loans } from '../../data/mockData';
import { formatDate, formatCurrency, getInitials, statusColor } from '../../utils/formatters';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const customer = customers.find(c => c._id === id);

  if (!customer) {
    return (
      <div className="empty-state">
        <h3>Customer not found</h3>
        <button className="btn btn-primary mt-4" onClick={() => navigate('/customers')}>Go Back</button>
      </div>
    );
  }

  const custAccounts = accounts.filter(a => a.customerId === id);
  const custTransactions = transactions.filter(t => t.customerId === id);
  const custLoans = loans.filter(l => l.customerId === id);
  const totalBalance = custAccounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <button className="btn btn-outline btn-icon" onClick={() => navigate('/customers')} id="btn-back">
            <ArrowLeft size={16} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div className="avatar avatar-xl avatar-blue">{getInitials(customer.name)}</div>
            <div>
              <h1 className="page-title">{customer.name}</h1>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{customer._id}</span>
                <span className={`badge badge-${statusColor(customer.status)}`}>
                  <span className="badge-dot" />{customer.status}
                </span>
                {customer.smsEnabled && <span className="badge badge-info"><MessageSquare size={10} />SMS</span>}
                {customer.whatsapp && <span className="badge badge-success"><MessageCircle size={10} />WhatsApp</span>}
              </div>
            </div>
          </div>
        </div>
        <button className="btn btn-outline" onClick={() => navigate(`/customers/${id}/edit`)} id="btn-edit-customer">
          <Edit2 size={14} /> Edit Profile
        </button>
      </div>

      {/* Summary Cards */}
      <div className="stat-cards-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': '#2A9D8F', '--icon-bg': 'rgba(42,157,143,0.12)' }}>
          <div className="stat-card-top">
            <div className="stat-card-icon"><Wallet size={18} color="#2A9D8F" /></div>
          </div>
          <div className="stat-card-value">{formatCurrency(totalBalance)}</div>
          <div className="stat-card-label">Total Balance</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#06b6d4', '--icon-bg': 'rgba(6,182,212,0.12)' }}>
          <div className="stat-card-top">
            <div className="stat-card-icon"><Wallet size={18} color="#06b6d4" /></div>
          </div>
          <div className="stat-card-value">{custAccounts.length}</div>
          <div className="stat-card-label">Accounts</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#8B5CF6', '--icon-bg': 'rgba(139,92,246,0.12)' }}>
          <div className="stat-card-top">
            <div className="stat-card-icon"><CreditCard size={18} color="#8B5CF6" /></div>
          </div>
          <div className="stat-card-value">{custLoans.length}</div>
          <div className="stat-card-label">Loans</div>
        </div>
      </div>

      <div className="grid-1-2">
        {/* Profile Details */}
        <div className="card">
          <h3 className="card-title mb-4">Personal Information</h3>
          <div className="detail-rows">
            <div className="detail-row">
              <label>Full Name</label>
              <span>{customer.name}</span>
            </div>
            <div className="detail-row">
              <label>Gender</label>
              <span>{customer.gender}</span>
            </div>
            <div className="detail-row">
              <label>Date of Birth</label>
              <span>{formatDate(customer.dob)}</span>
            </div>
            <div className="detail-row">
              <label>Citizenship No.</label>
              <span style={{ fontFamily: 'monospace', color: 'var(--text-accent)' }}>{customer.citizenshipNo}</span>
            </div>
            <div className="detail-row">
              <label>Phone</label>
              <span><Phone size={12} style={{ marginRight: 4 }} />{customer.phone}</span>
            </div>
            {customer.email && (
              <div className="detail-row">
                <label>Email</label>
                <span>{customer.email}</span>
              </div>
            )}
            <div className="detail-row">
              <label>Address</label>
              <span>{customer.address}</span>
            </div>
            <div className="detail-row">
              <label>Branch</label>
              <span>{customer.branch}</span>
            </div>
            <div className="detail-row">
              <label>Member Since</label>
              <span>{formatDate(customer.joinDate)}</span>
            </div>
            <div className="detail-row">
              <label>WhatsApp</label>
              <span>{customer.whatsapp || '—'}</span>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Accounts */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Accounts</h3>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/accounts/new')} id="btn-open-account">+ Open Account</button>
            </div>
            {custAccounts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No accounts yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {custAccounts.map(acc => (
                  <div
                    key={acc._id}
                    onClick={() => navigate(`/accounts/${acc._id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 14px', borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-input)', cursor: 'pointer', border: '1px solid var(--border-input)',
                      transition: 'all 0.2s'
                    }}
                    className="hover-lift"
                  >
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{acc.accountNo}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{acc.type} • {acc.interestRate}% p.a.</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--emerald)' }}>{formatCurrency(acc.balance)}</p>
                      <span className={`badge badge-${statusColor(acc.status)}`} style={{ fontSize: 10 }}>{acc.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Loans */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Loans</h3>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/loans/new')} id="btn-apply-loan">Apply Loan</button>
            </div>
            {custLoans.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No loans</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {custLoans.map(loan => (
                  <div
                    key={loan._id}
                    onClick={() => navigate(`/loans/${loan._id}`)}
                    style={{
                      padding: '12px 14px', borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-input)', cursor: 'pointer', border: '1px solid var(--border-input)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-accent)' }}>{loan.loanNo}</span>
                      <span className={`badge badge-${statusColor(loan.status)}`} style={{ fontSize: 10 }}>{loan.status}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{loan.type} • {formatCurrency(loan.amount)}</span>
                      <span style={{ fontSize: 13, color: loan.outstanding > 0 ? 'var(--gold)' : 'var(--emerald)', fontWeight: 600 }}>
                        Outstanding: {formatCurrency(loan.outstanding)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card mt-6">
        <div className="card-header">
          <h3 className="card-title">Transaction History</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/transactions')}>View All</button>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Txn No.</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Account</th>
                <th>Date</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {custTransactions.slice(0, 8).map(t => (
                <tr key={t._id}>
                  <td className="td-mono">{t.txnNo}</td>
                  <td>
                    <span className={`badge ${t.type === 'Deposit' || t.type === 'Interest Credit' ? 'badge-success' : t.type === 'Withdrawal' ? 'badge-danger' : 'badge-info'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={`td-amount ${t.type === 'Withdrawal' ? 'debit' : 'credit'}`}>
                    {t.type === 'Withdrawal' ? '−' : '+'}{formatCurrency(t.amount)}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{t.accountNo}</td>
                  <td>{t.date} {t.time}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{t.remarks}</td>
                </tr>
              ))}
              {custTransactions.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No transactions</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
