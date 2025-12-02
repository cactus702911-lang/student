
import React, { createContext, useContext, useState, useEffect } from 'react';
import { backend } from '../services/backend';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (u: string, p: string) => Promise<boolean>;
  signup: (u: string, p: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = backend.getCurrentUser();
    setUser(session);
    setIsLoading(false);
  }, []);

  const login = async (u: string, p: string) => {
    const res = await backend.login(u, p);
    if (res.success && res.data) {
      setUser(res.data);
      return true;
    }
    return false;
  };

  const signup = async (u: string, p: string) => {
      const res = await backend.signup(u, p);
      if (res.success && res.data) {
          setUser(res.data);
          return { success: true };
      }
      return { success: false, error: res.error };
  };

  const logout = async () => {
    await backend.logout();
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
      const res = await backend.updateUser(data);
      if (res.success && res.data) {
          setUser(res.data);
          return true;
      }
      return false;
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateProfile, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
