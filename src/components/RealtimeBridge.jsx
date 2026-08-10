import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { mainApi } from '../store/mainApi';
import { connectSocket, disconnectSocket } from '../services/socket';
import { formatCurrency } from '../utils/formatters';

const fmt = (value) => (value !== undefined && value !== null ? formatCurrency(Number(value)) : '');

const sameId = (a, b) => a && b && String(a) === String(b);

function buildHandlers(currentUserId) {
  const invalidate = (tags) => (payload) => {
    try {
      mainApi.util.invalidateTags(tags);
    } catch {
      /* ignore */
    }
    return payload;
  };

  const notify = (tags, message, opts = {}) => (payload) => {
    // Always invalidate so data refreshes in real time; only suppress the
    // toast when the event concerns the current user's own action.
    const ownAction =
      opts.selfField && sameId(payload && payload[opts.selfField], currentUserId);
    try {
      mainApi.util.invalidateTags(tags);
    } catch {
      /* ignore */
    }
    if (ownAction) return payload;
    toast(message(payload), {
      id: opts.id || `rt-${Math.random()}`,
      duration: 4000
    });
    return payload;
  };

  return {
    'transaction:created': invalidate(['Transactions', 'Accounts', 'Member', 'Dashboard']),
    'account:created': invalidate(['Accounts', 'Member', 'Dashboard']),
    'withdrawal:created': notify(['Withdrawals', 'Member', 'Dashboard'], (p) => `New withdrawal request: ${fmt(p.amount)}`),
    'withdrawal:updated': notify(['Withdrawals', 'Transactions', 'Accounts', 'Member', 'Dashboard'], (p) => `Withdrawal ${p.status}: ${fmt(p.amount)}`),
    'loan:created': notify(['Loans', 'Member', 'Dashboard'], (p) => `New loan application: ${fmt(p.amount)} (${p.type || ''})`),
    'loan:updated': notify(['Loans', 'Member', 'Dashboard'], (p) => `Loan ${p.loanNo || ''} ${p.status ? p.status.replace(/_/g, ' ') : ''}`.trim()),
    'kyc:applied': notify(['Kyc', 'Cooperatives', 'customers'], () => 'New membership application received', { selfField: 'user' }),
    'kyc:updated': notify(['Kyc', 'Cooperatives', 'customers', 'Member', 'Auth'], (p) => `Membership application ${p.status ? p.status.replace(/_/g, ' ') : ''}`.trim(), { selfField: 'user' }),
    'membership:applied': notify(['customers'], () => 'New membership application received'),
    'membership:updated': notify(['customers', 'Cooperatives', 'Member', 'Auth'], (p) => `Membership ${p.status ? p.status.replace(/_/g, ' ') : ''}`.trim(), { selfField: 'userId' }),
    'payment:completed': notify(['Payments', 'Transactions', 'Accounts', 'Member', 'Dashboard'], (p) => `Payment of ${fmt(p?.payment?.amount)} completed`),
    'sms:sent': invalidate(['Sms']),
    'cooperative:updated': invalidate(['Cooperatives', 'Auth']),
    notification: notify([], (p) => p?.message || 'New notification')
  };
}

export default function RealtimeBridge() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user) {
      disconnectSocket();
      return undefined;
    }

    const socket = connectSocket();
    const handlers = buildHandlers(user?._id);
    const listeners = Object.entries(handlers).map(([event, handler]) => {
      socket.on(event, handler);
      return [event, handler];
    });

    return () => {
      listeners.forEach(([event, handler]) => socket.off(event, handler));
    };
  }, [user, dispatch]);

  return null;
}
