import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MapPin, Phone, Mail, CheckCircle2, Landmark, ArrowLeft, Percent, Wallet, Info, FileText, Calendar } from 'lucide-react';
import { cooperatives, cooperativeProfiles } from '../../data/mockData';
import { formatDate } from '../../utils/formatters';
import Footer from '../../components/Footer';
import UserMenu from '../../components/UserMenu';
import { useGetPublicCooperativeQuery } from '../../store/mainApi';

export default function CooperativeProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { data: coopData, isLoading, isError } = useGetPublicCooperativeQuery(id);

  useEffect(() => {
    setLoading(isLoading);
    if (isError) {
      // Fallback to mock data
      const coop = cooperatives.find(c => c._id === id);
      if (coop) {
        const profile = cooperativeProfiles.find(p => p.cooperativeId === id) || {};
        setData({ cooperative: coop, profile });
      }
    } else if (coopData !== undefined) {
      setData(coopData);
    }
  }, [coopData, isLoading, isError, id]);

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading Profile...</div>;
  }

  if (!data || !data.cooperative) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red-light)' }}>Cooperative not found.</div>;
  }

  const { cooperative: coop, profile } = data;
  const hasBanner = !!profile.banner;

  return (
    <div className="profile-page" style={{ minHeight: '100vh', background: 'var(--bg-default)' }}>
      {/* Navbar */}
      <header className="glass-nav" style={{ padding: '16px 8%', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/marketplace')}>
            <ArrowLeft size={18} color="var(--text-muted)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Back to Directory</span>
          </div>
          {user ? (
            <UserMenu />
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>Login to Account</button>
          )}
        </div>
      </header>

      {/* Banner & Header */}
      <div style={{ 
        height: 240, 
        background: hasBanner ? `url(${profile.banner}) center/cover no-repeat` : 'linear-gradient(135deg, #0f172a, #1e293b)',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-default), transparent 70%)' }} />
      </div>

      <div style={{ maxWidth: 1000, margin: '-80px auto 0', padding: '0 24px', position: 'relative', zIndex: 2 }}>
        <div className="profile-head" style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 32 }}>
          <div className="glass-logo-tile" style={{ 
            width: 120, height: 120, borderRadius: 20, border: '4px solid var(--bg-default)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 40, fontWeight: 800, color: 'var(--emerald)'
          }}>
            {profile.logo || coop.name.substring(0, 2).toUpperCase()}
          </div>
          <div style={{ paddingBottom: 10 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              {coop.name}
              <CheckCircle2 size={24} color="#2A9D8F" />
            </h1>
            <div className="profile-meta" style={{ display: 'flex', gap: 16, color: 'var(--text-muted)', fontSize: 14 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} /> {coop.address}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={14} /> {coop.contactPhone}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={14} /> {coop.contactEmail}</span>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => user ? navigate(`/apply-membership/${coop._id || id}`) : navigate('/login')}
              style={{ marginTop: 16, background: 'linear-gradient(135deg, #2A9D8F, #21867A)', boxShadow: '0 8px 24px rgba(42,157,143,0.3)', border: 'none', borderRadius: 12, fontWeight: 700 }}
            >
              Become a Member
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, paddingBottom: 60 }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* About */}
            <div className="card">
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Info size={18} color="var(--emerald)" /> About Us
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {profile.description || 'No description provided.'}
              </p>
            </div>

            {/* Products (Savings) */}
            {(profile.savingsProducts?.length > 0) && (
              <div className="card">
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Wallet size={18} color="var(--emerald)" /> Savings Products
                </h3>
                <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {profile.savingsProducts.map((p, i) => (
                    <div key={i} style={{ padding: 16, borderRadius: 12, border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</h4>
                        <span style={{ background: 'rgba(42,157,143,0.1)', color: 'var(--emerald)', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                          {p.interestRate}% p.a.
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Products (Loans) */}
            {(profile.loanProducts?.length > 0) && (
              <div className="card">
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Percent size={18} color="var(--blue)" /> Loan Products
                </h3>
                <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {profile.loanProducts.map((p, i) => (
                    <div key={i} style={{ padding: 16, borderRadius: 12, border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</h4>
                        <span style={{ background: 'rgba(6,182,212,0.1)', color: 'var(--blue)', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                          {p.interestRate}% p.a.
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Quick Details */}
            <div className="card">
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Cooperative Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Registration No.</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{coop.registrationNo}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Founded</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{coop.createdAt ? formatDate(coop.createdAt).split(',')[0] : 'Unknown'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Status</span>
                  <span style={{ color: 'var(--emerald)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={12}/> Verified</span>
                </div>
              </div>
            </div>

            {/* Announcements */}
            {(profile.announcements?.length > 0) && (
              <div className="card">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={16} color="var(--orange)" /> Announcements
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {profile.announcements.map((a, i) => (
                    <div key={i} style={{ borderLeft: '2px solid var(--orange)', paddingLeft: 12 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{a.title}</h4>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{a.content}</p>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{formatDate(a.date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            {(profile.services?.length > 0) && (
              <div className="card">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Other Services</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {profile.services.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <CheckCircle2 size={14} color="var(--emerald)" style={{ marginTop: 2 }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
