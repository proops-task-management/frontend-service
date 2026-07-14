import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import TaskDetailPage from './TaskDetailPage'
import { AuthProvider } from '../contexts/AuthContext'

vi.mock('../api/tasks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/tasks')>()
  return {
    ...actual,
    getTaskById: vi.fn().mockResolvedValue({
      task: {
        id: 't1',
        title: 'Design the thing',
        description: 'desc',
        status: 'todo',
        assigneeId: undefined,
        createdBy: 'u1',
        dueDate: undefined,
        createdAt: '2026-07-14T00:00:00Z',
        updatedAt: '2026-07-14T00:00:00Z',
      },
      comments: [],
    }),
  }
})
vi.mock('../api/users', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/users')>()
  return { ...actual, getUsers: vi.fn().mockResolvedValue([]) }
})
vi.mock('../api/notifications', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/notifications')>()
  return { ...actual, getNotifications: vi.fn().mockResolvedValue([]) }
})

describe('TaskDetailPage', () => {
  it('loads a task and seeds the view via the render-phase adjustment', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/tasks/t1']}>
          <Routes>
            <Route path="/tasks/:id" element={<TaskDetailPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )
    // Rendering the loaded title proves getTaskById resolved and the render-phase seed ran.
    expect(await screen.findByText('Design the thing')).toBeTruthy()
  })
})
