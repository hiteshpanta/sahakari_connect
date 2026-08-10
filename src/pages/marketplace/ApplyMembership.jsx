import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, ArrowRight, User, Users, FileText, CheckCircle, Landmark, Upload, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import { cooperatives } from '../../data/mockData';
import toast from 'react-hot-toast';
import Footer from '../../components/Footer';
import { useApplyForCooperativeMutation } from '../../store/mainApi';

const STEPS = [
  { id: 1, title: 'Personal Details', icon: User },
  { id: 2, title: 'Nominee Info', icon: Users },
  { id: 3, title: 'KYC Documents', icon: FileText },
  { id: 4, title: 'Review & Submit', icon: CheckCircle }
];

const initialForm = {
  name: '', phone: '', email: '', address: '', gender: 'Male', dob: '', citizenshipNo: '', branch: '',
  nomineeName: '', nomineeRelation: '', nomineePhone: '',
  documents: { citizenshipFront: '', citizenshipBack: '', photo: '', signature: '', addressProof: '' }
};

export default function ApplyMembership() {
  const { cooperativeId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [coopName, setCoopName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [applyForCooperative] = useApplyForCooperativeMutation();

  useEffect(() => {
    const coop = cooperatives.find(c => c._id === cooperativeId);
    if (coop) setCoopName(coop.name);
    else setCoopName('Cooperative');
  }, [cooperativeId]);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const setDoc = (field, value) => setForm(prev => ({ ...prev, documents: { ...prev.documents, [field]: value } }));

  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setDoc(field, reader.result);
      reader.readAsDataURL(file);
    }
  };

  const canProceed = () => {
    if (step === 1) return form.name && form.phone && form.address && form.dob && form.citizenshipNo;
    if (step === 2) return form.nomineeName && form.nomineeRelation && form.nomineePhone;
    if (step === 3) return form.documents.citizenshipFront && form.documents.photo && form.documents.signature;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        cooperativeId,
        ...form,
        branch: form.branch || 'Head Office',
        dob: form.dob ? new Date(form.dob).toISOString() : undefined
      };
      if (user?._id) payload.userId = user._id;
      await applyForCooperative(payload).unwrap();
      setSubmitted(true);
      toast.success('Application submitted successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-default)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <div style={{ textAlign: 'center', maxWidth: 500, padding: 40 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(42,157,143,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <CheckCircle size={40} color="#2A9D8F" />
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>Application Submitted!</h2>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 32 }}>
              Your membership application to <strong style={{ color: 'var(--emerald)' }}>{coopName}</strong> has been submitted successfully.
              You will be notified once your application is reviewed and approved by the cooperative.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => navigate('/marketplace')}>Back to Directory</button>
              <button className="btn btn-primary" onClick={() => navigate(`/marketplace/${cooperativeId}`)}>View Cooperative</button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const inputStyle = { width: '100%' };

  return (
    <div className="apply-page" style={{ minHeight: '100vh', background: 'var(--bg-default)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="glass-nav" style={{ padding: '16px 8%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate(`/marketplace/${cooperativeId}`)}>
            <ArrowLeft size={18} color="var(--text-muted)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Back to {coopName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Landmark size={18} color="#2A9D8F" />
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Membership Application</span>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        {/* Step Indicators */}
        <div className="step-indicators" style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 48 }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className={`glass-step ${step > s.id ? 'glass-step-done' : step === s.id ? 'glass-step-active' : ''}`}
                style={{ cursor: step > s.id ? 'pointer' : 'default' }}
                onClick={() => step > s.id && setStep(s.id)}>
                <s.icon size={18} color={step >= s.id ? '#fff' : 'var(--text-muted)'} />
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: 60, height: 2, background: step > s.id ? '#2A9D8F' : 'var(--glass-border)', borderRadius: 4, transition: '0.3s' }} />
              )}
            </div>
          ))}
        </div>

        {/* Step Title */}
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, textAlign: 'center' }}>
          {STEPS[step - 1].title}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 32 }}>
          {step === 1 && 'Provide your basic personal information.'}
          {step === 2 && 'Add your nominee details for the account.'}
          {step === 3 && 'Upload required KYC and verification documents.'}
          {step === 4 && 'Review all information before submitting.'}
        </p>

        <div className="card" style={{ maxWidth: 640, margin: '0 auto', padding: 32 }}>

          {/* Step 1: Personal Details */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <div className="input-wrapper"><User size={15} className="input-icon" />
                  <input className="form-input" style={inputStyle} placeholder="E.g. Ram Bahadur Thapa" value={form.name} onChange={e => set('name', e.target.value)} required />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <div className="input-wrapper"><Phone size={15} className="input-icon" />
                    <input className="form-input" style={inputStyle} placeholder="98XXXXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <div className="input-wrapper"><Mail size={15} className="input-icon" />
                    <input type="email" className="form-input" style={inputStyle} placeholder="email@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Permanent Address *</label>
                <div className="input-wrapper"><MapPin size={15} className="input-icon" />
                  <input className="form-input" style={inputStyle} placeholder="Ward No, Municipality, District" value={form.address} onChange={e => set('address', e.target.value)} required />
                </div>
              </div>
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-input" style={{ ...inputStyle, cursor: 'pointer' }} value={form.gender} onChange={e => set('gender', e.target.value)}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth *</label>
                  <div className="input-wrapper"><Calendar size={15} className="input-icon" />
                    <input type="date" className="form-input" style={inputStyle} value={form.dob} onChange={e => set('dob', e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Citizenship No. *</label>
                  <input className="form-input" style={inputStyle} placeholder="XX-XX-XX-XXXXX" value={form.citizenshipNo} onChange={e => set('citizenshipNo', e.target.value)} required />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Nominee Info */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group">
                <label className="form-label">Nominee Full Name *</label>
                <div className="input-wrapper"><User size={15} className="input-icon" />
                  <input className="form-input" style={inputStyle} placeholder="Nominee's full name" value={form.nomineeName} onChange={e => set('nomineeName', e.target.value)} required />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Relationship *</label>
                  <select className="form-input" style={{ ...inputStyle, cursor: 'pointer' }} value={form.nomineeRelation} onChange={e => set('nomineeRelation', e.target.value)}>
                    <option value="">Select Relation</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Nominee Phone *</label>
                  <div className="input-wrapper"><Phone size={15} className="input-icon" />
                    <input className="form-input" style={inputStyle} placeholder="98XXXXXXXX" value={form.nomineePhone} onChange={e => set('nomineePhone', e.target.value)} required />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: KYC Documents */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { key: 'citizenshipFront', label: 'Citizenship (Front) *' },
                { key: 'citizenshipBack', label: 'Citizenship (Back)' },
                { key: 'photo', label: 'Passport Photo *' },
                { key: 'signature', label: 'Signature *' },
                { key: 'addressProof', label: 'Address Proof Document' }
              ].map(doc => (
                <div key={doc.key} className="form-group">
                  <label className="form-label">{doc.label}</label>
                  <div className="glass-upload" style={{ padding: form.documents[doc.key] ? 8 : 26, position: 'relative' }}>
                    {form.documents[doc.key] ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src={form.documents[doc.key]} alt={doc.label} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                        <div style={{ textAlign: 'left' }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--emerald)' }}>Uploaded</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Click to replace</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Upload size={20} color="var(--text-muted)" style={{ marginBottom: 8 }} />
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Click or drag to upload</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleFileChange(doc.key, e)}
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: 'rgba(42,157,143,0.05)', borderRadius: 12, padding: 20, border: '1px solid rgba(42,157,143,0.15)' }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--emerald)', marginBottom: 12 }}>Personal Details</h4>
                <div className="form-grid-2">
                  {[['Name', form.name], ['Phone', form.phone], ['Email', form.email || 'N/A'], ['Address', form.address], ['Gender', form.gender], ['DOB', form.dob], ['Citizenship No.', form.citizenshipNo]].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: 'rgba(6,182,212,0.05)', borderRadius: 12, padding: 20, border: '1px solid rgba(6,182,212,0.15)' }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--blue)', marginBottom: 12 }}>Nominee Information</h4>
                <div className="form-grid-2">
                  {[['Name', form.nomineeName], ['Relation', form.nomineeRelation], ['Phone', form.nomineePhone]].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: 'rgba(245,158,11,0.05)', borderRadius: 12, padding: 20, border: '1px solid rgba(245,158,11,0.15)' }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--orange)', marginBottom: 12 }}>Uploaded Documents</h4>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {Object.entries(form.documents).filter(([, v]) => v).map(([key, val]) => (
                    <div key={key} style={{ textAlign: 'center' }}>
                      <img src={val} alt={key} style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8, border: '2px solid var(--border-color)' }} />
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{key}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="form-nav" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border-color)' }}>
            <button
              className="btn btn-outline"
              onClick={() => step > 1 ? setStep(step - 1) : navigate(`/marketplace/${cooperativeId}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <ArrowLeft size={16} /> {step === 1 ? 'Cancel' : 'Previous'}
            </button>
            {step < 4 ? (
              <button
                className="btn btn-primary"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #2A9D8F, #21867A)' }}
              >
                {loading ? (
                  <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  <><CheckCircle size={16} /> Submit Application</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
