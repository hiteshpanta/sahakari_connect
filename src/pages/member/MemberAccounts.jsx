import React, { useState, useEffect } from 'react';
import { Wallet, Plus, Minus, Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate, statusColor } from '../../utils/formatters';
import EsewaModal from '../../components/Payment/EsewaModal';
import CooperativeSwitcher from '../../components/member/CooperativeSwitcher';
import toast from 'react-hot-toast';
import { useGetMemberAccountsQuery } from '../../store/mainApi';
import { useMemberCooperative } from '../../context/MemberCooperativeContext';

const accountTone = (type) => {
  if (type === 'Current') return { a: '#dbeafe', b: '#eff6ff', chip: '#2563eb' };
  if (type === 'Fixed Deposit') return { a: '#ede9fe', b: '#f5f3ff', chip: '#7c3aed' };
  return { a: '#d1fae5', b: '#f0fdf4', chip: '#2A9D8F' };
};

export default function MemberAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [esewaModal, setEsewaModal] = useState(null); // { purpose, account }
  const [depositAmount, setDepositAmount] = useState(1000);

  const { activeCoopId, activeCoop } = useMemberCooperative();

  const { data: accountsData, isLoading, isError, error: accountsError, refetch, isUninitialized } = useGetMemberAccountsQuery(activeCoopId, { skip: !activeCoopId });

  const loadAccounts = () => {
    if (isUninitialized) return;
    setLoading(true);
    refetch();
  };

  useEffect(() => {
    setLoading(isLoading);
    if (isError) {
      setError(accountsError?.data?.message || 'Failed to load your accounts');
    } else if (accountsData !== undefined) {
      setAccounts(accountsData);
    }
  }, [accountsData, isLoading, isError, accountsError]);

  useEffect(loadAccounts, []);

  const handleDeposit = (account) => {
    setDepositAmount(1000);
    setEsewaModal({ purpose: 'savings_deposit', account });
  };

  const handleWithdraw = (account) => {
    setDepositAmount(account.balance > 1000 ? 1000 : account.balance);
    setEsewaModal({ purpose: 'withdrawal', account });
  };

  const handlePaymentSuccess = (receipt) => {
    setEsewaModal(null);
    toast.success(receipt?.transactionCode ? 'Payment successful via eSewa!' : 'Transaction completed!');
    loadAccounts();
  };

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="glass-page animate-fade-in">
      <div className="glass-orb glass-orb-1" />
      <div className="glass-orb glass-orb-2" />

      <div className="glass-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Accounts</h1>
            <p className="page-subtitle">
              View and manage your deposit accounts
              {activeCoop?.cooperative?.name ? ` • ${activeCoop.cooperative.name}` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <CooperativeSwitcher compact />
            {!loading && accounts.length > 0 && (
              <span className="glass-chip glass-chip-solid">
                <Wallet size={14} /> Total: {formatCurrency(totalBalance)}
              </span>
            )}
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
        ) : accounts.length > 0 ? (
          <div className="grid-3">
            {accounts.map((account) => {
              const tone = accountTone(account.type);
              return (
                <div
                  key={account._id}
                  className="glass-account-card"
                  style={{ '--acc-grad-a': tone.a, '--acc-grad-b': tone.b }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span className="glassy-stat-icon" style={{ background: 'rgba(255,255,255,0.85)', color: tone.chip, boxShadow: '0 6px 16px rgba(15,23,42,0.1)' }}>
                        <Wallet size={20} />
                      </span>
                      <div>
                        <h3 style={{ fontSize: 15.5, fontWeight: 700 }}>{account.type} Account</h3>
                        <p className="glass-account-num">{account.accountNo}</p>
                      </div>
                    </div>
                    <span className={`badge ${statusColor(account.status)}`}>{account.status}</span>
                  </div>

                  <div style={{ marginTop: 20 }}>
                    <p style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>Available Balance</p>
                    <div className="glass-account-balance" style={{ marginTop: 4 }}>{formatCurrency(account.balance)}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, borderTop: '1px solid rgba(15,23,42,0.1)', paddingTop: 14, marginTop: 18 }}>
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Interest Rate</p>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>{account.interestRate}% p.a.</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Opened On</p>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>{formatDate(account.openDate)}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '8px 12px', fontSize: 12.5 }}
                      onClick={() => handleDeposit(account)}
                    >
                      <Plus size={15} /> Deposit
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{ flex: 1, padding: '8px 12px', fontSize: 12.5, color: '#ef4444', borderColor: 'rgba(239,68,68,0.35)' }}
                      onClick={() => handleWithdraw(account)}
                      disabled={account.balance <= 0}
                    >
                      <Minus size={15} /> Withdraw
                    </button>
                    <span className="glass-chip" style={{ color: tone.chip, background: 'rgba(255,255,255,0.7)' }}>
                      {account.branch || 'Main'}
                    </span>
                  </div>
                  <p style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>
                    <Wallet size={11} style={{ verticalAlign: '-2px' }} /> Deposit & withdraw via eSewa wallet
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card glass-empty">
            <Wallet size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <h3>No Accounts Found</h3>
            <p style={{ marginTop: 4 }}>You do not have any accounts linked to your profile.</p>
          </div>
        )}
      </div>

      {esewaModal && (
        <EsewaModal
          isOpen={!!esewaModal}
          onClose={() => setEsewaModal(null)}
          amount={depositAmount}
          purpose={esewaModal.purpose}
          entityId={esewaModal.account._id}
          entityModel="Account"
          account={esewaModal.account}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
