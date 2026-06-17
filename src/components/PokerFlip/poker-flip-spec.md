# Poker Card Squeeze / Peel — Component Spec

## Overview

A React component that simulates the real-world poker gesture of **squeezing** (peeking at) a face-down card. The player touches the back of a card near a corner or edge, then drags inward. The card back peels away from that anchor point, revealing the card face on the curling flap — just like peeking at your hand at a poker table.

---

## Interaction Model

### Touch & Drag

1. **Touch down** on the card's back face. The component selects the **single nearest anchor point** — one of 8 (4 corners + 4 edge midpoints) — by Euclidean distance to the touch (see below).
2. **Drag inward** (away from the anchor, toward the card center). The card back peels from that anchor, and the curling flap reveals the card face. Progress grows with the distance from the anchor to the current pointer.
3. **Release**:
   - If drag progress ≥ 50 % threshold → card **fully reveals** (face-up).
   - If drag progress < 50 % → card **snaps back** (spring animation, stays face-down).
4. **Tap a revealed card** to reset it face-down.

### Anchor Selection — Nearest of 8

There are exactly **8 anchor points** in card-local coordinates (card is `W`×`H` = 200×290):

```
  top-left (0,0) ──── top (W/2,0) ──── top-right (W,0)
        │                                     │
   left (0,H/2)          (center)        right (W,H/2)
        │                                     │
  bottom-left (0,H) ── bottom (W/2,H) ── bottom-right (W,H)
```

- Selection is **purely by Euclidean distance**: whichever of the 8 points is closest to the touch wins. The peel always originates from that single nearest anchor — it never picks a farther corner when an edge midpoint is closer.
- **Tie-break**: exact ties resolve to the earlier anchor in the list above (deterministic). On this portrait card a touch at the dead center is equidistant to `left` and `right`, so `left` wins.
- This replaces the older 3×3 zone-grid heuristic, which could snap to a corner even when an edge was geometrically nearer.

---

## Visual Layering (during peel)

The peel effect is built from stacked layers with CSS `clip-path` geometry:

| Z-order | Layer | Content | Clip |
|---------|-------|---------|------|
| 1 (bottom) | Card back | Full back-face pattern (always visible as the base) | None |
| 2 | Peeled flap | **Card face** (rank + suit), reflected/mirrored across the fold line | Clipped to the peeled region |
| 3 | Fold shadow | Gradient strip along the fold crease for depth | Contained within card bounds |
| 4 (top) | Finger indicator | 👆 emoji following the drag position | None (overlays everything) |

### Key rule

> **The peeled flap shows the card face.** The un-peeled area remains the card back.
> The player peeks at their card identity on the curling flap, while most of the card stays face-down on the table.

---

## Fold-Line Geometry

- A **fold line** is computed perpendicular to the drag vector, positioned halfway between the anchor and the current pointer.
- Reveal **progress** `= clamp(dist / maxDist, 0, 1)`, where `dist` is the anchor→pointer distance and `maxDist = hypot(W, H) · 0.55`.
- The **back face** remains fully rendered as the base layer (no clipping needed — it's always underneath).
- The **peeled flap** is clipped to the region on the drag side of the fold line, with the card face content reflected across the fold line using a 2D reflection matrix:

```
Reflection matrix across line through point (px, py) with unit normal (nx, ny):

a = 1 − 2·nx²      b = −2·nx·ny
c = −2·nx·ny        d = 1 − 2·ny²
tx = 2·px·nx² + 2·py·nx·ny
ty = 2·px·nx·ny + 2·py·ny²

CSS: transform: matrix(a, c, b, d, tx, ty)
```

- A **shadow gradient** is drawn along the fold line, with opacity proportional to peel progress, to give the illusion of paper depth.

---

## Finger Indicator

- A 👆 emoji follows the current drag position (card-local coordinates).
- The finger **rotates to point toward the anchor** (the held corner/edge).
- Rotation is `atan2(anchor.y − cursor.y, anchor.x − cursor.x)` converted to degrees, +90° offset (since 👆 points up by default).
- Appears on drag start, disappears on release.
- Has a drop-shadow filter for depth.

---

## Progress Feedback

- A thin **progress bar** at the bottom of the card fills as the user drags.
- Color changes from blue → green when past the 50 % reveal threshold.
- A small **label** at the top shows the selected nearest anchor (e.g., "top-left", "bottom", "right") while dragging.

---

## Animations

| Event | Animation |
|-------|-----------|
| Card entrance | Staggered fade-in + translateY + scale, 0.55s ease-out |
| Snap back | Spring animation (rAF loop), ease-out cubic, 350ms — fold line retreats to anchor |
| Full reveal | Instant state flip + popIn scale animation (0.94 → 1, 0.4s) |
| Shadow | Opacity and blur scale with drag progress |
| Box shadow | Lifts proportionally during peel (elevation increases with progress) |

---

## Card Design

### Back face
- Dark navy background with 45°/−45° crosshatch pattern.
- Inner border inset with subtle white stroke.
- Centered ♠ symbol with glow.

### Front face
- Off-white / cream background (#faf8f4).
- Top-left: rank + suit. Bottom-right: rank + suit (rotated 180°). Center: large suit symbol.
- Colored by suit: red (#C41E3A) for hearts/diamonds, dark (#1B1B1B) for clubs/spades.
- Serif font (Playfair Display / Georgia).

---

## Technical Notes

- **Framework**: React with hooks (useState, useRef, useCallback, useEffect).
- **No external dependencies** beyond React itself.
- **Touch + mouse** support: `onMouseDown` / `onTouchStart` on the card, global `mousemove` / `touchmove` / `mouseup` / `touchend` listeners while dragging.
- **Passive event prevention**: touchmove listeners use `{ passive: false }` to allow `preventDefault()`.
- **Card dimensions**: 200 × 290 px.
- **Clip-path**: `polygon()` based half-plane clipping for arbitrary fold-line angles.
- **Reflection**: CSS `matrix()` transform for 2D reflection across the fold line.
