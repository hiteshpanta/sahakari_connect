import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle, XCircle, Phone, Loader2 } from 'lucide-react';
import { smsLogs as mockSmsLogs, customers as mockCustomers } from '../../data/mockData';
import { formatDate, statusColor } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { useGetCustomersQuery, useGetSmsLogsQuery, useSendSmsMutation } from '../../store/mainApi';
import { Formik } from 'formik';
import * as Yup from 'yup';

const SMS_COMMANDS = [
  { cmd: 'BAL {account_no}', desc: 'Check account balance', example: 'BAL SAV-001-0001' },
  { cmd: 'MINI {account_no}', desc: 'Last 5 transactions', example: 'MINI SAV-001-0001' },
  { cmd: 'LOAN {loan_no}', desc: 'Loan outstanding details', example: 'LOAN LN-2024-001' },
  { cmd: 'HELP', desc: 'List all available commands', example: 'HELP' },
];

const smsSchema = Yup.object({
  recipient: Yup.string().required('Select a recipient'),
  message: Yup.string()
    .trim()
    .max(160, 'Message cannot exceed 160 characters')
    .required('Enter a message to send'),
});

export default function SMSBankingPanel() {
  const [simCmd, setSimCmd] = useState('');
  const [simPhone, setSimPhone] = useState('');
  const [simResult, setSimResult] = useState(null);

  const [customersList, setCustomersList] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const { data: customersData, isLoading: customersLoading, isError: customersError } = useGetCustomersQuery();
  const { data: smsLogsData, isLoading: logsLoading, isError: logsError } = useGetSmsLogsQuery();
  const [sendSmsMutation] = useSendSmsMutation();

  useEffect(() => {
    if (customersError) {
      setCustomersList(mockCustomers.filter((c) => c.phone));
    } else if (customersData !== undefined) {
      const custs = Array.isArray(customersData) ? customersData.filter((c) => c.phone) : [];
      setCustomersList(custs);
      if (custs.length > 0) setSimPhone(custs[0].phone);
    }
  }, [customersData, customersError]);

  useEffect(() => {
    if (logsError) {
      setLogs(mockSmsLogs);
    } else if (smsLogsData !== undefined) {
      setLogs(Array.isArray(smsLogsData) && smsLogsData.length > 0 ? smsLogsData : mockSmsLogs);
    }
  }, [smsLogsData, logsError]);

  useEffect(() => {
    setLoading(customersLoading || logsLoading);
  }, [customersLoading, logsLoading]);

  const simulate = () => {
    const cmd = simCmd.trim().toUpperCase();
    const customer = customersList.find(c => c.phone === simPhone) || mockCustomers.find(c => c.phone === simPhone);
    let response = '';

    if (!customer) {
      response = `Phone ${simPhone} is not registered. Contact your branch.`;
    } else if (cmd.startsWith('BAL')) {
      response = `Dear ${customer.name.split(' ')[0]}, Your A/C Available Balance: NPR 45,200.00. Date: ${new Date().toLocaleDateString()}. - Aama Cooperatives`;
    } else if (cmd.startsWith('MINI')) {
      response = `Mini Statement for ${customer.name.split(' ')[0]}: 1) +10,000 Dep 28Jun | 2) -3,000 WD 26Jun | 3) +15,000 Dep 24Jun. Bal: NPR 45,200. -Aama Cooperatives`;
    } else if (cmd.startsWith('LOAN')) {
      response = `Loan Outstanding: NPR 72,000. Next EMI: NPR 4,707 on 20 Jul 2024. Contact: 061-520002. -Aama Cooperatives`;
    } else if (cmd === 'HELP') {
      response = `Aama Cooperatives SMS Commands: BAL <accno>, MINI <accno>, LOAN <loanno>. Support: 061-520002`;
    } else {
      response = `Invalid command. Send HELP for list of commands. -Aama Cooperatives`;
    }

    setSimResult({ cmd: simCmd, response, time: new Date().toLocaleTimeString() });
    toast.success('SMS simulated!');
  };

  const smsEnabled = customersList.length;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">SMS Banking</h1>
          <p className="page-subtitle">Send SMS to customers and manage SMS banking services</p>
        </div>
        <span className="badge badge-success" style={{ fontSize: 12, padding: '6px 14px' }}>
          <span className="badge-dot" /> Service Active
        </span>
      </div>

      {/* Stats */}
      <div className="stat-cards-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': '#2A9D8F' }}>
          <div className="stat-card-value">{smsEnabled}</div>
          <div className="stat-card-label">SMS-Enabled Customers</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#06b6d4' }}>
          <div className="stat-card-value">{logs.length}</div>
          <div className="stat-card-label">Total SMS Messages</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#F59E0B' }}>
          <div className="stat-card-value">{logs.filter(s => s.status === 'delivered' || s.status === 'sent').length}</div>
          <div className="stat-card-label">Delivered</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#EF4444' }}>
          <div className="stat-card-value">{logs.filter(s => s.status === 'failed').length}</div>
          <div className="stat-card-label">Failed</div>
        </div>
      </div>

      <div className="grid-2 mb-6">
        {/* Send SMS to customer */}
        <div className="card">
          <h3 className="card-title mb-4">Send SMS to Customer</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
            Send a message directly to a customer&apos;s mobile number. Sent messages are logged automatically.
          </p>
          <Formik
            initialValues={{ recipient: '', message: '' }}
            validationSchema={smsSchema}
            onSubmit={async (values, { setFieldValue }) => {
              try {
                const json = await sendSmsMutation({ phone: values.recipient, message: values.message.trim() }).unwrap();
                toast.success(`SMS sent to ${json.to || values.recipient}`);
                setFieldValue('message', '');
                if (json.log) setLogs(prev => [json.log, ...prev.filter(l => l._id !== json.log._id)]);
              } catch (err) {
                toast.error(err?.data?.message || 'Failed to send SMS');
              }
            }}
          >
            {({ values, handleChange, handleSubmit, errors, touched, isSubmitting }) => (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Recipient *</label>
                  <div className="input-wrapper">
                    <Phone size={14} className="input-icon" />
                    <select className="form-select" style={{ paddingLeft: 36 }} name="recipient" value={values.recipient} onChange={handleChange} id="sms-recipient" disabled={loading}>
                      <option value="">Select a customer...</option>
                      {customersList.map(c => (
                        <option key={c._id} value={c.phone}>{c.phone} — {c.name}</option>
                      ))}
                    </select>
                  </div>
                  {touched.recipient && errors.recipient && <p className="text-red-500 text-sm mt-1">{errors.recipient}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea
                    id="sms-message"
                    className="form-input"
                    rows={4}
                    style={{ width: '100%', resize: 'vertical' }}
                    placeholder="Type your SMS message (max 160 characters)..."
                    name="message"
                    value={values.message}
                    maxLength={160}
                    onChange={handleChange}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{values.message.length}/160</span>
                  </div>
                  {touched.message && errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                </div>

                <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting || loading} id="btn-send-sms" style={{ justifyContent: 'center' }}>
                  {isSubmitting ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
                  Send SMS
                </button>
              </form>
            )}
          </Formik>
        </div>

        {/* SMS Command Simulator */}
        <div className="card">
          <h3 className="card-title mb-4">SMS Command Simulator</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
            Test SMS banking commands as a customer would send them.
          </p>
          <div className="form-group mb-3">
            <label className="form-label">Customer Phone</label>
            <div className="input-wrapper">
              <Phone size={14} className="input-icon" />
              <select className="form-select" style={{ paddingLeft: 36 }} value={simPhone} onChange={e => setSimPhone(e.target.value)} id="sim-phone" disabled={loading}>
                {customersList.map(c => (
                  <option key={c._id} value={c.phone}>{c.phone} — {c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group mb-4">
            <label className="form-label">SMS Command</label>
            <input
              id="sim-command"
              className="form-input"
              placeholder="e.g. BAL SAV-001-0001"
              value={simCmd}
              onChange={e => setSimCmd(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && simulate()}
            />
          </div>
          <button className="btn btn-outline w-full" onClick={simulate} disabled={!simCmd.trim() || loading} id="btn-simulate-sms" style={{ justifyContent: 'center' }}>
            <Send size={14} /> Simulate Command
          </button>

          {simResult && (
            <div style={{ marginTop: 'var(--space-4)' }}>
              <div className="sms-terminal">
                <p><span style={{ color: 'var(--text-muted)', fontSize: 11 }}>From: {simPhone}</span></p>
                <p className="cmd">&gt; {simResult.cmd}</p>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '8px 0' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>Reply ({simResult.time}):</p>
                <p className="resp">{simResult.response}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Commands Reference */}
      <div className="card mb-6">
        <h3 className="card-title mb-4">Supported SMS Commands</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {SMS_COMMANDS.map(cmd => (
            <div key={cmd.cmd} style={{
              padding: 'var(--space-4)',
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-input)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <code style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: 4 }}>{cmd.cmd}</code>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{cmd.desc}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Example: <code style={{ color: 'var(--emerald)' }}>{cmd.example}</code></p>
            </div>
          ))}
        </div>
      </div>

      {/* SMS Logs */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">SMS Log</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Recent sent messages</span>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>Customer</th><th>Phone</th><th>Message</th><th>Date & Time</th><th>Status</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 40 }}>
                    <Loader2 size={22} className="spin" style={{ color: 'var(--emerald)' }} />
                  </td>
                </tr>
              ) : logs.map(s => (
                <tr key={s._id}>
                  <td className="td-primary">{s.customerName || '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.phone}</td>
                  <td>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.message}</span>
                    {s.command && (
                      <code style={{ fontSize: 12, color: 'var(--gold)', background: 'rgba(245,158,11,0.08)', padding: '2px 8px', borderRadius: 4 }}>{s.command}</code>
                    )}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {s.sentAt ? formatDate(s.sentAt) : s.date ? `${s.date} ${s.time || ''}` : ''}
                  </td>
                  <td>
                    <span className={`badge badge-${statusColor(s.status)}`}>
                      {s.status === 'failed' ? <XCircle size={10} /> : <CheckCircle size={10} />}
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && logs.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon"><MessageSquare size={22} /></div>
              <h3>No SMS messages yet</h3>
              <p>Send your first SMS to a customer to see it here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
