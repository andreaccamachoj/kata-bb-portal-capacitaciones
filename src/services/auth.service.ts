import { AUTH_SERVICE_LOGIN, AUTH_SERVICE_REGISTER } from '@/config/resources';
import apiClient from '@/lib/api-client';
import { LoginCredentials, LoginResponse, RegisterCredentials } from '@/types/autentication.interface';
import Cookies from 'js-cookie';


class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>(AUTH_SERVICE_LOGIN, credentials);
    this.setToken(data.token);
    return data;
  }

  async logout(): Promise<void> {
    // Obtener usuario actual
    const userStr = localStorage.getItem('currentUser');
    let userId = 0;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userId = user.userId;
      } catch {
        console.log('Error al parsear el usuario almacenado');
      }
    }
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    // Limpiar cookies
    Cookies.remove('token');
    Cookies.remove('currentUser');
    // Limpiar cache (si usas SW o TanStack Query, aquí deberías limpiar)
    if ('caches' in window) {
      caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
    }
    // Llamar al endpoint de logout del backend si hay email
    if (userId) {
      try {
        await apiClient.delete(`/api/v1/auth/logout/${userId}`);
      } catch {
        console.error('Error al llamar al endpoint de logout');
      }
    }
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async register(credentials: RegisterCredentials): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>(AUTH_SERVICE_REGISTER, credentials);
    this.setToken(data.token);
    return data;
  }
}

export const authService = new AuthService();