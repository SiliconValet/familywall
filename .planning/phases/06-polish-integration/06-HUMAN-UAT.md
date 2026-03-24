---
status: partial
phase: 06-polish-integration
source: [06-VERIFICATION.md]
started: 2026-03-24T00:00:00Z
updated: 2026-03-24T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. On-screen keyboard on Pi touchscreen
expected: Focus any text input (e.g. family member name field) — virtual keyboard slides up from bottom edge of screen within ~200ms
result: [pending]

### 2. PIN modal keyboard exclusion
expected: Tapping into the PIN pad numeric inputs does NOT trigger the QWERTY virtual keyboard (inputs are excluded via data-no-keyboard / type checks)
result: [pending]

### 3. Exit Kiosk Mode on Pi hardware
expected: From Settings tab, tap Exit Kiosk Mode, enter valid PIN — Chromium kiosk process terminates via pkill -SIGTERM chromium
result: [pending]

### 4. Calendar offline toast on real network failure
expected: Disable network/WiFi on Pi — calendar section shows sonner toast "Calendar unavailable — no internet connection" (appears once, does not repeat on each refresh interval)
result: [pending]

### 5. 24-hour stability run
expected: Application runs for 24+ hours on Pi hardware without memory leaks, crashes, or performance degradation
result: [pending]

### 6. Family user acceptance
expected: Family members can complete daily usage scenarios (mark chores, view calendar, manage family members) without confusion or assistance from developer
result: [pending]

## Summary

total: 6
passed: 0
issues: 0
pending: 6
skipped: 0
blocked: 0

## Gaps
