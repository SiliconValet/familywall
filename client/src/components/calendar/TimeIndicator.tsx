import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export function TimeIndicator() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Only show between 6:00 AM and 10:00 PM
  const hours = currentTime.getHours();
  if (hours < 6 || hours >= 22) {
    return null;
  }

  const timeLabel = format(currentTime, 'h:mm a');

  return (
    <div className="flex items-center gap-2 my-4">
      <div className="flex-1 h-1 bg-primary" />
      <span className="text-sm whitespace-nowrap" style={{ color: 'oklch(var(--primary))' }}>
        {timeLabel}
      </span>
    </div>
  );
}
