import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin, register as apiRegister } from '../api/auth';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const token = await SecureStore.getItemAsync('token');
      const userJson = await SecureStore.getItemAsync('user');
      if (token && userJson) {
        setUser(JSON.parse(userJson));
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const result = await apiLogin(email, password);
    await SecureStore.setItemAsync('token', result.token);
    await SecureStore.setItemAsync('user', JSON.stringify(result.user));
    setUser(result.user);
  }

  async function register(name: string, email: string, password: string) {
    const result = await apiRegister(name, email, password);
    await SecureStore.setItemAsync('token', result.token);
    await SecureStore.setItemAsync('user', JSON.stringify(result.user));
    setUser(result.user);
  }

  async function logout() {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}