import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';
import KeycloakLocal from '../../../features/authentication/Keycloak';

/**
 * Cliente HTTP configurado con integración automática de Keycloak
 * Maneja automáticamente tokens bearer, refresh de tokens y redirecciones
 */
export class HttpClient {
  private axiosInstance: AxiosInstance;
  private initialized = false;

  constructor(baseURL?: string) {
    this.axiosInstance = axios.create({
      baseURL: baseURL || import.meta.env.VITE_API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    this.setupInterceptors();
  }

  /**
   * Configurar interceptores de Axios para manejo automático de tokens
   */
  private setupInterceptors(): void {
    if (this.initialized) return;

    // Interceptor para requests - agregar token bearer
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (KeycloakLocal.authenticated && KeycloakLocal.token) {
          config.headers.Authorization = `Bearer ${KeycloakLocal.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para responses - manejar tokens expirados
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && KeycloakLocal.authenticated) {
          try {
            // Intentar refrescar el token
            const refreshed = await KeycloakLocal.updateToken(30);
            if (refreshed) {
              // Reintentar la petición original con el nuevo token
              const originalRequest = error.config;
              originalRequest.headers.Authorization = `Bearer ${KeycloakLocal.token}`;
              return this.axiosInstance.request(originalRequest);
            } else {
              // Si no se puede refrescar, redirigir al login
              toast.error('Sesión expirada. Redirigiendo al login...');
              KeycloakLocal.login();
            }
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
            toast.error('Error actualizando token. Redirigiendo al login...');
            KeycloakLocal.login();
          }
        }
        return Promise.reject(error);
      }
    );

    this.initialized = true;
  }

  /**
   * Realizar petición GET
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  /**
   * Realizar petición POST
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  /**
   * Realizar petición PUT
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  /**
   * Realizar petición PATCH
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  /**
   * Realizar petición DELETE
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }

  /**
   * Obtener la instancia de axios para casos especiales
   */
  getInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * Configurar base URL dinámicamente
   */
  setBaseURL(baseURL: string): void {
    this.axiosInstance.defaults.baseURL = baseURL;
  }

  /**
   * Agregar header personalizado
   */
  setHeader(name: string, value: string): void {
    this.axiosInstance.defaults.headers.common[name] = value;
  }

  /**
   * Remover header
   */
  removeHeader(name: string): void {
    delete this.axiosInstance.defaults.headers.common[name];
  }
}

// Instancia singleton del cliente HTTP
export const httpClient = new HttpClient();