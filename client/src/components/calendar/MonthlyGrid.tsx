import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import type { MergedTimelineItem, CalendarEvent } from '@/types/calendar';
import type { Chore } from '@/types/chore';

interface MonthlyGridProps {
  items: MergedTimelineItem[];
  viewDate: Date;
  onDayClick: (date: Date) => void;
}

export function MonthlyGrid({ items, viewDate, onDayClick }: MonthlyGridProps) {
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  // Generate all days in the calendar grid (35 or 42 days)
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Group items by date
  const itemsByDate = items.reduce((acc, item) => {
    const itemDate = format(new Date(item.sortTime), 'yyyy-MM-dd');
    if (!acc[itemDate]) {
      acc[itemDate] = [];
    }
    acc[itemDate].push(item);
    return acc;
  }, {} as Record<string, MergedTimelineItem[]>);

  return (
    <div className="grid grid-cols-7 gap-0 border border-border">
      {/* Day headers */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div
          key={day}
          className="text-sm font-semibold text-center bg-muted py-2 border-b border-border"
        >
          {day}
        </div>
      ))}

      {/* Calendar grid cells */}
      {calendarDays.map((day) => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const dayItems = itemsByDate[dateKey] || [];
        const isCurrentMonth = isSameMonth(day, viewDate);
        const isToday = isSameDay(day, new Date());

        // Get family member colors for dots (max 3 visible)
        const visibleItems = dayItems.slice(0, 3);
        const overflowCount = dayItems.length > 3 ? dayItems.length - 3 : 0;

        return (
          <div
            key={dateKey}
            onClick={() => onDayClick(day)}
            className="h-16 border border-border p-1 cursor-pointer hover:bg-muted/50 active:scale-[0.98] transition-transform duration-150"
          >
            {/* Date number */}
            <div
              className={`text-sm ${
                isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
              } ${isToday ? 'font-bold' : ''}`}
            >
              {format(day, 'd')}
            </div>

            {/* Event dots */}
            {dayItems.length > 0 && (
              <div className="flex gap-1 justify-center mt-1">
                {visibleItems.map((item, index) => {
                  const familyMemberId = item.type === 'event'
                    ? (item.data as CalendarEvent).familyMemberId
                    : (item.data as Chore).assigned_to;
                  const chartColorIndex = ((familyMemberId || 0) % 4) + 1;
                  const chartColor = `oklch(var(--chart-${chartColorIndex}))`;

                  return (
                    <div
                      key={index}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: chartColor }}
                    />
                  );
                })}
                {overflowCount > 0 && (
                  <span className="text-xs text-muted-foreground">+{overflowCount}</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
