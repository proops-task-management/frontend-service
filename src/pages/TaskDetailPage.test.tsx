import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi, afterEach } from 'vitest'
import TaskDetailPage from './TaskDetailPage'
import { AuthProvider } from '../contexts/AuthContext'

// vi.hoisted: vi.mock factories are hoisted above module-scope consts, so a plain const
// would be uninitialised inside the factory. Hoisting keeps loadedTask available there.
const loadedTask = vi.hoisted(() => ({
  id: 't1',
  title: 'Design the thing',
  description: 'desc',
  status: 'todo' as const,
  assigneeId: undefined as string | undefined,
  createdBy: 'u1',
  dueDate: undefined as string | undefined,
  createdAt: '2026-07-14T00:00:00Z',
  updatedAt: '2026-07-14T00:00:00Z',
}))

vi.mock('../api/tasks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/tasks')>()
  return {
    ...actual,
    getTaskById: vi.fn().mockResolvedValue({ task: loadedTask, comments: [] }),
    addComment: vi.fn().mockResolvedValue({ id: 'c1', text: 'Nice', authorId: 'u1', createdAt: '2026-07-14T00:00:00Z' }),
    assignTask: vi.fn().mockResolvedValue(loadedTask),
    updateTaskMetadata: vi.fn().mockResolvedValue(loadedTask),
    updateTaskStatus: vi.fn().mockResolvedValue({ ...loadedTask, status: 'in_progress' }),
    deleteTask: vi.fn().mockResolvedValue(undefined),
  }
})
vi.mock('../api/users', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/users')>()
  return { ...actual, getUsers: vi.fn().mockResolvedValue([]) }
})
vi.mock('../api/notifications', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/notifications')>()
  return { ...actual, getNotifications: vi.fn().mockResolvedValue([]), requestNotificationsRefresh: vi.fn() }
})

function renderDetail() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/tasks/t1']}>
        <Routes>
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
          <Route path="/tasks" element={<div>Task list</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

afterEach(() => {
  cleanup()
  sessionStorage.clear()
})

describe('TaskDetailPage', () => {
  it('loads a task and seeds the view via the render-phase adjustment', async () => {
    renderDetail()
    // Rendering the loaded title proves getTaskById resolved and the render-phase seed ran.
    expect(await screen.findByText('Design the thing')).toBeTruthy()
  })

  it('lets a lead submit the comment/assign/metadata forms and change status', async () => {
    // Seed a signed-in lead whose id matches createdBy → isLead + canUpdateStatus are both true,
    // so the assign/metadata forms and the status buttons render (S9011/S1874 changed lines).
    sessionStorage.setItem('auth_token', 'x')
    sessionStorage.setItem('auth_user', JSON.stringify({ id: 'u1', email: 'lead@x.com', role: 'lead' }))
    renderDetail()
    await screen.findByText('Design the thing')

    fireEvent.change(screen.getByPlaceholderText('Add a comment...'), { target: { value: 'Nice' } })
    fireEvent.submit((screen.getByRole('button', { name: /post comment/i })).closest('form') as HTMLFormElement)
    fireEvent.submit((screen.getByRole('button', { name: /save assignment/i })).closest('form') as HTMLFormElement)
    fireEvent.submit((screen.getByRole('button', { name: /save details/i })).closest('form') as HTMLFormElement)
    fireEvent.click(screen.getByRole('button', { name: /mark in progress/i }))
    // Exercise the header buttons' inline handlers (S9011 changed lines 240 + 235).
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    fireEvent.click(screen.getByRole('button', { name: /back to tasks/i }))
    expect(await screen.findByText('Task list')).toBeTruthy()
  })

  it('renders a "Back to tasks" button when the task is not found', async () => {
    const { getTaskById } = await import('../api/tasks')
    vi.mocked(getTaskById).mockRejectedValueOnce(new Error('not found'))
    renderDetail()
    // The not-found branch renders the back button (S9011 changed line 224); click it to
    // exercise the inline navigate handler.
    fireEvent.click(await screen.findByRole('button', { name: /back to tasks/i }))
    expect(await screen.findByText('Task list')).toBeTruthy()
  })
})
