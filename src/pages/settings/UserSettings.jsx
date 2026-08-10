import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Palette, Sun, Moon, Monitor, Bell, User, Check, Mail, MessageSquare, MessageCircle, Megaphone, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { getInitials } from '../../utils/formatters';

const THEME_OPTIONS = [
  { id: 'light', label: 'Light', icon: Sun, desc: 'Bright, airy glass surfaces' },
  { id: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes at night' },
  { id: 'system', label: 'System', icon: Monitor, desc: 'Follow your device setting' }
];

const NOTIFICATION_KEY = 'aama_notif_prefs';

const DEFAULT_NOTIFS = {
  email: true,
  sms: true,
  whatsapp: false,
  marketing: false
};

export default function UserSettings() {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const { mode, setMode, resolvedDark } = useTheme();

  const [tab, setTab] = useState('appearance');
  const [notifs, setNotifs] = useState(DEFAULT_NOTIFS);

  const userId = user?.id || user?._id || user?.userId;

  useEffect(() => {
    if (!userId) return;
    try {
      const stored = JSON.parse(localStorage.getItem(`${NOTIFICATION_KEY}_${userId}`) || 'null');
      if (stored && typeof stored === 'object') setNotifs({ ...DEFAULT_NOTIFS, ...stored });
    } catch {}
  }, [userId]);

  const saveNotifs = (next) => {
    setNotifs(next);
    if (!userId) return;
    try {
      localStorage.setItem(`${NOTIFICATION_KEY}_${userId}`, JSON.stringify(next));
    } catch {}
    toast.success('Notification preferences saved');
  };

  const toggleNotif = (key) => saveNotifs({ ...notifs, [key]: !notifs[key] });

  const tabButton = (id, Icon, label) => (
    <button
      className={tab === id ? 'btn btn-primary' : 'btn btn-outline'}
      onClick={() => setTab(id)}
      style={{ justifyContent: 'flex-start' }}
    >
      <Icon size={16} /> {label}
    </button>
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Personalize your appearance, notifications and account</p>
        </div>
      </div>

      <div className="grid-1-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tabButton('appearance', Palette, 'Appearance')}
          {tabButton('notifications', Bell, 'Notifications')}
          {tabButton('account', User, 'My Account')}
        </div>

        <div className="card" style={{ padding: 28 }}>
          {/* ---------- Appearance ---------- */}
          {tab === 'appearance' && (
            <div>
              <h3 className="card-title mb-1">Theme</h3>
              <p className="page-subtitle" style={{ marginBottom: 20 }}>
                Choose how {user?.name?.split(' ')[0] || 'the app'} looks. This preference is remembered for your account on this device.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {THEME_OPTIONS.map(({ id, label, icon: Icon, desc }) => {
                  const active = mode === id;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        setMode(id);
                        toast.success(`${label} theme applied`);
                      }}
                      style={{
                        padding: 20,
                        borderRadius: 14,
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'inherit',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        background: active
                          ? 'linear-gradient(135deg, rgba(42,157,143,0.14), rgba(6,182,212,0.1))'
                          : 'var(--glass-bg-soft)',
                        border: active
                          ? '2px solid var(--emerald)'
                          : '1px solid var(--glass-border)',
                        boxShadow: active ? '0 8px 24px rgba(42,157,143,0.18)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 12,
                          background: active ? 'linear-gradient(135deg, #2A9D8F, #21867A)' : 'var(--glass-bg-strong)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: active ? '#fff' : 'var(--text-primary)'
                        }}>
                          <Icon size={20} />
                        </div>
                        {active && <Check size={18} color="var(--emerald)" />}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{label}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-muted)' }}>
                <ShieldCheck size={15} color="var(--emerald)" />
                Currently using <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{resolvedDark ? 'Dark' : 'Light'}</strong> mode.
              </div>
            </div>
          )}

          {/* ---------- Notifications ---------- */}
          {tab === 'notifications' && (
            <div>
              <h3 className="card-title mb-1">Notifications</h3>
              <p className="page-subtitle" style={{ marginBottom: 20 }}>
                Choose which banking alerts you receive.
              </p>

              {[
                { key: 'email', icon: Mail, label: 'Email Alerts', desc: 'Statements, approvals and important updates via email' },
                { key: 'sms', icon: MessageSquare, label: 'SMS Banking', desc: 'Balance and mini-statement replies via SMS' },
                { key: 'whatsapp', icon: MessageCircle, label: 'WhatsApp Updates', desc: 'Transaction confirmations on WhatsApp' },
                { key: 'marketing', icon: Megaphone, label: 'Product & Offers', desc: 'New savings and loan products from your cooperative' }
              ].map(({ key, icon: Icon, label, desc }) => (
                <div
                  key={key}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: 14,
                    background: 'var(--glass-bg-soft)',
                    border: '1px solid var(--glass-border)',
                    marginBottom: 12
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: 'linear-gradient(135deg, rgba(42,157,143,0.15), rgba(6,182,212,0.12))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--emerald)', flexShrink: 0
                  }}>
                    <Icon size={17} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{label}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</p>
                  </div>
                  <button
                    onClick={() => toggleNotif(key)}
                    aria-label={`Toggle ${label}`}
                    style={{
                      width: 46, height: 26, borderRadius: 999,
                      border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
                      background: notifs[key] ? 'var(--emerald)' : 'var(--border-strong)',
                      position: 'relative', transition: 'background 0.2s ease'
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: 3,
                      left: notifs[key] ? 23 : 3,
                      width: 20, height: 20, borderRadius: '50%',
                      background: '#fff', boxShadow: '0 2px 6px rgba(15,23,42,0.3)',
                      transition: 'left 0.2s ease'
                    }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ---------- Account ---------- */}
          {tab === 'account' && (
            <div>
              <h3 className="card-title mb-1">My Account</h3>
              <p className="page-subtitle" style={{ marginBottom: 20 }}>
                Your profile and role on the platform.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 20,
                  background: 'linear-gradient(135deg, #2A9D8F, #0e7490)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 800, color: '#fff',
                  boxShadow: '0 10px 28px rgba(42,157,143,0.4)'
                }}>
                  {getInitials(user?.name)}
                </div>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>{user?.name}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role} account</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  ['Name', user?.name],
                  ['Email', user?.email],
                  ['Role', user?.role],
                  ['Branch', user?.branch || '—'],
                  ['Cooperative', user?.cooperativeName || user?.cooperativeId || '—']
                ].map(([label, val]) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 16px', borderRadius: 12,
                      background: 'var(--glass-bg-soft)', border: '1px solid var(--glass-border)'
                    }}
                  >
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right' }}>{val}</span>
                  </div>
                ))}
              </div>

              {user?.role === 'member' && (
                <button className="btn btn-outline" onClick={() => navigate('/member/profile')} style={{ width: '100%' }}>
                  <User size={15} /> Edit My Profile
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
