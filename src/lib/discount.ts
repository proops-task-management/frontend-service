// Day 26 SonarCloud-gate DRILL — intentionally has NO test.
// SonarCloud ignores the new-code coverage condition for changesets with
// fewer than ~20 new lines to cover, so this module is sized PAST that
// threshold: 20+ uncovered "new code" lines => new-code coverage 0% < 80%
// => Quality Gate fails => merge blocked. This file is reverted after the drill.

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

export function addTax(amount: number, taxPercent: number): number {
  if (taxPercent < 0) {
    return amount
  }
  const tax = (amount * taxPercent) / 100
  return amount + tax
}

export function clampPercent(percent: number): number {
  if (percent < 0) {
    return 0
  }
  if (percent > 100) {
    return 100
  }
  return percent
}

export function totalWithDiscountAndTax(
  amount: number,
  discountPercent: number,
  taxPercent: number,
): number {
  const discounted = applyDiscount(amount, clampPercent(discountPercent))
  return addTax(discounted, clampPercent(taxPercent))
}

export function describeDiscount(percent: number): string {
  const clamped = clampPercent(percent)
  if (clamped === 0) {
    return 'no discount'
  }
  if (clamped === 100) {
    return 'free'
  }
  return `${clamped}% off`
}
