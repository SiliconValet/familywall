---
phase: 05-chess-board
verified: 2026-03-23T20:45:00Z
status: human_needed
score: 11/12 must-haves verified
re_verification: false
human_verification:
  - test: "Visual chess board and piece movement"
    expected: "Board shows 8x8 grid with Unicode chess pieces, tapping e2 selects it (blue border), tapping e4 moves the pawn, move history shows '1. e4'"
    why_human: "Touch/click interaction and visual rendering of Unicode glyphs cannot be verified programmatically"
  - test: "Player selection flow"
    expected: "Tapping white player badge opens modal with family members listed, selecting one updates the badge name"
    why_human: "Modal open/close state and dialog rendering requires browser interaction"
  - test: "New game confirmation dialog text"
    expected: "Dialog shows 'Start New Game?' title and 'Reset board and start fresh? This cannot be undone.' body"
    why_human: "Confirmed text is in source code but visual rendering requires human spot-check; already verified in Plan 03 human gate"
  - test: "Game state persistence across browser refresh"
    expected: "After moving pawns, refreshing browser restores the same board position and move history"
    why_human: "Requires running server and browser; server-side persistence logic is verified but end-to-end reload needs human"
  - test: "CHESS-03 drag-and-drop vs tap-tap discrepancy"
    expected: "REQUIREMENTS.md specifies 'touch drag-and-drop' but implementation uses tap-tap (D-01 decision)"
    why_human: "Stakeholder must confirm whether tap-tap satisfies the intent of CHESS-03 or if the requirement text needs updating"
---

# Phase 5: Chess Board Verification Report

**Phase Goal:** Implement a two-player chess board feature for the FamilyWall app — interactive 8x8 board, tap-tap piece movement, move history, player assignment from family members, game persistence, and full navigation integration.
**Verified:** 2026-03-23T20:45:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | GET /api/chess/game returns FEN, moves array, and player IDs | VERIFIED | `server/routes/chess.js` line 8-25: queries chess_games WHERE id=1, returns {fen, moves, white_player_id, black_player_id} |
| 2 | POST /api/chess/move accepts from/to/promotion and returns updated FEN + SAN move | VERIFIED | `server/routes/chess.js` lines 28-66: loads FEN, calls chess.move({from, to, promotion}), appends SAN, returns {fen, move, moves} |
| 3 | POST /api/chess/undo removes last move and returns reverted FEN | VERIFIED | `server/routes/chess.js` lines 68-101: replays moves[0..-1], reconstructs FEN, updates DB, returns {fen, moves} |
| 4 | POST /api/chess/new-game resets to starting position with empty moves | VERIFIED | `server/routes/chess.js` lines 103-128: sets fen=STARTING_FEN, moves='[]', returns {fen, moves:[], player_ids} |
| 5 | PUT /api/chess/player sets white or black player ID | VERIFIED | `server/routes/chess.js` lines 130-172: validates color and player_id, updates column dynamically, validates FK |
| 6 | useChessGame hook provides fen, moves, players, makeMove, undo, resetGame, setPlayer | VERIFIED | `client/src/hooks/useChessGame.ts` line 117-129: returns all 10 values including chess instance |
| 7 | Board renders 8x8 grid of alternating light/dark squares with Unicode chess pieces | VERIFIED (code) | `ChessBoard.tsx`: grid-cols-8 aspect-square; `ChessSquare.tsx`: PIECE_SYMBOLS map U+2654-U+265F with VS15 selector |
| 8 | Tapping a piece highlights its square; tapping destination moves it | VERIFIED (code) | `ChessPage.tsx` lines 18-30: handleSquareClick with chess.get()+chess.turn() guard, setSelectedSquare |
| 9 | Move history shows vertical list "1. e4" / "1... e5" format and auto-scrolls | VERIFIED | `MoveHistory.tsx`: Math.floor(index/2)+1 formatting, lastMoveRef.scrollIntoView on moves.length change |
| 10 | Sidebar shows player badges, turn indicator, New Game / Undo buttons | VERIFIED | `ChessSidebar.tsx`: two PlayerBadge + turn text + New Game Button + Undo Button (disabled={moves.length===0}) + MoveHistory |
| 11 | Chess tab appears in App.tsx navigation and renders ChessPage | VERIFIED | `App.tsx` lines 6, 10, 39-50: imports ChessPage, view state includes 'chess', Chess Button + {view==='chess'&&<ChessPage/>} |
| 12 | Tapping player badge opens family member picker modal | VERIFIED (code) | `ChessPage.tsx` lines 32-39: handleSelectWhitePlayer/Black sets pickerColor + pickerOpen; PlayerPickerModal wired |

**Score: 11/12 truths verified programmatically; 1 pending stakeholder clarification on CHESS-03 intent**

---

## Required Artifacts

### Plan 00: Test Stubs

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `client/src/components/__tests__/ChessBoard.test.tsx` | Behavioral test stubs for board rendering | VERIFIED | 11 it.todo stubs (ChessBoard x6, ChessSquare x5); 35 lines |
| `client/src/components/__tests__/MoveHistory.test.tsx` | Behavioral test stubs for move history | VERIFIED | 16 it.todo stubs (MoveHistory x6, PlayerBadge x5, ChessSidebar x5); 29 lines |
| `client/src/hooks/__tests__/useChessGame.test.tsx` | Behavioral test stubs for game hook | VERIFIED | 14 it.todo stubs across 5 describe blocks + vi.stubGlobal fetch; 43 lines |

### Plan 01: Backend + Data Layer

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `server/db.js` | chess_games table schema | VERIFIED | Lines 105-115: CREATE TABLE chess_games with id CHECK(id=1), fen, moves, white_player_id, black_player_id, FK to family_members ON DELETE SET NULL |
| `server/routes/chess.js` | Chess REST API routes | VERIFIED | 174 lines, exports default async function chessRoutes, all 5 endpoints implemented with db.prepare statements |
| `server/index.js` | chessRoutes registered | VERIFIED | Line 10: import chessRoutes; line 31: fastify.register(chessRoutes) |
| `client/src/types/chess.ts` | ChessGame, ChessMove TypeScript types | VERIFIED | Exports ChessGame, ChessMove, PieceColor, SquareInfo; 19 lines |
| `client/src/hooks/useChessGame.ts` | Game state management hook | VERIFIED | 130 lines; exports useChessGame; all 5 fetch calls present; returns 10-value object |

### Plan 02: UI Components

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `client/src/components/chess/ChessBoard.tsx` | 8x8 CSS Grid board | VERIFIED | 39 lines; grid-cols-8, aspect-square, max-w-[min(80vh,600px)]; renders 64 ChessSquare via loop |
| `client/src/components/chess/ChessSquare.tsx` | Individual square with piece rendering | VERIFIED | 36 lines; PIECE_SYMBOLS map; bg-[hsl(0,0%,85%)] / bg-[hsl(0,0%,60%)]; border-4 selection; min-h-[44px] |
| `client/src/components/chess/ChessSidebar.tsx` | Sidebar with controls and move history | VERIFIED | 65 lines; renders PlayerBadge x2 + turn text + New Game + Undo (disabled) + MoveHistory |
| `client/src/components/chess/MoveHistory.tsx` | Scrollable SAN move list | VERIFIED | 48 lines; overflow-y-auto; useRef+scrollIntoView; move formatting logic; "Moves" heading |
| `client/src/components/chess/PlayerBadge.tsx` | Player indicator with turn ring | VERIFIED | 28 lines; min-h-[48px]; "Not Selected" fallback; ring-2 ring-[hsl(220,90%,50%)] on isCurrentTurn |

### Plan 03: Integration + Navigation

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `client/src/components/chess/ChessPage.tsx` | Top-level chess page orchestrator | VERIFIED | 108 lines; calls useChessGame + useFamilyData; handleSquareClick with turn guard; renders ChessBoard + ChessSidebar + both modals |
| `client/src/components/chess/PlayerPickerModal.tsx` | Family member selection modal | VERIFIED | 49 lines; shadcn Dialog; min-h-[48px] rows; FamilyMemberBadge; "None" option for clearing |
| `client/src/components/chess/NewGameConfirmDialog.tsx` | Confirmation dialog for game reset | VERIFIED | 44 lines; "Start New Game?" title; "Reset board and start fresh? This cannot be undone." description; Cancel + Start New Game buttons |
| `client/src/App.tsx` | Chess tab in navigation | VERIFIED | imports ChessPage; view type includes 'chess'; Chess Button; {view==='chess'&&<ChessPage/>} at line 50 |

---

## Key Link Verification

### Plan 01 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `server/routes/chess.js` | `server/db.js` | better-sqlite3 db.prepare | WIRED | db.prepare used 12+ times for all CRUD operations |
| `server/index.js` | `server/routes/chess.js` | fastify.register(chessRoutes) | WIRED | Line 10 import + line 31 register |
| `client/src/hooks/useChessGame.ts` | `/api/chess` | fetch calls | WIRED | 5 fetch calls: /game, /move, /undo, /new-game, /player — all with response handling |

### Plan 02 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `ChessBoard.tsx` | `ChessSquare.tsx` | renders 64 ChessSquare components | WIRED | Line 2 import; loop renders ChessSquare for each of 64 board positions |
| `ChessSidebar.tsx` | `MoveHistory.tsx` | renders MoveHistory in sidebar | WIRED | Line 3 import; line 62 `<MoveHistory moves={moves} />` |
| `ChessSidebar.tsx` | `PlayerBadge.tsx` | renders two PlayerBadge components | WIRED | Line 2 import; lines 32-43 render white + black PlayerBadge |

### Plan 03 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `App.tsx` | `ChessPage.tsx` | conditional render on view state | WIRED | Line 6 import; line 50 `{view === 'chess' && <ChessPage />}` |
| `ChessPage.tsx` | `useChessGame.ts` | hook call | WIRED | Line 2 import; line 10 destructures all return values |
| `ChessPage.tsx` | `ChessBoard.tsx` | renders board with game state | WIRED | Line 4 import; lines 76-81 `<ChessBoard chess={chess} selectedSquare={selectedSquare} onSquareClick={handleSquareClick} />` |
| `ChessPage.tsx` | `ChessSidebar.tsx` | renders sidebar with controls | WIRED | Line 5 import; lines 83-93 `<ChessSidebar ...all props />` |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `ChessBoard.tsx` | `chess.board()` | chess instance synced from useChessGame.ts which loads from GET /api/chess/game | Yes — API queries chess_games table, returns FEN, chess.load(fen) called in loadGame() | FLOWING |
| `MoveHistory.tsx` | `moves` prop | useChessGame.ts → setMoves(data.moves) from API responses | Yes — moves array from DB updated on each POST /api/chess/move | FLOWING |
| `PlayerBadge.tsx` | `playerName` prop | ChessPage.tsx → getPlayerName(whitePlayerId) → members.find() from useFamilyData | Yes — useFamilyData fetches from GET /api/family/members which queries family_members table | FLOWING |
| `PlayerPickerModal.tsx` | `members` prop | ChessPage.tsx → useFamilyData().members | Yes — real family members from API | FLOWING |

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| chess.js module importable | `node -e "import('chess.js').then(m => console.log(typeof m.Chess))"` | function | PASS |
| chess_games table exists in schema | Read server/db.js lines 105-115 | CREATE TABLE IF NOT EXISTS chess_games with CHECK(id=1) | PASS |
| All 5 API endpoints defined | Read server/routes/chess.js | GET /game, POST /move, POST /undo, POST /new-game, PUT /player all present | PASS |
| chessRoutes registered in server | Grep server/index.js | import chessRoutes + fastify.register(chessRoutes) found | PASS |
| TypeScript types compile | npx tsc --noEmit (chess implementation files) | Zero errors in chess.ts, useChessGame.ts, all chess/*.tsx files | PASS |
| Test stubs: 43 todo items tracked | npm run test:client | "43 todo" confirmed in test output | PASS |
| Test suite pre-existing failure | npm run test:client | 1 failure in ChoreCard.test.tsx (CSS variable assertion) — pre-existing, not chess-related | INFO |
| TypeScript errors in test stubs | npx tsc --noEmit | Unused imports in it.todo test files — stubs never import/use the tested modules | INFO |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| CHESS-01 | Plan 01, 03 | User can select white player from family members | SATISFIED | PlayerPickerModal + handleSelectWhitePlayer + setPlayer('white', id) + PUT /api/chess/player |
| CHESS-02 | Plan 01, 03 | User can select black player from family members | SATISFIED | Same flow for black player |
| CHESS-03 | Plan 02 | User can move chess piece by touch drag-and-drop | PARTIAL — NEEDS HUMAN | Implementation is tap-tap (D-01 decision), not drag-and-drop as written. Intent satisfied if tap-tap is acceptable |
| CHESS-04 | Plan 02 | Board displays standard chess piece symbols | SATISFIED | PIECE_SYMBOLS map with Unicode U+2654-U+265F in ChessSquare.tsx |
| CHESS-05 | Plan 02 | Board shows clear visual distinction between white and black pieces | SATISFIED | Unicode's separate white set (U+2654-U+2659) vs black set (U+265A-U+265F) + VS15 text-only selector |
| CHESS-06 | Plan 02 | Move history displays in algebraic notation | SATISFIED | SAN strings from chess.js returned by POST /api/chess/move, stored in DB, displayed in MoveHistory |
| CHESS-07 | Plan 02 | Move history auto-scrolls to latest move | SATISFIED | lastMoveRef.scrollIntoView({ behavior:'smooth', block:'end' }) triggered on moves.length change |
| CHESS-08 | Plan 02 | Current turn indicator shows whose turn it is | SATISFIED | ChessSidebar: currentTurnPlayerName's Turn text + PlayerBadge ring-2 on isCurrentTurn |
| CHESS-09 | Plan 01, 03 | User can start new game with confirmation dialog | SATISFIED | NewGameConfirmDialog with correct text; POST /api/chess/new-game resets board |
| CHESS-10 | Plan 01, 03 | New game resets board and clears move history | SATISFIED | POST /api/chess/new-game sets fen=STARTING_FEN, moves='[]'; client chess.reset() + setMoves([]) |
| CHESS-11 | Plan 01, 02, 03 | User can undo last move | SATISFIED | POST /api/chess/undo replay-based reconstruction; Undo button wired; disabled when moves.length===0 |
| CHESS-12 | Plan 01 | Game state persists across browser restarts | SATISFIED (code) | SQLite chess_games table with FEN + moves; loadGame() on mount fetches from DB; NEEDS human end-to-end test |

**ORPHANED REQUIREMENTS CHECK:** All 12 CHESS-* requirements appear in at least one plan's `requirements` field. No orphans.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `client/src/hooks/useChessGame.ts` | 62-65 | `const newChess = new Chess()` created in undoMove but never used — chess is loaded directly from fen instead | INFO | Dead code; newChess variable is unused. The FEN load on line 66 `chess.load(data.fen)` is the actual state update. No functional impact. |
| `client/src/components/__tests__/ChessBoard.test.tsx` | 1-3 | Unused imports (`render`, `screen`, `userEvent`, `expect`) in it.todo-only file | INFO | TypeScript reports errors for unused imports. Not a runtime issue; stubs are intentionally empty. |
| `client/src/components/__tests__/MoveHistory.test.tsx` | 1-2 | Unused imports (`render`, `screen`, `expect`, `vi`) in it.todo-only file | INFO | Same as above — stub file unused imports. |
| `client/src/hooks/__tests__/useChessGame.test.tsx` | 1-2 | Unused imports (`renderHook`, `act`, `expect`) in it.todo-only file | INFO | Same as above. |

**No blockers found in chess implementation files.** All anti-patterns are INFO-level and confined to intentional it.todo test stub files.

---

## Human Verification Required

### 1. Chess-03 Requirement Interpretation

**Test:** Review REQUIREMENTS.md CHESS-03 ("User can move chess piece by touch drag-and-drop") vs implemented tap-tap interaction (decision D-01).
**Expected:** Stakeholder confirms tap-tap satisfies the intent, or updates REQUIREMENTS.md to reflect the actual interaction model.
**Why human:** This is a requirement text vs implementation discrepancy that requires stakeholder judgment. The design decision D-01 explicitly chose tap-tap for the Pi touchscreen, which is documented in 05-CONTEXT.md.

### 2. Full Chess Game Play Walkthrough

**Test:** Open app, click Chess tab, tap white pawn on e2 (select), tap e4 (move), verify "1. e4" appears in move history, tap black pawn e7, tap e5, verify "1... e5" appears.
**Expected:** Pieces move correctly, move history updates in correct algebraic format, auto-scrolls to latest entry.
**Why human:** Touch/click interaction and Unicode glyph rendering cannot be verified without a browser.

### 3. Player Assignment Flow

**Test:** Tap white player badge, select a family member from the modal, close modal. Verify badge displays the member's name. Repeat for black player.
**Expected:** Modal opens with all family members listed, selection updates the badge.
**Why human:** Modal open/close state and dynamic name resolution requires browser interaction.

### 4. Game Persistence Across Page Reload

**Test:** Make 3 moves, refresh browser, verify same board position and "1. e4 / 1... e5 / 2. Nf3" move history is restored.
**Expected:** SQLite persistence restores full game state on reload.
**Why human:** Requires running server + browser; verified at code level (loadGame on mount reads from DB) but end-to-end needs human confirmation.

### 5. Undo Button Disabled State

**Test:** On fresh game (no moves), verify "Undo Move" button is visually disabled. Make a move, verify it becomes enabled. Click it, verify move is undone and board reverts.
**Expected:** Button disabled when moves.length===0, enabled after move, undo reverts board.
**Why human:** Visual disabled state and board revert require browser verification.

---

## Gaps Summary

No implementation gaps were found. All artifacts exist, are substantive (well above minimum line counts), and are wired through the full data flow from SQLite through the API to React components. The single open item is a requirement text discrepancy (CHESS-03 says "drag-and-drop" but implementation uses tap-tap per locked design decision D-01), which requires stakeholder confirmation rather than a code fix.

The chess test stubs in Plan 00 remain as it.todo stubs — this was the explicit intent of that plan (behavioral stubs, not implementations). The stubs cover all 12 CHESS requirements and are tracked by vitest (43 todo items). They do not fail the test suite. Converting these to passing tests would be appropriate follow-up work.

One dead-code note: in `useChessGame.ts`, a `newChess` Chess instance is created inside `undoMove` but never used (lines 62-65). This is not a blocker — the actual state sync uses `chess.load(data.fen)` on line 66 — but the unused variable should be removed in a cleanup pass.

---

_Verified: 2026-03-23T20:45:00Z_
_Verifier: Claude (gsd-verifier)_
