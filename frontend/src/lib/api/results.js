import { api, unwrap } from './client';
import { getAccessToken } from '../../auth/tokenStore';
import { resolveApiBaseUrl } from '../../utils/apiBase';

export function getMyResults() {
  return api.get('/results/my-results').then(unwrap);
}

export function getExaminationResults(id, params) {
  return api.get(`/results/examination/${id}`, { params }).then(unwrap);
}

export function getResult(id) {
  return api.get(`/results/${id}`).then(unwrap);
}

export function publishResults(id) {
  return api.post(`/results/examination/${id}/publish`).then(unwrap);
}

export async function exportResultsCsv(id) {
  const response = await api.get(`/results/examination/${id}/export`, { responseType: 'blob' });
  return response.data;
}

export function downloadResultsCsv(id, filename = 'results.csv') {
  const url = `${resolveApiBaseUrl()}/results/examination/${id}/export`;
  return fetch(url, {
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${getAccessToken() || ''}`
    }
  }).then(async (res) => {
    if (!res.ok) throw new Error('Failed to export results');
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(href);
  });
}
