import { api } from '../lib/api'
import type { LoginPayload, LoginResponse } from '../types/auth'

export function login(payload: LoginPayload) {
  return api.post<LoginResponse>('/auth/login', payload).then((res) => res.data)
}

export function getSession() {
  return api.get<LoginResponse>('/auth/me').then((res) => res.data)
}

export function logout() {
  return api.post('/auth/logout')
}
