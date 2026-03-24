import type { SquareInfo } from '../../types/chess';

// U+FE0E forces text presentation (prevents emoji rendering on Apple platforms)
const VS15 = '\uFE0E';
const PIECE_SYMBOLS: Record<string, Record<string, string>> = {
  w: { p: '\u2659' + VS15, n: '\u2658' + VS15, b: '\u2657' + VS15, r: '\u2656' + VS15, q: '\u2655' + VS15, k: '\u2654' + VS15 },
  b: { p: '\u265F' + VS15, n: '\u265E' + VS15, b: '\u265D' + VS15, r: '\u265C' + VS15, q: '\u265B' + VS15, k: '\u265A' + VS15 },
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
