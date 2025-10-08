import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import usersData from '@/mocks/users.json';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithSSO: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check localStorage for existing session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, _password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = usersData.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser as User);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const loginWithSSO = async (): Promise<void> => {
    // Simulate SSO login - default to first learner
    await new Promise(resolve => setTimeout(resolve, 500));
    const defaultUser = usersData[0] as User;
    setUser(defaultUser);
    localStorage.setItem('currentUser', JSON.stringify(defaultUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        loginWithSSO, 
        logout, 
        isAuthenticated: !!user,
        hasRole 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
