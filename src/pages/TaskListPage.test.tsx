import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
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
})
