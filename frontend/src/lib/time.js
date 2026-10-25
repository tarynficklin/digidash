// Native Intl replacements for the two moment calls the Bitcoin widget made.

const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' });

// moment(date).format('MMM DD') -> "Oct 05". "YYYY-MM-DD" strings are read as
// local dates (like moment), not UTC midnight (like new Date('YYYY-MM-DD')).
export function formatShortDate(value) {
  const match = typeof value === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);
  return shortDate.format(date);
}

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const UNITS = [
  ['year', 60 * 60 * 24 * 365],
  ['month', 60 * 60 * 24 * 30],
  ['day', 60 * 60 * 24],
  ['hour', 60 * 60],
  ['minute', 60],
];

// moment(value).fromNow() -> "5 minutes ago", "now", ...
export function fromNow(value, now = Date.now()) {
  const seconds = (new Date(value).getTime() - now) / 1000;
  if (Number.isNaN(seconds)) return '';
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return relative.format(Math.round(seconds), 'second');
}
