---
created: 2026-03-24T00:46:43.983Z
title: Add exit kiosk mode button to settings page
area: ui
files:
  - client/src/components/FamilySettings.tsx
---

## Problem

The browser runs in Chromium kiosk mode (full-screen, no address bar or OS chrome). There is no way to exit back to the Pi desktop to access system settings, restart, or perform maintenance without a physical keyboard shortcut.

## Solution

Add an "Exit Kiosk" button on the Settings page (PIN-protected). On click, call `window.close()` or navigate to `about:blank`, which in Chromium kiosk mode will exit the browser. Alternatively, the Pi could expose a local endpoint that triggers a system command. Button should be clearly labeled and placed in a "System" section to avoid accidental taps.
