import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TaskCard from './TaskCard'

const task = {
  id: 't1',
  title: 'Card title',
  description: 'A description',
  status: 'todo' as const,
  assigneeId: undefined,
  createdBy: 'u1',
  dueDate: undefined,
  createdAt: '2026-07-14T00:00:00Z',
  updatedAt: '2026-07-14T00:00:00Z',
}

describe('TaskCard', () => {
  it('renders the task as a native button', () => {
    render(<TaskCard task={task} onClick={vi.fn()} />)
    // The card is a <button> (S9011/S6759 fix) — its accessible name includes the title.
    expect(screen.getByRole('button', { name: /Card title/i })).toBeTruthy()
  })
})
