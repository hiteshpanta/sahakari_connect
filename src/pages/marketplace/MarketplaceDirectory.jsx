import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Search, MapPin, Star, Building2, ChevronRight, Landmark, Users, PieChart } from 'lucide-react';
import Footer from '../../components/Footer';
import UserMenu from '../../components/UserMenu';
import { useGetPublicCooperativesQuery } from '../../store/mainApi';

const HERO_IMAGES = ['/hero-1.png', '/hero-2.jpg', '/hero-3.png'];

const formatCompact = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k+` : `${n}`);

export default function MarketplaceDirectory() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [heroIndex, setHeroIndex] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [heroStats, setHeroStats] = useState([
    { icon: Building2, value: '0', label: 'Verified Cooperatives' },
    { icon: Users, value: '0', label: 'Active Members' },
    { icon: MapPin, value: '0', label: 'Provinces Covered' },
    { icon: PieChart, value: '0', label: 'Loan Products' },
  ]);

  const { data: coopsData, isLoading, isError } = useGetPublicCooperativesQuery();

  useEffect(() => {
    const computeStats = (list) => {
      const members = list.reduce((sum, c) => sum + (c.memberCount || 0), 0);
      const provinces = new Set(list.map(c => c.province).filter(Boolean)).size;
      const loans = list.reduce((sum, c) => sum + (Array.isArray(c.loanProducts) ? c.loanProducts.length : 0), 0);
      setHeroStats([
        { icon: Building2, value: `${list.length}+`, label: 'Verified Cooperatives' },
        { icon: Users, value: formatCompact(members), label: 'Active Members' },
        { icon: MapPin, value: `${provinces}`, label: 'Provinces Covered' },
        { icon: PieChart, value: `${loans}+`, label: 'Loan Products' },
      ]);
    };

    if (isError) {
      // Fallback to mock data merging
      const mockData = cooperatives
        .filter(c => c.status === 'active')
        .map(c => {
          const profile = cooperativeProfiles.find(p => p.cooperativeId === c._id);
          return {
            _id: c._id,
            name: c.name,
            address: c.address,
            province: c.province,
            memberCount: c.memberCount,
            contactEmail: c.contactEmail,
            contactPhone: c.contactPhone,
            logo: profile?.logo || '',
            description: profile?.description || 'A trusted local cooperative.',
            loanProducts: profile?.loanProducts || []
          };
        });
      setData(mockData);
      computeStats(mockData);
    } else if (coopsData !== undefined) {
      const list = Array.isArray(coopsData) ? coopsData : coopsData?.cooperatives || [];
      setData(list);
      computeStats(list);
    }
  }, [coopsData, isError]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex(i => (i + 1) % HERO_IMAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const filtered = data.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.address.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="marketplace-page" style={{ minHeight: '100vh', background: 'var(--bg-default)', display: 'flex', flexDirection: 'column' }}>
      {/* Marketplace Header */}
      <header className="glass-nav" style={{ padding: '16px 8%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/marketplace')}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #2A9D8F, #21867A)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Landmark size={20} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Aama Cooperatives</h1>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Cooperative Marketplace</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {user ? (
              <UserMenu />
            ) : (
              <>
                <button className="btn btn-outline btn-sm" onClick={() => navigate('/login')}>Sign In</button>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Join Now</button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="marketplace-hero" style={{
        padding: '72px 8% 56px',
        textAlign: 'center',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {HERO_IMAGES.map((src, i) => (
          <div key={src} style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: i === heroIndex ? 1 : 0,
            transition: 'opacity 1s ease',
            zIndex: 0
          }} />
        ))}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(15,23,42,0.55), rgba(15,23,42,0.3))',
          zIndex: 1
        }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontSize: 44, fontWeight: 900, marginBottom: 16, lineHeight: 1.15 }}>
            Find Your Local <span style={{ background: 'linear-gradient(135deg, #8FD6CF, #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Cooperative</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(226,232,240,0.85)', maxWidth: 600, margin: '0 auto 36px', lineHeight: 1.7 }}>
            Explore approved community banks, compare interest rates, and access local financial services near you.
          </p>

          <div style={{ maxWidth: 520, margin: '0 auto', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
            <input
              type="text"
              placeholder="Search by cooperative name or location..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ width: '100%', padding: '16px 24px 16px 50px', fontSize: 15, borderRadius: 999, border: 'none', outline: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
            />
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'linear-gradient(135deg, #2A9D8F, #21867A)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '8px 18px', borderRadius: 999, cursor: 'pointer', pointerEvents: 'none' }}>Search</span>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 44, flexWrap: 'wrap' }}>
            {heroStats.map(stat => (
              <div key={stat.label} style={{ textAlign: 'center', minWidth: 150, padding: '18px 24px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 16, backdropFilter: 'blur(10px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 28, fontWeight: 800, color: '#8FD6CF' }}>
                  <stat.icon size={20} /> {stat.value}
                </div>
                <div style={{ fontSize: 12.5, color: 'rgba(226,232,240,0.7)', marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 22, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8, zIndex: 3 }}>
          {HERO_IMAGES.map((src, i) => (
            <button key={src} onClick={() => setHeroIndex(i)} aria-label={`Slide ${i + 1}`} style={{
              width: 10, height: 10, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0,
              background: i === heroIndex ? '#8FD6CF' : 'rgba(255,255,255,0.4)',
              transition: 'background 0.3s'
            }} />
          ))}
        </div>
      </section>

      {/* Directory Grid */}
      <section style={{ padding: '48px 8% 72px', flex: 1 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {filtered.length} Cooperative{filtered.length !== 1 ? 's' : ''}
            </h3>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>All verified &amp; regulated</span>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading cooperatives...</div>
          ) : (
            <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {paginated.map(coop => (
                <div
                  key={coop._id}
                  className="card card-hover"
                  style={{ cursor: 'pointer', padding: 24 }}
                  onClick={() => navigate(`/marketplace/${coop._id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, rgba(42,157,143,0.15), rgba(6,182,212,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20, fontWeight: 700, color: 'var(--emerald)', border: '1px solid rgba(42,157,143,0.2)' }}>
                      {coop.logo || <Building2 size={26} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{coop.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12.5 }}>
                        <MapPin size={12} /> {coop.address}
                      </div>
                    </div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(42,157,143,0.1)', color: 'var(--emerald)', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      <Star size={12} fill="#F59E0B" color="#F59E0B" /> {coop.avgRating || 'New'}
                    </span>
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {coop.description}
                  </p>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={12} fill="#F59E0B" color="#F59E0B" /> Verified
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      View Profile <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 60, color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 16, border: '1px dashed var(--border-color)' }}>
                  <Building2 size={40} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                  <p style={{ fontSize: 16 }}>No cooperatives found matching your search.</p>
                </div>
              )}
            </div>

            {filtered.length > 0 && totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 36, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1, fontSize: 13, fontWeight: 600 }}
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    style={{
                      width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                      background: n === page ? 'linear-gradient(135deg, #2A9D8F, #21867A)' : 'var(--bg-card)',
                      color: n === page ? '#fff' : 'var(--text-secondary)',
                      transition: '0.2s'
                    }}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1, fontSize: 13, fontWeight: 600 }}
                >
                  Next
                </button>
              </div>
            )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
