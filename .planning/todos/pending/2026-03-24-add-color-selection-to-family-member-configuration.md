---
created: 2026-03-24T00:46:43.983Z
title: Add color selection to family member configuration
area: ui
files:
  - client/src/components/FamilySettings.tsx
  - server/db.js
  - server/routes/family.js
---

## Problem

Family members have no color identity. Colors would allow chores, calendar events, and other items to be visually associated with specific family members at a glance on the touchscreen display.

## Solution

Add a `color` column (TEXT, e.g. hex string) to the `family_members` table. Expose it via the family member API (GET/POST/PUT). In the family settings UI, show a color picker or a palette of preset touch-friendly color swatches when adding/editing a family member. Use the color in FamilyMemberBadge and anywhere family members are displayed.
