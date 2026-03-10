# Pitfalls Research

**Domain:** Family Dashboard Application on Raspberry Pi with Touchscreen
**Researched:** 2026-03-10
**Confidence:** MEDIUM-HIGH

## Critical Pitfalls

### Pitfall 1: SD Card Corruption from Database Writes

**What goes wrong:**
SD cards frequently corrupt when running SQLite databases with frequent writes, especially under load. Even recommended/quality micro SD cards fail, often causing complete data loss and requiring full reinstallation. The system works fine for weeks or months, then suddenly becomes unbootable or the database becomes corrupted.

**Why it happens:**
SD cards have limited write cycles due to flash memory wear leveling. SQLite's default synchronous write mode with frequent small transactions (like chore completions) accelerates wear on specific sectors. Power loss during writes exacerbates corruption risk.

**How to avoid:**
- Boot from USB SSD instead of SD card (best solution for longevity)
- If SD card required: Use tmpfs for /var/log and other frequently-written directories
- Implement write-ahead logging (WAL) mode in SQLite to reduce sync frequency
- Use batch transactions for chore updates rather than individual commits
- Mount database partition with `noatime` flag to eliminate access-time writes
- Use High Endurance micro SD cards if SSD not viable
- Implement automatic database backups to cloud/USB before critical data loss

**Warning signs:**
- I/O errors in system logs
- Database locked errors that resolve after restart
- Increasing response time for database operations
- Lightning bolt icon (undervoltage) appearing frequently (indicates broader power issues)
- `PRAGMA integrity_check` returning errors

**Phase to address:**
Phase 1 (Infrastructure Setup) — Critical infrastructure decision that affects entire system reliability

---

### Pitfall 2: Chromium Memory Leaks in Long-Running Kiosk Mode

**What goes wrong:**
Chromium browser exhibits severe memory leaks when running 24/7 in kiosk mode. Memory usage grows continuously over days/weeks until the system freezes or the browser crashes. The Raspberry Pi has limited RAM (1-8GB depending on model), making this issue appear faster than on desktop systems.

**Why it happens:**
Chromium/Chrome are notorious memory hogs on Raspberry Pi. Memory leaks occur from:
- React applications holding references to unmounted components
- Event listeners not being cleaned up
- Browser tab/session data accumulating with auto-refresh features
- Google account sync if enabled
- Service workers caching excessively

**How to avoid:**
- Implement automatic browser restart daily (cron job at 3am to restart Chromium)
- Never enable browser sync or Google account login in kiosk mode
- Use React cleanup in useEffect hooks (return cleanup functions)
- Limit service worker cache size and implement cache eviction
- Monitor memory usage and log trends
- Consider lighter alternatives (Ladybird browser shows promise for low-memory Pi systems in 2026)
- Set Chromium flags: `--disable-sync --disable-background-networking`
- Use `--disable-extensions --disable-plugins` to reduce memory footprint

**Warning signs:**
- htop showing Chromium memory usage above 60% of available RAM
- UI becoming sluggish after several days uptime
- Browser taking longer to respond to touch inputs
- System swap usage increasing over time
- Calendar/chore updates taking longer to render

**Phase to address:**
Phase 1 (Infrastructure Setup) — Must configure kiosk mode properly from start
Phase 2 (Core Chore System) — Implement React memory management best practices

---

### Pitfall 3: Touchscreen Unresponsiveness After Display Sleep

**What goes wrong:**
After the display goes to sleep (screen blanking after 10 minutes), the touchscreen cannot wake it — only mouse input works. Additionally, "tap to wake" is dangerous because the tap registers as a normal click, potentially activating buttons when the screen is black (like deleting chores or marking incomplete tasks as done).

**Why it happens:**
Display power management doesn't properly re-initialize touch input handlers on wake. The browser's touch event listeners lose connection to the hardware driver. Chromium in kiosk mode with Wayland/X11 display server conflicts.

**How to avoid:**
- Disable screen blanking entirely for always-on family dashboard: `xset s off -dpms` in kiosk startup script
- If power saving required: Use motion sensor to wake display via script, not touch
- Alternatively: Implement software-based screensaver (dim content but keep display active)
- Configure `~/.config/wayfire.ini` properly (note: file doesn't exist by default, must create)
- Test wake behavior on actual hardware, not just development environment
- Document recovery process for family: "If screen won't respond, press this physical button"

**Warning signs:**
- Family members reporting "screen doesn't work" after periods of inactivity
- Accidental chore completions clustering after long idle periods
- Display showing lockscreen or login prompt instead of dashboard
- Touch working inconsistently (works after reboot, fails after hours)

**Phase to address:**
Phase 1 (Infrastructure Setup) — Configure display management before deploying
Phase 3 (Deployment & Hardware) — Verify on actual touchscreen hardware

---

### Pitfall 4: Inadequate Power Supply Causing Voltage Drops

**What goes wrong:**
System shows constant undervoltage warnings (lightning bolt icon). Touch input becomes erratic. USB peripherals disconnect randomly. The Pi reboots unexpectedly. Even with the official Raspberry Pi power supply, voltage drops below 4.65V when touchscreen and USB devices are active, causing instability.

**Why it happens:**
The official 7" touchscreen draws significant current. Raspberry Pi 3B+ requires 2.5A, but touchscreen adds ~400mA load. Cable quality matters more than power supply rating — long, thin, or cheap USB cables have high resistance causing voltage drop under load. Many micro-USB cables use thin aluminum with copper coating instead of pure copper.

**How to avoid:**
- Use official Raspberry Pi 3A+ power supply minimum (not phone chargers)
- Use short (<1m), high-quality USB power cables with thick gauge copper
- Measure voltage under load with multimeter: should be >4.75V at Pi GPIO pins
- Consider dual power approach: separate power for Pi and touchscreen
- Avoid daisy-chaining USB hubs without powered hub
- Replace micro-USB cables every 12 months as they degrade
- Watch for cheap USB-C to micro-USB adapters that drop voltage

**Warning signs:**
- Lightning bolt icon in corner of display
- `/var/log/syslog` showing "Undervoltage detected!"
- USB devices requiring multiple plug/unplug cycles to work
- System becomes unstable only when touchscreen backlight at full brightness
- Touch calibration drifting over time

**Phase to address:**
Phase 0 (Hardware Selection) — Choose adequate power supply before purchasing
Phase 3 (Deployment & Hardware) — Verify voltage under full load during deployment

---

### Pitfall 5: Touch Drag-and-Drop Failing for Chess Board

**What goes wrong:**
HTML5 Drag and Drop API doesn't work on touch devices. Chess pieces can be dragged with mouse but are completely unresponsive to touch/drag gestures on the touchscreen. Users can only see pieces but can't move them, rendering the chess feature unusable.

**Why it happens:**
HTML5 Drag and Drop API has poor/no support on mobile and touch devices, especially iOS. React drag-and-drop libraries often default to mouse events only. The dragging experience even with polyfills is poor — elements just "jump" rather than following the finger smoothly.

**How to avoid:**
- Use Pointer Events API instead of HTML5 Drag and Drop (works consistently across mouse/touch)
- Choose React libraries with native touch support:
  - **dnd-kit** (recommended 2026): Built-in mouse/touch/keyboard support, extensible
  - **hello-pangea/dnd**: Touch support built-in, good for lists/boards
  - **React Aria**: Unified drag/drop across mouse/touch/keyboard, accessible
- Avoid react-beautiful-dnd (deprecated, poor touch support)
- Implement tap-to-select, tap-to-place as alternative to drag-drop
- Test on actual touchscreen hardware, not just Chrome DevTools device emulation
- Consider hybrid: drag-drop on desktop, tap-tap on touch (detect via pointer type)

**Warning signs:**
- Chess board works perfectly in desktop browser, fails on Pi touchscreen
- Touch events firing but drag callbacks never triggering
- Drag preview appearing but not following finger
- OnTouchStart firing but onDragStart never called

**Phase to address:**
Phase 4 (Chess Feature) — Choose touch-compatible library before implementing chess drag-drop
Phase 5 (Integration Testing) — Test on physical touchscreen before considering complete

---

### Pitfall 6: Google Calendar API Rate Limits with Auto-Refresh

**What goes wrong:**
Calendar stops refreshing with 403 "rateLimitExceeded" or "quotaExceeded" errors. Family notices calendar is hours or days out of date. Error logs fill with API failures. The app appears broken but chores still work (confusing for users).

**Why it happens:**
Google Calendar API has strict quotas: 1,000,000 queries per day, but also per-minute rate limits per user. Auto-refreshing every 5 minutes across multiple calendars (3-4 family members) generates 288 requests/day per calendar = ~1,152 requests/day for 4 calendars. Polling instead of push notifications wastes quota. Batch requests not used.

**How to avoid:**
- Use push notifications (watch API) instead of polling where possible
- Increase refresh interval: 5 minutes → 15 minutes (saves 75% quota)
- Implement exponential backoff when receiving 403/429 errors
- Batch multiple calendar requests into single API call
- Cache aggressively: Only fetch events for next 7 days, not entire calendar
- Use incremental sync with `syncToken` to fetch only changes since last sync
- Set quotaUser parameter if using service account
- Monitor daily quota usage in Google Cloud Console
- Implement graceful degradation: show "last updated X minutes ago" when quota exceeded

**Warning signs:**
- 403 errors in logs: "Calendar limits exceeded" or "User rate limit exceeded"
- Calendar events frozen/not updating despite Google Calendar showing new events
- Rate limit errors appearing at consistent times daily (indicates systemic over-polling)
- Google Cloud Console showing quota usage approaching daily limits

**Phase to address:**
Phase 3 (Calendar Integration) — Implement proper rate limiting and caching from start
Phase 6 (Optimization) — Add push notifications to reduce polling

---

### Pitfall 7: Oversized Touch Targets Causing Accidental Actions

**What goes wrong:**
Buttons are too large or too close together, causing users to accidentally complete wrong chores, delete tasks, or activate unwanted features. Kids mark siblings' chores as complete. Parents accidentally press buttons when reaching for other controls. Family loses trust in the system because it "does things we didn't ask for."

**Why it happens:**
Developers overcompensate for "touch-friendly" by making everything 80-100px, creating overlap in effective tap zones. Spacing between targets is inadequate (<8px). Visual size doesn't match interactive area (padding extends clickable region invisibly). Buttons placed in high-traffic screen areas where accidental taps occur.

**How to avoid:**
- Follow 2026 touch target guidelines:
  - **Center content:** 27×27px minimum for small icons/links
  - **Screen edges (top/bottom):** 44×44px minimum (users less precise at edges)
  - **Critical actions:** 48×48px with 8px spacing minimum
- Separate visual size from interactive area: keep icons 24px but expand tappable area to 48px via padding
- Use confirmation dialogs for destructive actions (delete chore, clear all tasks)
- Position frequently-used buttons in center screen (most precise touch zone)
- Add "undo" functionality instead of confirmations for low-risk actions
- Test with actual family members (kids and adults) to find accidental tap patterns
- Use visual feedback (button depression, color change) so users know what they tapped

**Warning signs:**
- Family reports "I didn't press that!"
- Chore completion rate seems artificially high (accidental marks)
- Users developing workarounds ("touch very carefully in this area")
- Frequent requests for "undo" or "how do I reverse this?"
- Increased error rate after multi-hour usage sessions (user fatigue)

**Phase to address:**
Phase 2 (Core Chore System) — Get touch targets right for primary feature
Phase 5 (Integration Testing) — User testing with family to find accidental tap patterns

---

### Pitfall 8: Display Burn-In from Static Content

**What goes wrong:**
If using OLED display, the always-on dashboard causes permanent burn-in of static elements (chore list headers, calendar titles, navigation) within weeks. The display becomes unusable with ghost images visible even when showing different content. This is permanent damage requiring display replacement.

**Why it happens:**
OLED pixels are organic LEDs that degrade when displaying the same content continuously. Each pixel has ~1,000 hour lifespan at full brightness. Static UI elements (headers, buttons, borders) remain on-screen 24/7 in a family dashboard, causing uneven pixel wear.

**How to avoid:**
- **Use LCD touchscreen, not OLED** — LCD doesn't suffer from burn-in (critical decision)
- If OLED already purchased:
  - Rotate content positions slightly every few hours
  - Implement screensaver that moves elements around screen
  - Reduce brightness to 50% or lower
  - Turn off display during night hours (10pm-6am)
  - Use dark mode with white/colored text (reduces pixel wear)
  - Avoid pure white backgrounds (maximum pixel wear)
- For LCD: no special precautions needed, backlight degradation takes years

**Warning signs:**
- Faint outlines of UI elements visible even when that area shows different content
- Display brightness uneven across screen (some areas dimmer)
- Colors looking washed out or shifted in static UI regions
- "Image retention" visible for minutes after changing screens
- (OLED only) Using display >12 hours/day continuously for >2 weeks

**Phase to address:**
Phase 0 (Hardware Selection) — Choose LCD, not OLED, before purchasing
Phase 1 (Infrastructure Setup) — If OLED, implement pixel-shift and screensaver

---

### Pitfall 9: Offline-First PWA Misconfiguration

**What goes wrong:**
Chores don't work without internet despite "offline-capable" requirement. Service worker caches outdated app version after deployments. Users see old UI or broken features. Calendar shows "loading..." forever when WiFi drops. Family stops using system because "it only works sometimes."

**Why it happens:**
Service worker not properly registered or configured. Wrong caching strategy chosen (cache-first for API data causes stale data; network-first for static assets wastes bandwidth). Everything cached (bloats storage) or nothing cached (requires network). Service worker not updated properly, trapping users on old version. HTTPS not configured (PWA features require HTTPS except localhost).

**How to avoid:**
- **Separate caching strategies by content type:**
  - Static assets (JS/CSS/images): cache-first with version hashing
  - API data (calendar): network-first with fallback to cache
  - Database (chores): local-only, no network required
- Implement aggressive service worker update checks on app focus
- Use versioned cache names, delete old caches on activation
- Test offline mode in Chrome DevTools (Network → Offline) before deploying
- Require HTTPS for production (Let's Encrypt for free certs)
- Don't cache dynamic content that expires (calendar events)
- Provide user feedback when offline: "Calendar last updated 2 hours ago"
- Test PWA features on iOS Safari (different behavior than Chrome)

**Warning signs:**
- "Service worker failed to register" in console
- App shows old version after deployment until hard refresh
- Chore completions lost when internet drops
- Calendar works only when WiFi active
- Users reporting "sometimes it works, sometimes doesn't"
- Browser console showing "Failed to fetch" errors

**Phase to address:**
Phase 2 (Core Chore System) — Implement offline-first for chores from start
Phase 3 (Calendar Integration) — Separate online/offline strategies for calendar

---

### Pitfall 10: Node.js Memory Leaks from Long-Running Backend

**What goes wrong:**
Node.js backend process memory usage grows continuously over days/weeks until it exhausts available RAM (Pi has limited memory). Process eventually crashes with "JavaScript heap out of memory" error. SQLite connections leak. Event listeners accumulate. The system becomes unstable requiring frequent restarts.

**Why it happens:**
Node.js doesn't automatically garbage collect all leaked references. Common causes:
- Global variables accumulating data (e.g., storing request logs in array)
- Event listeners not removed (each calendar refresh adds listener)
- SQLite connections not properly closed after queries
- Promises/callbacks holding references to large objects
- Caching without eviction policy (cache grows unbounded)
- Timers (setInterval) not cleared when no longer needed

**How to avoid:**
- Implement automatic process restart daily (PM2 or systemd timer)
- Use PM2 `max_memory_restart` to automatically restart if memory exceeds threshold
- Monitor memory usage with heap snapshots (Chrome DevTools or heapdump module)
- Close SQLite connections in finally blocks or use connection pooling
- Remove event listeners when components unmount
- Implement cache eviction (LRU cache with max size)
- Avoid global state for request-specific data
- Use weak references for cached objects where appropriate
- Profile with `node --inspect` and heap snapshots during development
- Test long-running scenarios (24+ hours) before deployment

**Warning signs:**
- Node process resident memory (RSS) growing >100MB per day
- Slowdowns appearing after 3-5 days uptime
- Heap snapshots showing retained size growing over time
- SQLite "database is locked" errors increasing
- `free -m` showing available memory decreasing daily

**Phase to address:**
Phase 1 (Infrastructure Setup) — Configure PM2/systemd with memory limits and auto-restart
Phase 2 (Core Chore System) — Implement proper cleanup in backend code

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skipping React.memo/useMemo optimizations | Faster initial development | Poor performance on Pi's limited CPU, re-renders slow UI | Never for Pi deployment — optimize from start |
| Using polling instead of push notifications | Simpler implementation, no webhook setup | Wastes Google Calendar API quota, drains more power | MVP only, must replace in Phase 6 |
| No database migration system | Direct SQLite schema changes, no tooling overhead | Schema changes require manual SQL, risk data loss on updates | Never — implement migrations from Phase 1 |
| Embedding API keys in code | Quick testing without env vars | Security risk if code shared/committed, hard to rotate keys | Development only, never commit |
| No touch input testing during development | Develop on desktop with mouse | Features break on touchscreen (drag-drop), late discovery | Never — test on Pi hardware weekly |
| Skipping service worker versioning | Every deploy updates immediately | Users stuck on old versions, cache invalidation issues | Never for PWA — version from start |
| No automatic restart scheduling | One less cron job to configure | Memory leaks accumulate, system becomes unstable over weeks | Never — configure on deployment day |
| Large bundle sizes (unoptimized builds) | Full developer experience with source maps | Slow loading on Pi, high memory usage in Chromium | Development only, optimize for production |
| Using SD card instead of SSD | Lower initial cost ($10 vs $30) | Frequent corruption, data loss, poor reliability | Never for production — worth the $20 difference |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Google Calendar API | Polling every 5 minutes without incremental sync | Use syncToken for incremental updates, implement push notifications (watch API) for real-time |
| Google Calendar API | Not implementing exponential backoff on errors | Retry with exponential backoff: 1s, 2s, 4s, 8s, 16s max intervals |
| Google Calendar API | Fetching entire calendar history on each refresh | Only fetch events within time window (next 7 days), use pagination |
| SQLite on Pi | Using default synchronous mode with frequent small writes | Enable WAL mode: `PRAGMA journal_mode=WAL;` reduces write amplification |
| SQLite on Pi | Opening new connection for each query | Use connection pooling (single long-lived connection in Node.js) |
| React on Pi | Using create-react-app defaults (large bundle) | Use production build with code-splitting, lazy loading for routes |
| Touchscreen input | Assuming mouse events work for touch | Use Pointer Events API or touch-compatible libraries (dnd-kit, React Aria) |
| Kiosk mode Chromium | Using default flags | Add: `--disable-sync --disable-background-networking --disable-extensions` |
| Service Worker caching | Caching everything with cache-first strategy | Differentiate: cache-first for static, network-first for dynamic, no-cache for real-time |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading entire chore history in React state | UI sluggish, long initial load time | Paginate or filter to recent chores only (30 days), lazy load history | >1000 completed chores (~6 months) |
| Re-rendering entire calendar on each event update | Calendar flickers, high CPU usage | Use React.memo on calendar components, update only changed dates | >50 calendar events visible |
| Not using React production build | Slow app loading, high memory usage | Use `npm run build`, minified production bundle, code-splitting | Always — development build too slow on Pi |
| Storing full calendar event objects in state | Increasing memory usage, garbage collection pauses | Store only needed fields (title, date, time), discard metadata | >200 events cached |
| No debouncing on auto-refresh logic | Overlapping API requests, quota waste | Debounce calendar refresh, cancel previous request if new one starts | When WiFi flaky/slow |
| Running too many simultaneous calendar fetches | API rate limits, slow response | Fetch calendars sequentially or batch, max 2 parallel requests | >4 family calendars |
| Large image assets for chore icons | Slow page load, high memory usage | Use SVG icons or small optimized PNGs (<10KB), lazy load images | >20 chore icons total |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing parental PIN in plaintext in SQLite | Kids can read database file with USB card reader, bypass PIN | Hash PIN with bcrypt, salt properly, verify hash not plaintext |
| No rate limiting on PIN attempts | Brute force PIN in minutes (4-digit = 10,000 combinations) | Rate limit to 3 attempts per 5 minutes, lockout after 10 failed attempts |
| Allowing chore deletion without authentication | Kids delete their assigned chores to avoid them | Require parental PIN for delete operations, keep audit log |
| Exposing backend API on network without authentication | Anyone on home WiFi can mark chores complete, modify data | Use session-based auth or API key, bind backend to localhost only |
| Not validating Google Calendar OAuth scope | App requests excessive permissions (calendar write, contacts, etc.) | Request minimum scope: `https://www.googleapis.com/auth/calendar.readonly` |
| Storing Google OAuth tokens unencrypted | Tokens exposed if SD card removed and read | Encrypt tokens at rest, use OS keyring if available |
| No HTTPS in production | Google Calendar OAuth won't work, credentials exposed on network | Use Let's Encrypt for free HTTPS cert, enforce HTTPS redirects |
| Undocumented admin access for debugging | Family can't disable system if it misbehaves or developer unavailable | Document admin PIN, "reset to factory" procedure, physical override button |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No visual feedback on touch | Users tap repeatedly thinking it didn't work, causing duplicate actions | Add immediate visual feedback: button press animation, color change, ripple effect within 100ms |
| Chore "complete" is permanent | Kids accidentally mark wrong chore, can't undo, lose trust in system | Add "undo" button that appears for 5 seconds after marking complete |
| Over-complicated gamification with points/levels | Initial excitement fades after month one, becomes boring routine | Keep it simple: checkmarks and streaks only (defer points to v2) |
| Calendar too small to read from across room | Family walks up close to screen instead of glancing from distance | Use large fonts (minimum 18px body, 32px+ headers), high contrast colors |
| Too many features on home screen | Overwhelming, family doesn't know where to look | Simple navigation: Chores, Calendar, Chess — one main view at a time |
| Requiring multiple taps to see today's chores | Friction reduces usage, family stops checking | Default view: Today's chores for all family members, one screen, no navigation |
| No "who's turn" indicator for chess | Family members don't know if they should take a turn | Display "White's turn" or "[Name]'s turn" prominently on chess board |
| Chore notifications too aggressive | Annoying alerts cause family to ignore or disable system | No audio alerts, visual-only: pending chores highlighted in red/yellow |
| No indication of calendar freshness | Users don't know if showing current events or stale data from hours ago | Display "Last updated: 5 minutes ago" on calendar, warning if >1 hour old |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Offline chores:** Often missing service worker registration — verify works with WiFi actually disabled, not just DevTools offline mode
- [ ] **Touch drag-drop:** Often missing pointer event handlers — verify works on actual touchscreen hardware, not just mouse
- [ ] **Calendar refresh:** Often missing error handling for rate limits — verify handles 403 quota errors gracefully, shows useful message
- [ ] **Database persistence:** Often missing WAL mode and proper connection cleanup — verify data persists after unexpected power loss
- [ ] **PIN protection:** Often missing rate limiting — verify lockout after failed attempts, can't brute force
- [ ] **Kiosk mode:** Often missing display power management config — verify screen doesn't sleep or can be woken by touch
- [ ] **Memory management:** Often missing cleanup in useEffect — verify no memory growth over 24+ hour run
- [ ] **Power supply:** Often missing voltage verification under load — verify no undervoltage warnings with all features active
- [ ] **Service worker updates:** Often missing cache invalidation — verify new deployment shows updated UI without hard refresh
- [ ] **Chess touch input:** Often missing tap-to-move fallback — verify playable with finger on touchscreen, not just mouse

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| SD card corruption | MEDIUM | Restore from automated backup (should run daily), or fresh install + manual data re-entry if no backup |
| Chromium memory leak crash | LOW | Systemd auto-restart recovers in 30s, data preserved in SQLite, minimal user impact |
| Google Calendar quota exceeded | LOW | Wait for quota reset (per-minute limits reset in <5min), reduce polling frequency in code |
| Service worker stuck on old version | LOW | Hard refresh (Ctrl+Shift+R) or clear site data, redeploy with new cache name |
| Node.js memory leak crash | LOW | PM2 auto-restart recovers in <10s, SQLite data preserved, no user data loss |
| Touch calibration drift | MEDIUM | Recalibrate touchscreen: `DISPLAY=:0 xinput_calibrator`, save to config file |
| PIN lockout (too many failures) | LOW | Wait for lockout period to expire, or override via SSH with admin command |
| Database locked errors | LOW | Usually self-resolving in <1s with retry, worst case: close all connections and restart Node.js |
| Display burn-in (OLED) | HIGH | Hardware replacement required (~$50-80), no software fix, migrate to LCD |
| Undervoltage instability | MEDIUM | Replace power supply ($10) and/or USB cable ($5), verify with multimeter |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| SD card corruption | Phase 1 (Infrastructure) | Run 7-day stress test with write-heavy workload, check `PRAGMA integrity_check` |
| Chromium memory leaks | Phase 1 (Infrastructure) | Configure auto-restart, run 48-hour test and verify memory doesn't exceed threshold |
| Touch unresponsiveness after sleep | Phase 1 (Infrastructure) | Disable screen blanking, verify screen responds after 24+ hour idle |
| Power supply voltage drops | Phase 0 (Hardware Selection) | Measure voltage at GPIO pins under full load: >4.75V required |
| Touch drag-drop failure | Phase 4 (Chess) | Test chess piece movement on actual touchscreen before considering complete |
| Calendar API rate limits | Phase 3 (Calendar) | Monitor quota usage for 7 days, verify <50% of daily limit used |
| Touch target size issues | Phase 2 (Chores), Phase 5 (Testing) | User testing with family, measure accidental tap rate |
| Display burn-in | Phase 0 (Hardware Selection) | Choose LCD not OLED, or implement pixel-shift if OLED already purchased |
| Offline PWA misconfiguration | Phase 2 (Chores) | Test with WiFi disabled: chores work, calendar shows stale data gracefully |
| Node.js memory leaks | Phase 1 (Infrastructure), Phase 2 (Chores) | Heap snapshot comparison after 24 hours, retained size should be stable |

## Sources

### Official Documentation
- [Google Calendar API - Manage quotas](https://developers.google.com/workspace/calendar/api/guides/quota)
- [Google Calendar API - Handle errors](https://developers.google.com/workspace/calendar/api/guides/errors)
- [Touch Targets on Touchscreens - Nielsen Norman Group](https://www.nngroup.com/articles/touch-target-size/)
- [Understanding Success Criterion 2.5.5: Target Size - W3C](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Progressive Web Apps: Offline and background operation - MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation)
- [Node.js Memory Diagnostics](https://nodejs.org/en/learn/diagnostics/memory)

### Community Forums & Discussions
- [Raspberry Pi Forums - SD Card wear](https://forums.raspberrypi.com/viewtopic.php?t=257514)
- [Raspberry Pi Forums - Severe memory leak in Chromium](https://forums.raspberrypi.com/viewtopic.php?t=296598)
- [Raspberry Pi Forums - Chromium kiosk mode touch interaction issues](https://forums.raspberrypi.com/viewtopic.php?t=364840)
- [Raspberry Pi Forums - Low voltage warning with touchscreen](https://forums.raspberrypi.com/viewtopic.php?t=222608)
- [Raspberry Pi Forums - OLED burn-in](https://forums.raspberrypi.com/viewtopic.php?t=255495)
- [Raspberry Pi Forums - LCD displays fade or burn-in](https://forums.raspberrypi.com/viewtopic.php?t=317011)

### Technical Guides & Best Practices
- [Reducing SD Card Wear on Raspberry Pi - Chris Dzombak](https://www.dzombak.com/blog/2021/11/Reducing-SD-Card-Wear-on-a-Raspberry-Pi-or-Armbian-Device.html)
- [SQLite3 Raspberry Pi Problems and Solutions - Scargill's Tech Blog](https://tech.scargill.net/sqlite3-raspberry-pi-problems/)
- [Raspberry Pi Kiosk Mode Tutorial](https://www.raspberrypi.com/tutorials/how-to-use-a-raspberry-pi-in-kiosk-mode/)
- [Top 5 Drag-and-Drop Libraries for React in 2026 - Puck](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react)
- [React DnD - Touch Backend](https://react-dnd.github.io/react-dnd/docs/backends/touch/)
- [How I Built Drag and Drop in React Without Libraries (Using Pointer Events)](https://medium.com/@aswathyraj/how-i-built-drag-and-drop-in-react-without-libraries-using-pointer-events-a0f96843edb7)
- [Preventing and Debugging Memory Leaks in Node.js - Better Stack](https://betterstack.com/community/guides/scaling-nodejs/high-performance-nodejs/nodejs-memory-leaks/)
- [How to Profile Node.js Applications for Memory Leaks - OneUptime](https://oneuptime.com/blog/post/2026-01-26-nodejs-memory-leak-profiling/view)

### Home Automation & Security
- [Smart Home Security in 2026 - SecureIoT.house](https://secureiot.house/smart-home-security-in-2026-the-rising-threat-landscape-every-homeowner-must-know/)
- [Home Automation: Privacy Risks and Strategies - Tech Safety Canada](https://techsafety.ca/resources/toolkits/home-automation-privacy-risks-and-strategies)

### Performance & Optimization
- [Accessible Tap Target Sizes Cheatsheet - Smashing Magazine](https://www.smashingmagazine.com/2023/04/accessible-tap-target-sizes-rage-taps-clicks/)
- [Progressive Web Apps 2026: PWA Performance Guide](https://www.digitalapplied.com/blog/progressive-web-apps-2026-pwa-performance-guide)
- [React Performance Optimization: Best Practices for 2025](https://dev.to/frontendtoolstech/react-performance-optimization-best-practices-for-2025-2g6b)

### Gamification & UX
- [Best Kids Chore Apps 2026 - PointUp](https://point-up.co.uk/compare/best-kids-chore-apps)
- [How to Gamify Chores - Hire and Fire your Kids](https://hireandfireyourkids.com/blog/gamify-chores/)

---
*Pitfalls research for: Family Dashboard Application on Raspberry Pi*
*Researched: 2026-03-10*
