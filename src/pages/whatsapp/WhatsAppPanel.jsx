import React, { useState } from 'react';
import { MessageCircle, Send, CheckCircle, Phone } from 'lucide-react';
import { whatsappLogs, customers } from '../../data/mockData';
import { formatDate, statusColor } from '../../utils/formatters';
import toast from 'react-hot-toast';

const WA_COMMANDS = [
  { cmd: 'BALANCE', desc: 'Check your current account balance', emoji: '💰' },
  { cmd: 'MINISTATEMENT', desc: 'View last 5 transactions', emoji: '📋' },
  { cmd: 'LOAN', desc: 'Check outstanding loan details', emoji: '🏦' },
  { cmd: 'HELP', desc: 'List all commands', emoji: '❓' },
];

function formatWAResponse(text) {
  return text.split('\n').map((line, i) => {
    const bold = line.replace(/\*(.*?)\*/g, (_, m) => `<strong>${m}</strong>`);
    return <p key={i} dangerouslySetInnerHTML={{ __html: bold }} style={{ marginBottom: 2 }} />;
  });
}

export default function WhatsAppPanel() {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [inputMsg, setInputMsg] = useState('');
  const [chatMessages, setChatMessages] = useState([]);

  const waCustomers = customers.filter(c => c.whatsapp);
  const effectiveCustomer = selectedCustomer || waCustomers[0]?._id || '';
  const customer = customers.find(c => c._id === effectiveCustomer);

  const botResponses = {
    BALANCE: `🏦 *Aama Cooperatives*\nDear ${customer?.name?.split(' ')[0]},\n\nAccount: SAV-001-0001\nType: Savings\nAvailable Balance: *NPR 45,200.00*\n\nDate: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} | ${new Date().toLocaleTimeString()}`,
    MINISTATEMENT: `🏦 *Mini Statement*\nAccount: SAV-001-0001\n\n1. +NPR 10,000 (Deposit) 28 Jun\n2. −NPR 3,000 (Transfer) 26 Jun\n3. +NPR 15,000 (Deposit) 24 Jun\n\nCurrent Bal: *NPR 45,200*\n_For full statement visit branch._`,
    LOAN: `🏦 *Loan Details*\nLoan No: LN-2024-001\nType: Agriculture\nOutstanding: NPR 72,000\nNext EMI: NPR 4,707 on 20 Jul 2024\n\nFor support: 061-520002`,
    HELP: `🏦 *Aama Cooperatives — WhatsApp Commands*\n\n💰 BALANCE — Check balance\n📋 MINISTATEMENT — Recent transactions\n🏦 LOAN — Loan details\n\n_24/7 banking at your fingertips_`,
  };

  const sendMessage = () => {
    const msg = inputMsg.trim().toUpperCase();
    if (!msg) return;
    const userMsg = { from: 'user', text: inputMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const botResp = botResponses[msg] || `Sorry, I didn't understand "*${inputMsg}*". Send HELP for available commands. -Aama Cooperatives`;
    const botMsg = { from: 'bank', text: botResp, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages(p => [...p, userMsg, botMsg]);
    setInputMsg('');
  };

  const totalWAMessages = whatsappLogs.length;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">WhatsApp Banking</h1>
          <p className="page-subtitle">Conversational banking via WhatsApp Business API</p>
        </div>
        <span className="badge badge-success" style={{ fontSize: 12, padding: '6px 14px' }}>
          <span className="badge-dot" /> WhatsApp Business Connected
        </span>
      </div>

      {/* Stats */}
      <div className="stat-cards-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': '#25D366' }}>
          <div className="stat-card-value">{waCustomers.length}</div>
          <div className="stat-card-label">WhatsApp Users</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#06b6d4' }}>
          <div className="stat-card-value">{totalWAMessages}</div>
          <div className="stat-card-label">Total Messages</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#2A9D8F' }}>
          <div className="stat-card-value">{whatsappLogs.filter(w => w.status === 'sent').length}</div>
          <div className="stat-card-label">Delivered</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#F59E0B' }}>
          <div className="stat-card-value">98.5%</div>
          <div className="stat-card-label">Delivery Rate</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Chat Simulator */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ width: 38, height: 38, background: '#25D366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle size={18} color="white" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Aama Cooperatives</p>
              <p style={{ fontSize: 11, color: '#25D366' }}>● Online</p>
            </div>
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Simulate as Customer</label>
            <select className="form-select" value={effectiveCustomer} onChange={e => { setSelectedCustomer(e.target.value); setChatMessages([]); }} id="wa-customer-select">
              {waCustomers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.whatsapp})</option>)}
            </select>
          </div>

          {/* Quick command buttons */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
            {WA_COMMANDS.map(c => (
              <button key={c.cmd} className="btn btn-outline btn-sm" onClick={() => setInputMsg(c.cmd)} id={`wa-cmd-${c.cmd.toLowerCase()}`}>
                {c.emoji} {c.cmd}
              </button>
            ))}
          </div>

          {/* Chat area */}
          <div className="whatsapp-chat" style={{ minHeight: 200, maxHeight: 300, overflowY: 'auto', marginBottom: 'var(--space-3)' }}>
            {chatMessages.length === 0 && (
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12, padding: '20px 0' }}>
                Select a command above or type a message below
              </p>
            )}
            {chatMessages.map((m, i) => (
              <div key={i} className={`bubble ${m.from === 'user' ? 'bubble-user' : 'bubble-bank'}`}>
                {formatWAResponse(m.text)}
                <span className="bubble-time">{m.time}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              id="wa-input"
              className="form-input"
              placeholder="Type BALANCE, MINISTATEMENT, LOAN or HELP..."
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              style={{ flex: 1 }}
            />
            <button className="btn btn-success btn-icon" onClick={sendMessage} disabled={!inputMsg.trim()} id="btn-wa-send">
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Commands + Message Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className="card">
            <h3 className="card-title mb-4">Available Commands</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {WA_COMMANDS.map(cmd => (
                <div key={cmd.cmd} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: '10px 14px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-input)' }}>
                  <span style={{ fontSize: 20 }}>{cmd.emoji}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{cmd.cmd}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cmd.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="card-title mb-4">Recent WhatsApp Queries</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {whatsappLogs.map(w => (
                <div key={w._id} style={{ padding: '10px 14px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-input)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{w.customerName}</span>
                    <span className={`badge badge-${statusColor(w.status)}`} style={{ fontSize: 10 }}>{w.status}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <code style={{ fontSize: 11, color: '#25D366', background: 'rgba(37,211,102,0.1)', padding: '1px 6px', borderRadius: 3 }}>{w.message}</code>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{w.sentAt ? formatDate(w.sentAt) : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
