import { startOfDay, differenceInCalendarDays } from 'date-fns';

/**
 * Determines whether a recurring chore should have an instance on the given date.
 *
 * @param {object} config - Parsed recurrence_config JSON.
 *   For 'interval' frequency, config.startDate (yyyy-MM-dd) is used as the
 *   stable anchor. The caller is responsible for setting startDate before
 *   calling this function (falling back to the template's created_at if needed).
 * @param {Date} date - The calendar date to test.
 * @param {number|null} _lastGeneratedAt - Unused; kept for API compatibility.
 * @returns {boolean}
 */
export function shouldGenerateToday(config, date, _lastGeneratedAt) {
  const dayOfWeek = date.getDay(); // 0=Sunday, 6=Saturday

  switch (config.frequency) {
    case 'daily':
      return true;
    case 'weekly':
      return config.days.includes(dayOfWeek);
    case 'custom':
      return config.days.includes(dayOfWeek);
    case 'interval': {
      const interval = config.interval || 1;
      // startDate must be set by the caller (either from config or from template created_at)
      if (!config.startDate) return false;
      const anchor = new Date(config.startDate + 'T12:00:00');
      const daysSinceStart = differenceInCalendarDays(startOfDay(date), startOfDay(anchor));
      if (daysSinceStart < 0) return false; // Before start date
      return daysSinceStart % interval === 0;
    }
    default:
      return false;
  }
}
