import { startOfWeek, endOfWeek, format } from 'date-fns';

/**
 * Returns the start and end dates for the current week (Sunday-Saturday).
 */
export function getWeekDateRange(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: 0 }),
    end: endOfWeek(date, { weekStartsOn: 0 }),
  };
}

/**
 * Formats a week date range as "March 22-28" for display.
 * Per UI-SPEC copywriting: abbreviated month, day range.
 */
export function formatWeekRange(date: Date = new Date()): string {
  const { start, end } = getWeekDateRange(date);
  const startMonth = format(start, 'MMMM');
  const endMonth = format(end, 'MMMM');
  const startDay = format(start, 'd');
  const endDay = format(end, 'd');

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}\u2013${endDay}`;
  }
  return `${startMonth} ${startDay}\u2013${endMonth} ${endDay}`;
}

/**
 * Returns dates for each day of the current week (Sunday-Saturday).
 */
export function getWeekDays(date: Date = new Date()): Date[] {
  const { start } = getWeekDateRange(date);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return day;
  });
}
