---
phase: 05-chess-board
plan: 01
subsystem: api
tags: [chess, chess.js, sqlite, typescript, react-hooks, rest-api]

# Dependency graph
requires:
  - phase: 02-foundation-family-management
    provides: family_members table and SQLite better-sqlite3 patterns
  - phase: 01-infrastructure-setup
    provides: Fastify server, SQLite db.js base, workspace setup

provides:
  - chess_games SQLite table with single-row constraint (id=1) and FEN/moves storage
  - Chess REST API with 5 endpoints (GET /game, POST /move, POST /undo, POST /new-game, PUT /player)
  - chess.js 1.4.0 installed in client workspace
  - TypeScript types: ChessGame, ChessMove, PieceColor, SquareInfo
  - useChessGame hook with full game state management

affects:
  - 05-02 (chess board UI components consume useChessGame hook)
  - 05-03 (chess sidebar/controls consume useChessGame hook)
  - 05-04 (any further chess UI plans)

# Tech tracking
tech-stack:
  added:
    - chess.js 1.4.0 (chess game logic, FEN/SAN handling, move validation)
  patterns:
    - Single-row SQLite pattern (id=1 with CHECK constraint) for singleton game state
    - Server-as-source-of-truth: client chess instance synced from API responses, not from local move execution
    - FEN + JSON moves TEXT column for complete game state persistence

key-files:
  created:
    - server/routes/chess.js
    - client/src/types/chess.ts
    - client/src/hooks/useChessGame.ts
  modified:
    - server/db.js (added chess_games table)
    - server/index.js (registered chessRoutes)
    - client/package.json (added chess.js dependency)

key-decisions:
  - "Server is source of truth for chess game state; client chess instance is synced from API responses (FEN) after each mutation, not updated optimistically"
  - "chess.js installed at root workspace level via npm hoisting; client package.json declares dependency, hoisted to node_modules root"
  - "POST /api/chess/undo reconstructs FEN by replaying remaining moves from scratch (Chess() + replay) rather than using chess.js undo() method, ensuring DB and client stay in sync"

patterns-established:
  - "Pattern: Chess game state as single SQLite row (id=1) with FEN text + JSON moves array for efficient atomic updates"
  - "Pattern: useChessGame hook provides unified game API to UI components; all server sync handled internally"

requirements-completed: [CHESS-01, CHESS-02, CHESS-03, CHESS-06, CHESS-09, CHESS-10, CHESS-11, CHESS-12]

# Metrics
duration: 2min
completed: 2026-03-23
---

# Phase 05 Plan 01: Chess Backend Infrastructure and Data Layer Summary

**chess.js 1.4.0 installed, chess_games SQLite table with single-row FEN+moves persistence, 5 REST API endpoints, TypeScript types, and useChessGame hook with full API integration**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-23T19:09:25Z
- **Completed:** 2026-03-23T19:11:20Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- chess.js 1.4.0 installed in client workspace (hoisted to root node_modules via npm workspaces)
- chess_games table added to SQLite with id=1 CHECK constraint enforcing single active game, FEN notation for board state, JSON moves array for history, foreign keys to family_members for player IDs
- 5 REST API endpoints implemented: GET /game (auto-creates row), POST /move (chess.move validation + SAN append), POST /undo (replay-based FEN reconstruction), POST /new-game (reset keeping players), PUT /player (family member assignment with validation)
- TypeScript types ChessGame, ChessMove, PieceColor, SquareInfo exported from client/src/types/chess.ts
- useChessGame hook provides full state management: fen, chess instance, moves, player IDs, loading flag, and makeMove/undoMove/resetGame/setPlayer functions

## Task Commits

Each task was committed atomically:

1. **Task 1: Install chess.js, create chess_games table, build REST API** - `2633fcb` (feat)
2. **Task 2: Create TypeScript types and useChessGame hook** - `bf4fed8` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `server/routes/chess.js` - Chess REST API with 5 endpoints using chess.js for validation
- `server/db.js` - Added chess_games table with single-row constraint and FEN/moves columns
- `server/index.js` - Registered chessRoutes via fastify.register
- `client/src/types/chess.ts` - ChessGame, ChessMove, PieceColor, SquareInfo TypeScript types
- `client/src/hooks/useChessGame.ts` - Game state hook with full API integration
- `client/package.json` - Added chess.js ^1.4.0 dependency

## Decisions Made
- Server is source of truth: client chess instance is loaded from server FEN responses, not mutated locally first. This avoids optimistic update inconsistencies when dealing with a trust-based game where server validates moves.
- POST /undo reconstructs the board by replaying remaining SAN moves from scratch (new Chess() + loop) rather than calling chess.undo() which only works on the in-memory instance. This ensures DB and reconstruction stay consistent.
- chess.js installed via npm workspaces (`--workspace=client`); npm hoisted it to root node_modules, available to both client build (Vite resolves it) and any server-side use.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. chess.js was hoisted to root node_modules by npm workspace resolution (not installed to client/node_modules directly), but Vite's module resolution correctly finds it there. The verify command in the plan used a path to client/node_modules which doesn't exist, but `npm ls chess.js --workspace=client` confirms correct installation and the TypeScript compilation confirms the import works.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- useChessGame hook ready for UI consumption in Plans 02-04
- All 5 API endpoints tested and functional via verification
- TypeScript types compile cleanly (new files have zero errors)
- chess_games table created in SQLite and verified via node import
