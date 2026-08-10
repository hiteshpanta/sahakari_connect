import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { customers as mockCustomers } from "../../data/mockData";
import { formatDate } from '../../utils/formatters';
import { CheckCircle, XCircle, Eye, X, User, FileText, Users, Clock, PauseCircle, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetCustomersQuery, useUpdateCustomerStatusMutation } from '../../store/mainApi';

export default function MembershipApplications() {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data: customersData, isLoading, isError, refetch } = useGetCustomersQuery();

  useEffect(() => {
    setLoading(isLoading);
    if (isError) {
      const pending = (mockCustomers || []).filter(c => c.status === 'pending_approval' || c.status === 'on_hold');
      setApplications(pending.length ? pending : [
        { _id: 'APP001', name: 'Sita Sharma', phone: '9845123456', email: 'sita@mail.com', address: 'Pokhara-5, Kaski', gender: 'Female', dob: '1995-03-15', citizenshipNo: '33-01-76-12345', nomineeName: 'Ram Sharma', nomineeRelation: 'Spouse', nomineePhone: '9845654321', status: 'pending_approval', createdAt: '2024-06-10T08:30:00Z', documents: { citizenshipFront: '', citizenshipBack: '', photo: '', signature: '' } },
        { _id: 'APP002', name: 'Bijay Gurung', phone: '9812345678', email: 'bijay@mail.com', address: 'Bharatpur-10, Chitwan', gender: 'Male', dob: '1990-08-22', citizenshipNo: '35-02-72-54321', nomineeName: 'Mina Gurung', nomineeRelation: 'Mother', nomineePhone: '9812111222', status: 'pending_approval', createdAt: '2024-06-12T14:00:00Z', documents: { citizenshipFront: '', photo: '', signature: '' } }
      ]);
    } else if (customersData !== undefined) {
      setApplications(customersData.filter(c => c.status === 'pending_approval' || c.status === 'on_hold'));
    }
  }, [customersData, isLoading, isError]);

  useEffect(() => {
    refetch();
  }, [currentUser, refetch]);

  const [updateCustomerStatus] = useUpdateCustomerStatusMutation();

  const handleAction = async (id, status) => {
    try {
      const body = { status };
      if (status === 'rejected' && rejectionReason) body.rejectionReason = rejectionReason;

      await updateCustomerStatus({ id, ...body }).unwrap();

      toast.success(status === 'active' ? 'Application Approved! Member created.'
        : status === 'on_hold' ? 'Application put on hold.'
        : 'Application Rejected.');
    } catch (err) {
      toast.error(err?.data?.message || 'Action failed. Please try again.');
      return;
    }

    setApplications(prev => prev.filter(a => a._id !== id));
    setSelectedApp(null);
    setShowRejectModal(false);
    setRejectionReason('');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>Membership Applications</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Review and manage incoming membership requests</p>
        </div>
        <div className="badge" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', padding: '8px 16px', borderRadius: 20, fontSize: 14, fontWeight: 600 }}>
          <Clock size={14} style={{ marginRight: 6 }} />
          {applications.length} Pending
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <CheckCircle size={48} color="var(--emerald)" style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>All Caught Up!</h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>There are no pending membership applications to review.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {applications.map(app => (
            <div key={app._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(6,182,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'var(--blue)' }}>
                    {app.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{app.name}</h3>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      <span>{app.phone}</span>
                      <span>{app.address}</span>
                      <span>Applied: {formatDate(app.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="badge" style={{
                    background: app.status === 'on_hold' ? 'rgba(6,182,212,0.12)' : 'rgba(245,158,11,0.12)',
                    color: app.status === 'on_hold' ? '#06B6D4' : '#F59E0B',
                    display: 'flex', alignItems: 'center', gap: 4
                  }}>
                    {app.status === 'on_hold' ? <PauseCircle size={13} /> : <Clock size={13} />}
                    {app.status === 'on_hold' ? 'On Hold' : 'Pending'}
                  </span>
                  <button className="btn btn-outline btn-sm" onClick={() => setSelectedApp(app)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Eye size={14} /> Review
                  </button>
                  {app.status === 'on_hold' && (
                    <button className="btn btn-sm" onClick={() => handleAction(app._id, 'active')} style={{ background: 'rgba(42,157,143,0.1)', color: '#2A9D8F', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <PlayCircle size={14} /> Resume
                    </button>
                  )}
                  <button className="btn btn-sm" onClick={() => handleAction(app._id, 'active')} style={{ background: 'rgba(42,157,143,0.1)', color: '#2A9D8F', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button className="btn btn-sm" onClick={() => handleAction(app._id, 'on_hold')} style={{ background: 'rgba(6,182,212,0.1)', color: '#06B6D4', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <PauseCircle size={14} /> Hold
                  </button>
                  <button className="btn btn-sm" onClick={() => { setSelectedApp(app); setShowRejectModal(true); }} style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Detail Modal */}
      {selectedApp && !showRejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setSelectedApp(null)}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, maxWidth: 700, width: '100%', maxHeight: '90vh', overflow: 'auto', padding: 32, border: '1px solid var(--border-color)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>Application Review</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedApp(null)}><X size={18} /></button>
            </div>

            {/* Personal Details */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--emerald)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><User size={14} /> Personal Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[['Name', selectedApp.name], ['Phone', selectedApp.phone], ['Email', selectedApp.email || 'N/A'], ['Address', selectedApp.address], ['Gender', selectedApp.gender], ['DOB', selectedApp.dob], ['Citizenship No.', selectedApp.citizenshipNo]].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nominee */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--blue)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Users size={14} /> Nominee Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[['Nominee Name', selectedApp.nomineeName], ['Relation', selectedApp.nomineeRelation], ['Phone', selectedApp.nomineePhone]].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--orange)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><FileText size={14} /> Uploaded Documents</h3>
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
                <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>No documents uploaded yet (mock data).</p>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 20, borderTop: '1px solid var(--border-color)' }}>
              <button className="btn btn-outline" onClick={() => setSelectedApp(null)}>Close</button>
              <button className="btn btn-sm" onClick={() => handleAction(selectedApp._id, 'on_hold')} style={{ background: 'rgba(6,182,212,0.1)', color: '#06B6D4', border: 'none', padding: '8px 20px', borderRadius: 10 }}>
                <PauseCircle size={14} style={{ marginRight: 6 }} /> Hold
              </button>
              <button className="btn btn-sm" onClick={() => { setShowRejectModal(true); }} style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'none', padding: '8px 20px', borderRadius: 10 }}>
                <XCircle size={14} style={{ marginRight: 6 }} /> Reject
              </button>
              <button className="btn btn-primary" onClick={() => handleAction(selectedApp._id, 'active')} style={{ background: 'linear-gradient(135deg, #2A9D8F, #21867A)' }}>
                <CheckCircle size={14} style={{ marginRight: 6 }} /> Approve Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && selectedApp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => { setShowRejectModal(false); setRejectionReason(''); }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, maxWidth: 480, width: '100%', padding: 32, border: '1px solid var(--border-color)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Reject Application</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
              Please provide a reason for rejecting <strong>{selectedApp.name}</strong>'s application.
            </p>
            <div className="form-group">
              <label className="form-label">Rejection Reason</label>
              <textarea
                className="form-input"
                rows={3}
                style={{ background: 'rgba(0,0,0,0.2)', width: '100%', resize: 'vertical' }}
                placeholder="E.g. Incomplete documentation, invalid citizenship..."
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-outline" onClick={() => { setShowRejectModal(false); setRejectionReason(''); }}>Cancel</button>
              <button className="btn" onClick={() => handleAction(selectedApp._id, 'rejected')} style={{ background: '#EF4444', color: 'white', border: 'none' }}>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
