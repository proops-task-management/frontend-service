import apiClient from './client'
import { UserRole } from './auth'

export interface UserSummary {
  id: string
  email: string
  role: UserRole
  created_at: string
}

export interface CreateManagedUserRequest {
  email: string
  password: string
  role: UserRole
}

export interface UpdateUserRequest {
  email?: string
  password?: string
  role?: UserRole
}

export async function getUsers(): Promise<UserSummary[]> {
  const res = await apiClient.get<UserSummary[]>('/users')
  return res.data
}

export async function createManagedUser(data: CreateManagedUserRequest): Promise<UserSummary> {
  const res = await apiClient.post<UserSummary>('/users/admin', data)
  return res.data
}

export async function updateUser(id: string, data: UpdateUserRequest): Promise<UserSummary> {
  const res = await apiClient.patch<UserSummary>(`/users/${id}`, data)
  return res.data
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`)
}
