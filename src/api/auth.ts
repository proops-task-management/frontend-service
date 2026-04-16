import apiClient from './client'

export type UserRole = 'member' | 'lead'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    email: string
    role: UserRole
  }
}

export interface RegisterRequest {
  email: string
  password: string
}

export interface RegisterResponse {
  id: string
  email: string
  role: UserRole
  created_at: string
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>('/auth/login', data)
  return res.data
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const res = await apiClient.post<RegisterResponse>('/users', data)
  return res.data
}
