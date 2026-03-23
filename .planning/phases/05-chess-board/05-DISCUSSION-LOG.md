# Phase 5: Chess Board - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-23
**Phase:** 05-chess-board
**Areas discussed:** Piece movement interaction, Board & piece visual style, Game controls & layout, Move history display

---

## Piece movement interaction

### Question: How should users move chess pieces on the touchscreen?

| Option | Description | Selected |
|--------|-------------|----------|
| Tap-tap (recommended) | Tap source square, then tap destination square. Simpler for touchscreen, no drag precision needed. Clear visual feedback shows selected piece. | ✓ |
| Drag-and-drop | Touch and drag piece to destination. More intuitive for chess players but requires precise touch tracking and prevents accidental moves. | |
| Both methods | Support both tap-tap and drag-and-drop. Flexible but adds complexity to gesture handling and visual feedback states. | |

**User's choice:** Tap-tap (recommended)

---

### Question: What visual feedback when a piece is selected?

| Option | Description | Selected |
|--------|-------------|----------|
| Highlight square only | Selected square gets a colored border or background. Simple, clean visual state. | ✓ |
| Highlight + show valid moves (recommended) | Highlight selected piece AND show dots/circles on all legal destination squares. Helps players see options, educational for learning chess. | |
| Animate piece slightly | Selected piece lifts or scales up. More dynamic feedback but doesn't show where it can move. | |

**User's choice:** Highlight square only
**Notes:** Aligns with trust-based gameplay approach (no rules enforcement per requirements)

---

### Question: How should users cancel a selected piece?

| Option | Description | Selected |
|--------|-------------|----------|
| Tap same square again (recommended) | Tap the selected piece again to deselect. Simple, discoverable pattern. | ✓ |
| Tap anywhere invalid | Tap any empty square or opponent piece to cancel. More forgiving but less explicit. | |
| Dedicated cancel button | Add an X or Cancel button near the board. Clear but adds UI clutter for a simple action. | |

**User's choice:** Tap same square again (recommended)

---

## Board & piece visual style

### Question: How should chess pieces be rendered?

| Option | Description | Selected |
|--------|-------------|----------|
| Unicode symbols (recommended) | Use chess Unicode characters (♔♕♖♗♘♙). Zero asset loading, crisp at any size, simple implementation. Standard chess symbols everyone recognizes. | ✓ |
| SVG graphics | Custom SVG chess piece designs. More control over style and branding, but requires creating/sourcing 12 SVG files. | |
| Image assets | PNG/WebP chess piece images. Traditional approach but requires asset management and multiple sizes for different screens. | |

**User's choice:** Unicode symbols (recommended)

---

### Question: What color scheme for the chess board squares?

| Option | Description | Selected |
|--------|-------------|----------|
| Traditional brown/beige | Classic chess board colors (light tan and dark brown). Familiar, timeless aesthetic. | |
| Modern neutral (recommended) | Light gray and darker gray squares. Matches existing FamilyWall design system, clean and minimal. | ✓ |
| Family member colors | Use family color palette for board squares. Creative but might distract from pieces and clash with player indicators. | |

**User's choice:** Modern neutral (recommended)

---

### Question: How should white and black pieces be visually distinguished?

| Option | Description | Selected |
|--------|-------------|----------|
| Unicode built-in (recommended) | Use white piece symbols (♔♕♖) for white, black symbols (♚♛♜) for black. Unicode provides both, clear distinction, no extra styling needed. | ✓ |
| Color + outline | Use same Unicode symbols but style with CSS colors (white pieces get white fill + black outline, black pieces get black fill). More control but may reduce readability. | |
| Family member colors | White player's pieces use their family color, black player uses their color. Reinforces player identity but breaks chess convention. | |

**User's choice:** Unicode built-in (recommended)

---

## Game controls & layout

### Question: Where should game controls live in relation to the chess board?

| Option | Description | Selected |
|--------|-------------|----------|
| Sidebar (recommended) | Controls in a vertical sidebar next to the board. Good use of horizontal space, keeps board square, groups all controls together. | ✓ |
| Top and bottom bars | Controls split between top header and bottom action bar. Maximizes board size but spreads controls apart. | |
| Overlay/floating | Controls as floating buttons over the board corners. Minimal UI but can obscure board squares. | |

**User's choice:** Sidebar (recommended)

---

### Question: What controls should appear in the sidebar?

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal set (recommended) | Player badges (showing white/black with family colors), New Game button, Undo Move button. Clean and focused on essential actions. | ✓ |
| Include turn indicator | Add 'White to move' or 'Black to move' text indicator. Helpful but redundant if player badges highlight current turn. | |
| Full control panel | Add settings, resign, offer draw, game timer. Comprehensive but adds complexity beyond v1 requirements. | |

**User's choice:** Minimal set (recommended)

---

### Question: How should players select white and black players from family members?

| Option | Description | Selected |
|--------|-------------|----------|
| Tap badge to change (recommended) | Player badges in sidebar are tappable. Tap white badge → family picker modal. Simple, inline with gameplay. | ✓ |
| Setup screen first | Dedicated 'New Game Setup' screen before starting. Choose both players, then navigate to board. More formal but adds navigation step. | |
| Settings gear icon | Player selection buried in settings. Keeps board clean but makes switching players less discoverable. | |

**User's choice:** Tap badge to change (recommended)

---

### Question: Should New Game require confirmation (per CHESS-09 requirement)?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, modal confirm (recommended) | New Game button opens 'Reset board and start fresh? This cannot be undone.' confirmation dialog. Prevents accidental resets. | ✓ |
| Yes, double-tap | Require tapping New Game twice within 3 seconds. Faster but less explicit about consequences. | |
| PIN-protected | Require parental PIN to start new game. Maximum protection but overkill for a casual chess game. | |

**User's choice:** Yes, modal confirm (recommended)

---

## Move history display

### Question: Where should move history display in algebraic notation?

| Option | Description | Selected |
|--------|-------------|----------|
| Below controls in sidebar (recommended) | Scrollable move list in the same sidebar as controls. Everything in one column, natural reading flow from top to bottom. | ✓ |
| Separate right panel | Dedicated panel on the right side of the screen. More space for history but splits UI into multiple columns. | |
| Collapsible overlay | Hidden by default, tap button to expand move history. Saves space but hides information unless explicitly opened. | |

**User's choice:** Below controls in sidebar (recommended)

---

### Question: How should moves be formatted in the history list?

| Option | Description | Selected |
|--------|-------------|----------|
| Vertical list (recommended) | Each move on its own row: '1. e4', '1... e5', '2. Nf3'. Easier to read on touchscreen, clear separation, more scrollable space. | ✓ |
| Paired horizontal | Pairs of moves per row: '1. e4 e5', '2. Nf3 Nc6'. Traditional chess notation, more compact but requires more horizontal space. | |
| Grid with turn numbers | Table format with columns for turn number, white move, black move. Structured but complex layout for a sidebar. | |

**User's choice:** Vertical list (recommended)

---

### Question: Should move history auto-scroll to the latest move (per CHESS-07)?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, always (recommended) | Automatically scroll to bottom when new move is made. Keeps latest move visible, matches requirement. Users can manually scroll up to review earlier moves. | ✓ |
| Yes, unless scrolled | Auto-scroll only if user hasn't manually scrolled up. Respects user position but adds tracking logic. | |
| Manual only | Never auto-scroll, users scroll themselves. Violates CHESS-07 requirement. | |

**User's choice:** Yes, always (recommended)

---

## Claude's Discretion

- Exact shade of gray for board squares
- Selected square highlight color and border thickness
- Unicode piece font size and rendering
- Confirmation dialog wording and button styling
- Sidebar width and spacing between controls
- Move history text size and line height
- FEN notation library choice for board representation
- Algebraic notation generation logic

## Deferred Ideas

None — all alternatives were phase-appropriate. Move validation and game history archive explicitly out of scope per PROJECT.md.
