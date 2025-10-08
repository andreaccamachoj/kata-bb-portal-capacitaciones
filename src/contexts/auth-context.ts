import { User } from '@/types/autentication.interface';
import { createContext } from 'react';

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: string | string[]) => boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);