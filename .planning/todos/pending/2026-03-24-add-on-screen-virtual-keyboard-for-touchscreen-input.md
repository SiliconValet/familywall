---
created: 2026-03-24T00:46:43.983Z
title: Add on-screen virtual keyboard for touchscreen input
area: ui
files:
  - client/src/App.tsx
---

## Problem

The app runs in kiosk mode on a Raspberry Pi touchscreen. There is no physical keyboard attached, so users cannot enter text into fields (family member names, chore titles, descriptions, etc.) without an on-screen keyboard.

## Solution

Preferred: virtual keyboard that appears automatically when a text input is focused and dismisses on blur (e.g. react-simple-keyboard or similar). Alternative: a toggle button in the top-right corner to show/hide the keyboard globally. Must integrate with all text inputs across the app (family settings, chore forms, etc.).
