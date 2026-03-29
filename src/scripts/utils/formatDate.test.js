import { formatDate } from "./formatDate";

test('formatDate', () => {
  expect(formatDate('2026-03-15')).toBe('15 марта');
  expect(formatDate('2026-01-01')).toBe('1 января');
  expect(formatDate('2026-12-31')).toBe('31 декабря');
  expect(formatDate('2026-05-05')).toBe('5 мая');
});