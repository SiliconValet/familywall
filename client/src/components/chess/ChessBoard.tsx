import type { Chess } from 'chess.js';
import { ChessSquare } from './ChessSquare';

interface ChessBoardProps {
  chess: Chess;
  selectedSquare: string | null;
  onSquareClick: (square: string) => void;
}

export function ChessBoard({ chess, selectedSquare, onSquareClick }: ChessBoardProps) {
  const board = chess.board();

  const squares = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const file = 'abcdefgh'[col];
      const square = file + (8 - row);
      const isLight = (row + col) % 2 === 0;
      const piece = board[row][col];

      squares.push(
        <ChessSquare
          key={square}
          piece={piece}
          isLight={isLight}
          isSelected={square === selectedSquare}
          onClick={() => onSquareClick(square)}
          coordinate={square}
        />
      );
    }
  }

  return (
    <div className="grid grid-cols-8 grid-rows-8 aspect-square max-w-[min(80vh,600px)] mx-auto w-full">
      {squares}
    </div>
  );
}
