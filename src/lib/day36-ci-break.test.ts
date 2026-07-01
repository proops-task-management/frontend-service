import { describe, expect, it } from 'vitest'

// Day 36 — deliberate CI break to validate Agent B (triage-ci-failure).
// This is throwaway scaffolding: it makes exactly ONE test step fail so the
// agent has a clean, single root cause to find. Delete after the test.
describe('Day 36 Agent B — intentional CI break', () => {
  it('fails on purpose to produce a red run', () => {
    expect(1 + 1).toBe(3)
  })
})
