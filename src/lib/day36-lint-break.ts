// Day 36 — deliberate LINT error for Agent B case B2 (multi-failure: lint + test).
// The unused variable trips `eslint --max-warnings 0`. Combined with the existing failing
// test, two CI steps now fail. Throwaway scaffolding — removed with the branch.
const unusedVariable = 42
