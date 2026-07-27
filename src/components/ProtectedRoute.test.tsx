import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import ProtectedRoute from './ProtectedRoute'
import { AuthProvider } from '../contexts/AuthContext'

describe('ProtectedRoute', () => {
  it('redirects to /login when unauthenticated', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/secret']}>
          <Routes>
            <Route path="/login" element={<div>Login screen</div>} />
            <Route
              path="/secret"
              element={
                <ProtectedRoute>
                  <div>Secret</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )
    // No token in sessionStorage → the guard renders <Navigate to="/login" />.
    expect(screen.getByText('Login screen')).toBeTruthy()
  })
})
