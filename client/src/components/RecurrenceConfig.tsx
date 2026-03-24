import type { RecurrenceConfig as RecurrenceConfigType } from '@/types/chore';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface RecurrenceConfigProps {
  value: RecurrenceConfigType;
  onChange: (config: RecurrenceConfigType) => void;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
];

export function RecurrenceConfig({ value, onChange }: RecurrenceConfigProps) {
  const handleFrequencyChange = (frequency: string) => {
    let newDays: number[] = [];
    let newInterval: number | undefined = undefined;

    switch (frequency) {
      case 'daily':
        newDays = [0, 1, 2, 3, 4, 5, 6];
        break;
      case 'weekly':
        newDays = [0, 1, 2, 3, 4, 5, 6];
        break;
      case 'custom':
        newDays = value.days || [];
        break;
      case 'interval':
        newDays = [];
        newInterval = value.interval || 2;
        break;
    }

    onChange({
      frequency: frequency as RecurrenceConfigType['frequency'],
      days: newDays,
      interval: newInterval,
      startDate: frequency === 'interval'
        ? (value.startDate || new Date().toISOString().split('T')[0])
        : undefined,
    });
  };

  const handleDayToggle = (day: number) => {
    const newDays = value.days.includes(day)
      ? value.days.filter((d) => d !== day)
      : [...value.days, day];

    onChange({
      ...value,
      days: newDays,
    });
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const interval = parseInt(e.target.value, 10);
    if (!isNaN(interval) && interval >= 1 && interval <= 365) {
      onChange({ ...value, interval });
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, startDate: e.target.value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="frequency">Frequency</Label>
        <Select value={value.frequency} onValueChange={handleFrequencyChange}>
          <SelectTrigger id="frequency" className="min-h-12 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="custom">Custom Days</SelectItem>
            <SelectItem value="interval">Every N Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {value.frequency === 'custom' && (
        <div className="space-y-2">
          <Label>Days of Week</Label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <label
                key={day.value}
                className="flex items-center gap-2 min-h-12 px-3 rounded-xl border border-input cursor-pointer hover:bg-muted"
              >
                <Checkbox
                  checked={value.days.includes(day.value)}
                  onCheckedChange={() => handleDayToggle(day.value)}
                />
                <span className="text-sm">{day.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {value.frequency === 'interval' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="interval">Repeat every _ days</Label>
            <Input
              id="interval"
              type="number"
              min={1}
              max={365}
              value={value.interval || 2}
              onChange={handleIntervalChange}
              className="min-h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Starting</Label>
            <Input
              id="startDate"
              type="date"
              data-no-keyboard
              value={value.startDate || new Date().toISOString().split('T')[0]}
              onChange={handleStartDateChange}
              className="min-h-12"
            />
          </div>
        </div>
      )}
    </div>
  );
}
