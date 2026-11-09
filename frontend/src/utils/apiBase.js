export function resolveApiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const trimmed = String(raw).replace(/\/$/, '');
  if (trimmed.endsWith('/api/v1')) return trimmed;
  if (trimmed.endsWith('/api')) return `${trimmed}/v1`;
  return `${trimmed}/api/v1`;
}

export function resolveOriginUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const trimmed = String(raw).replace(/\/$/, '');
  return trimmed.replace(/\/api\/v1$/, '').replace(/\/api$/, '');
}
