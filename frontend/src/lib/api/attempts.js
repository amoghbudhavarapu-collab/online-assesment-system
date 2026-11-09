import { api, unwrap } from './client';

export function getAttempt(id) {
  return api.get(`/attempts/${id}`).then(unwrap);
}

export function saveAnswer(attemptId, questionId, payload) {
  return api.put(`/attempts/${attemptId}/answers/${questionId}`, payload).then(unwrap);
}

export function submitAttempt(id) {
  return api.post(`/attempts/${id}/submit`).then(unwrap);
}

export function getMyAttempts() {
  return api.get('/attempts/my-attempts').then(unwrap);
}
