
import { createContext, useContext, useState, ReactNode } from 'react';
import { Admin, AuthContextType } from '../types';
import { admins } from '../data/students';

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Admin | null>(() => {
    const storedUser = localStorage.getItem('progresspoint_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (username: string, password: string) => {
    const admin = admins.find(
      (a) => a.username.toLowerCase() === username.toLowerCase() && a.password === password
    );

    if (admin) {
      setUser(admin);
      localStorage.setItem('progresspoint_user', JSON.stringify(admin));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('progresspoint_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
