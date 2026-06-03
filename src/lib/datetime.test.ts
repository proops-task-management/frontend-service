import { describe, expect, it } from 'vitest'
import { formatDate, formatDateTime } from './datetime'

describe('formatDate', () => {
  it('returns empty string for null/undefined', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate(undefined)).toBe('')
  })

  it('formats a date-only string in the given locale', () => {
    // Date-only is parsed in local time, so the output is timezone-stable.
    expect(formatDate('2024-01-15', 'en-US')).toBe('01/15/2024')
  })

  it('returns the raw value when it is not a valid date', () => {
    expect(formatDate('not-a-date', 'en-US')).toBe('not-a-date')
  })
})

describe('formatDateTime', () => {
  it('returns "Just now" for null/undefined/empty', () => {
    expect(formatDateTime(null)).toBe('Just now')
    expect(formatDateTime(undefined)).toBe('Just now')
    expect(formatDateTime('')).toBe('Just now')
  })

  it('formats a date-only string with a time component', () => {
    // Note: en-US hour12:false renders local midnight as "24:00:00" (ICU quirk),
    // so assert on the date + a HH:MM:SS shape rather than the exact midnight string.
    const result = formatDateTime('2024-01-15', 'en-US')
    expect(result).toContain('01/15/2024')
    expect(result).toMatch(/\d{2}:\d{2}:\d{2}/)
  })

  it('formats a datetime-without-zone string', () => {
    // UTC-parsed, so assert on the year only (timezone-stable for midday).
    expect(formatDateTime('2024-01-15T12:30:00', 'en-US')).toContain('2024')
  })

  it('returns the raw value when it is not a valid date', () => {
    expect(formatDateTime('garbage', 'en-US')).toBe('garbage')
  })
})
