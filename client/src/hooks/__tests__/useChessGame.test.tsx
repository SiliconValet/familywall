import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch for API calls
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('useChessGame', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('initialization', () => {
    it.todo('loads game state from GET /api/chess/game on mount (D-20)');
    it.todo('sets loading to true initially and false after load');
    it.todo('initializes Chess instance with fetched FEN');
  });

  describe('makeMove', () => {
    it.todo('sends POST /api/chess/move with from, to, promotion');
    it.todo('updates fen and moves state on successful move');
    it.todo('returns true on successful move');
    it.todo('returns false on invalid move (400 response)');
  });

  describe('undoMove', () => {
    it.todo('sends POST /api/chess/undo (CHESS-11, D-21)');
    it.todo('updates fen and moves state with server response');
    it.todo('replays remaining moves on Chess instance');
  });

  describe('resetGame', () => {
    it.todo('sends POST /api/chess/new-game (CHESS-09, CHESS-10)');
    it.todo('resets Chess instance to starting position');
    it.todo('clears moves array');
  });

  describe('setPlayer', () => {
    it.todo('sends PUT /api/chess/player with color and player_id (CHESS-01, CHESS-02)');
    it.todo('updates whitePlayerId or blackPlayerId state');
  });
});
