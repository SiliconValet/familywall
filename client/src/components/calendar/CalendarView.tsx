import { useState } from 'react';
import { format, addDays, addWeeks, addMonths, startOfWeek, endOfWeek } from 'date-fns';
import type { CalendarViewMode } from '@/types/calendar';
import { useCalendarData } from '@/hooks/useCalendarData';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { useChoreData } from '@/hooks/useChoreData';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon, RefreshIcon, Settings02Icon } from '@hugeicons/core-free-icons';
import { DailyAgenda } from './DailyAgenda';
import { WeeklyAgenda } from './WeeklyAgenda';
import { MonthlyGrid } from './MonthlyGrid';

interface CalendarViewProps {
  onOpenSettings: () => void;
}

export function CalendarView({ onOpenSettings }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('daily');
  const [viewDate, setViewDate] = useState(new Date());
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const { allDayItems, timedItems, mergedItems, loading, authStatus } = useCalendarData(viewDate, viewMode);
  const { syncing, lastSynced, triggerSync } = useCalendarSync();
  const { completeChore } = useChoreData();

  // Navigation handlers
  const handlePrevious = () => {
    if (viewMode === 'daily') setViewDate(addDays(viewDate, -1));
    else if (viewMode === 'weekly') setViewDate(addWeeks(viewDate, -1));
    else setViewDate(addMonths(viewDate, -1));
  };

  const handleNext = () => {
    if (viewMode === 'daily') setViewDate(addDays(viewDate, 1));
    else if (viewMode === 'weekly') setViewDate(addWeeks(viewDate, 1));
    else setViewDate(addMonths(viewDate, 1));
  };

  const handleToday = () => {
    setViewDate(new Date());
  };

  // Period label formatting
  const periodLabel = (() => {
    if (viewMode === 'daily') {
      return format(viewDate, 'MMMM d, yyyy');
    } else if (viewMode === 'weekly') {
      const weekStart = startOfWeek(viewDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(viewDate, { weekStartsOn: 1 });
      return `${format(weekStart, 'MMM d')}–${format(weekEnd, 'd, yyyy')}`;
    } else {
      return format(viewDate, 'MMMM yyyy');
    }
  })();

  // Handle day click from monthly grid
  const handleDayClick = (date: Date) => {
    setViewDate(date);
    setViewMode('daily');
  };

  // Handle event expand/collapse
  const handleToggleExpand = (id: string) => {
    setExpandedEventId(expandedEventId === id ? null : id);
  };

  return (
    <div className="flex flex-col h-full px-6">
      {/* Header row with title and action buttons */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-heading">Calendar</h1>
        <div className="flex items-center gap-2">
          {/* Refresh button */}
          <Button
            variant="ghost"
            size="icon"
            className="min-h-12 min-w-12"
            onClick={triggerSync}
            disabled={syncing}
            aria-label="Refresh calendar"
          >
            <HugeiconsIcon
              icon={RefreshIcon}
              strokeWidth={2}
              className={syncing ? 'animate-spin' : ''}
            />
          </Button>
          {/* Settings button */}
          <Button
            variant="ghost"
            size="icon"
            className="min-h-12 min-w-12"
            onClick={onOpenSettings}
            aria-label="Calendar settings"
          >
            <HugeiconsIcon icon={Settings02Icon} strokeWidth={2} />
          </Button>
        </div>
      </div>

      {/* Row 1: View switcher */}
      <div className="mb-3">
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => value && setViewMode(value as CalendarViewMode)}
        >
          <ToggleGroupItem value="daily" className="min-h-12 px-6">
            Daily
          </ToggleGroupItem>
          <ToggleGroupItem value="weekly" className="min-h-12 px-6">
            Weekly
          </ToggleGroupItem>
          <ToggleGroupItem value="monthly" className="min-h-12 px-6">
            Monthly
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Row 2: Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="min-h-12 min-w-12"
            onClick={handlePrevious}
            aria-label="Previous period"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
          </Button>
          <h2 className="text-2xl font-heading min-w-[200px] text-center">
            {periodLabel}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="min-h-12 min-w-12"
            onClick={handleNext}
            aria-label="Next period"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
          </Button>
        </div>
        <Button
          variant="ghost"
          className="min-h-12"
          onClick={handleToday}
          aria-label="Jump to today"
        >
          Today
        </Button>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto">
        {!authStatus.connected ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h3 className="text-2xl font-heading mb-2">No Calendar Connected</h3>
            <p className="text-base text-muted-foreground">
              Connect your Google Calendar in Settings to see events here.
            </p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-base">Syncing calendar...</p>
          </div>
        ) : viewMode === 'daily' ? (
          <DailyAgenda
            allDayItems={allDayItems}
            timedItems={timedItems}
            expandedEventId={expandedEventId}
            onToggleExpand={handleToggleExpand}
            onCompleteChore={completeChore}
          />
        ) : viewMode === 'weekly' ? (
          <WeeklyAgenda
            items={mergedItems}
            viewDate={viewDate}
            expandedEventId={expandedEventId}
            onToggleExpand={handleToggleExpand}
            onCompleteChore={completeChore}
          />
        ) : (
          <MonthlyGrid
            items={mergedItems}
            viewDate={viewDate}
            onDayClick={handleDayClick}
          />
        )}
      </div>

      {/* Sync status badge */}
      {lastSynced && !syncing && (
        <div className="text-sm text-muted-foreground mt-4 text-right">
          Last synced {Math.floor((Date.now() - new Date(lastSynced).getTime()) / 60000)} minutes ago
        </div>
      )}
    </div>
  );
}
