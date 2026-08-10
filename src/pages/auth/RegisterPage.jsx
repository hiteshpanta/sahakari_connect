import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Landmark, ArrowRight, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { Formik } from 'formik';
import { useUserRegisterMutation } from '../../api/authApi';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/authSlice';
import * as Yup from 'yup';


const registerSchema = Yup.object({
  name: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .required("Name is required"),

  email: Yup.string()
    .email("Invalid email")
    .required("Email is required"),

  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain uppercase, lowercase, number and special character"
    )
    .required("Password is required"),

  role: Yup.string()
    .required("Role is required"),
  
});

export default function RegisterPage() {

  const [ userRegister, {isLoading}] = useUserRegisterMutation();
  const dispatch = useDispatch();

  const navigate = useNavigate();


  return (
    <div className="auth-shell">
      <div className="auth-grid" />
      <div className="auth-orb" style={{ width: 600, height: 600, background: '#8B5CF6', top: -300, left: -200, opacity: 0.45 }} />
      <div className="auth-orb" style={{ width: 500, height: 500, background: '#2A9D8F', bottom: -250, right: -100, opacity: 0.45 }} />
      <div className="auth-orb" style={{ width: 400, height: 400, background: '#06b6d4', top: '20%', left: '40%', opacity: 0.3 }} />

      {/* Form */}
      <div className="auth-form-panel">
        <div className="glass-panel">
          <div className="auth-brand">
            <div className="brand-logo" style={{ width: 44, height: 44, borderRadius: 12 }}>
              <Landmark size={22} />
            </div>
            <span className="auth-brand-name">Aama <span>Cooperatives</span></span>
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Create Account</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>Fill in your details to get started.</p>

          <Formik
            initialValues={{
              name: "",
              email: "",
              password: "",
              role: "member",
            }}

            validationSchema={registerSchema}

            onSubmit={async(values)=>{

              try {

                const response = await userRegister(values).unwrap();

                const user = response?.user ?? response;
                dispatch(setUser(user));

                toast.success(
                  "Registration successful! Welcome aboard."
                );

                // Render the new user straight into their dashboard
                if (user?.role === 'member') {
                  navigate('/member/dashboard');
                } else if (user?.role === 'manager') {
                  navigate(`/c/${user?.cooperativeId || 'setup'}/dashboard`);
                } else {
                  navigate('/');
                }

              } catch(err){

                console.log(err)

                toast.error(
                  err?.data?.message ||
                  err?.data?.data ||
                  "Registration failed"
                );

              }

            }}
          >
          {({
          values,
          handleChange,
          handleSubmit,
          errors,
          touched,
          })=>(
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <User size={15} className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="E.g. John Doe"
                    name='name'
                    value={values.name}
                    onChange={handleChange}
                  />
                </div>
                  {touched.name && errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name}
                    </p>
                  )}
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail size={15} className="input-icon" />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="john@aamacooperatives.com"
                    name='email'
                    value={values.email}
                    onChange={handleChange}
                  />
                </div>
                {touched.email && errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <Lock size={15} className="input-icon" />
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Create a strong password"
                    name='password'
                    value={values.password}
                    onChange={handleChange}
                  />
                </div>
                {touched.password && errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <div className="input-wrapper">
                    <Briefcase size={15} className="input-icon" />
                    <select
                      className="form-input"
                      name='role'
                      value={values.role}
                      onChange={handleChange}
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="member">Member</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                  {touched.role && errors.role && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.role}
                    </p>
                  )}
                </div>
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
                    Create Account <ArrowRight size={18} />
                  </span>
                )}
              </button>
            </div>
          </form>
          )
        }
        </Formik>

          <div style={{ marginTop: 24, textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--glass-border)' }} />
            <span style={{ background: 'var(--glass-bg-strong)', padding: '0 12px', fontSize: 12, color: 'var(--text-muted)', position: 'relative' }}>OR</span>
          </div>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <span 
              onClick={() => navigate('/login')} 
              style={{ color: '#2A9D8F', cursor: 'pointer', fontWeight: 600, transition: '0.2s', padding: '4px 8px', borderRadius: 6 }}
              onMouseOver={e => e.target.style.background = 'rgba(42,157,143,0.1)'}
              onMouseOut={e => e.target.style.background = 'transparent'}
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
