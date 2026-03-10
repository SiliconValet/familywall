# Stack Research

**Domain:** Web-based family dashboard application (React + Node.js + SQLite on Raspberry Pi)
**Researched:** 2026-03-10
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 19.2.x | Frontend UI framework | React 19 is stable (released Dec 2024, 19.2 in Oct 2025) with excellent touch event handling, component-based architecture perfect for modular features (calendar/chores/chess), and proven performance on Raspberry Pi. React Compiler and Activity component improve performance for resource-constrained devices. |
| TypeScript | 5.9.x | Type safety | Latest stable version (5.9 released Mar 2025) provides full type safety for React 19, catches errors at build time, improves DX with autocomplete, and handles async/await patterns cleanly for API calls. TypeScript 6.0 RC available but 5.9 recommended for stability. |
| Vite | 7.x | Build tool and dev server | Vite 7 (latest major, Mar 2026) provides lightning-fast HMR during development, optimized production builds via Rollup, SWC-based compilation for 5x faster builds, and minimal configuration. Default browser target is 'baseline-widely-available' reducing bundle size for modern browsers. |
| Node.js | 22.x LTS | Backend runtime | Node.js 22 (Jod) is Active LTS through Oct 2025, then Maintenance LTS until Apr 2027. Stable, well-supported, and efficient for Raspberry Pi hardware. Node.js 24 LTS available Oct 2025 but 22 recommended for current stability. |
| Fastify | 5.x | Backend framework | Fastify 5.8.2 (latest as of Mar 2026) is significantly faster than Express with built-in schema validation, async/await support, and optimized JSON handling. Low overhead critical for Raspberry Pi constraints. 2-3x faster than Express while maintaining simple API. |
| better-sqlite3 | 12.x | SQLite database driver | better-sqlite3 12.6.2 (actively maintained) is the fastest SQLite library for Node.js, fully synchronous API that outperforms async wrappers, achieves 2000+ queries/sec with proper indexing, and perfect for Raspberry Pi local storage with no external dependencies. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zustand | 5.x | Global state management | For chore data, chess game state, and app settings. 1KB bundle size, simpler than Redux, excellent performance on Raspberry Pi. Use when state needs to be shared across multiple components (current chess game, active chores list). |
| TanStack Query | 5.x | Server state & data fetching | For Google Calendar API integration. Handles caching (5 min staleTime), auto-refresh (background updates), request deduplication, and retry logic automatically. Critical for managing calendar data refresh without manual state management. |
| react-chessboard | 5.x | Chess UI component | For chess board display. Version 5.10.0 (Feb 2026) supports React 19, modern responsive design, touch-friendly piece movement. Pair with chess.js for game logic. |
| chess.js | 1.x | Chess game logic | For chess move validation and game state. Version 1.4.0, TypeScript-based, headless library handles all chess rules, move validation, and algebraic notation. Separates UI from logic cleanly. |
| dnd-kit | 6.x | Touch drag-and-drop | For chess piece movement. Modern toolkit with excellent mobile/touch support, customizable sensors (mouse/touch/keyboard), accessibility built-in, 10KB min+gz. Set `touch-action: none` on draggables to prevent iOS Safari scrolling. |
| googleapis | 143.x | Google Calendar API client | For calendar integration. Official Google client library with OAuth2 support, type-safe API methods, handles authentication and token refresh. Use @google-cloud/local-auth for OAuth flow. |
| date-fns | 4.x | Date manipulation | For calendar display and chore scheduling. Version 4.1.0 with first-class timezone support via @date-fns/tz. Tree-shakeable (import only needed functions), more modern API than moment.js. |
| Tailwind CSS | 4.x | Utility-first styling | For responsive touch-friendly UI. Version 4.0+ (released Jan 2025) with Rust-powered engine (5x faster builds, 100x faster incremental), CSS-first config via @theme, built-in container queries, 3D transforms, OKLCH color support. Perfect for rapid prototyping. |
| React Router | 7.x | Client-side routing | For navigation between dashboard views. Version 7.13.1 (latest Mar 2026) combines React Router v6 + Remix features, supports React 19, SPA mode perfect for local-first dashboard. Non-breaking upgrade from v6. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| @vitejs/plugin-react-swc | Vite React plugin with SWC | Rust-based compiler significantly faster than Babel. Skip Babel config to use esbuild-only for production builds (fastest option). |
| ESLint 9.x | Code linting | Configure for React 19 hooks, TypeScript, and Fastify patterns. Use flat config format (eslint.config.js) for ESLint 9+. |
| Prettier | Code formatting | Standard 2-space formatting, integrate with ESLint via eslint-config-prettier to avoid conflicts. |
| Chromium | Kiosk mode browser | Official Raspberry Pi OS browser. Use `--kiosk --noerrdialogs --disable-infobars --ozone-platform=wayland` flags. On Pi 5 with Bookworm, configure autostart via wayfire.ini instead of traditional X11 autostart. |

## Installation

```bash
# Core dependencies
npm install react@19 react-dom@19
npm install fastify@5
npm install better-sqlite3@12

# Frontend libraries
npm install zustand@5
npm install @tanstack/react-query@5
npm install react-chessboard@5 chess.js@1
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install react-router@7
npm install tailwindcss@4

# Backend libraries
npm install googleapis@143
npm install date-fns@4 @date-fns/tz

# Dev dependencies
npm install -D vite@7 @vitejs/plugin-react-swc
npm install -D typescript@5 @types/react@19 @types/react-dom@19 @types/node
npm install -D @types/better-sqlite3
npm install -D eslint@9 prettier eslint-config-prettier
npm install -D tailwindcss@4
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Fastify | Express.js | If you need maximum plugin ecosystem compatibility or your team is already expert with Express. However, Fastify's performance advantage is significant on Raspberry Pi. |
| Fastify | Hono | If targeting edge/serverless deployment or multi-runtime (Deno, Bun, Cloudflare Workers). For Raspberry Pi Node.js server, Fastify is more mature with better ecosystem. |
| Zustand | Jotai | If you have complex state interdependencies or need atomic state updates with minimal re-renders (real-time data, complex forms). Zustand simpler for 90% of use cases. |
| Zustand | React Context | If state is only shared within small component subtree and doesn't change frequently. For app-wide state (chores, chess game), Zustand prevents Context re-render issues. |
| Vite | Create React App | Never in 2026. CRA is effectively unmaintained, Vite is 10-100x faster, more modern, and official React docs recommend Vite. |
| Vite | Next.js / Remix | If you need SSR, file-based routing, or full-stack framework features. For single-device local dashboard, Vite SPA is simpler and faster. |
| better-sqlite3 | node-sqlite3 | Never for this use case. better-sqlite3 is orders of magnitude faster for bulk operations, has simpler API (synchronous), and performs better on Pi hardware. |
| Tailwind CSS | Plain CSS / CSS Modules | If you strongly prefer semantic class names or have strict design system with existing CSS. Tailwind's utility-first approach is faster for prototyping and v4's performance makes it negligible overhead. |
| TanStack Query | Manual fetch + useState | Never for API data fetching. TanStack Query handles caching, deduplication, retries, stale data, and background updates automatically. Manual approach requires reinventing all these patterns. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Create React App | Unmaintained since 2022, webpack-based, extremely slow builds, no longer recommended by React docs | Vite (official recommendation) |
| Express.js | 2x-3x slower than Fastify, callback-based patterns feel dated in 2025, no built-in schema validation, manual async/await wrapping | Fastify for performance-critical Pi deployment |
| node-sqlite3 | Async API is actually slower than better-sqlite3's sync API, callback-based, orders of magnitude slower for bulk operations | better-sqlite3 |
| Moment.js | Deprecated, massive bundle size (not tree-shakeable), mutable API causes bugs | date-fns v4 (tree-shakeable, immutable, timezone support) |
| Redux Toolkit | Overkill for this project size, more boilerplate than Zustand, requires more setup and configuration | Zustand for simple global state |
| axios | Unnecessary dependency when native fetch + TanStack Query handles all use cases, adds bundle weight | Native fetch with TanStack Query |
| chessboardjsx | Unmaintained, led to creation of react-chessboard | react-chessboard (actively maintained, React 19 compatible) |
| react-beautiful-dnd | Atlassian has moved to pragmatic-drag-and-drop, no longer actively maintained | dnd-kit (modern, lightweight, better touch support) |

## Stack Patterns by Variant

**For Raspberry Pi optimization:**
- Use Vite's `build.target: 'esnext'` to target modern browsers only (Chromium kiosk)
- Configure manual chunking to separate vendor code: `vendor: ['react', 'react-dom']`
- Enable SWC instead of Babel for 5-10x faster build times
- Set TanStack Query `staleTime: 5 * 60 * 1000` (5 min) and `cacheTime: 10 * 60 * 1000` (10 min) to reduce API calls
- Use Tailwind's JIT mode (default in v4) to generate only used classes

**For touch-optimized UI:**
- Use dnd-kit with `touch-action: none` on draggables for reliable iOS Safari support
- Set minimum touch target size to 44x44px (iOS HIG) or 48x48px (Material Design)
- Avoid hover states entirely, use `:active` pseudo-class for touch feedback
- Configure React Router with `<Link>` components that have large hit areas

**For offline-first chores:**
- Use better-sqlite3 with WAL mode: `db.pragma('journal_mode = WAL')`
- Store all chore data locally in SQLite
- Use Zustand with localStorage persistence for app settings
- Keep calendar as online-only feature (TanStack Query handles offline gracefully with cached data)

**For kiosk mode deployment:**
- Configure Chromium with `--kiosk --noerrdialogs --disable-infobars --ozone-platform=wayland`
- On Raspberry Pi 5 with Bookworm (Wayland), edit `~/.config/wayfire.ini` for autostart
- On older Pi models with X11, use `~/.config/lxsession/LXDE-pi/autostart`
- Disable screensaver and power management in Raspberry Pi OS settings
- Use PM2 or systemd to auto-restart Node.js backend on crash/reboot

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| React 19.2.x | TypeScript 5.9.x | Requires @types/react@19 for proper typing of new features (Activity component, ref cleanup) |
| Vite 7.x | Node.js 22.x LTS | Requires Node.js 18+ minimum, 22 LTS recommended for stability |
| Fastify 5.x | Node.js 22.x LTS | Tested with all Node.js LTS versions, works with 18, 20, 22+ |
| better-sqlite3 12.x | Node.js 22.x | Requires Node.js v14.21.1+, prebuilt binaries for LTS versions |
| react-chessboard 5.x | React 19.x | Peer dependency requires ^19.0.0 |
| TanStack Query 5.x | React 19.x | Fully compatible with React 19 Suspense and concurrent features |
| Tailwind CSS 4.x | Vite 7.x | Use @import "tailwindcss" in CSS, zero config needed |
| React Router 7.x | React 19.x | Designed for React 18+ and React 19 features, SPA mode available |

## Sources

### High Confidence (Official Docs + Context7)
- [React 19.2 Official Release](https://react.dev/blog/2025/10/01/react-19-2) — Version confirmation, new features
- [Vite 7.0 Announcement](https://vite.dev/blog/announcing-vite7) — Latest version, features, migration guide
- [Fastify Official Documentation](https://fastify.dev/docs/latest/Reference/LTS/) — Version 5.8.2, Node.js compatibility
- [better-sqlite3 GitHub](https://github.com/WiseLibs/better-sqlite3) — Performance characteristics, API design
- [Node.js Release Schedule](https://nodejs.org/en/about/previous-releases) — LTS versions, end-of-life dates
- [TypeScript 5.9 Documentation](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html) — Latest stable version
- [Tailwind CSS v4.0 Blog](https://tailwindcss.com/blog/tailwindcss-v4) — v4 features, performance improvements
- [React Router Changelog](https://reactrouter.com/changelog) — Version 7.13.1, features

### Medium Confidence (Multiple Credible Sources)
- [Understanding Better-SQLite3: The Fastest SQLite Library for Node.js](https://dev.to/lovestaco/understanding-better-sqlite3-the-fastest-sqlite-library-for-nodejs-4n8) — Performance comparisons
- [State Management in 2025: When to Use Context, Redux, Zustand, or Jotai](https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k) — Zustand vs alternatives
- [Top 5 Drag-and-Drop Libraries for React in 2026](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react) — dnd-kit recommendations
- [TanStack Query: The Ultimate Complete Guide](https://medium.com/@kom50/tanstack-query-the-ultimate-complete-guide-with-all-best-features-bd01806dc86c) — Best practices
- [Raspberry Pi Kiosk Mode Official Tutorial](https://www.raspberrypi.com/tutorials/how-to-use-a-raspberry-pi-in-kiosk-mode/) — Chromium setup
- [Kiosk mode on RPi 5 with Bookworm Lite (2025)](https://forums.raspberrypi.com/viewtopic.php?t=389880) — Wayland configuration
- [Advanced Guide to Using Vite with React in 2025](https://codeparrot.ai/blogs/advanced-guide-to-using-vite-with-react-in-2025) — Optimization strategies
- [Fastify vs Express vs Hono: Choosing the Right Node.js Framework](https://medium.com/@arifdewi/fastify-vs-express-vs-hono-choosing-the-right-node-js-framework-for-your-project-da629adebd4e) — Performance comparisons
- [date-fns v4.0 with Time Zone Support](https://blog.date-fns.org/v40-with-time-zone-support/) — v4 features
- [react-chessboard npm page](https://www.npmjs.com/package/react-chessboard) — Version 5.10.0, React 19 compatibility
- [chess.js GitHub](https://github.com/jhlywa/chess.js/) — Version 1.4.0, TypeScript implementation
- [Node.js Google Calendar API Quickstart](https://developers.google.com/workspace/calendar/api/quickstart/nodejs) — Official googleapis integration guide

---
*Stack research for: Web-based family dashboard application (React + Node.js + SQLite on Raspberry Pi)*
*Researched: 2026-03-10*
