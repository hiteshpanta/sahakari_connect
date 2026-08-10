import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Landmark, MapPin, Star, Building2, ArrowRight, Shield, CheckCircle,
  Wallet, Smartphone, MessageCircle, WifiOff, PieChart, ChevronRight,
  Users, UserPlus, Sparkles, Quote
} from 'lucide-react';
import Footer from '../../components/Footer';
import { cooperatives as mockCoops, cooperativeProfiles } from '../../data/mockData';
import { useGetPublicCooperativesQuery } from '../../store/mainApi';

const HERO_IMAGES = ['/hero-1.png', '/hero-2.jpg', '/hero-3.png'];

const formatCompact = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k+` : `${n}`);

export default function Home() {
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);
  const [coops, setCoops] = useState([]);
  const [coopsLoading, setCoopsLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroStats, setHeroStats] = useState([
    { icon: Building2, value: '0', label: 'Verified Cooperatives' },
    { icon: Users, value: '0', label: 'Active Members' },
    { icon: MapPin, value: '0', label: 'Provinces Covered' },
    { icon: PieChart, value: '0', label: 'Loan Products' },
  ]);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'member') navigate('/member/dashboard');
      else if (user.role === 'manager') navigate(`/c/${user.cooperativeId}/dashboard`);
    }
  }, [user, loading, navigate]);

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
      const mock = mockCoops
        .filter(c => c.status === 'active')
        .map(c => {
          const profile = cooperativeProfiles.find(p => p.cooperativeId === c._id);
          return {
            _id: c._id,
            name: c.name,
            address: c.address,
            province: c.province,
            memberCount: c.memberCount,
            logo: profile?.logo || '',
            description: profile?.description || 'A trusted local cooperative.',
            loanProducts: profile?.loanProducts || []
          };
        });
      setCoops(mock.slice(0, 3));
      computeStats(mock);
    } else if (coopsData !== undefined) {
      const list = Array.isArray(coopsData) ? coopsData : coopsData?.cooperatives || [];
      setCoops(list.slice(0, 3));
      computeStats(list);
    }
  }, [coopsData, isError]);

  useEffect(() => {
    setCoopsLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex(i => (i + 1) % HERO_IMAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (user) {
    return null;
  }

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Platform', target: 'features' },
    { label: 'How It Works', target: 'how-it-works' },
    { label: 'Marketplace', target: 'marketplace' },
    { label: 'Testimonials', target: 'testimonials' },
  ];

  const features = [
    { icon: Wallet, title: 'Core Banking Suite', desc: 'Accounts, transactions, loans and deposits — managed from one unified dashboard for cooperative staff.' },
    { icon: MessageCircle, title: 'WhatsApp Banking', desc: 'Members check balances and statements right from WhatsApp without installing a single app.' },
    { icon: Smartphone, title: 'SMS Banking', desc: 'Instant transaction alerts and balance enquiries via SMS, even on basic feature phones.' },
    { icon: WifiOff, title: 'Offline Sync', desc: 'Rural branches keep working without internet; records sync automatically once connected.' },
    { icon: PieChart, title: 'Reports & Analytics', desc: 'Portfolio health, branch performance and member growth — visualized in real time.' },
    { icon: Shield, title: 'Bank-Grade Security', desc: 'Encrypted sessions, secure tokens and role-based access protect every transaction.' },
  ];

  const steps = [
    { icon: Users, step: '01', title: 'Register Your Cooperative', desc: 'Sign up your cooperative on the platform and get approved by our team.' },
    { icon: UserPlus, step: '02', title: 'Add Members & Staff', desc: 'Onboard members and set up managers and staff with the right permissions.' },
    { icon: Landmark, step: '03', title: 'Bank Digitally', desc: 'Disburse loans, take deposits and serve members — online, offline and on WhatsApp.' },
  ];

  const testimonials = [
    { quote: 'We moved our entire branch network onto Aama Cooperatives and offline sync saved us during network outages.', name: 'Suman Shrestha', role: 'Manager, Sajha Cooperative' },
    { quote: 'Members love checking balances on WhatsApp. Our footfall at the counter has dropped by half.', name: 'Rita Maharjan', role: 'Staff, Mahila Coop' },
    { quote: 'Reports that used to take days are now generated in seconds. Incredibly simple to use.', name: 'Bikash Thapa', role: 'Manager, Krishak Coop' },
  ];

  return (
    <div className="home-page" style={{ minHeight: '100vh', background: 'var(--bg-default)', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="home-nav" style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 8%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #2A9D8F, #21867A)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Landmark size={20} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Aama Cooperatives</h1>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Cloud-Based Rural Banking</span>
            </div>
          </div>
          <nav className="home-nav-links" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            {navLinks.map(link => (
              <span key={link.label} onClick={() => scrollTo(link.target)} style={{ fontSize: 14, color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, transition: '0.2s' }}>
                {link.label}
              </span>
            ))}
          </nav>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/login')}>Sign In</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Join Now</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="home-hero" style={{
        padding: '64px 8% 48px',
        color: '#fff',
        textAlign: 'center',
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
          <h1 style={{ fontSize: 44, fontWeight: 900, marginBottom: 14, lineHeight: 1.12, maxWidth: 860, marginLeft: 'auto', marginRight: 'auto' }}>
            Banking That Reaches
            <br />
            <span style={{ background: 'linear-gradient(135deg, #8FD6CF, #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Every Rural Corner
            </span>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(226,232,240,0.85)', maxWidth: 640, margin: '0 auto 28px', lineHeight: 1.7 }}>
            Aama Cooperatives empowers local cooperatives with modern, secure and affordable financial technology — accounts, loans, SMS, WhatsApp banking and offline-first support for remote branches.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>Get Started <ArrowRight size={18} /></span>
            </button>
            <button className="btn btn-lg" onClick={() => scrollTo('marketplace')} style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)' }}>
              Explore Marketplace
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 32, flexWrap: 'wrap' }}>
            {heroStats.map(stat => (
              <div key={stat.label} style={{ textAlign: 'center', minWidth: 150, padding: '12px 20px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 16, backdropFilter: 'blur(10px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 24, fontWeight: 800, color: '#8FD6CF' }}>
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

      {/* Features */}
      <section id="features" style={{ padding: '80px 8%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(42,157,143,0.1)', color: 'var(--emerald)', padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, marginBottom: 16 }}>
              <Sparkles size={14} /> Platform
            </span>
            <h2 style={{ fontSize: 34, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12 }}>Everything a Cooperative Needs</h2>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>One platform for staff, members and admins — built for the realities of rural banking.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {features.map(feature => (
              <div key={feature.title} className="card" style={{ padding: 28, transition: 'transform 0.2s, box-shadow 0.2s' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, rgba(42,157,143,0.15), rgba(6,182,212,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald)', marginBottom: 18 }}>
                  <feature.icon size={22} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{feature.title}</h3>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: '80px 8%', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(42,157,143,0.1)', color: 'var(--emerald)', padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, marginBottom: 16 }}>
              <CheckCircle size={14} /> How It Works
            </span>
            <h2 style={{ fontSize: 34, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12 }}>Up and Running in Three Steps</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
            {steps.map(step => (
              <div key={step.step} style={{ textAlign: 'center', padding: 32, position: 'relative' }}>
                <div style={{ width: 68, height: 68, margin: '0 auto 20px', borderRadius: '50%', background: 'linear-gradient(135deg, #2A9D8F, #21867A)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(42,157,143,0.35)' }}>
                  <step.icon size={28} color="white" />
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, color: 'var(--emerald)' }}>STEP {step.step}</span>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '8px 0' }}>{step.title}</h3>
                <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace preview */}
      <section id="marketplace" style={{ padding: '80px 8%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(42,157,143,0.1)', color: 'var(--emerald)', padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
                <Building2 size={14} /> Marketplace
              </span>
              <h2 style={{ fontSize: 34, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Find Your Local Cooperative</h2>
            </div>
            <span onClick={() => navigate('/marketplace')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--emerald)', fontWeight: 600, cursor: 'pointer' }}>
              View All <ChevronRight size={16} />
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {coopsLoading ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading cooperatives...</div>
            ) : (
              coops.map(coop => (
                <div key={coop._id} className="card card-hover" style={{ cursor: 'pointer', padding: 24 }} onClick={() => navigate(`/marketplace/${coop._id}`)}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, rgba(42,157,143,0.15), rgba(6,182,212,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20, fontWeight: 700, color: 'var(--emerald)' }}>
                      {coop.logo || <Building2 size={24} />}
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
                      <CheckCircle size={12} /> Verified
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      View Profile <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" style={{ padding: '80px 8%', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(42,157,143,0.1)', color: 'var(--emerald)', padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, marginBottom: 16 }}>
              <Quote size={14} /> Testimonials
            </span>
            <h2 style={{ fontSize: 34, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12 }}>Trusted by Cooperative Leaders</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {testimonials.map((t, idx) => (
              <div key={idx} className="card" style={{ padding: 28 }}>
                <Quote size={28} color="#2A9D8F" style={{ marginBottom: 16, opacity: 0.6 }} />
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>{t.quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #2A9D8F, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15 }}>
                    {t.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 8%' }}>
        <div className="home-cta" style={{ maxWidth: 1200, margin: '0 auto', borderRadius: 24, padding: '56px 48px', textAlign: 'center', background: 'radial-gradient(circle at 20% 0%, rgba(42,157,143,0.18), transparent 50%), radial-gradient(circle at 80% 100%, rgba(6,182,212,0.14), transparent 50%), linear-gradient(180deg, #f2fbf9, #e6f4f1)', color: 'var(--text-primary)', border: '1px solid rgba(42,157,143,0.18)', boxShadow: '0 24px 64px rgba(42,157,143,0.12)' }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, marginBottom: 14, color: 'var(--text-primary)' }}>Ready to Bring Your Cooperative Online?</h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.7 }}>
            Join dozens of cooperatives already banking digitally with Aama Cooperatives. Free to get started.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>Join Now — It's Free <ArrowRight size={18} /></span>
            </button>
            <button className="btn btn-lg" onClick={() => navigate('/login')} style={{ background: 'rgba(42,157,143,0.1)', color: 'var(--emerald)', border: '1px solid rgba(42,157,143,0.35)' }}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
