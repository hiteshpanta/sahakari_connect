import React, { createContext, useContext, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, logout as logoutAction } from '../store/authSlice';
import { useLoginMutation, useRegisterMutation, useLogoutMutation } from '../store/mainApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user: currentUser, loading } = useSelector((state) => state.auth);
  const [error, setError] = useState('');

  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();

  const login = useCallback(async (email, password) => {
    try {
      const data = await loginMutation({ email, password }).unwrap();
      if (data.token) localStorage.setItem('token', data.token);
      dispatch(setUser(data?.user ?? data));
      setError('');
      return true;
    } catch (err) {
      setError(err?.data?.message || 'Invalid email or password');
      return false;
    }
  }, [loginMutation, dispatch]);

  const register = useCallback(async (name, email, password, branch, role = 'staff', cooperativeId = null) => {
    try {
      const payload = { name, email, password, branch, role };
      if (cooperativeId) payload.cooperativeId = cooperativeId;

      const data = await registerMutation(payload).unwrap();
      if (data.token) localStorage.setItem('token', data.token);
      dispatch(setUser(data?.user ?? data));
      setError('');
      return true;
    } catch (err) {
      setError(err?.data?.message || 'Registration failed');
      return false;
    }
  }, [registerMutation, dispatch]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    logoutMutation();
    dispatch(logoutAction());
    setError('');
  }, [logoutMutation, dispatch]);

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, error, setError, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
