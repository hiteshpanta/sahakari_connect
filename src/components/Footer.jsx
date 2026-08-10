import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, Mail, Phone, MapPin, Globe, AtSign, Share2, Rss, ChevronRight } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="app-footer">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Top row: brand + columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, paddingBottom: 36 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #2A9D8F, #21867A)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(42,157,143,0.4)' }}>
                <Landmark size={22} color="white" />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Aama Cooperatives</h3>
                <span style={{ fontSize: 11, color: 'var(--emerald)' }}>Cloud-Based Rural Banking</span>
              </div>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-muted)', margin: 0, maxWidth: 280 }}>
              Empowering local cooperatives and rural communities with secure, modern and accessible financial technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Platform</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {[
                { label: 'Marketplace', to: '/marketplace' },
                { label: 'Become a Member', to: '/register' },
                { label: 'Sign In', to: '/login' },
              ].map(link => (
                <a key={link.label} href="#!" onClick={(e) => { e.preventDefault(); navigate(link.to); }}
                   style={{ fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ChevronRight size={13} color="#2A9D8F" /> {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
                <Mail size={15} color="#2A9D8F" /> support@aamacooperatives.com
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
                <Phone size={15} color="#2A9D8F" /> +977 01-5551234
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
                <MapPin size={15} color="#2A9D8F" /> Kathmandu, Nepal
              </span>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Follow Us</h4>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { icon: Globe, label: 'Website' },
                { icon: AtSign, label: 'Social' },
                { icon: Share2, label: 'Share' },
                { icon: Rss, label: 'Updates' },
              ].map(({ icon: Icon, label }) => (
                <a key={label} href="#!" onClick={(e) => e.preventDefault()}
                   title={label}
                   style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(42,157,143,0.08)', border: '1px solid rgba(42,157,143,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.2s' }}
                   onMouseOver={e => { e.currentTarget.style.background = '#2A9D8F'; e.currentTarget.style.color = '#fff'; }}
                   onMouseOut={e => { e.currentTarget.style.background = 'rgba(42,157,143,0.08)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(42,157,143,0.15)', paddingTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} Aama Cooperatives. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: 20 }}>
            <a href="#!" onClick={(e) => e.preventDefault()} style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Privacy Policy</a>
            <a href="#!" onClick={(e) => e.preventDefault()} style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
