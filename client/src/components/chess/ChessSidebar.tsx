import { Button } from '../ui/button';
import { PlayerBadge } from './PlayerBadge';
import { MoveHistory } from './MoveHistory';
import type { PieceColor } from '../../types/chess';

interface ChessSidebarProps {
  whitePlayerName: string | null;
  blackPlayerName: string | null;
  currentTurn: PieceColor;
  moves: string[];
  onSelectWhitePlayer: () => void;
  onSelectBlackPlayer: () => void;
  onNewGame: () => void;
  onUndo: () => void;
}

export function ChessSidebar({
  whitePlayerName,
  blackPlayerName,
  currentTurn,
  moves,
  onSelectWhitePlayer,
  onSelectBlackPlayer,
  onNewGame,
  onUndo,
}: ChessSidebarProps) {
  const currentTurnPlayerName =
    currentTurn === 'w' ? (whitePlayerName ?? 'White') : (blackPlayerName ?? 'Black');

  return (
    <div className="flex flex-col gap-4 w-full">
      <PlayerBadge
        color="white"
        playerName={whitePlayerName}
        isCurrentTurn={currentTurn === 'w'}
        onClick={onSelectWhitePlayer}
      />
      <PlayerBadge
        color="black"
        playerName={blackPlayerName}
        isCurrentTurn={currentTurn === 'b'}
        onClick={onSelectBlackPlayer}
      />
      <p className="text-sm font-medium text-center">
        {currentTurnPlayerName}&apos;s Turn
      </p>
      <Button
        variant="outline"
        className="min-h-12 w-full"
        onClick={onNewGame}
      >
        New Game
      </Button>
      <Button
        variant="outline"
        className="min-h-12 w-full"
        onClick={onUndo}
        disabled={moves.length === 0}
      >
        Undo Move
      </Button>
      <MoveHistory moves={moves} />
    </div>
  );
}
