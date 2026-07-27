import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import UsersPage from './UsersPage'
import { AuthProvider } from '../contexts/AuthContext'
import { getUsers, createManagedUser } from '../api/users'

vi.mock('../api/users', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/users')>()
  return {
    ...actual,
    getUsers: vi.fn().mockResolvedValue([]),
    createManagedUser: vi.fn().mockResolvedValue({
      id: 'u3',
      email: 'new@x.com',
      role: 'member',
      created_at: '2026-07-14T00:00:00Z',
    }),
  }
})
vi.mock('../api/notifications', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/notifications')>()
  return { ...actual, getNotifications: vi.fn().mockResolvedValue([]) }
})

describe('UsersPage', () => {
  it('renders the management view and creates a user', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <UsersPage />
        </MemoryRouter>
      </AuthProvider>,
    )
    expect(screen.getByText('User management')).toBeTruthy()
    await waitFor(() => expect(getUsers).toHaveBeenCalled())
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'new@x.com' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } })
    // Exercises handleCreateUser(event: SyntheticEvent) — the S1874 change.
    fireEvent.submit((screen.getByRole('button', { name: /create user/i })).closest('form') as HTMLFormElement)
    await waitFor(() => expect(createManagedUser).toHaveBeenCalled())
    // Exercise the header Sign-out button's inline handler (S9011 changed line 149).
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }))
    expect(await screen.findByText(/Sign out now\?/i)).toBeTruthy()
  })
})
