export type CalendarViewMode = 'daily' | 'weekly' | 'monthly';

export interface CalendarEvent {
  id: string;
  calendarSourceId: string;
  summary: string | null;
  description: string | null;
  location: string | null;
  startTime: string | null;     // ISO8601 dateTime for timed events
  endTime: string | null;       // ISO8601 dateTime for timed events
  startDate: string | null;     // YYYY-MM-DD for all-day events
  endDate: string | null;       // YYYY-MM-DD for all-day events
  isAllDay: boolean;
  status: string;
  familyMemberId: number | null;
  familyMemberName: string | null;
  calendarName: string;
}

export interface CalendarSource {
  id: string;
  summary: string;
  backgroundColor: string | null;
  selected: boolean;
  familyMemberId: number | null;
  familyMemberName: string | null;
}

export interface CalendarAuthStatus {
  connected: boolean;
  email: string | null;
}

export interface SyncResult {
  synced: boolean;
  eventCount: number;
  lastSynced: string;
}

// Merged timeline item: either a calendar event or a chore (per D-31, D-33)
export interface MergedTimelineItem {
  type: 'event' | 'chore';
  sortTime: number;         // Unix timestamp for sorting
  isAllDay: boolean;
  data: CalendarEvent | import('./chore').Chore;
}
