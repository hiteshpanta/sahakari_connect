import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, MessageCircle, Shield, Loader2, AlertCircle, Pencil, X } from 'lucide-react';
import { formatDate, getInitials } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { useGetMemberProfileQuery, useUpdateMemberProfileMutation } from '../../store/mainApi';
import { useMemberCooperative } from '../../context/MemberCooperativeContext';
import CooperativeSwitcher from '../../components/member/CooperativeSwitcher';
import { Formik } from 'formik';
import * as Yup from 'yup';

const profileSchema = Yup.object({
  phone: Yup.string(),
  email: Yup.string().email('Invalid email address'),
  address: Yup.string(),
  whatsapp: Yup.string(),
});

export default function MemberProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const { activeCoopId, activeCoop } = useMemberCooperative();

  const { data: profileData, isLoading, isError, error: profileError, refetch, isUninitialized } = useGetMemberProfileQuery(activeCoopId, { skip: !activeCoopId });
  const [updateProfile] = useUpdateMemberProfileMutation();

  const loadProfile = () => {
    if (isUninitialized) return;
    setLoading(true);
    refetch();
  };

  useEffect(() => {
    setLoading(isLoading);
    if (isError) {
      setError(profileError?.data?.message || 'Failed to load your profile');
    } else if (profileData !== undefined) {
      setProfile(profileData);
    }
  }, [profileData, isLoading, isError, profileError]);

  useEffect(loadProfile, []);

  if (loading) {
    return (
      <div className="glass-page">
        <div className="glass-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Loader2 size={30} className="spin" style={{ color: 'var(--emerald)' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-page">
        <div className="glass-content glass-card" style={{ display: 'flex', gap: 12, alignItems: 'center', color: 'var(--red-light)' }}>
          <AlertCircle size={20} /> {error}
        </div>
      </div>
    );
  }

  const p = profile || {};

  return (
    <div className="glass-page animate-fade-in">
      <div className="glass-orb glass-orb-1" />
      <div className="glass-orb glass-orb-2" />

      <div className="glass-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Profile</h1>
            <p className="page-subtitle">
              Manage your personal information and settings
              {activeCoop?.cooperative?.name ? ` • ${activeCoop.cooperative.name}` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <CooperativeSwitcher compact />
            <span className={`badge ${p.status === 'active' ? 'success' : 'neutral'}`}>{p.status}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 24 }}>
          <div className="glass-avatar">{getInitials(p.name)}</div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>{p.name}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{p.email} • {p.branch || 'No branch'} • Member since {formatDate(p.joinDate)}</p>
          </div>
        </div>

        <div className="grid-2-1">
          <div className="glass-card">
            <div className="card-header" style={{ padding: '0 0 14px' }}>
              <div>
                <h3 className="card-title">Contact Information</h3>
                <p className="card-subtitle">These fields are visible to your cooperative</p>
              </div>
              {!isEditing ? (
                <button className="btn btn-outline btn-sm" onClick={() => setIsEditing(true)}>
                  <Pencil size={14} /> Edit Details
                </button>
              ) : (
                <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(false)}>
                  <X size={14} /> Cancel
                </button>
              )}
            </div>

            {isEditing ? (
              <Formik
                initialValues={{
                  phone: p.phone || '',
                  email: p.email || '',
                  address: p.address || '',
                  whatsapp: p.whatsapp || ''
                }}
                validationSchema={profileSchema}
                onSubmit={async (values) => {
                  setSaving(true);
                  try {
                    const data = await updateProfile({ ...values, cooperativeId: activeCoopId || undefined }).unwrap();
                    setProfile(data);
                    setIsEditing(false);
                    toast.success('Profile updated successfully!');
                  } catch (err) {
                    toast.error(err?.data?.message || 'Failed to update profile');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {({ values, handleChange, handleSubmit, errors, touched }) => (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input type="text" className="glass-input" name="phone" value={values.phone} onChange={handleChange} />
                      {touched.phone && errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input type="email" className="glass-input" name="email" value={values.email} onChange={handleChange} />
                      {touched.email && errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Address</label>
                      <input type="text" className="glass-input" name="address" value={values.address} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">WhatsApp Number</label>
                      <input type="text" className="glass-input" name="whatsapp" value={values.whatsapp} onChange={handleChange} />
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving && <Loader2 size={15} className="spin" />} Save Changes
                      </button>
                      <button type="button" className="btn btn-ghost" onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                  </form>
                )}
              </Formik>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span className="glassy-stat-icon" style={{ width: 38, height: 38, '--icon-bg': 'rgba(42,157,143,0.1)', '--accent': 'var(--emerald)' }}>
                    <Phone size={17} />
                  </span>
                  <div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Phone Number</p>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>{p.phone || '-'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span className="glassy-stat-icon" style={{ width: 38, height: 38, '--icon-bg': 'rgba(6,182,212,0.1)', '--accent': '#06b6d4' }}>
                    <Mail size={17} />
                  </span>
                  <div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Email Address</p>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>{p.email || '-'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span className="glassy-stat-icon" style={{ width: 38, height: 38, '--icon-bg': 'rgba(245,158,11,0.12)', '--accent': '#f59e0b' }}>
                    <MapPin size={17} />
                  </span>
                  <div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Address</p>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>{p.address || '-'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span className="glassy-stat-icon" style={{ width: 38, height: 38, '--icon-bg': 'rgba(139,92,246,0.1)', '--accent': '#8b5cf6' }}>
                    <MessageCircle size={17} />
                  </span>
                  <div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>WhatsApp Number</p>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>{p.whatsapp || '-'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="glass-card">
              <h3 className="card-title" style={{ marginBottom: 16 }}>Personal Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Full Name</p>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</p>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Citizenship / ID No.</p>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{p.citizenshipNo || '-'}</p>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Date of Birth</p>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{p.dob ? formatDate(p.dob) : '-'}</p>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Gender</p>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{p.gender || '-'}</p>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nominee</p>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>
                    {p.nomineeName ? `${p.nomineeName}${p.nomineeRelation ? ` (${p.nomineeRelation})` : ''}` : '-'}
                  </p>
                </div>
              </div>

              <div className="info-box neutral" style={{ marginTop: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <Shield size={16} style={{ marginTop: 2 }} />
                <p style={{ fontSize: 12 }}>
                  To update your core KYC details (Name, ID, DOB), please visit your branch with valid documentation.
                </p>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span className="glassy-stat-icon" style={{ width: 40, height: 40, '--icon-bg': 'rgba(42,157,143,0.12)', '--accent': 'var(--emerald)' }}>
                <User size={18} />
              </span>
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Account Type</p>
                <p style={{ fontSize: 14, fontWeight: 700 }}>Cooperative Member</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
