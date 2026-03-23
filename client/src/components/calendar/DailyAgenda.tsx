import { format } from 'date-fns';
import type { MergedTimelineItem, CalendarEvent } from '@/types/calendar';
import type { Chore } from '@/types/chore';
import { EventCard } from './EventCard';
import { TimeIndicator } from './TimeIndicator';

interface DailyAgendaProps {
  allDayItems: MergedTimelineItem[];
  timedItems: MergedTimelineItem[];
  expandedEventId: string | null;
  onToggleExpand: (id: string) => void;
  onCompleteChore: (id: number) => void;
}

export function DailyAgenda({
  allDayItems,
  timedItems,
  expandedEventId,
  onToggleExpand,
  onCompleteChore,
}: DailyAgendaProps) {
  // Group timed items by hour
  const groupedByHour = timedItems.reduce((acc, item) => {
    const time = new Date(item.sortTime);
    const hourLabel = format(time, 'h:mm a');
    if (!acc[hourLabel]) {
      acc[hourLabel] = [];
    }
    acc[hourLabel].push(item);
    return acc;
  }, {} as Record<string, MergedTimelineItem[]>);

  const timeLabels = Object.keys(groupedByHour);
  const currentHour = new Date().getHours();
  const currentTime = new Date().getTime();

  // Find where to insert TimeIndicator
  let timeIndicatorInserted = false;

  // Empty state
  if (allDayItems.length === 0 && timedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h3 className="text-2xl font-heading mb-2">No Events Today</h3>
        <p className="text-base text-muted-foreground">
          Your schedule is clear. New events will sync automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* All-Day Events Section */}
      {allDayItems.length > 0 && (
        <>
          <div>
            <h4 className="text-sm text-muted-foreground mb-2">All-Day Events</h4>
            <div className="space-y-2">
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
                  />
                );
              })}
            </div>
          </div>
          <div className="border-t border-border" />
        </>
      )}

      {/* Timed Events Section */}
      <div className="space-y-4">
        {timeLabels.map((timeLabel, index) => {
          const items = groupedByHour[timeLabel];
          const firstItemTime = items[0].sortTime;

          // Check if we should insert TimeIndicator before this time group
          const shouldInsertIndicator =
            !timeIndicatorInserted &&
            currentTime < firstItemTime &&
            currentHour >= 6 &&
            currentHour < 22;

          if (shouldInsertIndicator) {
            timeIndicatorInserted = true;
          }

          return (
            <div key={timeLabel}>
              {shouldInsertIndicator && <TimeIndicator />}

              <div className="mb-2">
                <h5 className="text-sm text-muted-foreground mb-2">{timeLabel}</h5>
                <div className="space-y-2">
                  {items.map((item) => {
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
            </div>
          );
        })}

        {/* Insert TimeIndicator at the end if not yet inserted and within range */}
        {!timeIndicatorInserted && currentHour >= 6 && currentHour < 22 && (
          <TimeIndicator />
        )}
      </div>
    </div>
  );
}
