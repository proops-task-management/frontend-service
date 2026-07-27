import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CreateTaskModal from './CreateTaskModal'
import { createTask } from '../api/tasks'

vi.mock('../api/tasks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/tasks')>()
  return {
    ...actual,
    createTask: vi.fn().mockResolvedValue({
      id: 't9',
      title: 'My task',
      description: '',
      status: 'todo',
      assigneeId: undefined,
      createdBy: 'u1',
      dueDate: undefined,
      createdAt: '2026-07-14T00:00:00Z',
      updatedAt: '2026-07-14T00:00:00Z',
    }),
  }
})

describe('CreateTaskModal', () => {
  it('renders the modal and submits the new-task form', async () => {
    const onCreated = vi.fn()
    render(<CreateTaskModal onCreated={onCreated} onClose={vi.fn()} />)
    // The dialog (with its sibling backdrop <button> — S6848/S1082 fix) renders.
    expect(screen.getByText('New task')).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'My task' } })
    // Exercises handleSubmit(event: SyntheticEvent) — the S1874 change.
    fireEvent.submit((screen.getByRole('button', { name: /^create$/i })).closest('form') as HTMLFormElement)
    await waitFor(() => expect(createTask).toHaveBeenCalled())
    expect(onCreated).toHaveBeenCalled()
  })
})
