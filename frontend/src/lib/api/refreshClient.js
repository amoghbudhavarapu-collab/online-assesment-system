import axios from 'axios';
import { resolveApiBaseUrl } from '../../utils/apiBase';

export const refreshClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});
