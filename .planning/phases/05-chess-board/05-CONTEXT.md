# Phase 5: Chess Board - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Touch-enabled chess game where family members can play long-running games with persistent state. Users select white and black players from family members, move pieces via tap-tap interaction, view move history in algebraic notation, and can start new games (with confirmation) or undo last move. Game state persists across browser restarts and daily Chromium reboots.

</domain>

<decisions>
## Implementation Decisions

### Piece Movement Interaction
- **D-01:** Tap-tap method for moving pieces (tap source square, then tap destination square)
- **D-02:** Selected square highlighted with colored border when piece is tapped
- **D-03:** Tap same square again to deselect/cancel selection
- **D-04:** No visual indication of valid moves (trust-based gameplay, matches requirements)

### Board & Piece Visual Style
- **D-05:** Unicode chess symbols for pieces (♔♕♖♗♘♙ for white, ♚♛♜♝♞♟ for black)
- **D-06:** Modern neutral gray color scheme for board squares (light gray and dark gray)
- **D-07:** Use Unicode's built-in white/black piece symbols for distinction (no custom CSS coloring)
- **D-08:** 8x8 grid of squares with board coordinates (a-h, 1-8) optional for edges

### Game Controls & Layout
- **D-09:** Sidebar layout with controls positioned vertically next to the chess board
- **D-10:** Minimal control set in sidebar: player badges (white/black with family colors), New Game button, Undo Move button
- **D-11:** Player selection via tappable badges (tap white badge → family picker modal, tap black badge → family picker modal)
- **D-12:** New Game button opens confirmation dialog ("Reset board and start fresh? This cannot be undone.")
- **D-13:** Board occupies main area (square aspect ratio), sidebar takes remaining horizontal space

### Move History Display
- **D-14:** Move history displays below controls in the same sidebar (scrollable vertical list)
- **D-15:** Vertical list format with each move on its own row (e.g., "1. e4", "1... e5", "2. Nf3")
- **D-16:** Always auto-scroll to latest move when new move is made (per CHESS-07)
- **D-17:** Users can manually scroll up to review earlier moves (auto-scroll doesn't prevent this)

### Game State Persistence
- **D-18:** Game state stored in SQLite: board position (FEN notation), move history, current turn, white/black player IDs
- **D-19:** Single active game at a time (no game history/archive in v1)
- **D-20:** Load game state on page load, save after each move
- **D-21:** Undo removes last move from database and reverts board state

### Claude's Discretion
- Exact shade of gray for board squares
- Selected square highlight color and border thickness
- Unicode piece font size and rendering
- Confirmation dialog wording and button styling
- Sidebar width and spacing between controls
- Move history text size and line height
- FEN notation library choice for board representation
- Algebraic notation generation logic

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` §Chess Board (CHESS-01 through CHESS-12) — 12 requirements mapped to this phase

### Prior Phase Patterns
- `.planning/phases/02-foundation-family-management/02-CONTEXT.md` — Modal forms, touch targets (44px minimum), family member selection pattern
- `.planning/phases/02-foundation-family-management/02-UI-SPEC.md` — shadcn component usage, 44px touch targets, dialog patterns
- `.planning/phases/03-chore-system/03-CONTEXT.md` — Family member color palette (blue, green, purple, orange), badge components
- `.planning/phases/03-chore-system/03-UI-SPEC.md` — Color coding pattern, family member badges with colors

### External Documentation
- Chess FEN notation specification — Standard format for representing chess board state (position, turn, castling rights, en passant)
- Algebraic chess notation — Standard format for move history (e4, Nf3, Qxd5, etc.)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `client/src/components/ui/button.tsx` — shadcn Button (44px minimum touch targets, reuse for New Game, Undo)
- `client/src/components/ui/dialog.tsx` — shadcn Dialog (reuse for New Game confirmation modal)
- `client/src/components/FamilyMemberBadge.tsx` — Family member badge with color coding (reuse for player indicators)
- `client/src/hooks/useFamilyData.ts` — Family data hook (fetch family members for player picker)
- `client/src/types/family.ts` — Family member TypeScript types (reuse for player selection)
- Family member color palette from Phase 3: blue, green, purple, orange (assign to white/black players)

### Established Patterns
- Feature-based organization: `client/features/chess/` and `server/features/chess/`
- Custom hooks separate data from UI: create `useChessGame()` hook for game state
- Modal forms for setup/configuration operations (New Game confirmation, player picker)
- SQLite persistence pattern: create `chess_games` table with FEN position, move history, players
- REST API route pattern: create `server/routes/chess.js` with GET /game, POST /move, POST /undo, POST /new-game
- React hooks pattern: useState for UI state, useEffect for loading game on mount

### Integration Points
- Family members from Phase 2 used for white/black player selection (foreign keys to family_members table)
- Family member color palette from Phase 3 used to color-code player badges in sidebar
- Modal dialog pattern from Phase 2 reused for New Game confirmation and player picker
- SQLite database at `server/data/familywall.db` gets chess_games table
- App.tsx navigation extended: Chores | Calendar | Family | **Chess** (add fourth tab)

</code_context>

<specifics>
## Specific Ideas

- **Trust-based gameplay:** No move validation or rules enforcement (per REQUIREMENTS.md out-of-scope note). Family members learn chess rules through play. Highlighting valid moves was explicitly not chosen to maintain this trust-based approach.
- **Tap-tap over drag:** Simpler for touchscreen, no precision issues, clear feedback states
- **Unicode symbols:** Zero asset management, crisp rendering, universally recognized chess pieces
- **Single game focus:** Long-running games where family members take turns when passing by the kiosk. No need for multiple simultaneous games or game history in v1.
- **Sidebar consolidation:** All controls and move history in one vertical column keeps board square and UI organized
- **Vertical move list:** Easier to read on touchscreen, clearer separation than paired horizontal format
- **Always auto-scroll:** Keeps latest move visible for ongoing games, meets CHESS-07 requirement

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

Move validation / rules enforcement explicitly out of scope (per PROJECT.md: "Chess rules enforcement — Trust-based gameplay").
Game history / archive explicitly out of scope (per PROJECT.md: "Chess game history/archive — Current game only, no save/load past games (defer to v2)").

</deferred>

---

*Phase: 05-chess-board*
*Context gathered: 2026-03-23*
