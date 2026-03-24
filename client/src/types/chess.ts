export interface ChessGame {
  fen: string;
  moves: string[];
  white_player_id: number | null;
  black_player_id: number | null;
}

export interface ChessMove {
  from: string;
  to: string;
  promotion?: string;
}

export type PieceColor = 'w' | 'b';

export interface SquareInfo {
  type: string;  // p, n, b, r, q, k
  color: PieceColor;
}
