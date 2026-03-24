import { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import type { ChessGame } from '../types/chess';

export function useChessGame() {
  const [chess] = useState(() => new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [moves, setMoves] = useState<string[]>([]);
  const [whitePlayerId, setWhitePlayerId] = useState<number | null>(null);
  const [blackPlayerId, setBlackPlayerId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const loadGame = useCallback(async () => {
    try {
      const res = await fetch('/api/chess/game');
      if (!res.ok) throw new Error('Failed to load game');
      const data: ChessGame = await res.json();

      chess.load(data.fen);
      setFen(data.fen);
      setMoves(data.moves);
      setWhitePlayerId(data.white_player_id);
      setBlackPlayerId(data.black_player_id);
    } catch (err) {
      console.error('Failed to load chess game:', err);
    } finally {
      setLoading(false);
    }
  }, [chess]);

  const makeMove = useCallback(async (from: string, to: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/chess/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, promotion: 'q' }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      chess.load(data.fen);
      setFen(data.fen);
      setMoves(data.moves);
      return true;
    } catch (err) {
      console.error('Failed to make move:', err);
      return false;
    }
  }, [chess]);

  const undoMove = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch('/api/chess/undo', {
        method: 'POST',
      });

      if (!res.ok) return;

      const data = await res.json();
      // Reconstruct chess instance from returned state
      const newChess = new Chess();
      for (const san of data.moves) {
        newChess.move(san);
      }
      chess.load(data.fen);
      setFen(data.fen);
      setMoves(data.moves);
    } catch (err) {
      console.error('Failed to undo move:', err);
    }
  }, [chess]);

  const resetGame = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch('/api/chess/new-game', {
        method: 'POST',
      });

      if (!res.ok) return;

      const data = await res.json();
      chess.reset();
      setFen(chess.fen());
      setMoves([]);
      setWhitePlayerId(data.white_player_id);
      setBlackPlayerId(data.black_player_id);
    } catch (err) {
      console.error('Failed to reset game:', err);
    }
  }, [chess]);

  const setPlayer = useCallback(async (color: 'white' | 'black', playerId: number | null): Promise<void> => {
    try {
      const res = await fetch('/api/chess/player', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color, player_id: playerId }),
      });

      if (!res.ok) return;

      if (color === 'white') {
        setWhitePlayerId(playerId);
      } else {
        setBlackPlayerId(playerId);
      }
    } catch (err) {
      console.error('Failed to set player:', err);
    }
  }, []);

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  return {
    fen,
    chess,
    moves,
    whitePlayerId,
    blackPlayerId,
    loading,
    makeMove,
    undoMove,
    resetGame,
    setPlayer,
  };
}
