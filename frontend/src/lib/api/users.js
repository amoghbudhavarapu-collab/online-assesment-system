import { api, unwrap, unwrapPage } from './client';

export function listUsers(params) {
  return api.get('/users', { params }).then(unwrapPage);
}

export function getUser(id) {
  return api.get(`/users/${id}`).then(unwrap);
}

export function updateUser(id, payload) {
  return api.patch(`/users/${id}`, payload).then(unwrap);
}

export function updateUserStatus(id, isActive) {
  return api.patch(`/users/${id}/status`, { isActive }).then(unwrap);
}

export function getOwnProfile() {
  return api.get('/users/me').then(unwrap);
}

export function updateOwnProfile(payload) {
  return api.patch('/users/me', payload).then(unwrap);
}
