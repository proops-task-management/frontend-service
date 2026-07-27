import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, afterEach } from 'vitest'
import TaskListPage from './TaskListPage'
import { AuthProvider } from '../contexts/AuthContext'
import { getTasks } from '../api/tasks'

vi.mock('../api/tasks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/tasks')>()
  return { ...actual, getTasks: vi.fn().mockResolvedValue({ tasks: [], total: 0 }) }
})
vi.mock('../api/notifications', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/notifications')>()
  return { ...actual, getNotifications: vi.fn().mockResolvedValue([]) }
})

afterEach(() => cleanup())

describe('TaskListPage', () => {
  it('fetches tasks on mount and renders the empty state', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <TaskListPage />
        </MemoryRouter>
      </AuthProvider>,
    )
    await waitFor(() => expect(getTasks).toHaveBeenCalled())
    expect(await screen.findByText(/No tasks yet/i)).toBeTruthy()
  })

  it('opens the create modal and the sign-out confirm from the toolbar buttons', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <TaskListPage />
        </MemoryRouter>
      </AuthProvider>,
    )
    await screen.findByText(/No tasks yet/i)
    // "New task" (S9011 fix) opens CreateTaskModal; "Sign out" (S9011 fix) opens ConfirmDialog.
    fireEvent.click(screen.getByRole('button', { name: /new task/i }))
    // The modal's "Title" field is unique (the toolbar also has a "New task" label).
    expect(await screen.findByLabelText('Title')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }))
    expect(await screen.findByText(/Sign out now\?/i)).toBeTruthy()
  })
})
