import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Landmark, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useUserLoginMutation } from '../../api/authApi';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/authSlice';

const loginSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email")
    .required("Email is required"),
  password: Yup.string()
    .min(3, "Password must be at least 3 characters")
    .required("Password is required"),
});

export default function LoginPage() {
  const [userLogin, { isLoading }] = useUserLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="auth-shell">
      <div className="auth-grid" />
      <div className="auth-orb" style={{ width: 640, height: 640, background: '#2A9D8F', top: -260, left: -220, opacity: 0.45 }} />
      <div className="auth-orb" style={{ width: 520, height: 520, background: '#0e7490', bottom: -260, right: -120, opacity: 0.45 }} />
      <div className="auth-orb" style={{ width: 420, height: 420, background: '#8B5CF6', top: '25%', left: '45%', opacity: 0.3 }} />

      {/* Form */}
      <div className="auth-form-panel">
        <div className="glass-panel">
          <div className="auth-brand">
            <div className="brand-logo" style={{ width: 44, height: 44, borderRadius: 12 }}>
              <Landmark size={22} />
            </div>
            <span className="auth-brand-name">Aama <span>Cooperatives</span></span>
          </div>

          <div className="auth-badge">
            <Shield size={13} /> Secure Banking
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Sign In</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>Enter your credentials to access your account.</p>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={loginSchema}
            onSubmit={async (values) => {
              try {
                const response = await userLogin(values).unwrap();
                localStorage.setItem('token', response.token);
                toast.success("Login successful");
                dispatch(setUser(response?.user ?? response));
                navigate('/');
              } catch (err) {
                toast.error(err?.data?.message || err?.data?.data || "Login failed");
              }
            }}
          >
            {({ values, handleChange, handleSubmit, touched, errors }) => (
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <div className="input-wrapper">
                      <Mail size={15} className="input-icon" />
                      <input
                        type="email"
                        className="form-input"
                        placeholder="you@example.com"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                      />
                    </div>
                    {touched.email && errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="input-wrapper">
                      <Lock size={15} className="input-icon" />
                      <input
                        type={showPw ? "text" : "password"}
                        className="form-input"
                        placeholder="Enter your password"
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        style={{ paddingRight: 40 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {touched.password && errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-aurora"
                    style={{ marginTop: 12 }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        Sign In <ArrowRight size={18} />
                      </span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </Formik>

          <div style={{ marginTop: 24, textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--glass-border)' }} />
            <span style={{ background: 'var(--glass-bg-strong)', padding: '0 12px', fontSize: 12, color: 'var(--text-muted)', position: 'relative' }}>OR</span>
          </div>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <span
              onClick={() => navigate('/register')}
              style={{ color: 'var(--emerald)', cursor: 'pointer', fontWeight: 600, transition: '0.2s', padding: '4px 8px', borderRadius: 6 }}
              onMouseOver={e => e.target.style.background = 'rgba(42,157,143,0.1)'}
              onMouseOut={e => e.target.style.background = 'transparent'}
            >
              Create Account
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
