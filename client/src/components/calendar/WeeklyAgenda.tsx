import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import type { MergedTimelineItem, CalendarEvent } from '@/types/calendar';
import type { Chore } from '@/types/chore';
import { EventCard } from './EventCard';

interface WeeklyAgendaProps {
  items: MergedTimelineItem[];
  viewDate: Date;
  expandedEventId: string | null;
  onToggleExpand: (id: string) => void;
  onCompleteChore: (id: number) => void;
  memberColorMap?: Map<number, string>;
}

export function WeeklyAgenda({
  items,
  viewDate,
  expandedEventId,
  onToggleExpand,
  onCompleteChore,
  memberColorMap,
}: WeeklyAgendaProps) {
  const weekStart = startOfWeek(viewDate, { weekStartsOn: 1 }); // Monday

  // Generate 7 days starting from Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Group items by day
  const itemsByDay = weekDays.map((day) => {
    const dayItems = items.filter((item) => {
      const itemDate = new Date(item.sortTime);
      return isSameDay(itemDate, day);
    });

    // Separate all-day and timed items for each day
    const allDayItems = dayItems.filter((item) => item.isAllDay);
    const timedItems = dayItems.filter((item) => !item.isAllDay);

    return { day, allDayItems, timedItems };
  });

  // Empty state
  if (items.length === 0) {
    const weekStartLabel = format(weekStart, 'MMMM d');
    const weekEndLabel = format(addDays(weekStart, 6), 'd');
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h3 className="text-2xl font-heading mb-2">No Events This Week</h3>
        <p className="text-base text-muted-foreground">
          You're free for {weekStartLabel}–{weekEndLabel}. Events will appear when scheduled.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-7 gap-2 h-full">
      {itemsByDay.map(({ day, allDayItems, timedItems }) => (
        <div key={day.toISOString()} className="flex flex-col">
          {/* Column header */}
          <div className="text-sm font-semibold text-center bg-muted py-2 rounded-t-lg mb-2">
            {format(day, 'EEE d')}
          </div>

          {/* Column content */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {/* All-day events */}
            {allDayItems.length > 0 && (
              <div className="mb-2">
                <p className="text-sm text-muted-foreground mb-1">All-day:</p>
                {allDayItems.map((item) => {
                  const id = item.type === 'event'
                    ? (item.data as CalendarEvent).id
                    : String((item.data as Chore).id);
                  return (
                    <EventCard
                      key={id}
                      item={item}
                      expanded={expandedEventId === id}
                      onToggleExpand={onToggleExpand}
                      onCompleteChore={onCompleteChore}
                      memberColorMap={memberColorMap}
                    />
                  );
                })}
              </div>
            )}

            {/* Timed events */}
            {timedItems.map((item) => {
              const id = item.type === 'event'
                ? (item.data as CalendarEvent).id
                : String((item.data as Chore).id);
              return (
                <EventCard
                  key={id}
                  item={item}
                  expanded={expandedEventId === id}
                  onToggleExpand={onToggleExpand}
                  onCompleteChore={onCompleteChore}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
