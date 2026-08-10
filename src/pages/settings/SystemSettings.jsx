import React from 'react';
import { Save, Shield, Smartphone, Globe, Building, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { Formik } from 'formik';
import * as Yup from 'yup';

const settingsSchema = Yup.object({
  smsProvider: Yup.string().required('Select a provider'),
  smsApiKey: Yup.string().required('SMS API key is required'),
  senderId: Yup.string().required('Sender ID is required'),
  whatsappNumber: Yup.string().required('WhatsApp number is required'),
  whatsappToken: Yup.string().required('WhatsApp token is required'),
  webhookToken: Yup.string().required('Webhook verify token is required'),
});

export default function SystemSettings() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">System Settings</h1>
          <p className="page-subtitle">Configure global platform parameters</p>
        </div>
      </div>

      <div className="grid-1-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }}><Building size={16} /> Institution Details</button>
          <button className="btn btn-primary" style={{ justifyContent: 'flex-start' }}><Smartphone size={16} /> SMS & WhatsApp API</button>
          <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }}><Globe size={16} /> Regional & Currency</button>
          <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }}><Shield size={16} /> Security & Passwords</button>
          <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }}><Bell size={16} /> Notifications</button>
        </div>

        <div className="card">
          <h3 className="card-title mb-5">SMS & WhatsApp API Configuration</h3>
          <Formik
            initialValues={{
              smsProvider: 'Nepal Telecom (NTC)',
              smsApiKey: '************************',
              senderId: 'SAHARA',
              whatsappNumber: '+9779800000000',
              whatsappToken: '************************',
              webhookToken: 'sahara_webhook_secret_123',
            }}
            validationSchema={settingsSchema}
            onSubmit={() => {
              toast.success('Settings saved successfully');
            }}
          >
            {({ values, handleChange, handleSubmit, errors, touched }) => (
              <form onSubmit={handleSubmit}>
                <div className="form-group mb-4">
                  <label className="form-label">SMS Gateway Provider</label>
                  <select className="form-select" name="smsProvider" value={values.smsProvider} onChange={handleChange}>
                    <option>Nepal Telecom (NTC)</option>
                    <option>Ncell</option>
                    <option>Sparrow SMS</option>
                  </select>
                  {touched.smsProvider && errors.smsProvider && <p className="text-red-500 text-sm mt-1">{errors.smsProvider}</p>}
                </div>

                <div className="form-grid-2 mb-4">
                  <div className="form-group">
                    <label className="form-label">SMS API Key</label>
                    <input className="form-input" type="password" name="smsApiKey" value={values.smsApiKey} onChange={handleChange} />
                    {touched.smsApiKey && errors.smsApiKey && <p className="text-red-500 text-sm mt-1">{errors.smsApiKey}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sender ID</label>
                    <input className="form-input" name="senderId" value={values.senderId} onChange={handleChange} />
                    {touched.senderId && errors.senderId && <p className="text-red-500 text-sm mt-1">{errors.senderId}</p>}
                  </div>
                </div>

                <div className="divider" />

                <div className="form-group mb-4">
                  <label className="form-label">WhatsApp Business Number</label>
                  <input className="form-input" name="whatsappNumber" value={values.whatsappNumber} onChange={handleChange} />
                  {touched.whatsappNumber && errors.whatsappNumber && <p className="text-red-500 text-sm mt-1">{errors.whatsappNumber}</p>}
                </div>

                <div className="form-grid-2 mb-5">
                  <div className="form-group">
                    <label className="form-label">WhatsApp Cloud API Token</label>
                    <input className="form-input" type="password" name="whatsappToken" value={values.whatsappToken} onChange={handleChange} />
                    {touched.whatsappToken && errors.whatsappToken && <p className="text-red-500 text-sm mt-1">{errors.whatsappToken}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Webhook Verify Token</label>
                    <input className="form-input" type="password" name="webhookToken" value={values.webhookToken} onChange={handleChange} />
                    {touched.webhookToken && errors.webhookToken && <p className="text-red-500 text-sm mt-1">{errors.webhookToken}</p>}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary">
                    <Save size={15} /> Save Changes
                  </button>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
