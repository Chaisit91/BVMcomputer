export interface LoginPayload {
  identifier: string
  password: string
  remember: boolean
}

export interface LoginResponse {
  user: {
    id: string
    name: string
    email: string
  }
}
