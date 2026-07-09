import axios, { AxiosHeaders } from 'axios';
import { clearToken, getToken, notifyUnauthorized } from './token';

const client = axios.create({
  baseURL: '/api',
});

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

// A 401 while a token is stored means the session expired or was revoked:
// drop the stale token so the app returns to the signed-out state instead of
// resending it forever. A 401 without a token (e.g. wrong login password) is
// left to the caller.
client.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && getToken()) {
      clearToken();
      notifyUnauthorized();
    }
    return Promise.reject(error);
  },
);

export default client;
