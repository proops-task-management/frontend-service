import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import LoginPage from './LoginPage'
import { AuthProvider } from '../contexts/AuthContext'
import { login } from '../api/auth'

vi.mock('../api/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/auth')>()
  return {
    ...actual,
    login: vi.fn().mockResolvedValue({ token: 'a.b.c', user: { id: 'u1', email: 'a@b.com', role: 'member' } }),
  }
})

describe('LoginPage', () => {
  it('renders the sign-in form and submits credentials', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>,
    )
    const submit = screen.getByRole('button', { name: /sign in/i })
    expect(submit).toBeTruthy()
    // Submitting exercises handleSubmit(event: SyntheticEvent) — the S1874 change.
    fireEvent.submit(submit.closest('form') as HTMLFormElement)
    await waitFor(() => expect(login).toHaveBeenCalled())
  })
})
