# Phase 6: Polish & Integration - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Production hardening and family user acceptance — make FamilyWall run reliably on real Raspberry Pi hardware. All core features (chores, calendar, chess) are complete; this phase makes them production-ready for daily family use. Scope includes: offline/error indicators for the calendar, on-screen virtual keyboard for touchscreen text input, family member color assignment (fixing the CAL-03 color-coding gap), PIN session timeout, and a Settings tab restructure.

</domain>

<decisions>
## Implementation Decisions

### Offline & Error Indicators
- **D-01:** Show a sonner toast when internet/API connectivity is lost, then stay silent — no persistent banner, no per-section status badges. Non-intrusive for a kiosk.
- **D-02:** Calendar is the only internet-dependent section. Chores use local SQLite and always work — no offline indicator needed for Chores.
- **D-03:** Retry strategy: keep existing useInterval auto-refresh (calendar every 15 minutes). No additional exponential backoff or manual retry button needed.

### On-Screen Virtual Keyboard
- **D-04:** Keyboard auto-appears when any text input field is focused (no explicit keyboard button per input).
- **D-05:** Fixed bottom overlay — keyboard slides up from the bottom edge of the screen, content above scrolls/shifts. Standard mobile keyboard behavior.
- **D-06:** Single QWERTY layout with top numbers row and backspace. PIN numeric input already handled by existing PinModal — no separate NUM pad layout needed.
- **D-07:** Keyboard dismisses on tap outside OR when the Done button is pressed.

### Family Member Color Assignment
- **D-08:** Pre-defined palette of ~8 distinct, accessible colors shown as swatches. No full color picker — prevents low-contrast choices, simpler touch targets.
- **D-09:** Color selection lives inside the existing Add/Edit Family Member modal (FamilyFormModal). No new screens or separate settings section.
- **D-10:** Auto-assign from palette on create (first member gets color 1, second gets color 2, etc.). Member can change their color in the edit modal at any time.
- **D-11:** Calendar events automatically use the matched family member's assigned color. No separate calendar-source-to-color mapping needed in CalendarSettings.

### Settings Tab Restructure
- **D-12:** Rename the "Family" tab to "Settings" and move it to the rightmost position in the nav bar.
- **D-13:** Settings tab contains: family member list (existing), followed by system settings section below — PIN change and Exit Kiosk button. All admin-related items in one place.
- **D-14:** Exit Kiosk Mode button requires PIN before executing. Consistent with other parental actions.
- **D-15:** Exit Kiosk action kills the kiosk Chromium process (using a server-side endpoint that triggers the appropriate system command for the labwc/Pi setup), restoring desktop access for admin tasks.

### PIN Session Timeout
- **D-16:** 60-second grace period after last successful PIN verification. Parent can take multiple protected actions within 60 seconds without re-entering PIN.
- **D-17:** Timer resets on each successful authenticated action. After 60 seconds of inactivity, the next protected action requires PIN again.
- **D-18:** No visual countdown indicator — session expires silently. Next protected action simply shows the PIN modal again.
- **D-19:** Implemented in `usePinAuth` hook — add `lastAuthTime` ref and check elapsed time before showing PIN modal vs. executing directly.

### Claude's Discretion
- Exact color palette values (8 colors with good contrast on both light and dark backgrounds)
- On-screen keyboard library choice vs. custom React component
- Keyboard animation timing and exact height
- Which system command kills the kiosk Chromium on labwc (reference Phase 1 restart script pattern)
- Memory monitoring approach for 24-hour stability (if any client-side action is taken)
- Error toast wording for calendar connectivity failures

### Folded Todos
- **Color selection for family members** — Pre-defined palette in FamilyFormModal, auto-assign on create, drives calendar event colors.
- **On-screen virtual keyboard** — Auto-appears on text input focus, fixed bottom overlay, QWERTY + numbers + backspace.
- **PIN session timeout (60s inactivity)** — Grace period in usePinAuth, resets on each action, silent expiry.
- **Exit kiosk mode button + rename Family→Settings tab** — Bundled as one settings-restructure task. PIN-protected, kills Chromium kiosk process.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Infrastructure & Kiosk Setup
- `.planning/phases/01-infrastructure-setup/01-02-PLAN.md` — labwc autostart, kiosk Chromium configuration, restart script patterns (relevant for exit-kiosk system command)
- `.planning/phases/01-infrastructure-setup/01-03-deployment.md` — Deployment environment details, user (jassmith), systemd timer setup

### Foundation & Auth Patterns
- `.planning/phases/02-foundation-family-management/02-UI-SPEC.md` — Visual and interaction specs: spacing, touch targets (44px min), color system, component inventory
- `.planning/phases/02-foundation-family-management/02-CONTEXT.md` — PIN auth decisions, sonner toast usage, pending action pattern in usePinAuth

### Project Requirements
- `.planning/REQUIREMENTS.md` §Calendar Integration (CAL-03) — Color-coding by family member requirement
- `.planning/REQUIREMENTS.md` §Family Management (FAM-07, FAM-08) — Touch target and visual feedback requirements

### No external docs
No external API docs required for this phase — all changes are internal UI/UX and system-level.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `client/src/hooks/usePinAuth.ts` — PIN auth hook with `withPinAuth(action)` pattern and pending action deferred execution. Extend this for the 60s session timeout (add `lastAuthTime` ref).
- `client/src/components/PinModal.tsx` — Existing PIN modal (numeric). Reuse for exit-kiosk PIN confirmation.
- `client/src/components/FamilyFormModal.tsx` — Add/Edit modal where color swatch picker will live.
- `client/src/components/FamilyMemberBadge.tsx` — Badge component that likely needs to consume the member's color.
- `client/src/components/ui/` — shadcn/ui component library. Check for any color swatch or popover components before building custom.
- `client/src/hooks/useCalendarData.ts` — Calendar data fetching; add error state surfacing for offline toast.
- `client/src/App.tsx` — Tab navigation (4 tabs: Chores, Calendar, Family, Chess). Rename "Family" to "Settings", move to rightmost position.

### Established Patterns
- Sonner toasts for transient feedback (established in Phase 2) — use for offline/error notifications.
- `useInterval` hook for auto-refresh — calendar already uses this every 15 minutes; no new retry logic needed.
- `withPinAuth(action)` pattern — all parental-protected actions use this. PIN session timeout extends this pattern.
- Server-side API endpoints for all state mutations — exit-kiosk will need a `/api/system/exit-kiosk` endpoint.

### Integration Points
- Family member `color` field: add to SQLite `family_members` table, expose in `/api/family` GET/POST/PUT, consumed by CalendarView for event color-coding.
- `usePinAuth` → `lastAuthTime` state: timer check before `withPinAuth` decides whether to show modal or execute directly.
- On-screen keyboard: wraps all `<input>` elements site-wide, likely a context provider + bottom-fixed component that listens to focus events.

</code_context>

<specifics>
## Specific Ideas

- Exit Kiosk: reference the existing labwc/Chromium restart script from Phase 1 (`01-02-PLAN.md`) — the exit command is the inverse of the kiosk autostart. Likely `pkill chromium` or `killall chromium-browser`.
- PIN session: `lastAuthTime` as a `useRef<number>` — compare `Date.now() - lastAuthTime.current < 60_000` before showing PIN modal.
- Color palette: should include distinct colors usable for calendar event backgrounds — similar to Google Calendar's built-in palette (tomato, flamingo, tangerine, banana, sage, basil, peacock, blueberry).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 06-polish-integration*
*Context gathered: 2026-03-23*
