import { api, unwrap } from './client';

export function getAdminDashboard() {
  return api.get('/dashboard/admin').then(unwrap);
}

export function getTeacherDashboard() {
  return api.get('/dashboard/teacher').then(unwrap);
}

export function getStudentDashboard() {
  return api.get('/dashboard/student').then(unwrap);
}
