---
created: 2026-03-24T00:46:43.983Z
title: PIN session timeout after 60 seconds inactivity
area: auth
files:
  - client/src/hooks/usePinAuth.ts
---

## Problem

Users must re-enter the parental PIN for every protected action. When updating multiple items in sequence (e.g. adding several chores), this is tedious and disruptive to the workflow.

## Solution

Implement a session timer in the PIN auth hook: once the PIN is verified, consider the session active for 60 seconds of inactivity. Any user interaction resets the timer. After 60 seconds with no interaction, the session expires and the PIN is required again. Store session state in memory (not localStorage) so it resets on page reload.
