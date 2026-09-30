import { describe, expect, it } from 'vitest';
import { addDays, formatDate, weekStart } from './dates';

describe('date-only helpers', () => {
  it('keeps calendar arithmetic independent of UTC midnight', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01');
    expect(addDays('2026-10-01', -1)).toBe('2026-09-30');
  });
  it('finds Monday as the beginning of a week', () => expect(weekStart('2026-09-30')).toBe('2026-09-28'));
  it('formats a date-only value for people', () => expect(formatDate('2026-09-30')).toContain('30'));
});
