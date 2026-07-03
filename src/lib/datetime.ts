const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const DATE_TIME_WITHOUT_ZONE_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/

function parseApiDate(value: string): Date {
  const dateOnlyMatch = value.match(DATE_ONLY_PATTERN)
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  const dateTimeWithoutZoneMatch = value.match(DATE_TIME_WITHOUT_ZONE_PATTERN)
  if (dateTimeWithoutZoneMatch) {
    const [, year, month, day, hour, minute, second = '0', millisecond = '0'] = dateTimeWithoutZoneMatch
    return new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second),
        Number(millisecond.padEnd(3, '0')),
      ),
    )
  }

  return new Date(value)
}

function isValidDate(date: Date) {
  return !Number.isNaN(date.getTime())
}

export function formatDateTime(value?: string | null, locale = 'vi-VN'): string {
  if (!value) {
    return 'Just now'
  }

  const date = parseApiDate(value)
  if (!isValidDate(date)) {
    return value
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

export function formatDate(value?: string | null, locale = 'vi-VN'): string {
  if (!value) {
    return ''
  }

  const date = parseApiDate(value)
  if (!isValidDate(date)) {
    return value
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}
