import { startOfDay, differenceInCalendarDays } from 'date-fns';

/**
 * Determines if a recurring chore should generate a new instance today.
 * @param {object} config - Parsed recurrence_config JSON
 * @param {Date} date - The date to check (typically today)
 * @param {number|null} lastGeneratedAt - Unix timestamp of last generated instance
 * @returns {boolean}
 */
export function shouldGenerateToday(config, date, lastGeneratedAt) {
  const dayOfWeek = date.getDay(); // 0=Sunday, 6=Saturday

  switch (config.frequency) {
    case 'daily':
      return true;
    case 'weekly':
      return config.days.includes(dayOfWeek);
    case 'custom':
      return config.days.includes(dayOfWeek);
    case 'interval': {
      if (!lastGeneratedAt) return true; // First generation
      const lastDate = new Date(lastGeneratedAt * 1000);
      const daysSinceLast = differenceInCalendarDays(startOfDay(date), startOfDay(lastDate));
      return daysSinceLast >= (config.interval || 1);
    }
    default:
      return false;
  }
}
