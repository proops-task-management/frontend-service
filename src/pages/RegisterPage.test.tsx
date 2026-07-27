import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import RegisterPage from './RegisterPage'
import { AuthProvider } from '../contexts/AuthContext'
import { register } from '../api/auth'

vi.mock('../api/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/auth')>()
  return {
    ...actual,
    register: vi.fn().mockResolvedValue({ id: 'u2', email: 'a@b.com', role: 'member' }),
  }
})

describe('RegisterPage', () => {
  it('renders the register form and submits it', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </AuthProvider>,
    )
    const submit = screen.getByRole('button', { name: /register/i })
    expect(submit).toBeTruthy()
    // Exercises handleSubmit(event: SyntheticEvent) — the S1874 change.
    fireEvent.submit(submit.closest('form') as HTMLFormElement)
    await waitFor(() => expect(register).toHaveBeenCalled())
  })
})
