import { api, unwrap } from './client';
import { refreshClient } from './refreshClient';

export function login(payload) {
  return api.post('/auth/login', payload).then(unwrap);
}

export function register(payload) {
  return api.post('/auth/register', payload).then(unwrap);
}

export function logout() {
  return refreshClient.post('/auth/logout').then(unwrap);
}

export function getMe() {
  return api.get('/auth/me').then((res) => unwrap(res)?.user || unwrap(res));
}

export function changePassword(payload) {
  return api.patch('/auth/change-password', payload).then(unwrap);
}
