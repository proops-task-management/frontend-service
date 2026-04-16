import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react'
import toast from 'react-hot-toast'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export interface AuthUser {
  id: string
  email: string
  role: string
}

interface AuthState {
  token: string | null
  user: AuthUser | null
}

type AuthAction =
  | { type: 'LOGIN'; token: string; user: AuthUser }
  | { type: 'LOGOUT' }

interface AuthContextValue extends AuthState {
  login: (token: string, user: AuthUser) => void
  logout: () => void
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return { token: action.token, user: action.user }
    case 'LOGOUT':
      return { token: null, user: null }
    default:
      return state
  }
}

function loadInitialState(): AuthState {
  const token = localStorage.getItem(TOKEN_KEY)
  const storedUser = localStorage.getItem(USER_KEY)

  if (!token) {
    return { token: null, user: null }
  }

  if (storedUser) {
    try {
      return { token, user: JSON.parse(storedUser) as AuthUser }
    } catch {
      localStorage.removeItem(USER_KEY)
    }
  }

  return { token, user: decodeUserFromToken(token) }
}

function decodeUserFromToken(token: string): AuthUser | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) {
      return null
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const claims = JSON.parse(atob(padded))

    if (
      typeof claims.userId === 'string' &&
      typeof claims.email === 'string' &&
      typeof claims.role === 'string'
    ) {
      return {
        id: claims.userId,
        email: claims.email,
        role: claims.role,
      }
    }
  } catch {
    return null
  }

  return null
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, undefined, loadInitialState)

  const login = useCallback((token: string, user: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    dispatch({ type: 'LOGIN', token, user })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    dispatch({ type: 'LOGOUT' })
    toast.success('You have been signed out.')
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
