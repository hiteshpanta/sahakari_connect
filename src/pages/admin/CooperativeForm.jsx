import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Building2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetCooperativeByIdQuery, useGetUsersQuery, useUpdateCooperativeMutation, useCreateCooperativeMutation } from '../../store/mainApi';
import { Formik } from 'formik';
import * as Yup from 'yup';

const PROVINCES = [
  'Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'
];

const CATEGORIES = [
  'Saving & Credit', 'Multi-purpose', 'Agriculture', 'Dairy', 'Thrift', 'Housing', 'Consumer'
];

const PLANS = ['free', 'basic', 'premium'];

const cooperativeSchema = Yup.object({
  name: Yup.string().required('Cooperative name is required'),
  address: Yup.string().required('Address is required'),
  contactEmail: Yup.string()
    .email('Invalid email address')
    .required('Contact email is required'),
  contactPhone: Yup.string().required('Contact phone is required'),
  establishedYear: Yup.number()
    .typeError('Enter a valid year')
    .min(1950, 'Year must be 1950 or later')
    .max(2026, 'Year cannot be in the future'),
  registrationNo: Yup.string(),
  district: Yup.string(),
  province: Yup.string(),
  category: Yup.string(),
  subscriptionPlan: Yup.string(),
  managers: Yup.array(),
});

export default function CooperativeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [managerEmail, setManagerEmail] = useState('');
  const [existingManagers, setExistingManagers] = useState([]);
  const { data: coop, isLoading: coopLoading, isError: coopError } = useGetCooperativeByIdQuery(id, { skip: !isEdit });
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery(undefined, { skip: !isEdit });

  const [updateCoop] = useUpdateCooperativeMutation();
  const [createCoop] = useCreateCooperativeMutation();

  useEffect(() => {
    if (!isEdit) return;
    setLoading(coopLoading || usersLoading);
  }, [coopLoading, usersLoading, isEdit]);

  useEffect(() => {
    if (!isEdit) return;
    if (coopError) {
      toast.error('Failed to load cooperative');
      navigate('/admin/cooperatives');
    }
  }, [coopError, isEdit, navigate]);

  useEffect(() => {
    if (!isEdit) return;
    if (usersData !== undefined) {
      setExistingManagers(usersData.filter(u => u.role === 'manager'));
    }
  }, [usersData, isEdit]);

  const initialValues = {
    name: coop?.name || '',
    address: coop?.address || '',
    district: coop?.district || '',
    province: coop?.province || 'Bagmati',
    establishedYear: coop?.establishedYear ? String(coop.establishedYear) : '',
    category: coop?.category || 'Saving & Credit',
    contactEmail: coop?.contactEmail || '',
    contactPhone: coop?.contactPhone || '',
    registrationNo: coop?.registrationNo || '',
    subscriptionPlan: coop?.subscriptionPlan || 'free',
    managers: coop?.managers || [],
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={cooperativeSchema}
      onSubmit={async (values) => {
        setSaving(true);
        try {
          const payload = {
            ...values,
            establishedYear: values.establishedYear ? Number(values.establishedYear) : undefined,
          };
          if (isEdit) {
            await updateCoop({ id, ...payload }).unwrap();
          } else {
            await createCoop(payload).unwrap();
          }
          toast.success(isEdit ? 'Cooperative updated successfully!' : 'Cooperative created successfully!');
          navigate('/admin/cooperatives');
        } catch (err) {
          toast.error(err?.data?.message || 'Something went wrong');
        } finally {
          setSaving(false);
        }
      }}
    >
      {(formik) => {
        const addManager = () => {
          const email = managerEmail.trim().toLowerCase();
          if (!email) return;
          const user = existingManagers.find(u => u.email.toLowerCase() === email);
          if (!user) {
            toast.error('No manager account found with that email');
            return;
          }
          if (formik.values.managers.includes(user._id)) {
            toast('Manager already added');
            return;
          }
          formik.setFieldValue('managers', [...formik.values.managers, user._id]);
          setManagerEmail('');
        };

        const removeManager = (managerId) => {
          formik.setFieldValue('managers', formik.values.managers.filter(m => m !== managerId));
        };

        const managerEmailFor = (managerId) => {
          const u = existingManagers.find(m => m._id === managerId);
          return u ? u.email : managerId;
        };

        const addedManagerUsers = formik.values.managers
          .map(managerId => existingManagers.find(m => m._id === managerId))
          .filter(Boolean);
        const availableManagerEmails = existingManagers
          .filter(u => !formik.values.managers.includes(u._id))
          .map(u => u.email);

        return (
          <div className="animate-fade-in">
            <div className="page-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <button className="btn btn-outline btn-icon" onClick={() => navigate('/admin/cooperatives')}><ArrowLeft size={16} /></button>
                <div>
                  <h1 className="page-title">{isEdit ? 'Edit Cooperative' : 'Add Cooperative'}</h1>
                  <p className="page-subtitle">{isEdit ? `Updating ${formik.values.name}` : 'Register a new sahakari / cooperative'}</p>
                </div>
              </div>
            </div>

            <form onSubmit={formik.handleSubmit}>
              <div className="card mb-5">
                <h3 className="card-title mb-5"><Building2 size={16} style={{ marginRight: 8 }} /> Basic Information</h3>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Cooperative Name *</label>
                    <input className="form-input" placeholder="e.g. Sajha Sahakari Sanstha" name="name" value={formik.values.name} onChange={formik.handleChange} />
                    {formik.touched.name && formik.errors.name && <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Registration No.</label>
                    <input className="form-input" placeholder="e.g. NRB-12345" name="registrationNo" value={formik.values.registrationNo} onChange={formik.handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Established Year</label>
                    <input type="number" min={1950} max={2026} className="form-input" placeholder="e.g. 2010" name="establishedYear" value={formik.values.establishedYear} onChange={formik.handleChange} />
                    {formik.touched.establishedYear && formik.errors.establishedYear && <p className="text-red-500 text-sm mt-1">{formik.errors.establishedYear}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" name="category" value={formik.values.category} onChange={formik.handleChange}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="card mb-5">
                <h3 className="card-title mb-5">Address</h3>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Address *</label>
                    <input className="form-input" placeholder="Municipality / Tole" name="address" value={formik.values.address} onChange={formik.handleChange} />
                    {formik.touched.address && formik.errors.address && <p className="text-red-500 text-sm mt-1">{formik.errors.address}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">District</label>
                    <input className="form-input" placeholder="e.g. Kathmandu" name="district" value={formik.values.district} onChange={formik.handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Province</label>
                    <select className="form-select" name="province" value={formik.values.province} onChange={formik.handleChange}>
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="card mb-5">
                <h3 className="card-title mb-5">Contact & Subscription</h3>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Contact Email *</label>
                    <input type="email" className="form-input" placeholder="info@coop.com.np" name="contactEmail" value={formik.values.contactEmail} onChange={formik.handleChange} />
                    {formik.touched.contactEmail && formik.errors.contactEmail && <p className="text-red-500 text-sm mt-1">{formik.errors.contactEmail}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Phone *</label>
                    <input className="form-input" placeholder="98XXXXXXXX" name="contactPhone" value={formik.values.contactPhone} onChange={formik.handleChange} />
                    {formik.touched.contactPhone && formik.errors.contactPhone && <p className="text-red-500 text-sm mt-1">{formik.errors.contactPhone}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subscription Plan</label>
                    <select className="form-select" name="subscriptionPlan" value={formik.values.subscriptionPlan} onChange={formik.handleChange}>
                      {PLANS.map(p => <option key={p} value={p} style={{ textTransform: 'capitalize' }}>{p}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {isEdit && (
                <div className="card mb-5">
                  <h3 className="card-title mb-2">Managers</h3>
                  <p className="card-subtitle mb-5">Emails of users granted manager access to this cooperative</p>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                    {formik.values.managers.length === 0 && (
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No managers assigned yet.</span>
                    )}
                    {formik.values.managers.map(managerId => (
                      <span key={managerId} className="badge badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px' }}>
                        {managerEmailFor(managerId)}
                        <button type="button" onClick={() => removeManager(managerId)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex' }}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      className="form-input"
                      list="manager-options"
                      style={{ maxWidth: 320 }}
                      placeholder="Add manager email..."
                      value={managerEmail}
                      onChange={e => setManagerEmail(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addManager(); } }}
                    />
                    <datalist id="manager-options">
                      {availableManagerEmails.map(email => <option key={email} value={email} />)}
                    </datalist>
                    <button type="button" className="btn btn-outline" onClick={addManager}><Plus size={14} /> Add</button>
                  </div>
                  {addedManagerUsers.length > 0 && (
                    <p style={{ marginTop: 'var(--space-3)', fontSize: 12, color: 'var(--text-muted)' }}>
                      {addedManagerUsers.length} manager{addedManagerUsers.length > 1 ? 's' : ''} will be granted access.
                    </p>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/cooperatives')}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <Save size={15} /> {saving ? 'Saving...' : isEdit ? 'Update Cooperative' : 'Create Cooperative'}
                </button>
              </div>
            </form>
          </div>
        );
      }}
    </Formik>
  );
}
