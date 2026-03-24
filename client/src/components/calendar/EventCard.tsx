import { format } from 'date-fns';
import type { MergedTimelineItem } from '@/types/calendar';
import type { CalendarEvent } from '@/types/calendar';
import type { Chore } from '@/types/chore';
import { Checkbox } from '@/components/ui/checkbox';

const DEFAULT_COLOR = '#039BE5';

interface EventCardProps {
  item: MergedTimelineItem;
  expanded: boolean;
  onToggleExpand: (id: string) => void;
  onCompleteChore?: (id: number) => void;
  memberColorMap?: Map<number, string>;
}

export function EventCard({ item, expanded, onToggleExpand, onCompleteChore, memberColorMap }: EventCardProps) {
  const isEvent = item.type === 'event';
  const isChore = item.type === 'chore';

  const event = isEvent ? (item.data as CalendarEvent) : null;
  const chore = isChore ? (item.data as Chore) : null;

  // Determine color: for events use familyMemberColor, for chores look up member
  let itemColor = DEFAULT_COLOR;
  if (isEvent && event!.familyMemberColor) {
    itemColor = event!.familyMemberColor;
  } else if (isChore && memberColorMap && chore!.assigned_to) {
    itemColor = memberColorMap.get(chore!.assigned_to) || DEFAULT_COLOR;
  }

  // Format time label for events
  const timeLabel = isEvent && !item.isAllDay && event!.startTime
    ? format(new Date(event!.startTime), 'h:mm a')
    : null;

  // Format time range for expanded events
  const timeRange = isEvent && !item.isAllDay && event!.startTime && event!.endTime
    ? `${format(new Date(event!.startTime), 'h:mm a')} - ${format(new Date(event!.endTime), 'h:mm a')}`
    : null;

  // Get display title
  const title = isEvent ? event!.summary || 'Untitled Event' : chore!.title;

  // Handle click
  const handleClick = () => {
    const id = isEvent ? event!.id : String(chore!.id);
    onToggleExpand(id);
  };

  // Handle checkbox click (for chores only)
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isChore && onCompleteChore && chore!.status === 'active') {
      onCompleteChore(chore!.id);
    }
  };

  const isCompleted = isChore && chore!.status !== 'active';

  return (
    <div
      onClick={handleClick}
      className={`${isChore ? 'bg-muted/60' : 'bg-card'} rounded-2xl p-4 cursor-pointer transition-all duration-300 active:scale-[0.96] active:transition-transform active:duration-150`}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: itemColor,
        minHeight: '48px',
        opacity: isCompleted ? 0.7 : 1,
        height: expanded ? 'auto' : undefined,
      }}
    >
      <div className="flex items-center gap-4">
        {/* Checkbox for chores */}
        {isChore && (
          <div
            className="min-w-12 min-h-12 flex items-center justify-center"
            onClick={handleCheckboxClick}
          >
            <Checkbox
              checked={isCompleted}
              disabled={isCompleted}
              style={isCompleted ? { borderColor: itemColor, backgroundColor: itemColor } : {}}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Collapsed state: time + title */}
          <div className="flex items-baseline gap-2">
            {timeLabel && (
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {timeLabel}
              </span>
            )}
            <h3 className="text-lg">
              {title}
            </h3>
          </div>

          {/* Expanded state: additional details */}
          {expanded && (
            <div className="mt-2 space-y-1 animate-in fade-in duration-200">
              {isEvent && (
                <>
                  {timeRange && (
                    <p className="text-sm text-muted-foreground">
                      {timeRange}
                    </p>
                  )}
                  {event!.location && (
                    <p className="text-base">
                      Location: {event!.location}
                    </p>
                  )}
                  <p className="text-base">
                    {event!.description || 'No description'}
                  </p>
                </>
              )}
              {isChore && (
                <>
                  <p className="text-sm text-muted-foreground">
                    Assigned to: {chore!.assignee_name}
                  </p>
                  {chore!.description && (
                    <p className="text-base">
                      {chore!.description}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Chore badge + points */}
        {isChore && (
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-medium bg-primary/15 text-primary px-2 py-0.5 rounded-full whitespace-nowrap">
              Chore
            </span>
            <span className="text-sm bg-muted px-2 py-1 rounded whitespace-nowrap">
              {chore!.points}pts
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
