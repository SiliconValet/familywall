import { useRef, useEffect } from 'react';

interface MoveHistoryProps {
  moves: string[];
}

export function MoveHistory({ moves }: MoveHistoryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMoveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (moves.length > 0) {
      lastMoveRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [moves.length]);

  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">Moves</h3>
      <div
        ref={containerRef}
        className="overflow-y-auto max-h-[60vh] bg-secondary p-4 rounded-lg"
      >
        {moves.length === 0 ? (
          <p className="text-sm text-muted-foreground">(No moves yet)</p>
        ) : (
          moves.map((move, index) => {
            const moveNumber = Math.floor(index / 2) + 1;
            const formatted = index % 2 === 0
              ? `${moveNumber}. ${move}`
              : `${moveNumber}... ${move}`;
            const isLast = index === moves.length - 1;

            return (
              <div
                key={index}
                ref={isLast ? lastMoveRef : undefined}
                className="text-sm leading-relaxed"
              >
                {formatted}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
