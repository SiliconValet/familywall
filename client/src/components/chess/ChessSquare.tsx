import type { SquareInfo } from '../../types/chess';

const PIECE_SYMBOLS: Record<string, Record<string, string>> = {
  w: { p: '\u2659', n: '\u2658', b: '\u2657', r: '\u2656', q: '\u2655', k: '\u2654' },
  b: { p: '\u265F', n: '\u265E', b: '\u265D', r: '\u265C', q: '\u265B', k: '\u265A' },
};

interface ChessSquareProps {
  piece: SquareInfo | null;
  isLight: boolean;
  isSelected: boolean;
  onClick: () => void;
  coordinate: string;
}

export function ChessSquare({ piece, isLight, isSelected, onClick, coordinate }: ChessSquareProps) {
  const pieceSymbol = piece ? (PIECE_SYMBOLS[piece.color]?.[piece.type] ?? '') : '';

  const baseClasses = 'flex items-center justify-center cursor-pointer aspect-square min-h-[44px] select-none';
  const colorClass = isLight ? 'bg-[hsl(0,0%,85%)]' : 'bg-[hsl(0,0%,60%)]';
  const selectedClass = isSelected ? 'border-4 border-[hsl(220,90%,50%)] box-border' : '';
  const fontClass = "text-[clamp(2rem,8vw,3.5rem)] font-['Segoe_UI_Symbol','Noto_Sans_Symbols','Apple_Color_Emoji',sans-serif]";

  return (
    <div
      className={`${baseClasses} ${colorClass} ${selectedClass} ${fontClass}`}
      onClick={onClick}
      data-square={coordinate}
      aria-label={`${coordinate}${piece ? ` ${piece.color === 'w' ? 'white' : 'black'} ${piece.type}` : ''}`}
    >
      {pieceSymbol}
    </div>
  );
}
