import axios from 'axios';

// Base URL is read from the environment so each deployment can point at its
// own backend; falls back to a local dev API. `withCredentials` is on because
// the backend sits on a different origin (CORS + cookies/session auth).
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api',
  timeout: 5000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
