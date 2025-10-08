import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { AuthContext } from './auth-context';
import { LoginResponse, User } from '@/types/autentication.interface';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getToken();
        const storedUser = localStorage.getItem('currentUser');

        if (token && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const loginMutation = useMutation({
    mutationFn: (credentials: { email: string; password: string }) => 
      authService.login(credentials),
    onSuccess: (data: LoginResponse) => {
      if (data.userName && data.token) {
        const userData = {
          email: data.email,
          userName: data.userName,
          role: data.role,
          userId: data.userId
        };
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(userData));
      }
    },
  });

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      const token = authService.getToken();
      
      if (storedUser && token) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser) {
          setUser(parsedUser);
        }
      } else {
        authService.logout();
        setUser(null);
      }
    } catch (error) {
      console.error('Error al recuperar la sesión:', error);
      authService.logout();
      setUser(null);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await loginMutation.mutateAsync({ email, password });
      return true;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error al iniciar sesión');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    authService.logout();
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
        logout,
        isAuthenticated,
        hasRole,
        isLoading: loginMutation.isPending || isLoading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}