interface PlayerBadgeProps {
  color: 'white' | 'black';
  playerName: string | null;
  isCurrentTurn: boolean;
  onClick: () => void;
}

export function PlayerBadge({ color, playerName, isCurrentTurn, onClick }: PlayerBadgeProps) {
  const label = color === 'white' ? 'White' : 'Black';
  const kingIcon = color === 'white' ? '\u2654' : '\u265A';
  const displayName = playerName ?? 'Not Selected';

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border w-full min-h-[48px] active:scale-[0.96] transition-transform ${
        isCurrentTurn ? 'ring-2 ring-[hsl(220,90%,50%)]' : ''
      }`}
      onClick={onClick}
      role="button"
      aria-label={`${label} player: ${displayName}${isCurrentTurn ? ' (current turn)' : ''}`}
    >
      <span className="text-2xl leading-none" aria-hidden="true">{kingIcon}</span>
      <span className="text-sm font-medium">
        {label}: {displayName}
      </span>
    </div>
  );
}
