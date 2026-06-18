// ─────────────────────────────────────────────────────────────────
//  Poker squeeze/peel — tunable constants
// ─────────────────────────────────────────────────────────────────

// ── card geometry ───────────────────────────────────────────────
export const CARD_W = 200;
export const CARD_H = 275;   // matches the 342×470 card-art aspect (≈0.728)
export const CARD_RADIUS = 14; // corner radius used by the layer clips

// ── peel / reveal tuning ────────────────────────────────────────
export const THRESHOLD = 0.5; // drag progress at which release auto-completes the reveal

// Peel-axis distance at which progress reaches 1 (full reveal on release).
export const MAX_PEEL_DIST = Math.hypot(CARD_W, CARD_H) * 0.55; // ≈ 194px

// Cap how far the pointer can be dragged from the anchor (~246px). Past this the
// peel/finger freeze instead of flying off the card; full reveal is reached well
// before it (MAX_PEEL_DIST), so peeking is never restricted.
export const MAX_DRAG_DIST = Math.hypot(CARD_W, CARD_H) * 0.7;

// Below this peel-axis projection (px from the anchor) the drag is a soft reset:
// the flap retracts and progress falls to 0, but the gesture stays alive.
export const SOFT_RESET_PROJ = 5;

// ── animation timing ────────────────────────────────────────────
export const SPRING_BACK_MS = 350;       // snap-back (below-threshold release) duration
export const ENTRANCE_STAGGER_S = 0.12;  // per-card entrance delay (× index)

// ── finger sprite (photographic thumb) ──────────────────────────
// hand.png (960×744): the nail rests pointing roughly LEFT (rest angle ≈ -174°),
// with the fingertip at ~7% / 44.6% of the image. We pin that tip to the cursor
// and rotate about it so the nail points toward the anchor; +174 replaces the
// emoji's +90 up-default. hand.png has a baked-in shadow, so no CSS shadow is added.
export const HAND_W = 180;                    // rendered width (px); source is 960×744
export const HAND_H = HAND_W * (744 / 960);   // preserve aspect ratio
export const HAND_TIP_X = 0.07;               // fingertip x within the image (measured)
export const HAND_TIP_Y = 0.446;              // fingertip y within the image (measured)
export const HAND_ANGLE_OFFSET = 174;         // rotation offset for the thumb's rest pose
