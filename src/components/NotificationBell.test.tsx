import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import NotificationBell from './NotificationBell'
import { getNotifications } from '../api/notifications'

// Keep the module's constants/other exports; only stub the network call.
vi.mock('../api/notifications', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/notifications')>()
  return { ...actual, getNotifications: vi.fn().mockResolvedValue([]) }
})

describe('NotificationBell', () => {
  it('renders the bell and loads notifications on mount', async () => {
    render(<NotificationBell />)
    expect(screen.getByLabelText('Notifications')).toBeTruthy()
    await waitFor(() => expect(getNotifications).toHaveBeenCalled())
  })
})
