import React, { useState, useEffect } from 'react';
import { Save, Building2, Palette, Globe, Info, Loader, Landmark, TrendingUp, ArrowUpRight, ArrowDownLeft, HandCoins, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatters';
import { useGetCooperativeProfileQuery, useGetDashboardStatsQuery, useUpdateCooperativeProfileMutation } from '../../store/mainApi';
import { Formik } from 'formik';
import * as Yup from 'yup';

const cooperativeInfoSchema = Yup.object({
  name: Yup.string().required('Cooperative name is required'),
  address: Yup.string().required('Address is required'),
  contactEmail: Yup.string()
    .email('Invalid email address')
    .required('Contact email is required'),
  contactPhone: Yup.string().required('Contact phone is required'),
  establishedYear: Yup.number()
    .typeError('Enter a valid year')
    .min(1900, 'Year must be 1900 or later')
    .max(2100, 'Year cannot be in the future'),
  district: Yup.string(),
  province: Yup.string(),
  category: Yup.string(),
  registrationNo: Yup.string(),
  profile: Yup.object({
    appName: Yup.string(),
    description: Yup.string(),
    logo: Yup.string(),
    banner: Yup.string(),
    customDomain: Yup.string(),
    colors: Yup.object({
      primary: Yup.string(),
      secondary: Yup.string(),
      accent: Yup.string(),
    }),
  }),
});

const StatTile = ({ icon: Icon, label, value, color, bg }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
    <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={19} color={color} />
    </div>
    <div style={{ minWidth: 0 }}>
      <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{value}</p>
      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</p>
    </div>
  </div>
);

export default function CooperativeSettings() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const { data: profileData, isLoading: profileLoading, isError: profileError } = useGetCooperativeProfileQuery();
  const { data: dashboardStats, isLoading: statsLoading } = useGetDashboardStatsQuery('me');

  useEffect(() => {
    setLoading(profileLoading || statsLoading);
    if (!profileLoading && !statsLoading && profileData === undefined) {
      setIsNew(true);
    }
  }, [profileLoading, statsLoading, profileData]);

  useEffect(() => {
    if (profileError) {
      toast.error('Could not load cooperative information');
      return;
    }
    if (profileData === undefined) return;
    setIsNew(!profileData.cooperative);
  }, [profileData, profileError]);

  useEffect(() => {
    if (dashboardStats !== undefined) setStats(dashboardStats);
  }, [dashboardStats]);

  const [updateProfile] = useUpdateCooperativeProfileMutation();

  if (loading) {
    return (
      <div className="glass-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader size={24} className="spin" color="var(--emerald)" />
      </div>
    );
  }

  const coop = profileData?.cooperative;
  const profileInfo = profileData?.profile;

  const initialValues = {
    name: coop?.name || '',
    address: coop?.address || '',
    district: coop?.district || '',
    province: coop?.province || '',
    establishedYear: coop?.establishedYear ? String(coop.establishedYear) : '',
    category: coop?.category || 'Saving & Credit',
    contactEmail: coop?.contactEmail || '',
    contactPhone: coop?.contactPhone || '',
    registrationNo: coop?.registrationNo || '',
    profile: {
      appName: profileInfo?.appName || 'Aama Cooperatives',
      description: profileInfo?.description || '',
      logo: profileInfo?.logo || '',
      banner: profileInfo?.banner || '',
      customDomain: profileInfo?.customDomain || '',
      colors: {
        primary: profileInfo?.colors?.primary || '#0f172a',
        secondary: profileInfo?.colors?.secondary || '#3b82f6',
        accent: profileInfo?.colors?.accent || '#10b981'
      }
    }
  };

  const inputStyle = { width: '100%' };
  const inputCls = 'glass-input';

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={cooperativeInfoSchema}
      onSubmit={async (values) => {
        setSaving(true);
        try {
          const payload = {
            name: values.name,
            address: values.address,
            district: values.district,
            province: values.province,
            establishedYear: values.establishedYear ? Number(values.establishedYear) : undefined,
            category: values.category,
            contactEmail: values.contactEmail,
            contactPhone: values.contactPhone,
            registrationNo: values.registrationNo,
            profile: { ...values.profile }
          };
          await updateProfile(payload).unwrap();
          toast.success(isNew ? 'Cooperative created successfully' : 'Cooperative information saved successfully');
          setIsNew(false);
        } catch (err) {
          toast.error(err?.data?.message || 'Failed to save cooperative information');
        } finally {
          setSaving(false);
        }
      }}
    >
      {(formik) => (
        <div className="glass-page animate-fade-in">
          <div className="page-header" style={{ marginBottom: 24 }}>
            <div>
              <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Building2 size={22} color="var(--emerald)" /> {isNew ? 'Create Your Cooperative' : 'Cooperative Information'}
              </h1>
              <p className="page-subtitle">
                {isNew ? 'Set up your cooperative — it will be linked to your manager account' : "Edit your cooperative's basic details and public profile"}
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => formik.submitForm()} disabled={saving} style={{ background: 'linear-gradient(135deg, #2A9D8F, #21867A)' }}>
              {saving ? <Loader size={15} className="spin" /> : <Save size={15} />} {isNew ? 'Create Cooperative' : 'Save Changes'}
            </button>
          </div>

          <form onSubmit={formik.handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Live Cooperative Financial Stats */}
              {!isNew && stats && (
                <div className="glass-card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div className="glass-chip"><TrendingUp size={15} /></div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Financial Snapshot</h3>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Live aggregates updated by member deposits, withdrawals and loan payments</p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                    <StatTile icon={ArrowUpRight} label="Total Deposits" value={formatCurrency(stats.totalDeposits)} color="#2A9D8F" bg="rgba(42,157,143,0.12)" />
                    <StatTile icon={ArrowDownLeft} label="Total Withdrawals" value={formatCurrency(stats.totalWithdrawals)} color="#EF4444" bg="rgba(239,68,68,0.1)" />
                    <StatTile icon={HandCoins} label="Loan Collections" value={formatCurrency(stats.totalLoanCollections)} color="#8B5CF6" bg="rgba(139,92,246,0.12)" />
                    <StatTile icon={Landmark} label="Loans Disbursed" value={formatCurrency(stats.totalLoansDisbursed)} color="#F59E0B" bg="rgba(245,158,11,0.12)" />
                    <StatTile icon={Users} label="Members" value={Number(stats.memberCount || 0).toLocaleString()} color="#06B6D4" bg="rgba(6,182,212,0.12)" />
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="glass-card" style={{ padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div className="glass-chip"><Info size={15} /></div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Basic Information</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Registered details of the cooperative</p>
                  </div>
                </div>

                <div className="form-grid-2 mb-4">
                  <div className="form-group">
                    <label className="form-label">Cooperative Name *</label>
                    <input className={inputCls} style={inputStyle} name="name" value={formik.values.name} onChange={formik.handleChange} />
                    {formik.touched.name && formik.errors.name && <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Registration No.</label>
                    <input className={inputCls} style={inputStyle} name="registrationNo" value={formik.values.registrationNo} onChange={formik.handleChange} />
                  </div>
                </div>

                <div className="form-grid-2 mb-4">
                  <div className="form-group">
                    <label className="form-label">Address *</label>
                    <input className={inputCls} style={inputStyle} name="address" value={formik.values.address} onChange={formik.handleChange} />
                    {formik.touched.address && formik.errors.address && <p className="text-red-500 text-sm mt-1">{formik.errors.address}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">District</label>
                    <input className={inputCls} style={inputStyle} name="district" value={formik.values.district} onChange={formik.handleChange} />
                  </div>
                </div>

                <div className="form-grid-2 mb-4">
                  <div className="form-group">
                    <label className="form-label">Province</label>
                    <input className={inputCls} style={inputStyle} name="province" value={formik.values.province} onChange={formik.handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Established Year</label>
                    <input className={inputCls} style={inputStyle} type="number" min="1900" max="2100" name="establishedYear" value={formik.values.establishedYear} onChange={formik.handleChange} />
                    {formik.touched.establishedYear && formik.errors.establishedYear && <p className="text-red-500 text-sm mt-1">{formik.errors.establishedYear}</p>}
                  </div>
                </div>

                <div className="form-grid-2 mb-4">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className={inputCls} style={{ ...inputStyle, cursor: 'pointer' }} name="category" value={formik.values.category} onChange={formik.handleChange}>
                      {['Saving & Credit', 'Multi-purpose', 'Agriculture', 'Dairy', 'Thrift', 'Housing', 'Consumer'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Email *</label>
                    <input className={inputCls} style={inputStyle} type="email" name="contactEmail" value={formik.values.contactEmail} onChange={formik.handleChange} />
                    {formik.touched.contactEmail && formik.errors.contactEmail && <p className="text-red-500 text-sm mt-1">{formik.errors.contactEmail}</p>}
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Contact Phone *</label>
                    <input className={inputCls} style={inputStyle} name="contactPhone" value={formik.values.contactPhone} onChange={formik.handleChange} />
                    {formik.touched.contactPhone && formik.errors.contactPhone && <p className="text-red-500 text-sm mt-1">{formik.errors.contactPhone}</p>}
                  </div>
                </div>
              </div>

              {/* Public Profile */}
              <div className="glass-card" style={{ padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div className="glass-chip"><Globe size={15} /></div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Public Profile</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Shown on the marketplace directory and public page</p>
                  </div>
                </div>

                <div className="form-grid-2 mb-4">
                  <div className="form-group">
                    <label className="form-label">App / Display Name</label>
                    <input className={inputCls} style={inputStyle} name="profile.appName" value={formik.values.profile.appName} onChange={formik.handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Custom Domain</label>
                    <input className={inputCls} style={inputStyle} placeholder="coop.example.com" name="profile.customDomain" value={formik.values.profile.customDomain} onChange={formik.handleChange} />
                  </div>
                </div>

                <div className="form-group mb-4">
                  <label className="form-label">Description</label>
                  <textarea className={inputCls} style={{ ...inputStyle, resize: 'vertical', minHeight: 90 }} rows={3} name="profile.description" value={formik.values.profile.description} onChange={formik.handleChange} />
                </div>

                <div className="form-grid-2 mb-4">
                  <div className="form-group">
                    <label className="form-label">Logo URL</label>
                    <input className={inputCls} style={inputStyle} placeholder="https://..." name="profile.logo" value={formik.values.profile.logo} onChange={formik.handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Banner URL</label>
                    <input className={inputCls} style={inputStyle} placeholder="https://..." name="profile.banner" value={formik.values.profile.banner} onChange={formik.handleChange} />
                  </div>
                </div>
              </div>

              {/* Brand Colors */}
              <div className="glass-card" style={{ padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div className="glass-chip"><Palette size={15} /></div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Brand Colors</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Used across your public page and member portal</p>
                  </div>
                </div>
                <div className="form-grid-2">
                  {[['primary', 'Primary'], ['secondary', 'Secondary'], ['accent', 'Accent']].map(([key, label]) => (
                    <div className="form-group" key={key}>
                      <label className="form-label">{label} Color</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="color"
                          name={`profile.colors.${key}`}
                          value={formik.values.profile.colors[key]}
                          onChange={formik.handleChange}
                          style={{ width: 44, height: 38, border: '1px solid var(--border-color)', borderRadius: 10, background: 'rgba(0,0,0,0.2)', cursor: 'pointer' }}
                        />
                        <input className={inputCls} style={{ ...inputStyle, fontFamily: 'monospace' }} name={`profile.colors.${key}`} value={formik.values.profile.colors[key]} onChange={formik.handleChange} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <div className="glass-chip" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Landmark size={14} color="var(--emerald)" />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Changes appear on your public profile immediately</span>
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ background: 'linear-gradient(135deg, #2A9D8F, #21867A)' }}>
                  {saving ? <Loader size={15} className="spin" /> : <Save size={15} />} Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </Formik>
  );
}
