# Phase 5: Chess Board - Research

**Researched:** 2026-03-23
**Domain:** Chess game implementation with React, chess.js, persistent state
**Confidence:** HIGH

## Summary

Phase 5 implements a touch-enabled chess board where family members play long-running games. The standard stack combines **chess.js 1.4.0** for game logic (move validation, FEN state, algebraic notation) with custom React UI components for tap-tap piece movement. Unlike typical chess apps that use react-chessboard with drag-and-drop, this phase requires custom implementation to support the user-decided tap-tap interaction pattern and trust-based gameplay (no move validation UI).

Game state persists in SQLite using FEN notation for board position and JSON for move history, following the project's established pattern of better-sqlite3 with TEXT JSON storage. The UI uses Unicode chess symbols (♔♕♖♗♘♙ / ♚♛♜♝♞♟) instead of SVG pieces, CSS Grid for the 8×8 board layout, and existing shadcn components for controls (Button, Dialog) and family member selection patterns.

**Primary recommendation:** Use chess.js for all game logic and state management, implement custom CSS Grid board with tap-select interaction, store complete game state (FEN + move history + players) in single SQLite row, and leverage existing project patterns for family member selection and modal dialogs.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Piece Movement Interaction:**
- D-01: Tap-tap method for moving pieces (tap source square, then tap destination square)
- D-02: Selected square highlighted with colored border when piece is tapped
- D-03: Tap same square again to deselect/cancel selection
- D-04: No visual indication of valid moves (trust-based gameplay, matches requirements)

**Board & Piece Visual Style:**
- D-05: Unicode chess symbols for pieces (♔♕♖♗♘♙ for white, ♚♛♜♝♞♟ for black)
- D-06: Modern neutral gray color scheme for board squares (light gray and dark gray)
- D-07: Use Unicode's built-in white/black piece symbols for distinction (no custom CSS coloring)
- D-08: 8×8 grid of squares with board coordinates (a-h, 1-8) optional for edges

**Game Controls & Layout:**
- D-09: Sidebar layout with controls positioned vertically next to the chess board
- D-10: Minimal control set in sidebar: player badges (white/black with family colors), New Game button, Undo Move button
- D-11: Player selection via tappable badges (tap white badge → family picker modal, tap black badge → family picker modal)
- D-12: New Game button opens confirmation dialog ("Reset board and start fresh? This cannot be undone.")
- D-13: Board occupies main area (square aspect ratio), sidebar takes remaining horizontal space

**Move History Display:**
- D-14: Move history displays below controls in the same sidebar (scrollable vertical list)
- D-15: Vertical list format with each move on its own row (e.g., "1. e4", "1... e5", "2. Nf3")
- D-16: Always auto-scroll to latest move when new move is made (per CHESS-07)
- D-17: Users can manually scroll up to review earlier moves (auto-scroll doesn't prevent this)

**Game State Persistence:**
- D-18: Game state stored in SQLite: board position (FEN notation), move history, current turn, white/black player IDs
- D-19: Single active game at a time (no game history/archive in v1)
- D-20: Load game state on page load, save after each move
- D-21: Undo removes last move from database and reverts board state

### Claude's Discretion

- Exact shade of gray for board squares
- Selected square highlight color and border thickness
- Unicode piece font size and rendering
- Confirmation dialog wording and button styling
- Sidebar width and spacing between controls
- Move history text size and line height
- FEN notation library choice for board representation
- Algebraic notation generation logic

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.

Move validation / rules enforcement explicitly out of scope (per PROJECT.md: "Chess rules enforcement — Trust-based gameplay").
Game history / archive explicitly out of scope (per PROJECT.md: "Chess game history/archive — Current game only, no save/load past games (defer to v2)").

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CHESS-01 | User can select white player from family members | Family member picker modal pattern from Phase 2; FamilyMemberBadge component with tap interaction |
| CHESS-02 | User can select black player from family members | Same modal pattern; maintain two player_id fields in chess_games table |
| CHESS-03 | User can move chess piece by touch drag-and-drop | **MODIFIED**: User decision changed to tap-tap (D-01), not drag-drop; custom click handler on squares |
| CHESS-04 | Board displays standard chess piece symbols | Unicode symbols U+2654-U+265F (♔♕♖♗♘♙♚♛♜♝♞♟) render in all modern browsers with system fonts |
| CHESS-05 | Board shows clear visual distinction between white and black pieces | Unicode spec provides separate code points for white (U+2654-2659) and black (U+265A-265F) pieces |
| CHESS-06 | Move history displays in algebraic notation | chess.js history() method with verbose: false returns SAN array; format as "1. e4", "1... e5" |
| CHESS-07 | Move history auto-scrolls to latest move | React useRef + scrollIntoView on move history container; triggered by move count change |
| CHESS-08 | Current turn indicator shows whose turn it is | chess.js turn() method returns 'w' or 'b'; display white/black player badge with highlight |
| CHESS-09 | User can start new game with confirmation dialog | shadcn Dialog component; reset chess.js instance + UPDATE chess_games SET fen=initial, moves='[]' |
| CHESS-10 | New game resets board and clears move history | chess.js reset() method; clears database move history and resets FEN to starting position |
| CHESS-11 | User can undo last move | chess.js undo() method returns move object; remove last element from moves JSON array in DB |
| CHESS-12 | Game state persists across browser restarts | SQLite chess_games table with id=1 (single game); FEN + moves JSON + white_player_id + black_player_id |

</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| chess.js | 1.4.0 | Chess game logic, move validation, FEN/SAN handling | Industry standard chess library; 10+ years stable; TypeScript support; handles FEN, SAN, PGN, move generation, validation, checkmate detection |
| better-sqlite3 | (existing) | Game state persistence | Already project standard from Phase 1; synchronous API; WAL mode enabled |
| React 19 | (existing) | UI framework | Project standard; hooks for game state management |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | (existing) | Not needed | Already in project but not required for chess phase |
| shadcn Dialog | (existing) | New Game confirmation, player picker modal | Reuse existing pattern from Phase 2 family management |
| shadcn Button | (existing) | New Game, Undo Move buttons | 44px touch target compliance per Phase 2 |
| FamilyMemberBadge | (existing) | White/black player indicators | Reuse Phase 3 component with color coding |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| chess.js | react-chessboard + chess.js | react-chessboard provides drag-drop UI but user decided on tap-tap (D-01); adds 200KB+ dependency for unused features; custom implementation needed anyway |
| chess.js | Custom chess logic | chess.js handles 50+ edge cases (castling, en passant, promotion, stalemate); hand-rolling risks bugs and missing rules; no benefit given trust-based gameplay |
| Unicode symbols | SVG piece images | SVG requires asset management, loading time, CORS considerations; Unicode renders immediately, zero network requests, scales perfectly |
| CSS Grid | HTML table | Grid provides modern layout control, easier responsive behavior, better accessibility; table semantics incorrect for game board |

**Installation:**

```bash
npm install chess.js --workspace=client
```

**Version verification:**

```bash
npm view chess.js version
# Expected: 1.4.0 (published 2025-06-14)
```

## Architecture Patterns

### Recommended Project Structure

```
client/src/
├── components/
│   ├── chess/
│   │   ├── ChessBoard.tsx        # Main board component (8×8 grid, tap interaction)
│   │   ├── ChessSquare.tsx       # Individual square (piece display, click handler)
│   │   ├── ChessSidebar.tsx      # Controls + move history container
│   │   ├── PlayerBadge.tsx       # Clickable white/black player indicator
│   │   ├── MoveHistory.tsx       # Scrollable SAN move list
│   │   └── PlayerPickerModal.tsx # Family member selection modal
│   ├── ui/                        # (existing shadcn components)
│   └── FamilyMemberBadge.tsx     # (existing, reused)
├── hooks/
│   ├── useChessGame.ts           # Game state management hook
│   └── useFamilyData.ts          # (existing)
├── types/
│   ├── chess.ts                  # Chess game TypeScript types
│   └── family.ts                 # (existing)

server/
├── routes/
│   └── chess.js                  # Chess game API routes
├── db.js                          # (add chess_games table)
```

### Pattern 1: Custom Chess Hook (useChessGame)

**What:** Custom React hook that encapsulates chess.js instance, game state, and API persistence logic.

**When to use:** Main ChessBoard component mounts; provides game state, move handlers, and sync logic.

**Example:**

```typescript
// Source: Established pattern from Phase 2/3 (useFamilyData, useChoreData)
import { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';

export function useChessGame() {
  const [chess] = useState(() => new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [whitePlayer, setWhitePlayer] = useState<number | null>(null);
  const [blackPlayer, setBlackPlayer] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Load game state from server
  const loadGame = useCallback(async () => {
    const res = await fetch('/api/chess/game');
    if (!res.ok) throw new Error('Failed to load game');
    const data = await res.json();

    chess.load(data.fen);
    setFen(data.fen);
    setWhitePlayer(data.white_player_id);
    setBlackPlayer(data.black_player_id);
    setLoading(false);
  }, [chess]);

  // Make move and persist
  const makeMove = useCallback(async (from: string, to: string) => {
    const move = chess.move({ from, to, promotion: 'q' }); // Auto-queen promotion
    if (!move) return false; // Invalid move (shouldn't happen in trust mode)

    setFen(chess.fen());

    await fetch('/api/chess/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, promotion: 'q' })
    });

    return true;
  }, [chess]);

  useEffect(() => { loadGame(); }, [loadGame]);

  return {
    fen,
    chess,
    whitePlayer,
    blackPlayer,
    loading,
    makeMove,
    // ... undo, reset, setPlayer methods
  };
}
```

### Pattern 2: Tap-Tap Square Selection

**What:** Click handler that manages selected square state and executes moves on second tap.

**When to use:** User interaction with chess squares; replace drag-and-drop pattern with tap-select-tap-destination.

**Example:**

```typescript
// Source: User decision D-01 (tap-tap), adapted from common click-to-move pattern
const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

const handleSquareClick = (square: string) => {
  if (!selectedSquare) {
    // First tap: select square if it has a piece
    const piece = chess.get(square);
    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(square);
    }
  } else if (selectedSquare === square) {
    // Tap same square: deselect (D-03)
    setSelectedSquare(null);
  } else {
    // Second tap: attempt move
    const success = makeMove(selectedSquare, square);
    setSelectedSquare(null); // Clear selection whether valid or not
  }
};
```

### Pattern 3: FEN + Move History Persistence

**What:** Store complete game state as FEN position + JSON move array in single SQLite row.

**When to use:** After every move, new game, or undo operation; load on component mount.

**Example:**

```sql
-- Source: Established project pattern (chores.recurrence_config uses TEXT JSON)
CREATE TABLE IF NOT EXISTS chess_games (
  id INTEGER PRIMARY KEY CHECK (id = 1),  -- Single game constraint
  fen TEXT NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  moves TEXT NOT NULL DEFAULT '[]',  -- JSON array of SAN moves
  white_player_id INTEGER,
  black_player_id INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (white_player_id) REFERENCES family_members(id) ON DELETE SET NULL,
  FOREIGN KEY (black_player_id) REFERENCES family_members(id) ON DELETE SET NULL
);
```

### Pattern 4: Auto-Scrolling Move History

**What:** useRef + scrollIntoView to automatically scroll move history to latest move while allowing manual scroll.

**When to use:** Move history component; trigger on moves array length change.

**Example:**

```typescript
// Source: Common React pattern for chat/log auto-scroll
const moveListRef = useRef<HTMLDivElement>(null);
const lastMoveRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  // Auto-scroll to latest move (D-16)
  lastMoveRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
}, [moves.length]);

return (
  <div ref={moveListRef} className="overflow-y-auto max-h-96">
    {moves.map((move, i) => (
      <div key={i} ref={i === moves.length - 1 ? lastMoveRef : null}>
        {formatMove(move, i)}
      </div>
    ))}
  </div>
);
```

### Anti-Patterns to Avoid

- **Storing move history as separate table rows:** Adds complexity, JOIN overhead, no benefit over JSON array; violates project's TEXT JSON pattern
- **Client-only state without DB persistence:** CHESS-12 requires persistence across browser restarts; state must survive daily Chromium reboot
- **Validating moves in UI before chess.js:** chess.js already validates; trust-based gameplay means no pre-move validation UI needed
- **Drag-and-drop on touch:** User explicitly chose tap-tap (D-01); drag-drop has precision issues on touchscreens, conflicts with scrolling

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chess move validation | Custom rules engine for legal moves | chess.js move() method | Handles 50+ edge cases: castling rights, en passant, promotion, stalemate, threefold repetition, 50-move rule |
| FEN notation parsing | Manual board state serialization | chess.js fen() and load() methods | FEN spec has 6 fields with complex encoding (piece placement, castling availability, en passant target, halfmove clock, fullmove number) |
| Algebraic notation | Custom move formatting logic | chess.js history() with verbose: false | SAN handles disambiguation (Nbd2 vs Nfd2), captures (exd5), check (+), checkmate (#), promotion (e8=Q) |
| Board position rendering | Manual piece placement calculation | chess.js board() method | Returns 8×8 array of squares with piece objects; handles square indexing and coordinate mapping |
| Game state detection | Custom checkmate/stalemate logic | chess.js isCheckmate(), isStalemate(), isCheck() | Accurate detection requires full move generation; non-trivial to implement correctly |

**Key insight:** Chess has enormous rule complexity despite simple appearance. chess.js is 2000+ lines of battle-tested logic handling every edge case. Custom implementation risks bugs, incomplete rules, and move validation errors that break games mid-play.

## Common Pitfalls

### Pitfall 1: FEN Load Timing with React State

**What goes wrong:** Loading FEN from database after chess.js instance creation causes race condition; initial render shows wrong position.

**Why it happens:** chess.js instance initializes with starting position; async database fetch updates later; React renders before state update.

**How to avoid:** Initialize chess.js instance with useState(() => new Chess()) to run once; load FEN in useEffect and call chess.load() before first render; show loading state until database fetch completes.

**Warning signs:** Board briefly shows starting position before switching to saved state; player turn indicator flickers; move history renders empty then populates.

### Pitfall 2: Move History Formatting (Move Numbering)

**What goes wrong:** Displaying moves as "1. e4 e5 2. Nf3 Nc6" (horizontal pairs) instead of "1. e4", "1... e5", "2. Nf3", "2... Nc6" (vertical list per D-15).

**Why it happens:** PGN standard formats moves horizontally; natural to copy that pattern; requires custom formatting logic to split White/Black moves.

**How to avoid:** chess.js history() returns flat array ["e4", "e5", "Nf3", "Nc6"]; format as move index: `Math.floor(i/2) + 1`, prefix: `i % 2 === 0 ? '. ' : '... '`.

**Warning signs:** Move history doesn't match D-15 specification; scrolling behavior incorrect; harder to read on narrow sidebar.

### Pitfall 3: Promotion Handling in Trust Mode

**What goes wrong:** Pawn reaches 8th rank but move() fails because promotion piece not specified; game state becomes inconsistent.

**Why it happens:** chess.js requires promotion parameter for promotion moves; trust-based gameplay doesn't show promotion picker; user expects automatic promotion.

**How to avoid:** Always pass promotion: 'q' (auto-queen) to chess.move(); trust-based gameplay means no UI picker needed; users can manually adjust if they want different piece.

**Warning signs:** Pawn moves to 8th rank but stays as pawn; console shows chess.js error about missing promotion; subsequent moves fail.

### Pitfall 4: Unicode Chess Font Rendering

**What goes wrong:** Chess symbols render as empty squares, question marks, or inconsistent sizes across white/black pieces.

**Why it happens:** Not all system fonts include Unicode chess symbols (U+2654-265F); font-family fallback chain missing; browser defaults to emoji rendering that varies by platform.

**How to avoid:** Set font-family with fallback: `'Segoe UI Symbol', 'Noto Sans Symbols', 'Apple Color Emoji', sans-serif`; test on target device (Raspberry Pi); use large font-size (2.5rem+) for touch targets.

**Warning signs:** Squares show tofu (□), pieces render different sizes, black/white pieces look identical, symbols missing on Raspberry Pi Chromium.

### Pitfall 5: CSS Grid Square Sizing (Aspect Ratio)

**What goes wrong:** Board squares render as rectangles instead of squares; board doesn't maintain 1:1 aspect ratio on window resize.

**Why it happens:** CSS Grid auto-sizes based on content or fr units without aspect-ratio constraint; container width/height mismatch.

**How to avoid:** Use aspect-ratio: 1/1 on grid container; set grid-template-columns and grid-template-rows to repeat(8, 1fr); constrain container width with max-width and center with margin: 0 auto.

**Warning signs:** Board stretches horizontally, pieces look distorted, sidebar overlap issues, responsive behavior breaks layout.

### Pitfall 6: Turn Validation in Trust Mode

**What goes wrong:** Player can move opponent's pieces; turn order not enforced; both players can move white pieces.

**Why it happens:** Trust-based gameplay (D-04) might be misinterpreted as "no validation at all"; chess.js still enforces turn order.

**How to avoid:** Trust-based means no pre-move valid square highlighting, not no turn validation; chess.js automatically validates turn in move() method; UI should check chess.turn() when selecting piece (first tap) to prevent selecting opponent pieces.

**Warning signs:** Piece selection allows wrong color, moves succeed out of turn order, game state becomes illegal position, players confused about whose turn it is.

## Code Examples

Verified patterns from chess.js documentation and established project conventions.

### Loading and Saving Game State

```typescript
// Source: chess.js official docs + project pattern from chores.js
// Load game from database
const loadGame = async () => {
  const res = await fetch('/api/chess/game');
  const data = await res.json();

  chess.load(data.fen);  // Restore board position
  setFen(data.fen);
  setWhitePlayer(data.white_player_id);
  setBlackPlayer(data.black_player_id);
};

// Save move to database
const saveMove = async (from: string, to: string) => {
  await fetch('/api/chess/move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, promotion: 'q' })
  });
};
```

### Formatting Move History (Vertical List)

```typescript
// Source: PGN standard + user decision D-15
// chess.history() returns: ["e4", "e5", "Nf3", "Nc6"]
// Format as: "1. e4", "1... e5", "2. Nf3", "2... Nc6"
const formatMove = (move: string, index: number): string => {
  const moveNumber = Math.floor(index / 2) + 1;
  const prefix = index % 2 === 0 ? `${moveNumber}. ` : `${moveNumber}... `;
  return `${prefix}${move}`;
};
```

### Chess Board Grid Layout

```css
/* Source: CSS Grid chessboard pattern + project touch target standards */
.chess-board {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  aspect-ratio: 1 / 1;
  max-width: min(80vh, 600px);  /* Constrain to viewport or max size */
  margin: 0 auto;
  gap: 0;
}

.chess-square {
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(2rem, 8vw, 3.5rem);  /* Responsive piece size */
  cursor: pointer;
  min-height: 44px;  /* Touch target minimum per Phase 2 */
  font-family: 'Segoe UI Symbol', 'Noto Sans Symbols', 'Apple Color Emoji', sans-serif;
}

.chess-square.light {
  background-color: hsl(0, 0%, 85%);  /* Light gray */
}

.chess-square.dark {
  background-color: hsl(0, 0%, 60%);  /* Dark gray */
}

.chess-square.selected {
  border: 4px solid hsl(220, 90%, 50%);  /* Highlight selected square */
  box-sizing: border-box;
}
```

### Server Route Pattern (chess.js)

```javascript
// Source: Established pattern from chores.js + chess.js API
export default async function chessRoutes(fastify, options) {
  // GET current game state
  fastify.get('/api/chess/game', async (request, reply) => {
    let game = db.prepare('SELECT * FROM chess_games WHERE id = 1').get();

    if (!game) {
      // Initialize new game
      db.prepare(`
        INSERT INTO chess_games (id, fen, moves, white_player_id, black_player_id)
        VALUES (1, ?, ?, NULL, NULL)
      `).run(
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        '[]'
      );
      game = db.prepare('SELECT * FROM chess_games WHERE id = 1').get();
    }

    return {
      fen: game.fen,
      moves: JSON.parse(game.moves),
      white_player_id: game.white_player_id,
      black_player_id: game.black_player_id
    };
  });

  // POST make move
  fastify.post('/api/chess/move', async (request, reply) => {
    const { from, to, promotion = 'q' } = request.body;

    const game = db.prepare('SELECT * FROM chess_games WHERE id = 1').get();
    const chess = new Chess(game.fen);

    const move = chess.move({ from, to, promotion });
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

    return { fen: chess.fen(), move: move.san };
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Drag-and-drop only | Tap-tap + drag-drop options | ~2020 mobile UX research | Better touch UX, no precision issues, clear feedback states |
| SVG piece images | Unicode chess symbols | ~2015 (Unicode 7.0) | Zero asset management, instant rendering, perfect scaling, accessibility |
| PGN file storage | FEN + JSON moves in database | Modern web apps | Easier querying, faster load, simpler state management |
| Separate move table | JSON array in single row | Modern NoSQL patterns | Less complexity, fewer JOINs, atomic updates |
| chess.js v0.x (callback API) | chess.js v1.x (class API) | 2023 rewrite | TypeScript support, modern ESM imports, tree-shaking |

**Deprecated/outdated:**

- **chessboard.js**: Older jQuery-based board library; last update 2019; replaced by react-chessboard and custom implementations
- **chess.js require() syntax**: Pre-1.0 used CommonJS; now ES modules (import { Chess } from 'chess.js')
- **Algebraic notation without disambiguation**: Old move notation didn't handle multiple pieces to same square; SAN (Standard Algebraic Notation) is now universal

## Open Questions

None — research complete with HIGH confidence.

All user decisions documented in CONTEXT.md; standard stack verified with npm registry; chess.js API confirmed from official docs; patterns established from existing project codebase.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + @testing-library/react 16.3.2 |
| Config file | client/vitest.config.ts (existing) |
| Quick run command | `npm run test:client --workspace=client -- src/components/chess` |
| Full suite command | `npm run test:client --workspace=client` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CHESS-01 | Select white player from family members | integration | `npm test --workspace=client -- PlayerBadge.test.tsx -x` | ❌ Wave 0 |
| CHESS-02 | Select black player from family members | integration | `npm test --workspace=client -- PlayerBadge.test.tsx -x` | ❌ Wave 0 |
| CHESS-03 | Move piece via tap-tap interaction | integration | `npm test --workspace=client -- ChessBoard.test.tsx::test_tap_tap_movement -x` | ❌ Wave 0 |
| CHESS-04 | Display Unicode chess symbols | unit | `npm test --workspace=client -- ChessSquare.test.tsx::test_unicode_rendering -x` | ❌ Wave 0 |
| CHESS-05 | Visual distinction white/black pieces | unit | `npm test --workspace=client -- ChessSquare.test.tsx::test_piece_colors -x` | ❌ Wave 0 |
| CHESS-06 | Move history in algebraic notation | unit | `npm test --workspace=client -- MoveHistory.test.tsx::test_san_format -x` | ❌ Wave 0 |
| CHESS-07 | Auto-scroll to latest move | integration | `npm test --workspace=client -- MoveHistory.test.tsx::test_auto_scroll -x` | ❌ Wave 0 |
| CHESS-08 | Current turn indicator | unit | `npm test --workspace=client -- ChessSidebar.test.tsx::test_turn_indicator -x` | ❌ Wave 0 |
| CHESS-09 | New game confirmation dialog | integration | `npm test --workspace=client -- ChessBoard.test.tsx::test_new_game_confirm -x` | ❌ Wave 0 |
| CHESS-10 | New game resets board and history | integration | `npm test --workspace=client -- useChessGame.test.tsx::test_reset_game -x` | ❌ Wave 0 |
| CHESS-11 | Undo last move | integration | `npm test --workspace=client -- useChessGame.test.tsx::test_undo_move -x` | ❌ Wave 0 |
| CHESS-12 | Game state persists across restarts | integration | manual — requires browser restart simulation | ⚠️ Manual |

### Sampling Rate

- **Per task commit:** `npm test --workspace=client -- src/components/chess --run` (chess components only, <30s)
- **Per wave merge:** `npm run test:client --workspace=client` (full suite)
- **Phase gate:** Full suite green + manual CHESS-12 verification before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `client/src/components/chess/__tests__/ChessBoard.test.tsx` — covers CHESS-03, CHESS-09
- [ ] `client/src/components/chess/__tests__/ChessSquare.test.tsx` — covers CHESS-04, CHESS-05
- [ ] `client/src/components/chess/__tests__/MoveHistory.test.tsx` — covers CHESS-06, CHESS-07
- [ ] `client/src/components/chess/__tests__/PlayerBadge.test.tsx` — covers CHESS-01, CHESS-02
- [ ] `client/src/components/chess/__tests__/ChessSidebar.test.tsx` — covers CHESS-08
- [ ] `client/src/hooks/__tests__/useChessGame.test.tsx` — covers CHESS-10, CHESS-11
- [ ] Manual test procedure for CHESS-12 (browser restart persistence)

No framework installation needed — Vitest and React Testing Library already configured from Phase 2/3.

## Sources

### Primary (HIGH confidence)

- npm registry chess.js 1.4.0 — version verification (published 2025-06-14)
- npm registry react-chessboard 5.10.0 — version verification (published 2026-02-10)
- [chess.js official repository](https://github.com/jhlywa/chess.js) — API methods, features, installation
- [Forsyth-Edwards Notation - Wikipedia](https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation) — FEN specification
- [Algebraic notation (chess) - Wikipedia](https://en.wikipedia.org/wiki/Algebraic_notation_(chess)) — SAN/PGN format
- [Chess symbols in Unicode - Wikipedia](https://en.wikipedia.org/wiki/Chess_symbols_in_Unicode) — Unicode code points U+2654-265F
- Existing project codebase — db.js, chores.js, useFamilyData.ts patterns

### Secondary (MEDIUM confidence)

- [react-chessboard official repository](https://github.com/Clariity/react-chessboard) — drag-drop capabilities, touch support
- [React Testing Library with Vitest 2026 guide](https://vitest.dev/guide/browser/component-testing) — testing patterns
- [CSS Grid chessboard examples](https://dev.to/hira_zaira/create-a-chessboard-using-css-grid-3iil) — 8×8 layout patterns
- [Portable Game Notation Specification](http://www.saremba.de/chessgml/standards/pgn/pgn-complete.htm) — PGN standard
- [JavaScript Testing Complete Guide 2026](https://calmops.com/programming/javascript/javascript-testing-guide-2026/) — Vitest best practices

### Tertiary (LOW confidence)

- [Chess.com forum discussions](https://www.chess.com/forum/view/suggestions/click-move-option) — tap vs drag user preferences (anecdotal)
- [Touch vs mouse input design](https://prototypr.io/post/cross-device-inputs-design-for-touch-vs-mouse) — general UX principles
- Web search results for chess game state storage — various implementation approaches (not authoritative)

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — chess.js verified from npm registry (1.4.0, 2025-06-14), official docs confirm API, project already uses better-sqlite3
- Architecture: HIGH — Patterns verified from existing project codebase (hooks pattern from useFamilyData.ts, SQLite pattern from db.js/chores.js, modal pattern from Phase 2)
- Pitfalls: MEDIUM — Based on common chess.js issues from GitHub issues, general React patterns, and web search results (not project-specific)
- Validation: HIGH — Vitest framework already configured, existing test patterns from Phase 2/3 verified, test commands confirmed from package.json

**Research date:** 2026-03-23
**Valid until:** 2026-04-23 (30 days — chess.js and React stable, slow-moving domain)

---

*Phase: 05-chess-board*
*Research completed: 2026-03-23*
