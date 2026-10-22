// admin-web/src/context/MarketerAuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import marketerApi from '../services/marketerApi';

const MarketerAuthContext = createContext(null);

export function MarketerAuthProvider({ children }) {
  const [marketer, setMarketer] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem('marketer_token');
    if (!token) {
      setMarketer(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await marketerApi.get('/marketers/auth/me');
      setMarketer(data);
    } catch {
      localStorage.removeItem('marketer_token');
      setMarketer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (phone_number, password) => {
    const { data } = await marketerApi.post('/marketers/auth/login', {
      phone_number,
      password,
    });
    localStorage.setItem('marketer_token', data.token);
    await refresh();
    return data;
  };

  const logout = () => {
    localStorage.removeItem('marketer_token');
    setMarketer(null);
  };

  return (
    <MarketerAuthContext.Provider
      value={{ marketer, loading, login, logout, refresh }}
    >
      {children}
    </MarketerAuthContext.Provider>
  );
}

export const useMarketerAuth = () => useContext(MarketerAuthContext);