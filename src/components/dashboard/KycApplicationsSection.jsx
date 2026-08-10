import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Clock, PauseCircle, PlayCircle, User, FileText, Users, AlertCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { useOutletContext } from 'react-router-dom';
import {
  useGetKycRequestsQuery,
  useApproveKycMutation,
  useRejectKycMutation,
  useInsufficientKycMutation
} from '../../store/mainApi';

const STATUS_META = {
  pending_approval: { label: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  on_hold: { label: 'Needs More Documents', color: '#06B6D4', bg: 'rgba(6,182,212,0.12)' }
};

const normalize = (app) => {
  const a = app.applicant || {};
  return {
    _id: app._id,
    name: a.name,
    phone: a.phone,
    email: a.email,
    address: a.address,
    gender: a.gender,
    dob: a.dob,
    citizenshipNo: a.citizenshipNo,
    branch: a.branch,
    nomineeName: a.nomineeName,
    nomineeRelation: a.nomineeRelation,
    nomineePhone: a.nomineePhone,
    documents: app.kycDocuments || {},
    status: app.status === 'insufficient' ? 'on_hold' : 'pending_approval',
    rejectionReason: app.remarks,
    createdAt: app.createdAt
  };
};

export default function KycApplicationsSection() {
  const { activeCooperativeId } = useOutletContext() || {};
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [acting, setActing] = useState(false);

  const { data: kycData, isLoading, isFetching, isError, refetch } = useGetKycRequestsQuery(activeCooperativeId, {
    skip: !activeCooperativeId
  });

  const [approveKyc] = useApproveKycMutation();
  const [rejectKyc] = useRejectKycMutation();
  const [insufficientKyc] = useInsufficientKycMutation();

  useEffect(() => {
    setLoading(isLoading || isFetching);
    if (isError) {
      setApplications([]);
    } else if (kycData !== undefined) {
      setApplications(
        (kycData.applications || [])
          .filter(a => a.status === 'pending' || a.status === 'insufficient')
          .map(normalize)
      );
    }
  }, [kycData, isLoading, isFetching, isError]);

  const load = () => {
    refetch();
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (app, action) => {
    setActing(true);
    try {
      if (action === 'active') {
        await approveKyc(app._id).unwrap();
      } else if (action === 'on_hold') {
        await insufficientKyc({ id: app._id, remarks: 'More documents required' }).unwrap();
      } else if (action === 'rejected') {
        await rejectKyc({ id: app._id, remarks: rejectionReason || 'Rejected by manager' }).unwrap();
      }
      const label = action === 'active' ? 'Approved' : action === 'on_hold' ? 'Requested more documents' : action === 'rejected' ? 'Rejected' : 'Updated';
      toast.success(`${app.name}'s application ${label}`);
      setSelectedApp(null);
      setShowRejectModal(false);
      setRejectionReason('');
      load();
    } catch (err) {
      toast.error(err?.data?.message || 'Action failed');
    } finally {
      setActing(false);
    }
  };

  const openReject = (app) => {
    setSelectedApp(app);
    setShowRejectModal(true);
  };

  const pendingCount = applications.filter(a => a.status === 'pending_approval').length;
  const holdCount = applications.filter(a => a.status === 'on_hold').length;

  return (
    <div className="glass-card" style={{ padding: 28, marginTop: 28, marginBottom: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="glass-chip"><User size={15} color="var(--emerald)" /></div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>KYC Applications</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Membership requests submitted from the user section</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {pendingCount > 0 && (
            <span className="glass-chip" style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
              <Clock size={13} style={{ marginRight: 6 }} />{pendingCount} Pending
            </span>
          )}
          {holdCount > 0 && (
            <span className="glass-chip" style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4' }}>
              <PauseCircle size={13} style={{ marginRight: 6 }} />{holdCount} On Hold
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)', fontSize: 13 }}>Loading applications...</div>
      ) : applications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 30 }}>
          <CheckCircle size={36} color="var(--emerald)" style={{ margin: '0 auto 10px', opacity: 0.3 }} />
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No pending KYC applications. All caught up!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {applications.map(app => (
            <div key={app._id} className="glass-account-card" style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div className="glass-avatar">{app.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{app.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {app.phone} • {app.address} • Applied {formatDate(app.createdAt)}
                  </p>
                  {app.rejectionReason && (
                    <p style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}><AlertCircle size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />{app.rejectionReason}</p>
                  )}
                </div>
                <span className="glass-chip" style={{ background: STATUS_META[app.status].bg, color: STATUS_META[app.status].color }}>
                  {app.status === 'on_hold' ? <PauseCircle size={13} style={{ marginRight: 6 }} /> : <Clock size={13} style={{ marginRight: 6 }} />}
                  {STATUS_META[app.status].label}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => setSelectedApp(app)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Eye size={13} /> Review
                  </button>
                  {app.status === 'on_hold' && (
                    <button className="btn btn-sm" onClick={() => handleAction(app, 'active')} disabled={acting} style={{ background: 'rgba(42,157,143,0.1)', color: '#2A9D8F', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <PlayCircle size={13} /> Resume
                    </button>
                  )}
                  <button className="btn btn-sm" onClick={() => handleAction(app, 'active')} disabled={acting} style={{ background: 'rgba(42,157,143,0.1)', color: '#2A9D8F', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle size={13} /> Approve
                  </button>
                  <button className="btn btn-sm" onClick={() => handleAction(app, 'on_hold')} disabled={acting} style={{ background: 'rgba(6,182,212,0.1)', color: '#06B6D4', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <PauseCircle size={13} /> Hold
                  </button>
                  <button className="btn btn-sm" onClick={() => openReject(app)} disabled={acting} style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <XCircle size={13} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedApp && !showRejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setSelectedApp(null)}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, maxWidth: 680, width: '100%', maxHeight: '90vh', overflow: 'auto', padding: 32, border: '1px solid var(--border-color)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>KYC Application Review</h3>
              <span className="glass-chip" style={{ background: STATUS_META[selectedApp.status].bg, color: STATUS_META[selectedApp.status].color }}>{STATUS_META[selectedApp.status].label}</span>
            </div>

            <div style={{ marginBottom: 18 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--emerald)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><User size={14} /> Personal Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[['Name', selectedApp.name], ['Phone', selectedApp.phone], ['Email', selectedApp.email || 'N/A'], ['Address', selectedApp.address], ['Gender', selectedApp.gender], ['DOB', selectedApp.dob], ['Citizenship No.', selectedApp.citizenshipNo], ['Branch', selectedApp.branch]].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><Users size={14} /> Nominee Information</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[['Name', selectedApp.nomineeName], ['Relation', selectedApp.nomineeRelation], ['Phone', selectedApp.nomineePhone]].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--orange)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><FileText size={14} /> Uploaded Documents</h4>
              {selectedApp.documents && Object.entries(selectedApp.documents).filter(([, v]) => v).length > 0 ? (
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {Object.entries(selectedApp.documents).filter(([, v]) => v).map(([key, val]) => (
                    <div key={key} style={{ textAlign: 'center' }}>
                      <img src={val} alt={key} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 12, border: '2px solid var(--border-color)' }} />
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>No documents uploaded.</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 18, borderTop: '1px solid var(--border-color)' }}>
              <button className="btn btn-outline" onClick={() => setSelectedApp(null)}>Close</button>
              <button className="btn btn-sm" onClick={() => handleAction(selectedApp, 'on_hold')} disabled={acting} style={{ background: 'rgba(6,182,212,0.1)', color: '#06B6D4', border: 'none' }}>
                <PauseCircle size={13} style={{ marginRight: 6 }} /> Hold
              </button>
              <button className="btn btn-sm" onClick={() => openReject(selectedApp)} disabled={acting} style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'none' }}>
                <XCircle size={13} style={{ marginRight: 6 }} /> Reject
              </button>
              <button className="btn btn-primary" onClick={() => handleAction(selectedApp, 'active')} disabled={acting} style={{ background: 'linear-gradient(135deg, #2A9D8F, #21867A)' }}>
                <CheckCircle size={13} style={{ marginRight: 6 }} /> Approve Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedApp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => { setShowRejectModal(false); setRejectionReason(''); }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, maxWidth: 480, width: '100%', padding: 32, border: '1px solid var(--border-color)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Reject Application</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
              Please provide a reason for rejecting <strong>{selectedApp.name}</strong>'s application.
            </p>
            <div className="form-group">
              <label className="form-label">Rejection Reason</label>
              <textarea
                className="glass-input"
                rows={3}
                style={{ width: '100%', resize: 'vertical' }}
                placeholder="E.g. Incomplete documentation, invalid citizenship..."
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-outline" onClick={() => { setShowRejectModal(false); setRejectionReason(''); }}>Cancel</button>
              <button className="btn" onClick={() => handleAction(selectedApp, 'rejected')} disabled={acting} style={{ background: '#EF4444', color: 'white', border: 'none' }}>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
