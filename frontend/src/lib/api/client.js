import axios from 'axios';
import { getAccessToken, setAccessToken, clearAccessToken } from '../../auth/tokenStore';
import { resolveApiBaseUrl } from '../../utils/apiBase';
import { refreshClient } from './refreshClient';

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

let refreshPromise = null;

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post('/auth/refresh')
      .then((response) => {
        const payload = response.data?.data || response.data || {};
        const token = payload.accessToken || payload.token;
        const user = payload.user || response.data?.user;
        setAccessToken(token);
        return { token, user };
      })
      .catch((error) => {
        clearAccessToken();
        window.dispatchEvent(new Event('auth:expired'));
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const url = original?.url || '';

    if (status !== 401 || original?._retry || url.includes('/auth/refresh') || url.includes('/auth/login')) {
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      await refreshSession();
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${getAccessToken()}`;
      return api(original);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export function unwrap(response) {
  if (response?.data?.data !== undefined) return response.data.data;
  return response?.data;
}

export function unwrapPage(response) {
  return {
    data: unwrap(response) || [],
    pagination: response?.data?.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 }
  };
}

export { refreshSession };
