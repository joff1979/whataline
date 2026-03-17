import { api } from './client';

export const login = (username: string, password: string) =>
  api.post<{ token: string }>('/api/auth/login', { username, password })
    .then((r) => {
      sessionStorage.setItem('jwt', r.data.token);
      return r.data.token;
    });

export const logout = () => {
  sessionStorage.removeItem('jwt');
};

export const isAuthenticated = () =>
  Boolean(sessionStorage.getItem('jwt'));

export const changePassword = (currentPassword: string, newPassword: string) =>
  api.post('/api/auth/change-password', { currentPassword, newPassword });
