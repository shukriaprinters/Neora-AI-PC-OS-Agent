---
name: CSS pointer-events specificity trap
description: A broad ID+universal rule like `#app-wrapper * { pointer-events: auto }` overrides class-level `pointer-events: none`, blocking all clicks under fixed overlays.
---

## Rule

Never use `#id * { pointer-events: auto }` — the ID+universal selector (specificity 1,0,1) wins over any class selector (0,1,0), including overlays that explicitly declare `pointer-events: none`.

**Why:** In Neora, `#app-wrapper * { pointer-events: auto }` made the `.holo-scanline-container` (z-index: 50, `position: fixed`) interactive even though it had `pointer-events: none` in another rule. The overlay was blocking 100% of user clicks while appearing visually inert.

**How to apply:** 
- For "make all app content clickable" intent, only target the specific container element (`#root, #app-wrapper { pointer-events: auto }`), never descendants with `*`.
- Always add `!important` to `pointer-events: none` rules on decorative overlays/scanlines.
- Fix template: Remove the `* {}` descendant selector, add `pointer-events: none !important` to overlay class rules.
