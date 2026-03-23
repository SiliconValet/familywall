import { useCallback, useRef } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  threshold?: number; // milliseconds, default 1000 per D-17
}

export function useLongPress({ onLongPress, onClick, threshold = 1000 }: UseLongPressOptions) {
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isLongPressRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    isLongPressRef.current = false;

    // Record start position for movement detection (Pitfall 3 from RESEARCH.md)
    if ('touches' in e) {
      startPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
      startPosRef.current = { x: e.clientX, y: e.clientY };
    }

    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress();
    }, threshold);
  }, [onLongPress, threshold]);

  const handleEnd = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isLongPressRef.current && onClick) {
      onClick();
    }
    startPosRef.current = null;
  }, [onClick]);

  const handleMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!startPosRef.current || !timerRef.current) return;

    let currentX: number, currentY: number;
    if ('touches' in e) {
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
    } else {
      currentX = e.clientX;
      currentY = e.clientY;
    }

    // Cancel if finger moves > 10px (prevents long-press during scroll)
    const dx = currentX - startPosRef.current.x;
    const dy = currentY - startPosRef.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 10) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const handleCancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    startPosRef.current = null;
  }, []);

  return {
    onTouchStart: handleStart,
    onTouchEnd: handleEnd,
    onTouchMove: handleMove,
    onTouchCancel: handleCancel,
    onMouseDown: handleStart,
    onMouseUp: handleEnd,
    onMouseMove: handleMove,
    onMouseLeave: handleCancel,
  };
}
