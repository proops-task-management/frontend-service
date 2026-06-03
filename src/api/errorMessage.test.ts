import axios from 'axios'
import { describe, expect, it } from 'vitest'
import { getApiErrorMessage } from './errorMessage'

describe('getApiErrorMessage', () => {
  it('returns the fallback for a non-axios error', () => {
    expect(getApiErrorMessage(new Error('boom'), 'fallback')).toBe('fallback')
  })

  it('returns the API message from an axios error response', () => {
    const error = new axios.AxiosError('request failed')
    error.response = { data: { message: 'Email already in use' } } as never
    expect(getApiErrorMessage(error, 'fallback')).toBe('Email already in use')
  })

  it('falls back when the axios message is blank', () => {
    const error = new axios.AxiosError('request failed')
    error.response = { data: { message: '   ' } } as never
    expect(getApiErrorMessage(error, 'fallback')).toBe('fallback')
  })
})
