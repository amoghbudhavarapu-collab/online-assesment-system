import { api, unwrap, unwrapPage } from './client';

export function listQuestions(params) {
  return api.get('/questions', { params }).then(unwrapPage);
}

export function getQuestion(id) {
  return api.get(`/questions/${id}`).then(unwrap);
}

export function createQuestion(payload) {
  return api.post('/questions', payload).then(unwrap);
}

export function updateQuestion(id, payload) {
  return api.patch(`/questions/${id}`, payload).then(unwrap);
}

export function deleteQuestion(id) {
  return api.delete(`/questions/${id}`).then(unwrap);
}
