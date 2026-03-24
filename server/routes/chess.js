import { Chess } from 'chess.js';
import db from '../db.js';

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export default async function chessRoutes(fastify, options) {
  // GET current game state — auto-creates row if none exists
  fastify.get('/api/chess/game', async (request, reply) => {
    let game = db.prepare('SELECT * FROM chess_games WHERE id = 1').get();

    if (!game) {
      db.prepare(`
        INSERT INTO chess_games (id, fen, moves, white_player_id, black_player_id)
        VALUES (1, ?, ?, NULL, NULL)
      `).run(STARTING_FEN, '[]');
      game = db.prepare('SELECT * FROM chess_games WHERE id = 1').get();
    }

    return {
      fen: game.fen,
      moves: JSON.parse(game.moves),
      white_player_id: game.white_player_id,
      black_player_id: game.black_player_id
    };
  });

  // POST make a move — body: { from, to, promotion }
  fastify.post('/api/chess/move', async (request, reply) => {
    const { from, to, promotion = 'q' } = request.body || {};

    if (!from || !to) {
      reply.code(400).send({ error: 'Missing required fields: from, to' });
      return;
    }

    const game = db.prepare('SELECT * FROM chess_games WHERE id = 1').get();
    if (!game) {
      reply.code(404).send({ error: 'No game found. Call GET /api/chess/game first.' });
      return;
    }

    const chess = new Chess(game.fen);
    let move;
    try {
      move = chess.move({ from, to, promotion });
    } catch {
      reply.code(400).send({ error: 'Invalid move' });
      return;
    }

    if (!move) {
      reply.code(400).send({ error: 'Invalid move' });
      return;
    }

    const moves = JSON.parse(game.moves);
    moves.push(move.san);

    db.prepare(`
      UPDATE chess_games
      SET fen = ?, moves = ?, updated_at = unixepoch()
      WHERE id = 1
    `).run(chess.fen(), JSON.stringify(moves));

    return { fen: chess.fen(), move: move.san, moves };
  });

  // POST undo last move — rebuilds FEN by replaying all moves minus the last
  fastify.post('/api/chess/undo', async (request, reply) => {
    const game = db.prepare('SELECT * FROM chess_games WHERE id = 1').get();
    if (!game) {
      reply.code(404).send({ error: 'No game found.' });
      return;
    }

    const moves = JSON.parse(game.moves);
    if (moves.length === 0) {
      reply.code(400).send({ error: 'No moves to undo' });
      return;
    }

    // Reconstruct board by replaying all moves except the last
    const remainingMoves = moves.slice(0, -1);
    const chess = new Chess();
    try {
      for (const san of remainingMoves) {
        chess.move(san);
      }
    } catch {
      reply.code(500).send({ error: 'Failed to reconstruct game state' });
      return;
    }

    db.prepare(`
      UPDATE chess_games
      SET fen = ?, moves = ?, updated_at = unixepoch()
      WHERE id = 1
    `).run(chess.fen(), JSON.stringify(remainingMoves));

    return { fen: chess.fen(), moves: remainingMoves };
  });

  // POST new game — resets to starting position, keeps player IDs
  fastify.post('/api/chess/new-game', async (request, reply) => {
    const game = db.prepare('SELECT * FROM chess_games WHERE id = 1').get();

    if (!game) {
      // Create the row if it doesn't exist
      db.prepare(`
        INSERT INTO chess_games (id, fen, moves, white_player_id, black_player_id)
        VALUES (1, ?, ?, NULL, NULL)
      `).run(STARTING_FEN, '[]');
    } else {
      db.prepare(`
        UPDATE chess_games
        SET fen = ?, moves = '[]', updated_at = unixepoch()
        WHERE id = 1
      `).run(STARTING_FEN);
    }

    const updated = db.prepare('SELECT * FROM chess_games WHERE id = 1').get();
    return {
      fen: updated.fen,
      moves: [],
      white_player_id: updated.white_player_id,
      black_player_id: updated.black_player_id
    };
  });

  // PUT set player — body: { color: 'white'|'black', player_id: number|null }
  fastify.put('/api/chess/player', async (request, reply) => {
    const { color, player_id } = request.body || {};

    if (!color || !['white', 'black'].includes(color)) {
      reply.code(400).send({ error: "color must be 'white' or 'black'" });
      return;
    }

    // Validate player_id if provided
    if (player_id !== null && player_id !== undefined) {
      const member = db.prepare('SELECT id FROM family_members WHERE id = ?').get(player_id);
      if (!member) {
        reply.code(400).send({ error: 'Invalid player_id: family member not found' });
        return;
      }
    }

    const column = color === 'white' ? 'white_player_id' : 'black_player_id';

    // Ensure game row exists
    const game = db.prepare('SELECT * FROM chess_games WHERE id = 1').get();
    if (!game) {
      db.prepare(`
        INSERT INTO chess_games (id, fen, moves, white_player_id, black_player_id)
        VALUES (1, ?, ?, NULL, NULL)
      `).run(STARTING_FEN, '[]');
    }

    db.prepare(`
      UPDATE chess_games
      SET ${column} = ?, updated_at = unixepoch()
      WHERE id = 1
    `).run(player_id ?? null);

    const updated = db.prepare('SELECT * FROM chess_games WHERE id = 1').get();
    return {
      fen: updated.fen,
      moves: JSON.parse(updated.moves),
      white_player_id: updated.white_player_id,
      black_player_id: updated.black_player_id
    };
  });
}
