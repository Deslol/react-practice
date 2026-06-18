# Poker Card Squeeze / Peel — Component Spec

## Overview

A React component that simulates the real-world poker gesture of **squeezing** (peeking at) a face-down card. The player touches the back of a card near a corner or edge, then drags toward the opposite side. The card peels away from that anchor — the lifted region reveals the table (the container background) underneath, and the curling flap shows the card face — just like peeking at your hand at a poker table.

Cards are rendered from **PNG image assets** (a full 52-card deck + a card back), and each card is identified by a numeric **card code** decoded at runtime (the same shape delivered over the wire), so the component is ready to be driven by live game data.

---

## Files

| File | Responsibility |
|------|----------------|
| `PokerFlip.tsx` | The interactive component: gesture handling, fold geometry, layering, animation. |
| `cardImages.ts` | Single source of truth for card art + the card-code **codec** and image lookup. |
| `../../assets/reveal-poker-cards/*.png` | The deck: `back.png` + 52 fronts (`AS.png`, `10H.png`, `KD.png`, …), 342 × 470. |
| `../../assets/reveal-poker-hand/hand.png` | The photographic thumb sprite used as the drag indicator, 960 × 744. |

---

## Interaction Model

### Touch & Drag

1. **Touch down** on the card's back. The component selects the **single nearest anchor point** — one of 8 (4 corners + 4 edge midpoints) — by Euclidean distance to the touch (see below).
2. **Drag toward the opposite side.** The reveal is **directionally constrained**: progress is measured along the **peel axis** (anchor → card centre, which for a rectangle points straight at the opposite corner/edge). Dragging sideways advances it less; dragging back toward the anchor undoes it.
3. **Release**:
   - If progress ≥ 50 % threshold → card **fully reveals** (face-up).
   - If progress < 50 % → card **snaps back** (spring animation, stays face-down).
4. **Tap a revealed card** to reset it face-down.

### Anchor Selection — Nearest of 8

There are exactly **8 anchor points** in card-local coordinates (card is `W`×`H` = **200 × 275**):

```
  top-left (0,0) ──── top (W/2,0) ──── top-right (W,0)
        │                                     │
   left (0,H/2)          (center)        right (W,H/2)
        │                                     │
  bottom-left (0,H) ── bottom (W/2,H) ── bottom-right (W,H)
```

- Selection is **purely by Euclidean distance**: whichever of the 8 points is closest to the touch wins. The peel always originates from that single nearest anchor — it never picks a farther corner when an edge midpoint is closer.
- **Tie-break**: exact ties resolve to the earlier anchor in the list above (deterministic). On this portrait card a touch at the dead center is equidistant to `left` and `right`, so `left` wins.

### Directional Constraint — the Peel Axis

The "drag toward the opposite side" rule is enforced by projecting the drag onto a fixed **peel axis** `U = normalize(center − anchor)`:

- For a **corner** anchor, `U` points at the diagonally opposite corner (TL→BR, etc.).
- For an **edge** anchor, `U` points straight across to the opposite edge (top→bottom, left→right).
- **`proj = (pointer − anchor) · U`** is the signed distance along that axis. Reveal progress is derived from `proj`, **not** raw pointer distance — so off-axis drift counts for less and backward drift reduces progress.

This is implemented by `peelAxisProjection(anchor, px, py)`.

### Soft Reset (drag back to the anchor)

If the pointer is dragged back to or past the anchor along the peel axis (`proj < 5`), the flap **retracts and progress falls to 0**, but the gesture stays alive — dragging forward again resumes it without re-grabbing. Releasing at progress 0 simply snaps back.

### Drag-Distance Clamp

The pointer is clamped to a maximum distance from the anchor, `MAX_DRAG_DIST = hypot(W, H) · 0.7 ≈ 246 px`, preserving the drag direction. Beyond the cap the peel and finger **freeze in place** instead of flying off-card; the gesture stays alive (drag back inside to resume). Full reveal is reached well inside the cap (at `≈ 194 px`), so peeking is never restricted.

---

## Visual Layering (during peel)

The peel is built from stacked layers with CSS `clip-path` geometry and a 2D reflection. The card back and face are **`<img>`** elements.

| Z-order | Layer | Content | Clip / Transform |
|---------|-------|---------|------------------|
| 1 (bottom) | **Card back** | `back.png` | Clipped to the **kept (drag) side** of the fold line while peeling, so the lifted anchor-side region falls away. Wrapped by a `drop-shadow` filter (see Shadows). |
| 2 | **Peeled flap** | The **card face image**, reflected/mirrored across the fold line | Clipped to the peeled (drag-side) region; reflected via a `matrix()` transform. |
| 3 | Anchor label | Selected anchor name (e.g. `top-left`) while dragging | Overlay. |
| 4 | Progress bar | Thin bar at the bottom, blue → green past threshold | Overlay. |
| 5 (top) | **Finger indicator** | Photographic **thumb sprite** (`hand.png`) pinned to the drag point | Rotated about the fingertip; overlays everything. |

### Key rule — reveal the table, not the back

> When a corner is peeled, that card material has folded over to become the flap. The region it lifted **from** is now empty, so the **card back is clipped away there and the container (table/felt) shows through** — `clipPath = "none"` when idle, so the back is full when not peeling. The far flat part of the card keeps its back; the curling flap shows the face. The card back is **never** shown over the lifted region.

---

## Fold-Line Geometry

- A **fold line** is computed perpendicular to the drag vector, positioned **halfway between the anchor and the current (clamped) pointer**. The fold line follows the actual pointer direction for a natural angle; only the *progress* metric is axis-gated.
- Reveal **progress** `= clamp(proj / maxDist, 0, 1)`, where `proj` is the peel-axis projection and `maxDist = hypot(W, H) · 0.55 ≈ 194 px`.
- The **card back** (Layer 1) is clipped to the **drag side** of the fold line (`halfPlaneClip(..., side = 1)`), exposing the container on the anchor side.
- The **peeled flap** (Layer 2) is clipped to the **same drag-side** half-plane, with the face image reflected across the fold line:

```
Reflection matrix across line through point (px, py) with unit normal (nx, ny):

a = 1 − 2·nx²       b = −2·nx·ny
c = −2·nx·ny        d = 1 − 2·ny²
tx = 2·px·nx² + 2·py·nx·ny
ty = 2·px·nx·ny + 2·py·ny²

CSS: transform: matrix(a, c, b, d, tx, ty)
```

`halfPlaneClip()` builds a `polygon()` covering the kept side for arbitrary fold-line angles.

---

## Shadows

The elevation shadow **follows the peeled silhouette**, not the full card rectangle:

- While peeling, the lift shadow is a **`filter: drop-shadow(...)`** on the wrapper *around* the clipped card back. Because `drop-shadow` traces the clipped alpha (unlike `box-shadow`, which traces the border-box), the shadow hugs the lifted shape and **does not ring the exposed felt** where the corner has peeled away. Offset/blur/opacity scale with progress (`0 (4+14·p)px (12+30·p)px rgba(0,0,0, 0.18+0.22·p)`).
- The outer card wrapper carries only a **static resting shadow** once the card is **fully revealed**.

---

## Finger Indicator

A photographic **thumb sprite** (`hand.png`, 960 × 744) replaces the original 👆 emoji.

- The thumb's nail rests pointing **roughly left** (rest pointing-angle ≈ −174°), with the **fingertip at ~7 % / 44.6 %** of the image (`HAND_TIP_X` / `HAND_TIP_Y`).
- The sprite is **pinned by its fingertip to the drag point**: `left/top = cursor − tip · size`, with `transformOrigin` set to the fingertip, so it rotates **about the nail**.
- It rotates so the nail points from the cursor **toward the anchor**:
  `rotation = atan2(anchor.y − cursor.y, anchor.x − cursor.x) · 180/π + HAND_ANGLE_OFFSET`, where `HAND_ANGLE_OFFSET = 174` compensates for the sprite's left-leaning rest pose (the emoji used `+90` for its up-default pose).
- Rendered at `HAND_W = 180 px` wide, height preserving the source aspect (`× 744/960`).
- **Render gates** (the gesture/peel logic is untouched by these):
  - Appears on drag start, disappears on release.
  - **Hidden when dragged *beyond* the anchor** (peel-axis projection `< 0`) — past the held corner/edge it would otherwise float oddly off the card.
  - Frozen at the drag-distance clamp (see above) rather than flying away.
- `hand.png` has a baked-in drop-shadow, so no additional CSS shadow is applied to it.

---

## Progress Feedback

- A thin **progress bar** at the bottom of the card fills as the user drags.
- Colour changes from blue → green when past the 50 % reveal threshold.
- A small **label** at the top shows the selected nearest anchor (e.g. "top-left", "bottom", "right") while dragging.

---

## Animations

| Event | Animation |
|-------|-----------|
| Card entrance | Staggered fade-in + translateY + scale, 0.55 s ease-out |
| Snap back | Spring animation (rAF loop), ease-out cubic, 350 ms — fold line retreats to anchor |
| Full reveal | Instant state flip + `popIn` scale animation (0.94 → 1, 0.4 s) |
| Lift shadow | `drop-shadow` offset/blur/opacity scale with drag progress, following the peeled silhouette |

---

## Card Art (image assets)

- A matched **52-card deck + back**, each PNG **342 × 470** (aspect ≈ 0.728), with a small (~5 px) transparent margin, gently rounded corners, and effectively no baked shadow.
- Filenames are `{rank}{suit}.png` — rank ∈ `A,2…10,J,Q,K`; suit ∈ `S,H,D,C` (e.g. `AS.png`, `10H.png`, `KD.png`). The back is `back.png`.
- The card container is **200 × 275** to match the art aspect (no distortion). All geometry derives from `CARD_W` / `CARD_H`, so changing them re-derives anchors, `maxDist`, `MAX_DRAG_DIST`, and clipping automatically.
- Faces/back are `<img>` filling `inset:0` (`objectFit: fill`, `draggable={false}`, `pointerEvents:none`). The existing layer wrappers keep their `borderRadius` (rounded-corner containment for the reflected flap) and `clip-path` (the fold).
- **Face-down is a UI state (`revealed`), not a card value** — the back is shown until the card is revealed, independent of the card code.

---

## Data Model & Card Codec (`cardImages.ts`)

The **image set is static** (bundled at build time); the **data is dynamic** (a card code, decoded at runtime). `cardImages.ts` is the single source of truth bridging the two.

### Card code

A 1-byte code packs the suit in bits `0x30` and the face value (`1–13`) in the low nibble `0x0f`:

| Suit | bits | `CardType` |
|------|------|-----------|
| Club | `0x00` | `"C"` |
| Diamond | `0x10` | `"D"` |
| Spade | `0x20` | `"S"` |
| Heart | `0x30` | `"H"` |

Value contract: **`1 = Ace … 11 = J, 12 = Q, 13 = K`** (Ace is **1**, not 14). `0`, `14`, `15` are out-of-contract — no asset exists for them.

### API

- `convertToCardCode(suit, value): number` — encode.
- `convertCardCodeToPoker(code): IPokerInfo` — decode → `{ suit, value }`.
- `isValidCard({suit, value}): boolean` — `suit ≠ UNKNOWN && 1 ≤ value ≤ 13`.
- `cardImageFor(info): string` — front image URL; **falls back to the back** for any out-of-contract / unknown / missing card (never `undefined`).
- `cardImageForCode(code): string` — decode + resolve in one call.
- `backImage: string` — the card-back URL.

`CardType` is a `const` object + same-named union type (not a TS `enum`, which this project's `erasableSyntaxOnly` forbids); its values **are** the filename suit letters, so the asset key is simply `` `${RANK_BY_VALUE[value]}${suit}` `` → e.g. `{HEART, 10}` → `"10H"`.

### Image registry

```ts
import.meta.glob("../../assets/reveal-poker-cards/*.png", { eager: true, import: "default" })
```

`eager: true` compiles to plain static imports — every PNG is content-hashed and bundled (verified by a production build); the browser fetches each only when an `<img>` renders it. A **dev-only sanity check** logs a warning at startup if any of the 52 fronts (or the back) is missing, so renamed/missing art fails loudly instead of silently falling back.

### Rendering & WebSocket-readiness

`DECK` is an array of card **codes** (`number[]`), built with `convertToCardCode(...)` — the same shape a websocket delivers. `PokerCard({ code })` resolves its face via `cardImageForCode(code)`; the back uses `backImage`. Feeding live data is therefore one line: decode bytes → `code` → `<PokerCard code={code} />`.

---

## Technical Notes

- **Framework**: React with hooks (`useState`, `useRef`, `useCallback`, `useEffect`).
- **No external dependencies** beyond React.
- **Touch + mouse**: `onMouseDown` / `onTouchStart` on the card, with global `mousemove` / `touchmove` / `mouseup` / `touchend` listeners while dragging. `touchmove` uses `{ passive: false }` to allow `preventDefault()`.
- **Card dimensions**: 200 × 275 px (matches the 342 × 470 art aspect).
- **Clip-path**: `polygon()` half-plane clipping for arbitrary fold-line angles (applied to both the card back and the peeled flap).
- **Reflection**: CSS `matrix()` transform for 2D reflection of the face across the fold line.
- **Shadow**: `filter: drop-shadow` on the clipped back (follows the peeled silhouette) during peel; static `box-shadow` on the wrapper when revealed.
- **Assets**: bundled via Vite `import.meta.glob` (eager). Build verified to emit all 53 card PNGs.
- **TypeScript**: `noUnusedLocals`, `noUnusedParameters`, and `erasableSyntaxOnly` are enabled — hence `const`-object enums and no dead locals.

---

## Key Constants

| Constant | Value | Meaning |
|----------|-------|---------|
| `CARD_W` × `CARD_H` | 200 × 275 | Card container size (matches art aspect) |
| `THRESHOLD` | 0.50 | Drag progress to auto-complete on release |
| `maxDist` | `hypot(W,H)·0.55 ≈ 194` | Peel-axis distance at which progress = 1 |
| `MAX_DRAG_DIST` | `hypot(W,H)·0.7 ≈ 246` | Drag clamp from the anchor |
| `HAND_W` | 180 | Finger sprite width (px) |
| `HAND_TIP_X` / `HAND_TIP_Y` | 0.07 / 0.446 | Fingertip position within `hand.png` |
| `HAND_ANGLE_OFFSET` | 174 | Rotation offset for the thumb's rest pose |
| Card art | 342 × 470 | Source PNG size for every card |
