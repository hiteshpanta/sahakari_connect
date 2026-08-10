import React, { useState } from 'react';
import { Download, BarChart2, FileText, TrendingUp, Users } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { transactions, loans, customers, branchPerformanceData, monthlyTransactionData, loanPortfolioData } from '../../data/mockData';
import { formatCurrency } from '../../utils/formatters';
import { exportReportPdf } from '../../utils/pdfExport';
import toast from 'react-hot-toast';

const TABS = ['Daily Transactions', 'Monthly Summary', 'Loan Portfolio', 'Branch Performance'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 8, padding: '10px 14px' }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ fontSize: 12, color: p.color, fontWeight: 600 }}>
            {p.name}: {typeof p.value === 'number' && p.value > 10000 ? formatCurrency(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState(0);

  const todayTxns = transactions.filter(t => t.date === '2024-06-28');
  const todayDeposits = todayTxns.filter(t => t.type === 'Deposit').reduce((s, t) => s + t.amount, 0);
  const todayWithdrawals = todayTxns.filter(t => t.type === 'Withdrawal').reduce((s, t) => s + t.amount, 0);

  const handleExport = async () => {
    const activeLoans = loans.filter(l => l.status === 'active');
    const reportConfig = {
      0: {
        title: 'Daily Transaction Report',
        subtitle: `${todayTxns.length} transactions processed on 28 Jun 2024`,
        filename: 'daily-transactions-report',
        columns: [
          { header: 'Txn No.' },
          { header: 'Customer' },
          { header: 'Type' },
          { header: 'Amount', align: 'right' },
          { header: 'Branch' },
          { header: 'Time' },
        ],
        rows: todayTxns.map(t => [
          t.txnNo, t.customerName, t.type, formatCurrency(t.amount), t.branch, t.time
        ]),
        summary: [
          { label: 'Total Deposits', value: formatCurrency(todayDeposits) },
          { label: 'Total Withdrawals', value: formatCurrency(todayWithdrawals) },
          { label: 'Net', value: formatCurrency(todayDeposits - todayWithdrawals) },
        ],
      },
      1: {
        title: 'Monthly Financial Summary',
        subtitle: 'Transaction trends over 6 months',
        filename: 'monthly-summary-report',
        columns: [
          { header: 'Month' },
          { header: 'Deposits', align: 'right' },
          { header: 'Withdrawals', align: 'right' },
        ],
        rows: monthlyTransactionData.map(m => [
          m.month, formatCurrency(m.deposits), formatCurrency(m.withdrawals)
        ]),
        summary: [
          { label: 'Total Deposits', value: formatCurrency(monthlyTransactionData.reduce((s, m) => s + m.deposits, 0)) },
          { label: 'Total Withdrawals', value: formatCurrency(monthlyTransactionData.reduce((s, m) => s + m.withdrawals, 0)) },
        ],
      },
      2: {
        title: 'Loan Portfolio Report',
        subtitle: `${loans.length} total applications, ${activeLoans.length} active`,
        filename: 'loan-portfolio-report',
        columns: [
          { header: 'Loan No.' },
          { header: 'Customer' },
          { header: 'Type' },
          { header: 'Amount', align: 'right' },
          { header: 'Outstanding', align: 'right' },
          { header: 'Status' },
        ],
        rows: loans.map(l => [
          l.loanNo, l.customerName, l.type, formatCurrency(l.amount), formatCurrency(l.outstanding || 0), l.status
        ]),
        summary: [
          { label: 'Active Loans', value: String(activeLoans.length) },
          { label: 'Total Outstanding', value: formatCurrency(activeLoans.reduce((s, l) => s + (l.outstanding || 0), 0)) },
          { label: 'Total Applications', value: String(loans.length) },
        ],
      },
      3: {
        title: 'Branch Performance Report',
        subtitle: 'Deposits and loans by branch',
        filename: 'branch-performance-report',
        columns: [
          { header: 'Branch' },
          { header: 'Deposits', align: 'right' },
          { header: 'Loans', align: 'right' },
        ],
        rows: branchPerformanceData.map(b => [
          b.name, formatCurrency(b.deposits), formatCurrency(b.loans)
        ]),
        summary: [
          { label: 'Total Deposits', value: formatCurrency(branchPerformanceData.reduce((s, b) => s + b.deposits, 0)) },
          { label: 'Total Loans', value: formatCurrency(branchPerformanceData.reduce((s, b) => s + b.loans, 0)) },
        ],
      },
    };

    const config = reportConfig[activeTab];
    try {
      await exportReportPdf({
        title: config.title,
        subtitle: config.subtitle,
        filename: config.filename,
        columns: config.columns,
        rows: config.rows,
        summary: config.summary,
      });
      toast.success('Report exported as PDF');
    } catch {
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Financial reports and analytics</p>
        </div>
        <button className="btn btn-outline" onClick={handleExport} id="btn-export-report">
          <Download size={14} /> Export PDF
        </button>
      </div>

      {/* Report Type Cards */}
      <div className="stat-cards-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card" style={{ '--card-accent': '#06b6d4', cursor: 'pointer' }} onClick={() => setActiveTab(0)}>
          <div className="stat-card-top"><div className="stat-card-icon"><BarChart2 size={18} color="#06b6d4" /></div></div>
          <div className="stat-card-value">{todayTxns.length}</div>
          <div className="stat-card-label">Today's Transactions</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#2A9D8F', cursor: 'pointer' }} onClick={() => setActiveTab(1)}>
          <div className="stat-card-top"><div className="stat-card-icon"><TrendingUp size={18} color="#2A9D8F" /></div></div>
          <div className="stat-card-value">{formatCurrency(todayDeposits)}</div>
          <div className="stat-card-label">Today's Deposits</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#8B5CF6', cursor: 'pointer' }} onClick={() => setActiveTab(2)}>
          <div className="stat-card-top"><div className="stat-card-icon"><FileText size={18} color="#8B5CF6" /></div></div>
          <div className="stat-card-value">{loans.filter(l => l.status === 'active').length}</div>
          <div className="stat-card-label">Active Loans</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#F59E0B', cursor: 'pointer' }} onClick={() => setActiveTab(3)}>
          <div className="stat-card-top"><div className="stat-card-icon"><Users size={18} color="#F59E0B" /></div></div>
          <div className="stat-card-value">{customers.length}</div>
          <div className="stat-card-label">Total Members</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs mb-6">
        {TABS.map((t, i) => (
          <button key={t} className={`tab ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)} id={`tab-report-${i}`}>{t}</button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 0 && (
        <div className="animate-fade-in">
          <div className="card mb-5">
            <div className="card-header">
              <div>
                <h3 className="card-title">Daily Transaction Report — 28 Jun 2024</h3>
                <p className="card-subtitle">All transactions processed today</p>
              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr><th>Txn No.</th><th>Customer</th><th>Type</th><th>Amount</th><th>Branch</th><th>Time</th></tr>
                </thead>
                <tbody>
                  {todayTxns.map(t => (
                    <tr key={t._id}>
                      <td className="td-mono">{t.txnNo}</td>
                      <td className="td-primary">{t.customerName}</td>
                      <td><span className={`badge ${t.type === 'Deposit' ? 'badge-success' : 'badge-danger'}`}>{t.type}</span></td>
                      <td className={`td-amount ${t.type === 'Withdrawal' ? 'debit' : 'credit'}`}>{formatCurrency(t.amount)}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.branch}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-6)', padding: 'var(--space-4) var(--space-5)', borderTop: '1px solid var(--border-color)', justifyContent: 'flex-end' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Deposits</p>
                <p style={{ fontWeight: 700, color: 'var(--emerald)' }}>{formatCurrency(todayDeposits)}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Withdrawals</p>
                <p style={{ fontWeight: 700, color: 'var(--red-light)' }}>{formatCurrency(todayWithdrawals)}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Net</p>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(todayDeposits - todayWithdrawals)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div className="animate-fade-in">
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Monthly Financial Summary — Jan to Jun 2024</h3>
                <p className="card-subtitle">Transaction trends over 6 months</p>
              </div>
            </div>
            <div className="chart-wrapper" style={{ height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTransactionData}>
                  <defs>
                    <linearGradient id="gradDep" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradWD" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradTr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2A9D8F" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2A9D8F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={v => `${v/1000}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="deposits" name="Deposits" stroke="#06b6d4" fill="url(#gradDep)" strokeWidth={2} />
                  <Area type="monotone" dataKey="withdrawals" name="Withdrawals" stroke="#EF4444" fill="url(#gradWD)" strokeWidth={2} />
                  <Area type="monotone" dataKey="transfers" name="Transfers" stroke="#2A9D8F" fill="url(#gradTr)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div className="animate-fade-in grid-2">
          <div className="card">
            <div className="card-header"><h3 className="card-title">Loan Portfolio Distribution</h3></div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={loanPortfolioData} cx="50%" cy="45%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                    {loanPortfolioData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={v => `${v}%`} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 8 }} />
                  <Legend iconType="circle" formatter={v => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card">
            <h3 className="card-title mb-4">Loan Summary</h3>
            <div className="detail-rows">
              <div className="detail-row"><label>Total Applications</label><span>{loans.length}</span></div>
              <div className="detail-row"><label>Active</label><span style={{ color: 'var(--emerald)', fontWeight: 600 }}>{loans.filter(l => l.status === 'active').length}</span></div>
              <div className="detail-row"><label>Pending Approval</label><span style={{ color: 'var(--gold)', fontWeight: 600 }}>{loans.filter(l => l.status === 'pending').length}</span></div>
              <div className="detail-row"><label>Closed</label><span>{loans.filter(l => l.status === 'closed').length}</span></div>
              <div className="detail-row"><label>Rejected</label><span style={{ color: 'var(--red-light)' }}>{loans.filter(l => l.status === 'rejected').length}</span></div>
              <div className="detail-row"><label>Total Outstanding</label><span style={{ fontWeight: 700, color: 'var(--gold)' }}>{formatCurrency(loans.filter(l => l.status === 'active').reduce((s, l) => s + l.outstanding, 0))}</span></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 3 && (
        <div className="animate-fade-in">
          <div className="card">
            <div className="card-header"><h3 className="card-title">Branch Performance Comparison</h3></div>
            <div className="chart-wrapper" style={{ height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchPerformanceData} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="branch" tick={{ fill: '#64748B', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="customers" name="Customers" fill="#06b6d4" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="accounts" name="Accounts" fill="#2A9D8F" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="loans" name="Loans" fill="#F59E0B" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
