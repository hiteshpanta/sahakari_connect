import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { customers, branches } from '../../data/mockData';
import toast from 'react-hot-toast';
import { Formik } from 'formik';
import * as Yup from 'yup';

const customerSchema = Yup.object({
  name: Yup.string().required('Full name is required'),
  gender: Yup.string().required('Gender is required'),
  dob: Yup.string().required('Date of birth is required'),
  citizenshipNo: Yup.string().required('Citizenship number is required'),
  address: Yup.string().required('Address is required'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^9\d{9}$/, 'Enter a valid 10-digit mobile number'),
  email: Yup.string().email('Invalid email address'),
  branch: Yup.string().required('Branch is required'),
  whatsapp: Yup.string(),
  smsEnabled: Yup.boolean(),
});

export default function CustomerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'new';
  const existing = customers.find(c => c._id === id);

  const initialValues = {
    name: existing?.name || '',
    phone: existing?.phone || '',
    email: existing?.email || '',
    gender: existing?.gender || 'Male',
    dob: existing?.dob || '',
    citizenshipNo: existing?.citizenshipNo || '',
    address: existing?.address || '',
    branch: existing?.branch || branches[0]?.name || '',
    whatsapp: existing?.whatsapp || '',
    smsEnabled: existing?.smsEnabled ?? true,
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <button className="btn btn-outline btn-icon" onClick={() => navigate('/customers')}><ArrowLeft size={16} /></button>
          <div>
            <h1 className="page-title">{isEdit ? 'Edit Customer' : 'Register New Customer'}</h1>
            <p className="page-subtitle">{isEdit ? `Editing ${existing?.name}` : 'Complete KYC registration form'}</p>
          </div>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={customerSchema}
        onSubmit={() => {
          toast.success(isEdit ? 'Customer updated successfully!' : 'Customer registered successfully!');
          navigate('/customers');
        }}
      >
        {({ values, handleChange, handleSubmit, errors, touched }) => (
          <form onSubmit={handleSubmit}>
            <div className="card mb-5">
              <h3 className="card-title mb-5">Personal Details</h3>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" placeholder="Full legal name" name="name" value={values.name} onChange={handleChange} id="input-fullname" />
                  {touched.name && errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select className="form-select" name="gender" value={values.gender} onChange={handleChange} id="select-gender">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                  {touched.gender && errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth *</label>
                  <input type="date" className="form-input" name="dob" value={values.dob} onChange={handleChange} id="input-dob" />
                  {touched.dob && errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Citizenship Number *</label>
                  <input className="form-input" placeholder="e.g. KS-123456" name="citizenshipNo" value={values.citizenshipNo} onChange={handleChange} id="input-citizenship" />
                  {touched.citizenshipNo && errors.citizenshipNo && <p className="text-red-500 text-sm mt-1">{errors.citizenshipNo}</p>}
                </div>
              </div>
            </div>

            <div className="card mb-5">
              <h3 className="card-title mb-5">Contact & Address</h3>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input className="form-input" placeholder="98XXXXXXXX" name="phone" value={values.phone} onChange={handleChange} id="input-phone" />
                  {touched.phone && errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" placeholder="Optional" name="email" value={values.email} onChange={handleChange} id="input-email" />
                  {touched.email && errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Address *</label>
                  <input className="form-input" placeholder="Municipality, District, Province" name="address" value={values.address} onChange={handleChange} id="input-address" />
                  {touched.address && errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>
              </div>
            </div>

            <div className="card mb-5">
              <h3 className="card-title mb-5">Banking & Communication</h3>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Branch *</label>
                  <select className="form-select" name="branch" value={values.branch} onChange={handleChange} id="select-branch">
                    {branches.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                  </select>
                  {touched.branch && errors.branch && <p className="text-red-500 text-sm mt-1">{errors.branch}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">WhatsApp Number</label>
                  <input className="form-input" placeholder="Leave empty if not available" name="whatsapp" value={values.whatsapp} onChange={handleChange} id="input-whatsapp" />
                </div>
              </div>
              <div style={{ marginTop: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <input
                  type="checkbox"
                  id="check-sms"
                  name="smsEnabled"
                  checked={values.smsEnabled}
                  onChange={handleChange}
                  style={{ width: 16, height: 16, accentColor: 'var(--blue-primary)' }}
                />
                <label htmlFor="check-sms" style={{ fontSize: 14, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Enable SMS Banking for this customer
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/customers')}>Cancel</button>
              <button type="submit" className="btn btn-primary" id="btn-save-customer">
                <Save size={15} /> {isEdit ? 'Update Customer' : 'Register Customer'}
              </button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
}
