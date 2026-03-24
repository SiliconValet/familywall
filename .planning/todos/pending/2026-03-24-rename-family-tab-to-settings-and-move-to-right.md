---
created: 2026-03-24T00:46:43.983Z
title: Rename Family tab to Settings and move to right
area: ui
files:
  - client/src/App.tsx
---

## Problem

The "Family" tab contains configuration/settings for the app. The name doesn't reflect its broader settings purpose, and its position in the tab bar should be rightmost (conventionally where settings live).

## Solution

In App.tsx, rename the "Family" nav tab label to "Settings" and reorder it to the last position in the navigation tab list.
