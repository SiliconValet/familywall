import { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick02Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FamilyMemberBadge } from '@/components/FamilyMemberBadge';
import { formatWeekRange } from '@/utils/date-filters';
import type { WeeklySummaryRow } from '@/types/chore';

const DEFAULT_COLOR = '#039BE5';

interface WeeklySummaryProps {
  open: boolean;
  onClose: () => void;
  colorMap: Map<number, string>;
}

export function WeeklySummary({ open, onClose, colorMap }: WeeklySummaryProps) {
  const [data, setData] = useState<WeeklySummaryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchSummary();
    }
  }, [open]);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/chores/summary');
      if (!response.ok) {
        throw new Error('Failed to load summary');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load summary');
    } finally {
      setLoading(false);
    }
  };

  const weekRange = formatWeekRange();

  // Day abbreviations for column headers
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Weekly Summary</DialogTitle>
          <p className="text-sm text-muted-foreground">{weekRange}</p>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading summary...
          </div>
        ) : error ? (
          <div className="py-8 text-center text-destructive">
            {error}
          </div>
        ) : data.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No recurring chores to display for this week.
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Grid: first column for chore info, 7 columns for days */}
            <div className="grid grid-cols-[1fr_repeat(7,_48px)] gap-2">
              {/* Header Row */}
              <div className="font-medium text-sm">Chore</div>
              {dayNames.map((day, i) => (
                <div key={i} className="text-center font-medium text-sm">
                  {day}
                </div>
              ))}

              {/* Data Rows */}
              {data.map((row, rowIndex) => {
                const memberColor = colorMap.get(row.assigned_to) || DEFAULT_COLOR;

                return (
                  <div key={rowIndex} className="contents">
                    {/* Chore info cell */}
                    <div className="flex items-center gap-2 py-2" style={{ borderLeft: `4px solid ${memberColor}`, paddingLeft: '8px' }}>
                      <FamilyMemberBadge name={row.assignee_name} color={memberColor} />
                      <span className="text-sm">{row.chore_title}</span>
                    </div>

                    {/* Day cells (Sunday is last in display, but first in weekDays array) */}
                    {/* Reorder: Mon(1), Tue(2), Wed(3), Thu(4), Fri(5), Sat(6), Sun(0) */}
                    {[1, 2, 3, 4, 5, 6, 0].map((dayIndex) => {
                      const dayData = row.days[dayIndex];
                      const status = dayData.status;

                      return (
                        <div key={dayIndex} className="flex items-center justify-center py-2">
                          {status === 'completed' ? (
                            <HugeiconsIcon icon={Tick02Icon} className="h-5 w-5 text-green-600" />
                          ) : status === 'missed' ? (
                            <HugeiconsIcon icon={Cancel01Icon} className="h-5 w-5 text-red-500" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 min-h-12 min-w-12 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          aria-label="Close summary"
        >
          <HugeiconsIcon icon={Cancel01Icon} className="h-6 w-6" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
