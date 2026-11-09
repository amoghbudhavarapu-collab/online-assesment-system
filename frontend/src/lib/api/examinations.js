import { api, unwrap, unwrapPage } from './client';

export function listExaminations(params) {
  return api.get('/examinations', { params }).then(unwrapPage);
}

export function getAvailableExaminations() {
  return api.get('/examinations/available').then(unwrap);
}

export function getExamination(id) {
  return api.get(`/examinations/${id}`).then(unwrap);
}

export function createExamination(payload) {
  return api.post('/examinations', payload).then(unwrap);
}

export function updateExamination(id, payload) {
  return api.patch(`/examinations/${id}`, payload).then(unwrap);
}

export function deleteExamination(id) {
  return api.delete(`/examinations/${id}`).then(unwrap);
}

export function publishExamination(id) {
  return api.post(`/examinations/${id}/publish`).then(unwrap);
}

export function cancelExamination(id) {
  return api.post(`/examinations/${id}/cancel`).then(unwrap);
}

export function startExamination(id) {
  return api.post(`/examinations/${id}/start`).then(unwrap);
}
