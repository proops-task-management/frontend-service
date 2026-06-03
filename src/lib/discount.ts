// Day 26 SonarCloud-gate DRILL — intentionally has NO test.
// Its lines count as uncovered "new code", which drops new-code coverage
// below the 80% Quality Gate threshold so we can prove the gate blocks merge.
// This file is reverted at the end of the drill.
export function applyDiscount(amount: number, percent: number): number {
  if (percent < 0) {
    return amount
  }
  if (percent > 100) {
    return 0
  }
  const discount = (amount * percent) / 100
  return amount - discount
}

export function isFreeAfterDiscount(amount: number, percent: number): boolean {
  return applyDiscount(amount, percent) === 0
}
