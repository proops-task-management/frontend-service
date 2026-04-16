import axios from 'axios'
import { emitToast } from '../lib/toastBus'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      emitToast('Your session has expired. Please sign in again.', 'error')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default apiClient
