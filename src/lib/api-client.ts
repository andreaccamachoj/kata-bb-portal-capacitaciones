import axios from 'axios';
import { authService } from '@/services/auth.service';
import { API_BASE_URL } from '@/config/environment';

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  // exp está en segundos
  return Date.now() >= payload.exp * 1000;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL
});

// Interceptor para agregar el token de autenticación y validar expiración
apiClient.interceptors.request.use(async (config) => {
  const token = authService.getToken();
  if (token) {
    if (isTokenExpired(token)) {
      await authService.logout();
      window.location.href = '/login';
      throw new axios.Cancel('Sesión expirada. Logout forzado.');
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      authService.logout();
      window.location.href = '/login';
    }
    
    // Manejar errores de permisos
    if (error.response?.status === 403) {
      window.location.href = '/unauthorized';
    }

    // Personalizar mensajes de error
    const customError = new Error(
      error.response?.data?.message || 'Ha ocurrido un error inesperado'
    );
    return Promise.reject(customError);
  }
);

export default apiClient;