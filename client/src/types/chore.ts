export interface Chore {
  id: number;
  title: string;
  description: string | null;
  assigned_to: number;
  completed_by: number | null;
  points: number;
  status: 'active' | 'completed' | 'auto_completed';
  is_recurring: number; // 0 or 1 (SQLite integer boolean)
  recurrence_config: string | null; // JSON string when present
  parent_chore_id: number | null;
  created_at: number; // unix timestamp
  completed_at: number | null;
  updated_at: number;
  // Joined fields from API
  assignee_name: string;
  completed_by_name: string | null;
}

export interface RecurrenceConfig {
  frequency: 'daily' | 'weekly' | 'custom' | 'interval';
  days: number[]; // 0=Sunday through 6=Saturday
  interval?: number; // For 'interval' frequency
  startDate?: string; // ISO date string (yyyy-MM-dd) for 'interval' frequency anchor
}

export interface ChoreFormData {
  title: string;
  assigned_to: number;
  description?: string;
  points?: number;
  is_recurring?: boolean;
  recurrence_config?: RecurrenceConfig | null;
}

export interface ChoreStats {
  member_id: number;
  member_name: string;
  completed_count: number;
}

export interface WeeklySummaryDay {
  date: string;
  status: 'completed' | 'missed' | 'not_scheduled';
}

export interface WeeklySummaryRow {
  chore_title: string;
  assigned_to: number;
  assignee_name: string;
  days: WeeklySummaryDay[];
}
