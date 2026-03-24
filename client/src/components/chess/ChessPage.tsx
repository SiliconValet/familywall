import { useState } from 'react';
import { useChessGame } from '../../hooks/useChessGame';
import { useFamilyData } from '../../hooks/useFamilyData';
import { ChessBoard } from './ChessBoard';
import { ChessSidebar } from './ChessSidebar';
import { PlayerPickerModal } from './PlayerPickerModal';
import { NewGameConfirmDialog } from './NewGameConfirmDialog';

export function ChessPage() {
  const { chess, moves, whitePlayerId, blackPlayerId, loading, makeMove, undoMove, resetGame, setPlayer } = useChessGame();
  const { members } = useFamilyData();

  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerColor, setPickerColor] = useState<'white' | 'black'>('white');
  const [confirmNewGameOpen, setConfirmNewGameOpen] = useState(false);

  const handleSquareClick = (square: string) => {
    if (!selectedSquare) {
      const piece = chess.get(square as Parameters<typeof chess.get>[0]);
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square);
      }
    } else if (selectedSquare === square) {
      setSelectedSquare(null);
    } else {
      makeMove(selectedSquare, square);
      setSelectedSquare(null);
    }
  };

  const handleSelectWhitePlayer = () => {
    setPickerColor('white');
    setPickerOpen(true);
  };

  const handleSelectBlackPlayer = () => {
    setPickerColor('black');
    setPickerOpen(true);
  };

  const handleNewGame = () => {
    setConfirmNewGameOpen(true);
  };

  const handleConfirmNewGame = () => {
    resetGame();
    setSelectedSquare(null);
  };

  const handlePlayerSelect = (playerId: number | null) => {
    setPlayer(pickerColor, playerId);
  };

  const getPlayerName = (playerId: number | null): string | null => {
    if (playerId === null) return null;
    const member = members.find((m) => m.id === playerId);
    return member ? member.name : null;
  };

  const whitePlayerName = getPlayerName(whitePlayerId);
  const blackPlayerName = getPlayerName(blackPlayerId);
  const currentTurn = chess.turn();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex gap-8 p-4 max-w-screen-xl mx-auto">
      <div className="flex-1 max-w-[min(80vh,600px)]">
        <ChessBoard
          chess={chess}
          selectedSquare={selectedSquare}
          onSquareClick={handleSquareClick}
        />
      </div>
      <div className="w-64 flex-shrink-0">
        <ChessSidebar
          whitePlayerName={whitePlayerName}
          blackPlayerName={blackPlayerName}
          currentTurn={currentTurn}
          moves={moves}
          onSelectWhitePlayer={handleSelectWhitePlayer}
          onSelectBlackPlayer={handleSelectBlackPlayer}
          onNewGame={handleNewGame}
          onUndo={undoMove}
        />
      </div>
      <PlayerPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePlayerSelect}
        title={pickerColor === 'white' ? 'Select White Player' : 'Select Black Player'}
        members={members}
      />
      <NewGameConfirmDialog
        open={confirmNewGameOpen}
        onClose={() => setConfirmNewGameOpen(false)}
        onConfirm={handleConfirmNewGame}
      />
    </div>
  );
}
